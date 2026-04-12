import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon, PencilIcon, TrashIcon,
  StarIcon, CalendarDaysIcon, CurrencyRupeeIcon,
  ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon,
  EyeIcon, EyeSlashIcon, ChevronDownIcon, ChevronUpIcon,
  MapPinIcon, PhoneIcon, LockClosedIcon, LockOpenIcon,
  QuestionMarkCircleIcon, LightBulbIcon
} from '@heroicons/react/24/outline';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import StarRating from '../components/common/StarRating';
import {
  formatPrice, formatDate, STATUS_COLORS,
  CATEGORY_ICONS, CATEGORIES,
} from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ── Confirm Dialog (shared) ── */
const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[fadeSlideIn_0.2s_ease]">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 mx-auto">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={onConfirm} className="flex-1 justify-center inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Booking row expand ── */
const BookingExpand = ({ b }) => {
  const revealed = ['confirmed', 'in_progress', 'completed'].includes(b.status);

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Customer Contact */}
      <div>
        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
          {revealed
            ? <LockOpenIcon className="w-3 h-3 text-green-500" />
            : <LockClosedIcon className="w-3 h-3 text-amber-500" />
          }
          Customer Contact
        </p>
        {revealed ? (
          <div className="flex items-center gap-1.5">
            <PhoneIcon className="w-3.5 h-3.5" />
            {b.user?.phone
              ? <a href={`tel:${b.user.phone}`} className="hover:text-primary-600 transition">{b.user.phone}</a>
              : <span className="italic">No phone provided</span>
            }
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 px-2.5 py-1.5">
            <p className="text-amber-700 dark:text-amber-400 font-medium">Hidden until you accept</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Accept this booking to see customer's contact details.</p>
          </div>
        )}
      </div>

      {/* Service Address */}
      <div>
        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
          {revealed
            ? <LockOpenIcon className="w-3 h-3 text-green-500" />
            : <LockClosedIcon className="w-3 h-3 text-amber-500" />
          }
          Service Address
        </p>
        {revealed ? (
          <div className="flex items-start gap-1.5">
            <MapPinIcon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{b.address?.street ? `${b.address.street}, ` : ''}{b.address?.city}, {b.address?.state}</span>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 px-2.5 py-1.5">
            <p className="text-amber-700 dark:text-amber-400 font-medium">Hidden until you accept</p>
          </div>
        )}
      </div>

      {b.notes && (
        <div className="sm:col-span-2">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Notes</p>
          <p className="italic">"{b.notes}"</p>
        </div>
      )}
    </div>
  );
};

const INITIAL_FORM = {
  title: '', category: 'Web Development', description: '',
  'price.amount': '', 'price.unit': 'fixed',
  'location.city': 'Remote', 'location.state': 'Online', 'location.address': 'Digital / Remote',
  tags: '',
};

const ProviderDashboard = () => {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [activeTab,  setActiveTab]  = useState('bookings');
  const [bookings,   setBookings]   = useState([]);
  const [services,   setServices]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [editSvc,    setEditSvc]    = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [bookFilter, setBookFilter] = useState('all');
  const [form, setForm] = useState(INITIAL_FORM);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, sRes] = await Promise.all([
        api.get('/bookings/provider'),
        api.get('/services/my'),
      ]);
      setBookings(bRes.data.bookings);
      setServices(sRes.data.services);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking marked as ${status.replace('_', ' ')}`);
      fetchAll();
    } catch { toast.error('Update failed'); }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title:       form.title,
        category:    form.category,
        description: form.description,
        price: { amount: parseFloat(form['price.amount']), unit: form['price.unit'] },
        location: {
          address: form['location.address'],
          city:    form['location.city'],
          state:   form['location.state'],
        },
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (editSvc) {
        await api.put(`/services/${editSvc}`, payload);
        toast.success('Service updated! ✅');
      } else {
        await api.post('/services', payload);
        toast.success('Service listed! 🎉');
      }
      setShowForm(false);
      setEditSvc(null);
      setForm(INITIAL_FORM);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/services/${deleteId}`);
      toast.success('Service deleted');
      setDeleteId(null);
      fetchAll();
    } catch {
      toast.error('Delete failed');
      setDeleteId(null);
    }
  };

  const toggleActive = async (svc) => {
    try {
      await api.put(`/services/${svc._id}`, { isActive: !svc.isActive });
      toast.success(`Service ${!svc.isActive ? 'activated' : 'deactivated'}`);
      fetchAll();
    } catch { toast.error('Failed to toggle status'); }
  };

  const openEdit = (svc) => {
    setForm({
      title:              svc.title,
      category:           svc.category,
      description:        svc.description,
      'price.amount':     svc.price.amount,
      'price.unit':       svc.price.unit,
      'location.city':    svc.location?.city    || '',
      'location.state':   svc.location?.state   || '',
      'location.address': svc.location?.address || '',
      tags:               (svc.tags || []).join(', '),
    });
    setEditSvc(svc._id);
    setShowForm(true);
  };

  const pendingBookings   = bookings.filter((b) => b.status === 'pending').length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;
  const totalRevenue      = bookings
    .filter((b) => b.status === 'completed')
    .reduce((s, b) => s + b.pricing.totalAmount, 0);

  const filteredBookings = bookFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === bookFilter);

  return (
    <div className="page-container page-enter">
      {/* Provider Tip Banner */}
      <div className="mb-6 card bg-primary-600 p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <LightBulbIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">Grow your freelancing career!</p>
              <p className="text-white/70 text-sm">Check our professional guide for tips on portfolio optimization and client communication.</p>
            </div>
          </div>
          <Link to="/support" className="px-6 py-2.5 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-50 transition shadow-lg whitespace-nowrap">
            Provider Resources
          </Link>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Service?"
        message="This will permanently remove the service and all associated data. This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Provider Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome, {user?.name?.split(' ')[0]}! Manage your services & bookings.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditSvc(null); setForm(INITIAL_FORM); }}
          className="btn-primary text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'My Services',   value: services.length,           icon: StarIcon,           color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Pending',       value: pendingBookings,           icon: CalendarDaysIcon,   color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20'   },
          { label: 'Completed',     value: completedBookings,         icon: CheckCircleIcon,    color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-900/20'   },
          { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: CurrencyRupeeIcon,  color: 'text-indigo-600',  bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 hover:shadow-card-hover transition-shadow">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">{label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {['bookings', 'services'].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition ${
              activeTab === t
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}>
            {t}
            {t === 'bookings' && pendingBookings > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                {pendingBookings}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader size="lg" /></div>
      ) : activeTab === 'bookings' ? (
        /* ── Bookings Tab ── */
        <>
          {/* Booking filter chips */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setBookFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                  bookFilter === s
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                }`}
              >
                {s === 'all' ? `All (${bookings.length})` : s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-20 card">
              <p className="text-5xl mb-4">📬</p>
              <p className="text-gray-500">No {bookFilter !== 'all' ? bookFilter.replace('_', ' ') : ''} bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => (
                <div key={b._id} className="card p-5 hover:shadow-card-hover transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-2xl flex-shrink-0">
                      {CATEGORY_ICONS[b.service?.category] || '🛠️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{b.service?.title}</h3>
                          <p className="text-xs text-gray-400">Customer: <span className="font-medium">{b.user?.name}</span></p>
                        </div>
                        <span className={`badge flex-shrink-0 ${STATUS_COLORS[b.status]}`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <span>📅 {formatDate(b.bookingDate)}</span>
                        <span>⏰ {b.timeSlot?.start}–{b.timeSlot?.end}</span>
                        <span>💰 {formatPrice(b.pricing?.totalAmount)}</span>
                        <span>📍 {b.address?.city}</span>
                      </div>
                    </div>

                    {/* Provider actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(b._id, 'confirmed')}
                            className="btn-primary text-xs py-1.5 px-3">✓ Accept</button>
                          <button onClick={() => updateStatus(b._id, 'rejected')}
                            className="btn-danger text-xs py-1.5 px-3">✗ Reject</button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <button onClick={() => updateStatus(b._id, 'in_progress')}
                          className="btn-primary text-xs py-1.5 px-3">▶ Start</button>
                      )}
                      {b.status === 'in_progress' && (
                        <button onClick={() => updateStatus(b._id, 'completed')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-xl transition">
                          ✓ Complete
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedId(expandedId === b._id ? null : b._id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        {expandedId === b._id ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {expandedId === b._id && <BookingExpand b={b} />}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ── Services Tab ── */
        services.length === 0 ? (
          <div className="text-center py-20 card">
            <p className="text-5xl mb-4">🛠️</p>
            <p className="text-gray-500 mb-4">No services listed yet</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">Add your first service</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc) => (
              <div key={svc._id} className="card p-5 hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{CATEGORY_ICONS[svc.category]}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{svc.title}</h3>
                      <p className="text-xs text-gray-400">{svc.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleActive(svc)}
                      className={`p-1.5 rounded-lg transition ${
                        svc.isActive
                          ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title={svc.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {svc.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEdit(svc)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(svc._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <StarRating rating={svc.rating?.average || 0} size="sm" />
                  <span>{svc.rating?.average?.toFixed(1) || '0.0'} ({svc.rating?.count || 0} reviews)</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="font-bold text-primary-600 dark:text-primary-400 text-sm">
                    {formatPrice(svc.price?.amount)}
                    <span className="text-xs text-gray-400 font-normal ml-1">/{svc.price?.unit?.replace('per_', '')}</span>
                  </span>
                  <button
                    onClick={() => toggleActive(svc)}
                    className={`badge cursor-pointer transition-opacity hover:opacity-80 ${
                      svc.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {svc.isActive ? '● Active' : '○ Inactive'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Add/Edit Service Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editSvc ? 'Edit Service' : 'Add New Service'}
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditSvc(null); }}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Service Title *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Professional PPT & Presentation Design"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input-field"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your service, experience, and what's included..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-field resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (₹) *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="500"
                      value={form['price.amount']}
                      onChange={(e) => setForm({ ...form, 'price.amount': e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Unit</label>
                    <select
                      value={form['price.unit']}
                      onChange={(e) => setForm({ ...form, 'price.unit': e.target.value })}
                      className="input-field"
                    >
                      <option value="fixed">Fixed Price</option>
                      <option value="per_hour">Per Hour</option>
                      <option value="per_day">Per Day</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Digital / Remote"
                    value={form['location.address']}
                    onChange={(e) => setForm({ ...form, 'location.address': e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Remote"
                      value={form['location.city']}
                      onChange={(e) => setForm({ ...form, 'location.city': e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">State</label>
                    <input
                      type="text"
                      placeholder="Telangana"
                      value={form['location.state']}
                      onChange={(e) => setForm({ ...form, 'location.state': e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags <span className="font-normal text-gray-400">(comma separated)</span></label>
                  <input
                    type="text"
                    placeholder="seo, presentation, web design, freelancing"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                    {submitting
                      ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
                      : editSvc ? 'Update Service' : 'List Service'
                    }
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditSvc(null); }}
                    className="btn-secondary flex-1 justify-center"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
