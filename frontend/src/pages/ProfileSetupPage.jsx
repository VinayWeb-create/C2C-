import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, AcademicCapIcon, 
  LinkIcon, ArrowRightIcon,
  CloudArrowUpIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfileSetupPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    education: user?.professionalInfo?.education || '',
    github: user?.professionalInfo?.githubUrl || user?.professionalInfo?.portfolioUrl || '',
    linkedin: user?.professionalInfo?.linkedInUrl || '',
    resumeLink: user?.professionalInfo?.resumeUrl || '',
    bio: user?.professionalInfo?.bio || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name: formData.name,
        phone: formData.phone,
        professionalInfo: {
          education: formData.education,
          resumeUrl: formData.resumeLink,
          portfolioUrl: formData.github,
          githubUrl: formData.github,
          linkedInUrl: formData.linkedin,
          bio: formData.bio,
          skills: []
        },
        isProfileComplete: true
      });
      
      updateUser(data.user);
      toast.success('Professional profile built successfully! 🚀');
      navigate(user?.role === 'provider' ? '/dashboard/provider' : '/dashboard/user');
    } catch (err) {
      console.error('PROFILING ERROR:', err);
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full">
         <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
              {user?.isProfileComplete ? 'Update Your Identity' : 'Build Your Identity'}
            </h1>
            <p className="text-gray-500">
              {user?.isProfileComplete 
                ? 'Keep your professional details up to date for better opportunities.' 
                : 'Provide your credentials to start your career journey at C2C Hub.'}
            </p>
         </div>

         <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-gray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">Display Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field pl-12" placeholder="Your Name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">Phone Number</label>
                    <div className="relative">
                      <DevicePhoneMobileIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field pl-12" placeholder="+91 00000 00000" />
                    </div>
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">Highest Education</label>
                  <div className="relative">
                    <AcademicCapIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input required type="text" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} className="input-field pl-12" placeholder="e.g. B.Tech Computer Science" />
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">Public Resume Link (Google Drive/Dropbox)</label>
                  <div className="relative">
                    <CloudArrowUpIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input required type="url" value={formData.resumeLink} onChange={e => setFormData({...formData, resumeLink: e.target.value})} className="input-field pl-12" placeholder="https://drive.google.com/..." />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 px-2 italic">Make sure the link is set to "Anyone with the link can view"</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">GitHub / Portfolio</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="url" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} className="input-field pl-12" placeholder="https://github.com/..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">LinkedIn Pro</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="url" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="input-field pl-12" placeholder="https://linkedin.com/in/..." />
                    </div>
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">Short Professional Bio</label>
                  <textarea rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="input-field resize-none" placeholder="Tell us about your career goals..." />
               </div>

                <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full py-5 bg-primary-600 text-white font-black rounded-3xl shadow-xl shadow-primary-600/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
               >
                 {loading ? 'Saving Changes...' : (user?.isProfileComplete ? 'Update Professional Profile' : 'Complete Profile Setup')}
                 <ArrowRightIcon className="w-5 h-5" />
               </button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
