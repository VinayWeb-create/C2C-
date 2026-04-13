import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon, PencilIcon, TrashIcon,
  StarIcon, CalendarDaysIcon, CurrencyRupeeIcon,
  ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon,
  EyeIcon, EyeSlashIcon, ChevronDownIcon, ChevronUpIcon,
  MapPinIcon, PhoneIcon, LockClosedIcon, LockOpenIcon,
  QuestionMarkCircleIcon, LightBulbIcon,
  AcademicCapIcon, WrenchScrewdriverIcon, IdentificationIcon,
  LinkIcon, InformationCircleIcon, ClockIcon, BriefcaseIcon, TrophyIcon,
  PaperAirplaneIcon, MagnifyingGlassIcon, ShieldCheckIcon
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
import { motion, AnimatePresence } from 'framer-motion';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const navigate      = useNavigate();
  const [activeTab,   setActiveTab]  = useState('projects'); // projects, bookings, services, verify
  const [bookings,    setBookings]   = useState([]);
  const [services,    setServices]   = useState([]);
  const [marketplace, setMarketplace] = useState([]);
  const [myApps,      setMyApps]      = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [submitting,  setSubmitting] = useState(false);
  
  // Modals
  const [showForm,    setShowForm]   = useState(false);
  const [applyModal,  setApplyModal] = useState(null);
  const [applyNotes,  setApplyNotes] = useState('');
  const [applyEmail,  setApplyEmail] = useState(user?.email || '');
  const [applyPhone,  setApplyPhone] = useState('');

  // Service Form
  const [form, setForm] = useState({
    title: '', category: CATEGORIES[0], description: '',
    'price.amount': '', 'price.unit': 'fixed',
    'location.city': '', 'location.state': '', 'location.address': '',
    tags: '',
  });

  // Verification Form
  const [verifForm, setVerifForm] = useState({
    education:     user?.professionalInfo?.education || '',
    skills:        user?.professionalInfo?.skills?.join(', ') || '',
    currentStatus: user?.professionalInfo?.currentStatus || 'Freelancer',
    portfolioUrl:  user?.professionalInfo?.portfolioUrl || '',
    bio:           user?.professionalInfo?.bio || '',
    githubUrl:     user?.professionalInfo?.githubUrl || '',
    linkedInUrl:   user?.professionalInfo?.linkedInUrl || '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, sRes, mRes, aRes] = await Promise.all([
        api.get('/bookings/provider'),
        api.get('/services/my'),
        api.get('/projects'),
        api.get('/projects/my-applications')
      ]);
      setBookings(bRes.data.bookings || []);
      setServices(sRes.data.services || []);
      setMarketplace(mRes.data.projects || []);
      setMyApps(aRes.data.projects || []);
    } catch { 
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/projects/${applyModal}/apply`, { 
        notes: applyNotes,
        contactEmail: applyEmail,
        contactPhone: applyPhone
      });
      toast.success('Application submitted to Admin! 🚀');
      setApplyModal(null);
      setApplyNotes('');
      setApplyPhone('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        professionalInfo: {
          ...verifForm,
          skills: verifForm.skills.split(',').map(s => s.trim()).filter(Boolean)
        }
      };
      await api.put('/auth/profile', payload);
      toast.success('Profile updated! Refreshing...');
      window.location.reload();
    } catch {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success('Status updated');
      fetchData();
    } catch { toast.error('Update failed'); }
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="page-container page-enter pb-20">
      
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
         <div>
           <div className="flex items-center gap-2 mb-1">
             <h1 className="text-3xl font-black text-gray-900 dark:text-white">Professional Hub</h1>
             {user?.isApproved && <ShieldCheckIcon className="w-6 h-6 text-emerald-500" />}
           </div>
           <p className="text-gray-500">Welcome back, {user?.name}. You have <strong>{(user?.badges || []).length} Merit Badges</strong> earned.</p>
         </div>
         <div className="flex gap-2">
           <button onClick={() => navigate('/learning')} className="btn-secondary text-sm">Learning Academy</button>
           <button 
             disabled={!user?.isApproved}
             onClick={() => setShowForm(true)} 
             className="btn-primary text-sm shadow-xl shadow-primary-600/20"
           >
             <PlusIcon className="w-4 h-4" /> List New Service
           </button>
         </div>
      </div>

      {/* ── Status Banner (Verification) ── */}
      {!user?.isApproved && (
        <div className="mb-10 card bg-gradient-to-r from-amber-500 to-orange-600 p-8 flex flex-col md:flex-row items-center gap-8 text-white border-none shadow-2xl shadow-amber-500/30">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
            <ClockIcon className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black mb-1">Account Review Required</h2>
            <p className="text-white/80">Our admins take merit seriously. Please complete your professional profile with your badges, resume, and skills to unlock premium assignments.</p>
          </div>
          <button onClick={() => setActiveTab('verify')} className="px-8 py-4 bg-white text-amber-600 font-black rounded-[2rem] shadow-xl hover:scale-105 transition-all">Submit Portfolio →</button>
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-gray-100 dark:bg-gray-800/40 rounded-[2rem] w-fit">
        {[
          { id: 'projects', label: 'Corporate Projects', icon: BriefcaseIcon },
          { id: 'bookings', label: 'Service Bookings', icon: CalendarDaysIcon, count: pendingCount },
          { id: 'services', label: 'My Listings', icon: StarIcon },
          { id: 'verify',   label: 'Professional Profile', icon: IdentificationIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-md scale-105'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}>
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && <span className="ml-2 w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center">{tab.count}</span>}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader size="lg" /></div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            
            {activeTab === 'projects' && (
              <div className="space-y-10">
                {/* Available for Bidding */}
                <div>
                   <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Marketplace Projects</h2>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                         <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                         <input type="text" placeholder="Filter by skill..." className="bg-transparent border-none text-xs font-bold focus:ring-0 placeholder:text-gray-400" />
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {marketplace.length > 0 ? marketplace.map(project => {
                        const hasApplied = myApps.some(app => app._id === project._id);
                        return (
                          <div key={project._id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all group">
                             <div className="flex justify-between items-start mb-4">
                               <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                                 {CATEGORY_ICONS[project.category] || <BriefcaseIcon className="w-6 h-6" />}
                               </div>
                               <div className="text-right">
                                 <p className="text-xl font-black text-gray-900 dark:text-white">{formatPrice(project.budget)}</p>
                                 <p className="text-[10px] font-black uppercase text-gray-400">Fixed Contract</p>
                               </div>
                             </div>
                             <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{project.title}</h3>
                             <p className="text-sm text-gray-500 mt-2 line-clamp-3 leading-relaxed">{project.description}</p>
                              
                             <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {project.roles?.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Available Roles</p>
                                    <div className="flex flex-wrap gap-2">
                                      {project.roles.map(r => (
                                        <span key={r} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-tight italic">{r}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Technical Stack</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(project.skillsRequired || []).map(skill => (
                                      <span key={skill} className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-[9px] font-black uppercase text-gray-500">{skill}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {project.requirements && (
                                <div className="mt-6 p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                   <p className="text-[9px] font-black uppercase text-primary-600 mb-1">Deliverables & Specs</p>
                                   <p className="text-xs text-gray-400 italic line-clamp-2">{project.requirements}</p>
                                </div>
                              )}

                             <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary-600 italic">
                                    <ClockIcon className="w-4 h-4" /> {project.timeline || 'TBA'}
                                 </div>
                                {hasApplied ? (
                                   <span className="px-6 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black uppercase">Applied</span>
                                ) : (
                                  <button 
                                    onClick={() => setApplyModal(project._id)}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-600/20 hover:scale-105 transition"
                                  >
                                    Apply Now
                                  </button>
                                )}
                             </div>
                          </div>
                        );
                      }) : (
                        <div className="col-span-full py-20 text-center card bg-gray-50/50">
                           <p className="text-gray-400">No active corporate projects in this category.</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* My Active Applications */}
                <div className="pt-10 border-t border-gray-100 dark:border-gray-800">
                   <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Application Status</h2>
                   <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/60 text-[10px] font-black uppercase tracking-widest text-gray-400">
                           <tr>
                             <th className="px-10 py-5">Project Title</th>
                             <th className="px-10 py-5">Budget</th>
                             <th className="px-10 py-5">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                           {myApps.map(app => (
                             <tr key={app._id} className="text-gray-900 dark:text-white">
                                <td className="px-10 py-6 font-bold text-sm">{app.title}</td>
                                <td className="px-10 py-6 font-black text-sm">{formatPrice(app.budget)}</td>
                                <td className="px-10 py-6">
                                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                     app.status === 'open' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                                   }`}>
                                      {app.status}
                                   </span>
                                </td>
                             </tr>
                           ))}
                           {myApps.length === 0 && <tr><td colSpan="3" className="px-10 py-10 text-center text-gray-400 text-sm italic">You haven't applied for any projects yet.</td></tr>}
                        </tbody>
                      </table>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-4">
                 {bookings.map(b => (
                   <div key={b._id} className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/40 rounded-2xl flex items-center justify-center text-primary-600">
                            {CATEGORY_ICONS[b.service?.category] || '🛠️'}
                         </div>
                         <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{b.service?.title}</h3>
                            <p className="text-xs text-gray-500">Client: {b.user?.name} • {formatDate(b.bookingDate)}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                         {b.status === 'pending' && <button onClick={() => updateBookingStatus(b._id, 'confirmed')} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold">Accept</button>}
                      </div>
                   </div>
                 ))}
                 {bookings.length === 0 && <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-[2rem] text-gray-400 italic">No service bookings yet.</div>}
              </div>
            )}

            {activeTab === 'services' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {services.map(svc => (
                   <div key={svc._id} className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 group hover:shadow-2xl transition-all">
                      <div className="flex items-center gap-3 mb-4">
                         <span className="text-3xl">{CATEGORY_ICONS[svc.category]}</span>
                         <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">{svc.title}</h3>
                      </div>
                      <p className="text-xl font-black text-gray-900 dark:text-white mb-6">{formatPrice(svc.price?.amount)}</p>
                      <div className="flex gap-2">
                         <button className="flex-1 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500">Edit</button>
                         <button className="flex-1 py-3 bg-rose-50 dark:bg-rose-900/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-600">Delete</button>
                      </div>
                   </div>
                 ))}
                 {services.length === 0 && <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-900 rounded-[2rem] text-gray-400 italic">You haven't listed any private services yet.</div>}
              </div>
            )}

            {activeTab === 'verify' && (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center text-primary-600">
                      <IdentificationIcon className="w-8 h-8" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white">Professional Identity</h2>
                      <p className="text-sm text-gray-500">Provide required information for admin verification and corporate project matching.</p>
                   </div>
                </div>

                <form onSubmit={handleVerifySubmit} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-6">
                         <h3 className="text-sm font-black uppercase tracking-widest text-primary-600 mb-2">Qualifications</h3>
                         <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Education *</label>
                            <input required type="text" placeholder="e.g. B.Tech Computer Science" value={verifForm.education} onChange={e => setVerifForm({...verifForm, education: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white"/>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Core Skills (Comma separated) *</label>
                            <input required type="text" placeholder="e.g. React.js, Python, UI Design" value={verifForm.skills} onChange={e => setVerifForm({...verifForm, skills: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white"/>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Current Status *</label>
                            <select value={verifForm.currentStatus} onChange={e => setVerifForm({...verifForm, currentStatus: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">
                               <option value="Student">Student</option>
                               <option value="Freelancer">Full-time Freelancer</option>
                               <option value="Unstop member">Unstop Member</option>
                               <option value="Working Professional">Working Professional</option>
                            </select>
                         </div>
                      </div>

                      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-6">
                         <h3 className="text-sm font-black uppercase tracking-widest text-primary-600 mb-2">Links & Portfolio</h3>
                         <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Portfolio URL</label>
                            <input type="url" placeholder="https://yourportfolio.com" value={verifForm.portfolioUrl} onChange={e => setVerifForm({...verifForm, portfolioUrl: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white"/>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">LinkedIn Profile</label>
                            <input type="url" placeholder="https://linkedin.com/in/..." value={verifForm.linkedInUrl} onChange={e => setVerifForm({...verifForm, linkedInUrl: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white"/>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">GitHub Profile</label>
                            <input type="url" placeholder="https://github.com/..." value={verifForm.githubUrl} onChange={e => setVerifForm({...verifForm, githubUrl: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white"/>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Professional Bio</label>
                      <textarea rows={4} placeholder="Describe your experience and merit to the admins..." value={verifForm.bio} onChange={e => setVerifForm({...verifForm, bio: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white resize-none"/>
                   </div>

                   <button type="submit" disabled={submitting} className="w-full py-5 bg-primary-600 text-white font-black rounded-[2rem] text-sm uppercase tracking-widest shadow-2xl shadow-primary-600/30 hover:scale-[1.01] transition-all">Update & Verify Profile</button>
                </form>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Bidding / Application Modal ── */}
      {applyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setApplyModal(null)} className="absolute top-8 right-8 p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><XCircleIcon className="w-6 h-6" /></button>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Apply for Project</h2>
              <p className="text-sm text-gray-500 mb-8">Tell the admin why you're the best fit for this merit-based assignment.</p>
              
              <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 mb-8">
                 <BriefcaseIcon className="w-6 h-6 text-indigo-600" />
                 <div>
                    <p className="text-[10px] font-black uppercase text-indigo-800 dark:text-indigo-400">Match Your Role</p>
                    <p className="text-[10px] text-indigo-600">Select the area where you excel most.</p>
                 </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Which role are you applying for?</label>
                <div className="flex flex-wrap gap-2">
                  {(marketplace.find(p => p._id === applyModal)?.roles || []).map(role => (
                    <button 
                      key={role} 
                      type="button"
                      onClick={() => setApplyNotes(prev => prev.includes(`[Role: ${role}]`) ? prev : `[Role: ${role}] ${prev}`)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-[10px] font-black uppercase hover:bg-primary-500 hover:text-white transition"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleApply} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Primary Email</label>
                        <input required type="email" placeholder="you@example.com" value={applyEmail} onChange={e => setApplyEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white"/>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">WhatsApp / Phone</label>
                        <input required type="tel" placeholder="+91 ..." value={applyPhone} onChange={e => setApplyPhone(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white"/>
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Application Message</label>
                    <textarea required rows={5} placeholder="I have a 100% score in Web Development Academy and 2 successful projects..." value={applyNotes} onChange={e => setApplyNotes(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white resize-none"/>
                 </div>
                 <button type="submit" disabled={submitting} className="w-full py-5 bg-primary-600 text-white font-black rounded-[2rem] text-sm uppercase tracking-widest shadow-xl shadow-primary-600/30">
                    {submitting ? 'Submitting Application...' : 'Send Bidding Request'}
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default ProviderDashboard;
