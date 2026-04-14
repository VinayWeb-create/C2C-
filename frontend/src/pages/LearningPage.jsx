import { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  VideoCameraIcon, 
  DocumentTextIcon, 
  MapIcon, 
  CheckCircleIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  LightBulbIcon,
  BriefcaseIcon,
  LockClosedIcon,
  StarIcon,
  TrophyIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { CATEGORIES, CATEGORY_ICONS } from '../utils/helpers';
import { LEARNING_DATA } from '../data/learningResources';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const LearningPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [domainSelected, setDomainSelected] = useState(!!user?.activeLearningDomain);
  const [selectedCategory, setSelectedCategory] = useState(user?.activeLearningDomain || null);
  const [activeTab, setActiveTab] = useState('roadmap'); 
  
  // Test State
  const [answers, setAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [githubRepo, setGithubRepo] = useState('');
  const [testActive, setTestActive] = useState(false);

  const data = selectedCategory ? (LEARNING_DATA[selectedCategory] || { roadmap: [], youtube: [], notes: [], test: [], projects: [] }) : null;

  const handleDomainChoice = async (category) => {
    try {
      const { data: res } = await api.put('/auth/set-active-domain', { domain: category });
      updateUser(res.user);
      setSelectedCategory(category);
      setDomainSelected(true);
      setActiveTab('roadmap');
      toast.success(`You have committed to the ${category} Career Path! 🚀`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to select domain');
    }
  };

  const handleOptionSelect = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const tabs = [
    { id: 'roadmap', label: 'Roadmap', icon: MapIcon },
    { id: 'youtube', label: 'Videos', icon: VideoCameraIcon },
    { id: 'notes',   label: 'Notes',  icon: DocumentTextIcon },
    { id: 'projects', label: 'Hands-on Projects', icon: BriefcaseIcon, protected: true },
    { id: 'test',     label: 'Skill Test',        icon: CheckCircleIcon, protected: true },
  ];

  // Rest of effects...
  useEffect(() => {
    let timer;
    if (testActive && timeLeft > 0 && !testResult) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !testResult) {
      submitTest();
    }
    return () => clearInterval(timer);
  }, [testActive, timeLeft, testResult]);

  const startTest = () => {
    const shuffled = [...data.test].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setTestActive(true);
    setAnswers({});
    setTimeLeft(15 * 60);
    setTestResult(null);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const submitTest = async () => {
    if (!githubRepo.includes('github.com')) {
      toast.error('Please provide a valid GitHub repository URL for your project.');
      return;
    }

    setSubmitting(true);
    let correctCount = 0;
    shuffledQuestions.forEach(q => {
      if (answers[q.id] === q.answer) correctCount++;
    });

    const examScore = (correctCount / shuffledQuestions.length) * 50;
    const projectScore = 50;
    const totalScore = examScore + projectScore;

    setTestResult({ score: totalScore, examScore, projectScore, correct: correctCount, total: shuffledQuestions.length });

    if (totalScore >= 90) {
      try {
        await api.put('/auth/add-badge', { 
          name: `Professional Provider (${selectedCategory})`,
          role: selectedCategory,
          testResult: {
            category: selectedCategory,
            examScore,
            projectScore,
            githubRepo,
            passed: true
          }
        });
        toast.success(`🎉 Congratulations! You earned the Professional Provider Badge for ${selectedCategory}!`);
      } catch (err) {
        toast.error('Failed to update credentials. Please contact support.');
      }
    }
    setSubmitting(false);
    setTestActive(false);
  };

  const hasBadge = user?.badges?.some(b => b.role === selectedCategory);

  if (!domainSelected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
             <span className="px-5 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">
               Phase 1: Domain Selection
             </span>
             <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-6">Choose Your Career Domain</h1>
             <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                To provide you with the most relevant resources, roadmaps, and certification tests, 
                please select the professional domain you wish to specialize in.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CATEGORIES.map(cat => (
              <motion.button
                key={cat}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => handleDomainChoice(cat)}
                className="group p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 text-left hover:shadow-2xl hover:shadow-primary-600/10 transition-all"
              >
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  {CATEGORY_ICONS[cat]}
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{cat}</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  Master {cat} through our curated curriculum, hands-on projects, and earn a Professional Badge upon completion.
                </p>
                <div className="flex items-center gap-2 text-primary-600 font-bold text-sm">
                  Start Specialization <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Mini-View (To switch domain) */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <button 
              onClick={() => {
                if (hasBadge) {
                  setDomainSelected(false);
                } else {
                  toast.error(`Finish your ${selectedCategory} certification to unlock other paths!`, {
                    icon: '🔒',
                    style: { borderRadius: '10px', background: '#333', color: '#fff' }
                  });
                }
              }}
              className={`w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm font-bold transition-colors ${
                hasBadge ? 'text-primary-600 hover:bg-primary-50' : 'text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <span>{hasBadge ? 'Switch Domain' : 'Domain Locked'}</span>
              {hasBadge ? <BookOpenIcon className="w-5 h-5" /> : <LockClosedIcon className="w-5 h-5 text-rose-500" />}
            </button>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-8 mb-4 px-4 font-black">Curriculum</h2>
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id 
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20 translate-x-1' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-bold">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <span className="text-4xl">{CATEGORY_ICONS[selectedCategory]}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white">{selectedCategory} Academy</h1>
                  <p className="text-gray-500 dark:text-gray-400">Master the skills needed for a professional freelancing career.</p>
                </div>
              </div>

              {hasBadge && (
                <div className="flex items-center gap-3 p-3 px-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl shadow-xl shadow-amber-600/20">
                  <TrophyIcon className="w-6 h-6 animate-bounce" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Credential Earned</p>
                    <p className="text-sm font-bold">Verified Professional</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mt-8 p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl w-fit">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeTab === tab.id 
                        ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content Sections */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory + activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="min-h-[400px]"
              >
                
                {/* Protected View Overlay */}
                {tabs.find(t => t.id === activeTab)?.protected && !user && (
                   <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6">
                      <LockClosedIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Login to Unlock</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-sm">
                      Hands-on projects and Skill Tests are exclusively for our community members. 
                      Sign in to start your professional journey.
                    </p>
                    <div className="flex gap-4">
                      <button onClick={() => navigate('/login')} className="btn-primary">Sign In</button>
                      <button onClick={() => navigate('/register')} className="btn-secondary">Join C2C Hub</button>
                    </div>
                   </div>
                )}

                {/* Roadmap Content */}
                {activeTab === 'roadmap' && (
                  <div className="space-y-6">
                    {data.roadmap.map((step, idx) => (
                      <div key={idx} className="flex gap-6 group">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold border-2 border-primary-500/20">
                            {idx + 1}
                          </div>
                          {idx !== data.roadmap.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800 my-2" />
                          )}
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm group-hover:shadow-md transition-all flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* YouTube Content */}
                {activeTab === 'youtube' && (
                  <div className="space-y-12">
                     {/* Video Player Section */}
                     <div className="bg-black rounded-[3rem] aspect-video overflow-hidden shadow-2xl relative group">
                        <iframe 
                          id="academy-player"
                          className="w-full h-full"
                          src={data.youtube[0].url} 
                          title="C2C Academy Player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.youtube.map((video) => {
                          const isCompleted = user?.completedVideos?.includes(video.id);
                          return (
                            <div 
                              key={video.id} 
                              onClick={async () => {
                                document.getElementById('academy-player').src = video.url;
                                if (!isCompleted) {
                                  try {
                                    const { data: res } = await api.put('/auth/complete-video', { videoId: video.id });
                                    updateUser(res.user);
                                    toast.success('Session Progress Recorded! 📚', { icon: '✅' });
                                  } catch (err) {}
                                }
                              }}
                              className={`card overflow-hidden group cursor-pointer transition-all ${isCompleted ? 'border-green-500/50 bg-green-50/10' : ''}`}
                            >
                              <div className="relative aspect-video">
                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <PlayIcon className="w-8 h-8 text-white fill-current" />
                                </div>
                                {isCompleted && (
                                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                                    <CheckCircleIcon className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <h3 className={`font-bold text-sm mb-1 line-clamp-1 ${isCompleted ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                                  {video.title}
                                  {isCompleted && ' (Completed)'}
                                </h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{video.channel}</p>
                              </div>
                            </div>
                          );
                        })}
                     </div>
                  </div>
                )}

                {/* Notes Content */}
                {activeTab === 'notes' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.notes.map((note) => (
                      <div key={note.id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary-500 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                           <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{note.title}</h3>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest">{note.size} • {note.type}</p>
                        </div>
                        <button className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition">
                          <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects Content (Protected) */}
                {activeTab === 'projects' && user && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.projects.map((project) => (
                      <div key={project.id} className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex items-center justify-between mb-4">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                             project.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                             project.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                             'bg-red-100 text-red-700'
                           }`}>
                             {project.difficulty}
                           </span>
                           <BriefcaseIcon className="w-6 h-6 text-gray-300 group-hover:text-primary-500 transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{project.desc}</p>
                        <button className="w-full py-3 rounded-xl border-2 border-primary-600 text-primary-600 font-bold hover:bg-primary-600 hover:text-white transition-all">
                          Start Project Experience
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Test Content (Protected) */}
                {activeTab === 'test' && user && (
                  <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8">
                    {testResult ? (
                      <div className="flex flex-col items-center py-10 text-center animate-in fade-in duration-500">
                        {testResult.score >= 90 ? (
                           <>
                             <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mb-6 ring-8 ring-amber-50 dark:ring-amber-900/20">
                               <TrophyIcon className="w-12 h-12 text-amber-600" />
                             </div>
                             <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Credential Earned!</h3>
                             <p className="text-gray-500 mb-2">Total Score: <span className="text-2xl font-black text-amber-600">{testResult.score}/100</span></p>
                             <div className="flex gap-4 mb-8 text-xs font-bold uppercase tracking-widest">
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">Exam: {testResult.examScore.toFixed(1)}/50</span>
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">Project: {testResult.projectScore}/50</span>
                             </div>
                             <p className="text-gray-500 mb-8 max-w-sm">You earned the <strong>{selectedCategory} Pro Badge</strong>. You can now access high-value corporate projects in this domain.</p>
                             <button onClick={() => navigate('/dashboard/provider')} className="btn-primary py-4 px-10 rounded-2xl shadow-xl shadow-primary-600/20">Go to Provider Hub →</button>
                           </>
                        ) : (
                          <>
                             <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                               <LockClosedIcon className="w-12 h-12 text-rose-600" />
                             </div>
                             <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Score: {testResult.score.toFixed(1)}/100</h3>
                             <p className="text-gray-500 mb-8 max-w-sm">You need 90% merit to earn the badge. Review the roadmap and resources before trying again!</p>
                             <button onClick={() => setTestResult(null)} className="btn-secondary">Restart Assessment</button>
                          </>
                        )}
                      </div>
                    ) : !testActive ? (
                      <div className="flex flex-col items-center py-16 text-center">
                         <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mb-8">
                            <AcademicCapIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                         </div>
                         <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Professional Merit Exam</h2>
                         <p className="text-gray-500 dark:text-gray-400 max-w-md mb-10">
                           To earn your badge for <strong>{selectedCategory}</strong>, you must pass a 15-minute proctored exam (50 marks) and submit a practical project repo (50 marks).
                         </p>
                         <button 
                           onClick={startTest}
                           className="btn-primary py-4 px-12 rounded-2xl shadow-2xl shadow-primary-600/30 font-black uppercase tracking-widest text-sm"
                         >
                            Start Final Assessment →
                         </button>
                         <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest italic flex items-center gap-2">
                           <ShieldCheckIcon className="w-4 h-4" /> Integrity Monitoring: Switched tabs will be recorded.
                         </p>
                      </div>
                    ) : (
                      <div>
                        <div className="sticky top-0 z-10 flex items-center justify-between mb-8 p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 -mx-8 -mt-8 rounded-t-3xl">
                          <div className="flex items-center gap-2">
                             <div className={`w-3 h-3 rounded-full ${timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                             <span className="text-sm font-black text-gray-900 dark:text-white uppercase">Time Remaining:</span>
                             <span className={`text-xl font-black ${timeLeft < 60 ? 'text-red-600' : 'text-primary-600'}`}>{formatTime(timeLeft)}</span>
                          </div>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{shuffledQuestions.length} Randomized Questions</p>
                        </div>
                        
                        <div className="space-y-12">
                          <section className="p-8 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-600 mb-4 flex items-center gap-2">
                               <BriefcaseIcon className="w-4 h-4" /> Practical Project Component (50 Marks)
                             </h4>
                             <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">GitHub Repository URL</label>
                             <input 
                               type="url" 
                               value={githubRepo}
                               onChange={(e) => setGithubRepo(e.target.value)}
                               placeholder="https://github.com/your-username/project-repo"
                               className="w-full bg-white dark:bg-gray-900 border-2 border-primary-100 dark:border-primary-900/40 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                             />
                             <p className="mt-3 text-[10px] text-gray-400 italic">Project must match the domain guidelines and include a professional README.md</p>
                          </section>

                          {shuffledQuestions.map((item, idx) => (
                            <div key={item.id} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                              <p className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                <span className="text-primary-500 font-black mr-2">Q{idx + 1}.</span>
                                {item.question}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {item.options.map(opt => (
                                  <button 
                                    key={opt} 
                                    onClick={() => handleOptionSelect(item.id, opt)}
                                    className={`w-full p-5 rounded-2xl border-2 text-left transition-all text-sm font-bold ${
                                      answers[item.id] === opt 
                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/10 text-primary-600 shadow-lg scale-[0.98]' 
                                        : 'border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-primary-500/50'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-16 pt-12 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center">
                          <button 
                            onClick={submitTest}
                            disabled={submitting}
                            className="btn-primary px-16 py-5 rounded-3xl shadow-2xl shadow-primary-600/30 text-base font-black uppercase tracking-widest scale-110 hover:scale-[1.12]"
                          >
                            {submitting ? 'Authenticating Merit...' : 'Submit Professional Assessment'}
                          </button>
                          <p className="mt-8 text-xs text-gray-400 font-medium">Final merit calculation includes both technical exam and project verification.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Success Path Section */}
          <section className="mt-20 p-12 rounded-[3rem] bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-4 text-center">Your Merit Path to C2C Professional Hub</h2>
              <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
                We don't just provide resources; we provide a career path. You must prove your skills to earn your badge.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {[
                  { title: 'Learn', icon: AcademicCapIcon, desc: 'Complete the roadmaps and watch the curated high-quality sessions.' },
                  { title: 'Achieve 100%', icon: TrophyIcon, desc: 'Score 100% in our skill assessments to earn your merit badge.' },
                  { title: 'Unlock Pro', icon: StarIcon, desc: 'Once badged, register as a provider and start applying for projects.' }
                ].map((step, idx) => {
                   const Icon = step.icon;
                   return (
                    <div key={idx} className="p-8 bg-white/5 backdrop-blur-sm rounded-[2rem] border border-white/10">
                      <div className="w-12 h-12 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-primary-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LearningPage;
