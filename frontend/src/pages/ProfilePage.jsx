import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  UserIcon, AcademicCapIcon, 
  LinkIcon, IdentificationIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowDownTrayIcon,
  TrophyIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  const stats = [
    { label: 'Marketplace Status', value: user.role === 'provider' ? (user.isApproved ? 'Verified Provider' : 'Under Review') : 'Active Learner', icon: ShieldCheckIcon },
    { label: 'Merit Badges', value: user.badges?.length || 0, icon: AcademicCapIcon },
    { label: 'Projects Applied', value: user.appliedProjects?.length || 0, icon: BriefcaseIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 shadow-xl border border-gray-100 dark:border-gray-800 mb-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-10" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-[2rem] flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-lg overflow-hidden">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon className="w-16 h-16 text-gray-400" />}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white">{user.name}</h1>
                <Link to="/profile-setup" className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl text-xs font-black uppercase tracking-widest border border-primary-200/50 hover:bg-primary-100 transition-all w-fit mx-auto md:mx-0">
                  <PencilSquareIcon className="w-4 h-4" />
                  Edit Profile
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500 text-sm font-bold">
                 <span className="flex items-center gap-1"><EnvelopeIcon className="w-4 h-4" /> {user.email}</span>
                 <span className="flex items-center gap-1"><PhoneIcon className="w-4 h-4" /> {user.phone}</span>
                 <span className="flex items-center gap-1 uppercase tracking-widest text-[10px] bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{user.role}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
               {user.badges?.map((badge, idx) => (
                 <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800 text-xs font-black">
                    <AcademicCapIcon className="w-4 h-4" />
                    {badge.name}
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                 <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 mb-4">
                    <Icon className="w-5 h-5" />
                 </div>
                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{stat.label}</p>
                 <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* Detailed Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-8">
             <section className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <IdentificationIcon className="w-6 h-6 text-primary-600" />
                  Professional Identity
                </h3>
                <div className="space-y-6">
                   <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Education</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{user.professionalInfo?.education || 'No education listed'}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Professional Bio</p>
                      <p className="text-sm text-gray-500 leading-relaxed italic">{user.professionalInfo?.bio || 'No bio provided'}</p>
                   </div>
                </div>
             </section>

             <section className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <LinkIcon className="w-6 h-6 text-primary-600" />
                  Assets & Links
                </h3>
                <div className="space-y-4">
                   {user.professionalInfo?.resumeUrl && (
                     <a href={user.professionalInfo.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-primary-50 transition-colors group">
                        <span className="text-sm font-bold">Public Resume</span>
                        <ArrowDownTrayIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                     </a>
                   )}
                   {user.professionalInfo?.portfolioUrl && (
                     <a href={user.professionalInfo.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-primary-50 transition-colors group">
                        <span className="text-sm font-bold">GitHub Portfolio</span>
                        <LinkIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                     </a>
                   )}
                   {user.professionalInfo?.linkedInUrl && (
                     <a href={user.professionalInfo.linkedInUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-primary-50 transition-colors group">
                        <span className="text-sm font-bold">LinkedIn Profile</span>
                        <LinkIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                     </a>
                   )}
                </div>
             </section>
          </div>

          <div className="space-y-8">
             <section className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm h-full">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-primary-600" />
                  Detailed Merit History
                </h3>
                <div className="space-y-6">
                   {user.testResults?.length > 0 ? (
                     user.testResults.map((result, idx) => (
                       <div key={idx} className="p-6 border border-gray-100 dark:border-gray-800 rounded-3xl bg-gray-50/50">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-sm font-black">{result.category}</span>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {result.passed ? 'PASSED' : 'FAILED'}
                             </span>
                          </div>
                          <div className="flex gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                             <span>Exam: {result.examScore}/50</span>
                             <span>Project: {result.projectScore}/50</span>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-20">
                        <AcademicCapIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 text-sm font-bold">No academic records yet.</p>
                     </div>
                   )}
                </div>
             </section>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
