import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDaysIcon, StarIcon, ClockIcon, XMarkIcon,
  ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon,
  MapPinIcon, CurrencyRupeeIcon, LockClosedIcon, LockOpenIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import StarRating from '../components/common/StarRating';
import { formatPrice, formatDate, STATUS_COLORS, CATEGORY_ICONS } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TABS = ['All', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

/* ── Inline Confirm Dialog ── */
const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, danger = true }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[fadeSlideIn_0.2s_ease]">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto ${danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
          <ExclamationTriangleIcon className={`w-6 h-6 ${danger ? 'text-red-600' : 'text-amber-600'}`} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 justify-center">Keep it</button>
          <button onClick={onConfirm} className={`flex-1 justify-center inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl transition-all ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
            Yes, cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Booking Detail Expand ── */
const BookingDetail = ({ booking: b }) => {
  const revealed = ['confirmed', 'in_progress', 'completed'].includes(b.status);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      {/* Service Address — hidden until provider accepts */}
      <div className="space-y-2">
        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
          {revealed
            ? <LockOpenIcon className="w-3.5 h-3.5 text-green-500" />
            : <LockClosedIcon className="w-3.5 h-3.5 text-amber-500" />
          }
          Service Address
        </p>
        {revealed ? (
          <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400">
            <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{b.address?.street && `${b.address.street}, `}{b.address?.city}, {b.address?.state} - {b.address?.pincode}</span>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 px-3 py-2">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Hidden until provider accepts</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Your booking is pending. Address is shared once accepted.</p>
          </div>
        )}
      </div>

      {/* Payment Details */}
      <div className="space-y-2">
        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Details</p>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <CurrencyRupeeIcon className="w-4 h-4 flex-shrink-0" />
          <span>Base: {formatPrice(b.pricing?.baseAmount)} + GST: {formatPrice(b.pricing?.taxAmount)}</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs">Method: <span className="uppercase font-medium">{b.pricing?.paymentMethod}</span></p>
      </div>

      {b.notes && (
        <div className="sm:col-span-2">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</p>
          <p className="text-gray-500 dark:text-gray-400 italic">"{b.notes}"</p>
        </div>
      )}
    </div>
  );
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [tab,         setTab]         = useState('All');
  const [bookings,    setBookings]    = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [review,      setReview]      = useState({ bookingId: '', rating: 0, comment: '' });
  const [showReview,  setShowReview]  = useState(null);
  const [expandedId,  setExpandedId]  = useState(null);
  const [confirmId,   setConfirmId]   = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/my');
      setAllBookings(data.bookings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  /* Filter by tab on client side so stats stay accurate */
  useEffect(() => {
    setBookings(tab === 'All' ? allBookings : allBookings.filter((b) => b.status === tab));
  }, [tab, allBookings]);

  const cancelBooking = async () => {
    try {
      await api.put(`/bookings/${confirmId}/status`, { status: 'cancelled', cancellationReason: 'Cancelled by user' });
      toast.success('Booking cancelled');
      setConfirmId(null);
      fetchBookings();
    } catch {
      toast.error('Failed to cancel');
      setConfirmId(null);
    }
  };

  const submitReview = async () => {
    if (!review.rating)         { toast.error('Please select a rating'); return; }
    if (!review.comment.trim()) { toast.error('Please write a comment'); return; }
    try {
      await api.post('/reviews', { bookingId: review.bookingId, rating: review.rating, comment: review.comment });
      toast.success('Review submitted! ⭐');
      setShowReview(null);
      setReview({ bookingId: '', rating: 0, comment: '' });
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const stats = {
    total:     allBookings.length,
    completed: allBookings.filter((b) => b.status === 'completed').length,
    pending:   allBookings.filter((b) => b.status === 'pending').length,
    spent:     allBookings.filter((b) => b.status === 'completed').reduce((s, b) => s + b.pricing.totalAmount, 0),
  };

  return (
    <div className="page-container page-enter">
      {/* Help Banner */}
      <div className="mb-6 card bg-indigo-600 p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <QuestionMarkCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">Need assistance with your booking?</p>
              <p className="text-white/70 text-sm">Check our help center for FAQs and tips on how to get the best from providers.</p>
            </div>
          </div>
          <Link to="/support" className="px-6 py-2.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-50 transition shadow-lg whitespace-nowrap">
            Visit Help Center
          </Link>
        </div>
      </div>
      <ConfirmDialog
        open={!!confirmId}
        title="Cancel Booking?"
        message="This will cancel your booking. The provider will be notified. This cannot be undone."
        onConfirm={cancelBooking}
        onCancel={() => setConfirmId(null)}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">My Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back, {user?.name?.split(' ')[0]}! 👋</p>
        </div>
        <Link to="/services" className="btn-primary text-sm">Browse Services</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: stats.total,              icon: CalendarDaysIcon, color: 'text-primary-600',  bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Completed',      value: stats.completed,          icon: StarIcon,         color: 'text-green-600',    bg: 'bg-green-50 dark:bg-green-900/20'   },
          { label: 'Pending',        value: stats.pending,            icon: ClockIcon,        color: 'text-amber-600',    bg: 'bg-amber-50 dark:bg-amber-900/20'   },
          { label: 'Total Spent',    value: formatPrice(stats.spent), icon: null,             color: 'text-indigo-600',   bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 hover:shadow-card-hover transition-shadow">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              {Icon && <Icon className={`w-4 h-4 ${color}`} />}
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">{label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              tab === t
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
            }`}>
            {t === 'All' ? `All (${stats.total})` : t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader size="lg" /></div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 card">
          <p className="text-5xl mb-4">📭</p>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {tab === 'All' ? 'No bookings yet' : `No ${tab.replace('_', ' ')} bookings`}
          </h3>
          <p className="text-gray-400 text-sm mb-5">
            {tab === 'All' ? 'Find and book local services around you' : 'Switch tabs to see other bookings'}
          </p>
          {tab === 'All' && <Link to="/services" className="btn-primary">Browse Services</Link>}
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Service icon */}
                <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-3xl flex-shrink-0">
                  {CATEGORY_ICONS[b.service?.category] || '🛠️'}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{b.service?.title}</h3>
                      <p className="text-xs text-gray-400">{b.service?.category} · {b.provider?.name}</p>
                    </div>
                    <span className={`badge flex-shrink-0 ${STATUS_COLORS[b.status]}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>📅 {formatDate(b.bookingDate)}</span>
                    <span>⏰ {b.timeSlot?.start}–{b.timeSlot?.end}</span>
                    <span>💰 {formatPrice(b.pricing?.totalAmount)}</span>
                    <span>💳 {b.pricing?.paymentMethod?.toUpperCase()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {b.status === 'pending' && (
                    <button
                      onClick={() => setConfirmId(b._id)}
                      className="btn-danger text-xs py-1.5 px-3"
                    >
                      Cancel
                    </button>
                  )}
                  {b.status === 'completed' && !b.reviewSubmitted && (
                    <button
                      onClick={() => { setShowReview(b._id); setReview({ bookingId: b._id, rating: 0, comment: '' }); }}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      ⭐ Review
                    </button>
                  )}
                  {b.status === 'completed' && b.reviewSubmitted && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">✓ Reviewed</span>
                  )}
                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedId(expandedId === b._id ? null : b._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    title="View details"
                  >
                    {expandedId === b._id
                      ? <ChevronUpIcon className="w-4 h-4" />
                      : <ChevronDownIcon className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === b._id && <BookingDetail booking={b} />}

              {/* Review form */}
              {showReview === b._id && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Write a review</p>
                  <div className="space-y-3">
                    <StarRating
                      rating={review.rating}
                      size="lg"
                      interactive
                      onChange={(r) => setReview({ ...review, rating: r })}
                    />
                    <textarea
                      rows={3}
                      value={review.comment}
                      onChange={(e) => setReview({ ...review, comment: e.target.value })}
                      placeholder="Share your experience..."
                      className="input-field resize-none text-sm"
                    />
                    <div className="flex gap-2">
                      <button onClick={submitReview} className="btn-primary text-sm py-2">Submit Review</button>
                      <button onClick={() => setShowReview(null)} className="btn-secondary text-sm py-2">Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
