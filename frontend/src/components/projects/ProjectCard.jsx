import { Link } from 'react-router-dom';
import { BriefcaseIcon, ClockIcon, LockClosedIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { formatPrice, CATEGORY_ICONS } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const ProjectCard = ({ project }) => {
  const { user } = useAuth();
  const {
    _id, title, category, budget, description,
    skillsRequired, status, postedBy, createdAt
  } = project;

  // Check if provider has the badge for THIS specific category
  const hasRequiredBadge = user?.badges?.some(b => b.role === category) || user?.role === 'admin';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all group flex flex-col justify-between h-full relative">
      
      {!hasRequiredBadge && (
        <div className="absolute top-4 left-4 z-10">
           <div className="p-2 bg-amber-50 dark:bg-amber-900/40 rounded-xl border border-amber-200 text-amber-600 shadow-sm flex items-center gap-2" title="Merit Badge Required">
              <LockClosedIcon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Badge Locked</span>
           </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 text-3xl shadow-inner">
            {CATEGORY_ICONS[category] || <BriefcaseIcon className="w-8 h-8" />}
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-gray-900 dark:text-white">{formatPrice(budget)}</p>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Contract Budget</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
          {category}
        </span>
        
        <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2 mb-3">
          {title}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-6 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {(skillsRequired || []).map(skill => (
            <span key={skill} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-750 rounded-xl text-[10px] font-bold text-gray-600 dark:text-gray-300">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 italic">
          <ClockIcon className="w-4 h-4" /> 
          Post Date: {new Date(createdAt).toLocaleDateString()}
        </div>
        
        {hasRequiredBadge ? (
          <Link 
            to={`/dashboard/provider`} // Redirecting to dashboard to apply
            className="px-6 py-2.5 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-600/20 hover:scale-105 transition active:scale-95"
          >
            Apply Now
          </Link>
        ) : (
          <button 
            disabled
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest cursor-not-allowed opacity-60"
          >
            Locked
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
