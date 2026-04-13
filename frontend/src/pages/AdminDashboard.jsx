import { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  IndianRupee, 
  TrendingUp, 
  Users as UsersGroup,
  ArrowUpRight,
  Filter,
  Search,
  MoreVertical,
  Calendar,
  MapPin,
  Star,
  ShieldCheck,
  Activity,
  ArrowDown,
  ArrowUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  Target,
  Trophy
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../api/axios';
import { formatPrice, formatDate, CATEGORIES } from '../utils/helpers';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, approvals, projects, users, providers

  // Project Form State
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '', description: '', budget: '', category: CATEGORIES[0], 
    skillsRequired: '', roles: '', requirements: '', timeline: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, providersRes, earningsRes, pendingRes, projectsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/providers'),
        api.get('/admin/earnings'),
        api.get('/admin/providers/pending'),
        api.get('/projects')
      ]);

      setStats(statsRes.data.stats);
      setStatusData(statsRes.data.bookingStatusData || []);
      setCategoryData(statsRes.data.categoryDistribution || []);
      setTopProviders(statsRes.data.topProviders || []);
      setRecentBookings(statsRes.data.recentBookings || []);
      
      setUsers(usersRes.data.users || []);
      setProviders(providersRes.data.providers || []);
      setPendingProviders(pendingRes.data.providers || []);
      setEarningsData(earningsRes.data.earningsByMonth || []);
      setProjects(projectsRes.data.projects || []);
    } catch (err) {
      console.error('Admin Fetch Error:', err);
      toast.error('Failed to fetch comprehensive admin data');
    } finally {
      setLoading(false);
    }
  };

  const handlePostProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...projectForm,
        budget: parseFloat(projectForm.budget),
        skillsRequired: projectForm.skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
        roles: projectForm.roles.split(',').map(r => r.trim()).filter(Boolean)
      };
      await api.post('/projects', payload);
      toast.success('Corporate project posted successfully! 🚀');
      setShowProjectForm(false);
      setProjectForm({ 
        title: '', description: '', budget: '', category: CATEGORIES[0], 
        skillsRequired: '', roles: '', requirements: '', timeline: '' 
      });
      fetchData();
    } catch {
      toast.error('Failed to post project');
    }
  };

  const handleAssign = async (projectId, providerId) => {
    try {
      await api.put(`/projects/${projectId}/assign`, { providerId });
      toast.success('Project assigned! Communication channel opened.');
      fetchData();
    } catch {
      toast.error('Assignment failed');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/providers/${id}/approve`);
      toast.success('Provider approved! they can now list services.');
      fetchData();
    } catch {
      toast.error('Approval failed');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this application?')) return;
    try {
      await api.delete(`/admin/providers/${id}/reject`);
      toast.success('Application rejected');
      fetchData();
    } catch {
      toast.error('Rejection failed');
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.users || 0, icon: UsersGroup, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', isUp: true },
    { label: 'Verified Providers', value: stats?.providers || 0, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+5%', isUp: true },
    { label: 'Net Revenue', value: formatPrice(stats?.earnings || 0), icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50', trend: '+24%', isUp: true },
    { label: 'Active Projects', value: projects.length, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Market', isUp: true },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Loader size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 px-2 bg-primary-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest">Master Admin</span>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">CTOC Command Center</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Managing the transition from Campus to Corporate.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowProjectForm(true)} className="btn-primary py-2.5 px-6 flex items-center gap-2 shadow-xl shadow-primary-600/20">
              <Plus className="w-4 h-4" />
              Post Corporate Project
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div 
                whileHover={{ y: -5 }}
                key={card.label} 
                className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full ${card.isUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {card.isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {card.trend}
                  </div>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">{card.label}</h3>
                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{card.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 mb-8 p-1.5 bg-gray-200/40 dark:bg-gray-800/40 rounded-3xl w-fit">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'projects', label: 'Market Projects' },
            { id: 'approvals', label: `Pending Approvals (${pendingProviders.length})` },
            { id: 'users', label: 'Users' },
            { id: 'providers', label: 'Providers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3 rounded-2xl text-sm font-black transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-xl scale-105' 
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Earnings Area Chart */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Revenue Growth</h2>
                        <p className="text-sm text-gray-400">Monthly profit analysis.</p>
                      </div>
                    </div>
                    <div className="w-full">
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={earningsData}>
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="_id" tickFormatter={(val) => `M${val}`} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}/>
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(val) => `₹${val}`}/>
                          <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}/>
                          <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#chartGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Performers (Providers) */}
                  <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Alpha Providers</h2>
                    <p className="text-sm text-gray-400 mb-10">Highest merit badge holders.</p>
                    <div className="space-y-6">
                      {providers.slice(0, 5).map((prov, idx) => (
                        <div key={prov._id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-primary-600">
                                {prov.name[0]}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white">{prov.name}</h4>
                              <div className="flex items-center gap-1">
                                {(prov.badges || []).map(b => (
                                  <Trophy key={b.name} className="w-3 h-3 text-amber-500" />
                                ))}
                                <span className="text-[9px] font-black text-gray-400">{(prov.badges || []).length} Badges</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                 <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Active Corporate Contracts</h2>
                    <p className="text-gray-500">Manage high-value projects and assign them to verified providers.</p>
                 </div>

                 <div className="grid grid-cols-1 gap-6">
                    {projects.map(project => (
                      <div key={project._id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800">
                         <div className="flex justify-between items-start mb-6">
                            <div>
                               <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">{project.category}</span>
                               <h3 className="text-xl font-black text-gray-900 dark:text-white">{project.title}</h3>
                               <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                            </div>
                             <div className="text-right">
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{formatPrice(project.budget)}</p>
                                <p className="text-[10px] font-black uppercase text-gray-400 mt-1">Status: {project.status}</p>
                                {project.timeline && <p className="text-[10px] font-bold text-primary-600 mt-1 uppercase tracking-widest italic">{project.timeline}</p>}
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {project.roles?.length > 0 && (
                              <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Available Roles</h4>
                                <div className="flex flex-wrap gap-2">
                                  {project.roles.map(role => (
                                    <span key={role} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-[9px] font-bold uppercase">{role}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {project.skillsRequired?.length > 0 && (
                              <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Technical Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                  {project.skillsRequired.map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-[9px] font-bold uppercase">{skill}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {project.requirements && (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                               <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Specific Requirements</h4>
                               <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{project.requirements}</p>
                            </div>
                          )}

                         {project.status === 'open' && (
                           <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-800">
                              <h4 className="text-sm font-black text-gray-900 dark:text-white mb-4 uppercase tracking-widest">Applicants ({project.applications?.length || 0})</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                 {(project.applications || []).map(app => (
                                   <div key={app._id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                      <div className="flex items-center gap-3 mb-3">
                                         <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center font-bold text-xs">{app.provider?.name?.[0]}</div>
                                         <span className="text-xs font-bold text-gray-900 dark:text-white">{app.provider?.name}</span>
                                      </div>
                                      <p className="text-[10px] text-gray-500 mb-1 line-clamp-2"><strong>Notes:</strong> {app.notes || 'No message'}</p>
                                      <div className="flex flex-col gap-1 mb-4">
                                         {app.contactEmail && <p className="text-[9px] text-primary-600 font-bold truncate tracking-tight">{app.contactEmail}</p>}
                                         {app.contactPhone && <p className="text-[9px] text-gray-400 font-bold tracking-tight">{app.contactPhone}</p>}
                                      </div>
                                      <button 
                                        onClick={() => handleAssign(project._id, app.provider?._id || app.provider)}
                                        className="w-full py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                                      >
                                        Assign Project
                                      </button>
                                   </div>
                                 ))}
                                 {project.applications?.length === 0 && <p className="text-xs text-gray-400">Waiting for applications...</p>}
                              </div>
                           </div>
                         )}
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'approvals' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 mb-8">
                   <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Registration Queue</h2>
                   <p className="text-gray-500">Verify and approve new providers to maintain ecosystem quality.</p>
                </div>

                {pendingProviders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Queue is Empty</h3>
                    <p className="text-gray-400">All provider applications have been processed.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pendingProviders.map((prov) => (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={prov._id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-black">{prov.name?.[0]}</div>
                            <div>
                              <h3 className="text-lg font-black text-gray-900 dark:text-white">{prov.name}</h3>
                              <p className="text-sm text-gray-400 font-medium">{prov.email}</p>
                            </div>
                          </div>
                          <div className="space-y-4 mb-8">
                             <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Merit Badges</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                   {(prov.badges || []).map(b => (
                                     <span key={b.name} className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded-full flex items-center gap-1">
                                       <Trophy className="w-3 h-3" /> {b.name}
                                     </span>
                                   ))}
                                   {(prov.badges || []).length === 0 && <span className="text-xs text-amber-600 italic">No professional badges earned</span>}
                                </div>
                             </div>
                             <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                               <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Education & Status</p>
                               <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{prov.professionalInfo?.education || 'No info'}</p>
                             </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => handleApprove(prov._id)} className="flex-1 py-3 bg-primary-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-primary-600/20">Approve</button>
                          <button onClick={() => handleReject(prov._id)} className="flex-1 py-3 bg-rose-50 text-rose-600 font-black rounded-2xl text-xs uppercase tracking-widest border border-rose-100">Reject</button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                   <h2 className="text-2xl font-black text-gray-900 dark:text-white">Active Users</h2>
                   <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm" />
                   </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <tr>
                        <th className="px-10 py-5">Full Name</th>
                        <th className="px-10 py-5">Contact Details</th>
                        <th className="px-10 py-5">Merit Info</th>
                        <th className="px-10 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition text-gray-900 dark:text-white">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{user.name?.[0]}</div>
                              <span className="text-sm font-bold">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 font-medium text-sm text-gray-500">{user.email}</td>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-1 font-black text-amber-500 text-[10px] uppercase">
                               <Trophy className="w-3 h-3" /> {(user.badges || []).length} Badges
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                             <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition text-gray-400"><MoreVertical className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'providers' && (
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                   <h2 className="text-2xl font-black text-gray-900 dark:text-white">Verified Providers</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <tr>
                        <th className="px-10 py-5">Full Name</th>
                        <th className="px-10 py-5">Professional Badges</th>
                        <th className="px-10 py-5">Active Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {providers.map((prov) => (
                        <tr key={prov._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition text-gray-900 dark:text-white">
                          <td className="px-10 py-6 flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">{prov.name?.[0]}</div>
                             <span className="text-sm font-bold">{prov.name}</span>
                          </td>
                          <td className="px-10 py-6">
                             <div className="flex gap-2">
                               {(prov.badges || []).map(b => (
                                 <span key={b.name} className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[9px] font-black uppercase tracking-widest">{b.name}</span>
                               ))}
                             </div>
                          </td>
                          <td className="px-10 py-6 text-xs font-bold text-gray-500">{prov.professionalInfo?.currentStatus || 'Professional'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>

      {/* Project Post Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <button onClick={() => setShowProjectForm(false)} className="absolute top-8 right-8 p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><XCircle /></button>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Post New Contract</h2>
              <form onSubmit={handlePostProject} className="space-y-6">
                 <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Project Title</label>
                    <input required type="text" placeholder="e.g. Modern E-commerce Frontend Build" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-gray-300 text-gray-900 dark:text-white"/>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Category</label>
                      <select value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Budget (₹)</label>
                      <input required type="number" placeholder="5000" value={projectForm.budget} onChange={e => setProjectForm({...projectForm, budget: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white"/>
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Detailed Description</label>
                    <textarea required rows={4} placeholder="Describe the scope, deliverables, and timeline..." value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white resize-none"/>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Freelancing Roles (e.g. Frontend, API Dev)</label>
                        <input required type="text" placeholder="Frontend, Backend, UI/UX" value={projectForm.roles} onChange={e => setProjectForm({...projectForm, roles: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white"/>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Technical Skills (Comma separated)</label>
                        <input required type="text" placeholder="React, Node.js, TailWind" value={projectForm.skillsRequired} onChange={e => setProjectForm({...projectForm, skillsRequired: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white"/>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Timeline / Duration</label>
                        <input type="text" placeholder="e.g. 2 Months, 15 Days" value={projectForm.timeline} onChange={e => setProjectForm({...projectForm, timeline: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white"/>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Registration Deadline (Optional)</label>
                        <input type="date" value={projectForm.deadline} onChange={e => setProjectForm({...projectForm, deadline: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white"/>
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Deliverables & Requirements</label>
                    <textarea rows={3} placeholder="List out specific expectations..." value={projectForm.requirements} onChange={e => setProjectForm({...projectForm, requirements: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white resize-none"/>
                 </div>
                 <button type="submit" className="w-full py-5 bg-primary-600 text-white font-black rounded-3xl text-sm uppercase tracking-widest shadow-xl shadow-primary-600/30 hover:scale-[1.02] transition">Authorize & Post Contract</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
