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
  MoreVerticalIcon
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import api from '../api/axios';
import { formatPrice, formatDate } from '../utils/helpers';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, providers

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

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setProviders(providersRes.data.providers);
      setEarningsData(earningsRes.data.earningsByMonth);
    } catch (err) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.users || 0, icon: UserGroupIcon, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Total Providers', value: stats?.providers || 0, icon: BriefcaseIcon, color: 'bg-purple-500', trend: '+5%' },
    { label: 'Total Earnings', value: formatPrice(stats?.earnings || 0), icon: CurrencyRupeeIcon, color: 'bg-green-500', trend: '+24%' },
    { label: 'Project Growth', value: '88%', icon: TrendingUpIcon, color: 'bg-amber-500', trend: '+18%' },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Admin Central</h1>
            <p className="text-gray-500 dark:text-gray-400">Total control over the C2C ecosystem.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="btn-secondary py-2 px-4 shadow-sm">Refresh Data</button>
            <button className="btn-primary py-2 px-4 shadow-lg shadow-primary-600/20">Download Report</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="card p-6 border-none shadow-xl bg-white dark:bg-gray-900 group hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-2xl ${card.color} text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                    {card.trend}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{card.label}</h3>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-2xl w-fit">
          {['overview', 'users', 'providers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Earnings Chart */}
            <div className="lg:col-span-2 card p-8 min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Earnings Breakdown</h2>
                  <p className="text-xs text-gray-500">Monthly revenue trends</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <TrendingUpIcon className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="_id" 
                      tickFormatter={(val) => `Month ${val}`} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#9CA3AF', fontSize: 12}}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#9CA3AF', fontSize: 12}}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(val) => [`₹${val}`, 'Earnings']}
                    />
                    <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Orders / Summary */}
            <div className="card p-8">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">User Distribution</h2>
               <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Users', count: stats?.users },
                      { name: 'Providers', count: stats?.providers }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="count" fill="#4f46e5" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}

        {/* Tables for Users and Providers */}
        {activeTab !== 'overview' && (
          <div className="card overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'users' ? 'Registered Users' : 'Verified Providers'}
              </h2>
              <div className="flex gap-2">
                 <div className="relative">
                   <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                 </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-8 py-4 font-bold">Details</th>
                    <th className="px-8 py-4 font-bold">Email</th>
                    <th className="px-8 py-4 font-bold">Joined</th>
                    <th className="px-8 py-4 font-bold">Status</th>
                    <th className="px-8 py-4 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(activeTab === 'users' ? users : providers).map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 font-bold">
                            {item.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-sm text-gray-600 dark:text-gray-300">{item.email}</td>
                      <td className="px-8 py-4 text-sm text-gray-500">{formatDate(item.createdAt)}</td>
                      <td className="px-8 py-4">
                         <span className="badge bg-green-100 text-green-700">Active</span>
                      </td>
                      <td className="px-8 py-4">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
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

      </div>
    </div>
  );
};

export default AdminDashboard;
