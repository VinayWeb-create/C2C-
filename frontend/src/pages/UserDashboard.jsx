import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon, StarIcon, ClockIcon, 
  AcademicCapIcon, TrophyIcon, PlayCircleIcon,
  BriefcaseIcon, CheckBadgeIcon, ChartBarIcon,
  ArrowRightIcon, VideoCameraIcon, MapIcon,
  ShieldCheckIcon, BeakerIcon
} from '@heroicons/react/24/outline';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const UserDashboard = () => {
  const { user, becomeProvider } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeDomain, setActiveDomain] = useState('Web Development');

  const handleBecomeProvider = async () => {
    const res = await becomeProvider();
    if (res.success) {
      navigate('/dashboard/provider');
    }
  };

  // Stats calculation based on user data
  const stats = {
    badges: user?.badges?.length || 0,
    tests: user?.testResults?.length || 0,
    // Mocking video/roadmap data as it's not in the DB yet, but can be simulated for UI
    videos: Math.floor((user?.testResults?.length || 0) * 2.5), 
    roadmaps: user?.badges?.length ? 1 : 0,
    projects: user?.badges?.length || 0
  };

  useEffect(() => {
    // Simulated load to fetch latest user details
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const hasProfessionalBadge = user?.badges?.some(b => b.role === user.activeLearningDomain);
  const currentTestResult = user?.testResults?.find(r => r.category === user.activeLearningDomain);

  // Calculate dynamic progress
  const calculateProgress = () => {
    if (!user?.activeLearningDomain) return 10;
    if (hasProfessionalBadge) return 100;
    if (currentTestResult) return 75;
    
    // Calculate video completion ratio (assuming 5 videos per domain for now)
    const videosCompleted = user?.completedVideos?.length || 0;
    const moreProgress = Math.min(videosCompleted * 5, 20); // 20% base + up to 20% from videos = 40%
    return 20 + moreProgress;
  };
  const academyProgress = calculateProgress();

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-950"><Loader size="lg" /></div>;

  return (
    <div className="page-container page-enter pb-20">
      
      {/* ── Profile Header with Badge ── */}
      <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-8 p-10 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl">
              {user?.name?.[0]}
            </div>
            {hasProfessionalBadge && (
              <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1.5 rounded-xl border-4 border-white dark:border-gray-900 shadow-lg animate-bounce">
                <TrophyIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">Hi, {user?.name?.split(' ')[0]}!</h1>
              {hasProfessionalBadge && <CheckBadgeIcon className="w-6 h-6 text-primary-500" />}
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {hasProfessionalBadge 
                ? `${user.activeLearningDomain} Authorized Professional` 
                : user.activeLearningDomain ? `${user.activeLearningDomain} Specialist Trainee` : 'Student Advocate at C2C Academy'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 relative z-10">
          <button onClick={() => navigate('/learning')} className="btn-primary py-3 px-8 rounded-2xl flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5" /> {user.activeLearningDomain ? `Continue ${user.activeLearningDomain}` : 'Choose a Domain'}
          </button>
          {hasProfessionalBadge ? (
            <button 
              onClick={handleBecomeProvider} 
              className="btn-secondary py-3 px-8 rounded-2xl flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 hover:bg-amber-100 transition shadow-lg"
            >
              <ShieldCheckIcon className="w-5 h-5" /> Switch to Provider
            </button>
          ) : (
            <div className="px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <ClockIcon className="w-4 h-4" /> Provider Badge Locked
            </div>
          )}
        </div>
      </div>

      {/* ── Learning Merit Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {[
          { label: 'Videos Learned', value: stats.videos, icon: PlayCircleIcon, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Roadmaps Started', value: user.activeLearningDomain ? 1 : 0, icon: MapIcon, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Projects Done', value: currentTestResult ? 1 : 0, icon: BriefcaseIcon, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Practice Tests', value: currentTestResult ? 1 : 0, icon: BeakerIcon, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Merit Score', value: hasProfessionalBadge ? '100%' : currentTestResult ? 'Assessment Pending' : '0%', icon: TrophyIcon, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <motion.div whileHover={{ y: -5 }} key={card.label} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* ── Learning Journey Progress ── */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                   <ChartBarIcon className="w-6 h-6 text-primary-600" /> Current Learning Journey
                 </h2>
                 <div className="bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-primary-200/50">
                    {user.activeLearningDomain || 'Domain Not Selected'}
                 </div>
              </div>

              <div className="space-y-10">
                 <div>
                    <div className="flex justify-between items-end mb-4">
                       <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white">Academy Progression</p>
                          <p className="text-xs text-gray-400">Roadmap to Professional Badge</p>
                       </div>
                       <span className="text-xl font-black text-primary-600">{academyProgress}%</span>
                    </div>
                    <div className="w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${academyProgress}%` }}
                         className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 shadow-lg shadow-primary-600/20"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: user.activeLearningDomain || 'Foundations', status: user.activeLearningDomain ? 'In Progress' : 'Pending', icon: CheckBadgeIcon, color: user.activeLearningDomain ? 'text-blue-500' : 'text-gray-300' },
                      { title: 'Project Work', status: hasProfessionalBadge ? 'Completed' : currentTestResult ? 'Under Review' : 'Locked', icon: BriefcaseIcon, color: hasProfessionalBadge ? 'text-green-500' : currentTestResult ? 'text-blue-500' : 'text-gray-300' },
                      { title: 'Merit Test', status: hasProfessionalBadge ? '100% Score' : currentTestResult ? 'Score: ' + currentTestResult.score : 'Locked', icon: TrophyIcon, color: hasProfessionalBadge ? 'text-amber-500' : currentTestResult ? 'text-blue-500' : 'text-gray-300' },
                      { title: 'Provider Badge', status: hasProfessionalBadge ? 'Earned' : 'Locked', icon: ShieldCheckIcon, color: hasProfessionalBadge ? 'text-primary-500' : 'text-gray-300' },
                    ].map((step) => (
                      <div key={step.title} className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-[1.5rem] border border-gray-100 dark:border-gray-750 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <step.icon className={`w-5 h-5 ${step.color}`} />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{step.title}</span>
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{step.status}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* ── Submitted Projects ── */}
           <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                 <BriefcaseIcon className="w-6 h-6 text-primary-600" /> Project Portfolio
              </h2>
              
              {user?.badges?.length > 0 ? (
                <div className="space-y-4">
                   {user.badges.map((badge, idx) => (
                      <div key={idx} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-gray-750 flex items-center justify-between group hover:border-primary-500 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-sm">
                               <TrophyIcon className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-900 dark:text-white">{badge.name}</h4>
                               <p className="text-xs text-gray-400">Awarded on {new Date(badge.issuedAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">Admin Approved</span>
                         </div>
                      </div>
                   ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                   <p className="text-gray-400 italic">No projects submitted for review yet.</p>
                   <button onClick={() => navigate('/learning')} className="mt-4 text-primary-600 font-bold text-sm flex items-center gap-2 mx-auto hover:underline">
                      Go to Academy <ArrowRightIcon className="w-4 h-4" />
                   </button>
                </div>
              )}
           </div>
        </div>

        {/* ── Sidebar: Tests & Certificates ── */}
        <div className="space-y-8">
           <div className="bg-gradient-to-br from-indigo-600 to-primary-700 rounded-[2.5rem] p-10 text-white shadow-xl shadow-primary-600/20">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                 <VideoCameraIcon className="w-6 h-6" /> Quick Actions
              </h3>
              <div className="space-y-4">
                 <button onClick={() => navigate('/learning')} className="w-full py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-left px-6 text-sm font-bold hover:bg-white/20 transition">
                    🎥 Last Watched: Video #4
                 </button>
                 <button onClick={() => navigate('/learning')} className="w-full py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-left px-6 text-sm font-bold hover:bg-white/20 transition">
                    📝 View Roadmap Docs
                 </button>
              </div>
           </div>

           <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest">Merit Tests</h3>
              <div className="space-y-6">
                 {user?.testResults?.length > 0 ? user.testResults.map((result, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Test #{result.testId}</span>
                       </div>
                       <span className="font-black text-primary-600 text-sm">{result.score}%</span>
                    </div>
                 )) : (
                    <p className="text-xs text-gray-400">Complete sessions to unlock tests.</p>
                 )}
              </div>
           </div>
        </div>

      </div>

    </div>
  );
};

export default UserDashboard;
