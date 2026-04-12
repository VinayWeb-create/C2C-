import { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  BriefcaseIcon, 
  CurrencyRupeeIcon, 
  TrendingUpIcon, 
  UserGroupIcon,
  ArrowUpRightIcon,
  FilterIcon,
  SearchIcon,
  MoreVerticalIcon,
  PieChartIcon,
  BarChart3Icon,
  CalendarIcon,
  MapPinIcon,
  StarIcon,
  ShieldCheckIcon,
  ActivityIcon,
  ArrowDownIcon,
  ArrowUpIcon
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../api/axios';
import { formatPrice, formatDate, capitalize } from '../utils/helpers';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, providers, analytics

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, providersRes, earningsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/providers'),
        api.get('/admin/earnings')
      ]);

      const data = statsRes.data;
      setStats(data.stats);
      setStatusData(data.bookingStatusData);
      setCategoryData(data.categoryDistribution);
      setTopProviders(data.topProviders);
      setRecentBookings(data.recentBookings);
      
      setUsers(usersRes.data.users);
      setProviders(providersRes.data.providers);
      setEarningsData(earningsRes.data.earningsByMonth);
    } catch (err) {
      toast.error('Failed to fetch comprehensive admin data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.users || 0, icon: UserGroupIcon, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', isUp: true },
    { label: 'Verified Providers', value: stats?.providers || 0, icon: ShieldCheckIcon, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+5%', isUp: true },
    { label: 'Net Revenue', value: formatPrice(stats?.earnings || 0), icon: CurrencyRupeeIcon, color: 'text-green-600', bg: 'bg-green-50', trend: '+24%', isUp: true },
    { label: 'Active Projects', value: recentBookings.length, icon: ActivityIcon, color: 'text-amber-600', bg: 'bg-amber-50', trend: '-2%', isUp: false },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Loader size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 px-2 bg-primary-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest">Admin</span>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">Operations Command</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Complete visibility into your C2C freelancing ecosystem.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="btn-secondary py-2.5 px-5 flex items-center gap-2">
              <ActivityIcon className="w-4 h-4" />
              Refresh
            </button>
            <button className="btn-primary py-2.5 px-6 shadow-xl shadow-primary-600/20">Generate Report</button>
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
                    {card.isUp ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
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
          {['overview', 'users', 'providers', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-2xl text-sm font-black capitalize transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-xl scale-105' 
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {tab}
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
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Financial Growth</h2>
                        <p className="text-sm text-gray-400">Monthly revenue trends throughout the year.</p>
                      </div>
                      <select className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold px-4 py-2">
                        <option>2024 (Current)</option>
                        <option>2023</option>
                      </select>
                    </div>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={earningsData}>
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="_id" 
                            tickFormatter={(val) => `Month ${val}`} 
                            axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                          />
                          <YAxis 
                            axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                            tickFormatter={(val) => `₹${val}`}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                            formatter={(val) => [formatPrice(val), 'Revenue']}
                          />
                          <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#chartGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Booking Status Pie Chart */}
                  <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Project Success</h2>
                    <p className="text-sm text-gray-400 mb-8">Breakdown of booking outcomes.</p>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="count"
                            nameKey="_id"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {statusData.map((s, idx) => (
                        <div key={s._id} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="text-[10px] font-bold text-gray-500 uppercase">{s._id}: {s.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Category Popularity Bar Chart */}
                  <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Domain Popularity</h2>
                    <p className="text-sm text-gray-400 mb-10">Total services listed per category.</p>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="_id" 
                            type="category" 
                            axisLine={false} tickLine={false} 
                            tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} 
                            width={100}
                          />
                          <Tooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="count" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Performers (Providers) */}
                  <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Alpha Performers</h2>
                    <p className="text-sm text-gray-400 mb-10">Top earning providers in the system.</p>
                    <div className="space-y-6">
                      {topProviders.map((prov, idx) => (
                        <div key={prov._id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-primary-600">
                                {prov.details.name[0]}
                              </div>
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[10px] font-black text-white border-2 border-white dark:border-gray-900">
                                {idx + 1}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{prov.details.name}</h4>
                              <p className="text-xs text-gray-500">{prov.count} Successful Projects</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-gray-900 dark:text-white">{formatPrice(prov.totalEarnings)}</p>
                            <div className="flex items-center justify-end gap-1 text-[10px] text-amber-500 font-bold">
                              <StarIcon className="w-3 h-3 fill-current" />
                              4.9
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Bookings Table (Detailed) */}
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                   <div className="p-10 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                     <div>
                       <h2 className="text-2xl font-black text-gray-900 dark:text-white">Live Operations</h2>
                       <p className="text-sm text-gray-400">Real-time booking and project activity.</p>
                     </div>
                     <button className="text-xs font-black uppercase tracking-widest text-primary-600">View All Bookings →</button>
                   </div>
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                       <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                         <tr>
                           <th className="px-10 py-5">Client & Service</th>
                           <th className="px-10 py-5">Provider</th>
                           <th className="px-10 py-5">Date</th>
                           <th className="px-10 py-5">Price</th>
                           <th className="px-10 py-5">Status</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                         {recentBookings.map((booking) => (
                           <tr key={booking._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition">
                             <td className="px-10 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-sm">
                                    {booking.user.name[0]}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{booking.user.name}</p>
                                    <p className="text-xs text-gray-400">{booking.service.title}</p>
                                  </div>
                               </div>
                             </td>
                             <td className="px-10 py-6">
                               <div className="flex items-center gap-2">
                                 <BriefcaseIcon className="w-4 h-4 text-gray-300" />
                                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{booking.provider.name}</span>
                               </div>
                             </td>
                             <td className="px-10 py-6">
                               <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                 <CalendarIcon className="w-4 h-4" />
                                 {formatDate(booking.bookingDate)}
                               </div>
                             </td>
                             <td className="px-10 py-6">
                               <span className="text-sm font-black text-gray-900 dark:text-white">{formatPrice(booking.pricing.totalAmount)}</span>
                             </td>
                             <td className="px-10 py-6">
                               <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                 booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                 booking.status === 'pending'   ? 'bg-amber-100 text-amber-700' :
                                 booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                 'bg-blue-100 text-blue-700'
                               }`}>
                                 {booking.status}
                               </span>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              </div>
            )}

            {/* TAB: USERS LIST */}
            {activeTab === 'users' && (
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                   <h2 className="text-2xl font-black text-gray-900 dark:text-white">Active Population (Clients)</h2>
                   <div className="relative">
                     <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input type="text" placeholder="Search by name or email..." className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm" />
                   </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <tr>
                        <th className="px-10 py-5">Full Name</th>
                        <th className="px-10 py-5">Contact Details</th>
                        <th className="px-10 py-5">Location</th>
                        <th className="px-10 py-5">Registration Date</th>
                        <th className="px-10 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                {user.name[0]}
                              </div>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{user.email}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{user.phone || 'No phone set'}</p>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                               <MapPinIcon className="w-3 h-3" />
                               {user.location?.city || 'Not specified'}
                            </div>
                          </td>
                          <td className="px-10 py-6 text-xs text-gray-400 font-medium">{formatDate(user.createdAt)}</td>
                          <td className="px-10 py-6 text-right">
                             <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                               <MoreVerticalIcon className="w-4 h-4 text-gray-400" />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: PROVIDERS LIST */}
            {activeTab === 'providers' && (
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                   <h2 className="text-2xl font-black text-gray-900 dark:text-white">Strategic Partners (Providers)</h2>
                   <button className="btn-primary py-2 px-6 rounded-2xl text-xs">Verified Check →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <tr>
                        <th className="px-10 py-5">Partner Name</th>
                        <th className="px-10 py-5">Communication</th>
                        <th className="px-10 py-5">Skill Domain</th>
                        <th className="px-10 py-5">Status</th>
                        <th className="px-10 py-5 text-right">Access Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {providers.map((prov) => (
                        <tr key={prov._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                                {prov.name[0]}
                              </div>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{prov.name}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{prov.email}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{prov.phone}</p>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-wrap gap-1">
                               <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[9px] font-black uppercase tracking-wider text-gray-600">Pro Freelancer</span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
                              <ShieldCheckIcon className="w-3 h-3" />
                              Active
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                             <div className="flex justify-end gap-2">
                               <button className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-gray-700">Audit</button>
                               <button className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg border border-red-100">Suspend</button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                 <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mb-6">
                   <TrendingUpIcon className="w-10 h-10 text-primary-600" />
                 </div>
                 <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 text-center">Predictive Insights Coming Soon</h2>
                 <p className="text-gray-500 text-center max-w-md">Our AI system is currently analyzing year-to-date data to provide revenue forecasts and domain popularity predictions.</p>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default AdminDashboard;
