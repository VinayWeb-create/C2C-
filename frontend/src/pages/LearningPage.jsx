import { useState } from 'react';
import { 
  AcademicCapIcon, 
  VideoCameraIcon, 
  DocumentTextIcon, 
  MapIcon, 
  CheckCircleIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { CATEGORIES, CATEGORY_ICONS } from '../utils/helpers';
import { LEARNING_DATA } from '../data/learningResources';
import { motion, AnimatePresence } from 'framer-motion';

const LearningPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [activeTab, setActiveTab] = useState('roadmap'); // roadmap, youtube, notes, test

  const data = LEARNING_DATA[selectedCategory] || { roadmap: [], youtube: [], notes: [], test: [] };

  const tabs = [
    { id: 'roadmap', label: 'Roadmap', icon: MapIcon },
    { id: 'youtube', label: 'Learning Videos', icon: VideoCameraIcon },
    { id: 'notes', label: 'Resources & Notes', icon: DocumentTextIcon },
    { id: 'test', label: 'Practice Test', icon: CheckCircleIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Categories */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">Categories</h2>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    selectedCategory === cat 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20 translate-x-1' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900'
                  }`}
                >
                  <span className="text-xl">{CATEGORY_ICONS[cat]}</span>
                  <span className="text-sm font-medium truncate">{cat}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <span className="text-4xl">{CATEGORY_ICONS[selectedCategory]}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedCategory} Academy</h1>
                <p className="text-gray-500 dark:text-gray-400">Master the skills needed for a professional freelancing career.</p>
              </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.youtube.length > 0 ? data.youtube.map((video) => (
                      <div key={video.id} className="card overflow-hidden group">
                        <div className="relative aspect-video">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <a href={video.url.replace('embed/', 'watch?v=')} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/20 backdrop-blur rounded-full text-white">
                              <PlayIcon className="w-8 h-8 fill-current" />
                            </a>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{video.title}</h3>
                          <p className="text-xs text-gray-500">{video.channel}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <VideoCameraIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">More videos coming soon for this category.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes Content */}
                {activeTab === 'notes' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.notes.length > 0 ? data.notes.map((note) => (
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
                    )) : (
                      <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                         <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Resources are being prepared for {selectedCategory}.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Test Content */}
                {activeTab === 'test' && (
                  <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8">
                    {data.test.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-3 mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/20">
                          <LightBulbIcon className="w-6 h-6 text-amber-600" />
                          <p className="text-xs text-amber-800 dark:text-amber-200 sm:text-sm">Pass this test with 80% or more to earn a "Verified Expert" badge on your profile!</p>
                        </div>
                        
                        <div className="space-y-12">
                          {data.test.map((item, idx) => (
                            <div key={item.id}>
                              <p className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                <span className="text-primary-600 mr-2">{idx + 1}.</span>
                                {item.question}
                              </p>
                              <div className="grid grid-cols-1 gap-3">
                                {item.options.map(opt => (
                                  <button key={opt} className="w-full p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-left hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-12 flex justify-center">
                          <button className="btn-primary px-12 py-4 rounded-2xl shadow-xl shadow-primary-600/20">
                            Submit Assessment
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-20 text-center">
                        <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Practice tests for {selectedCategory} will be available soon.</p>
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
              <h2 className="text-3xl font-bold mb-4 text-center">Your Path to C2C Professional Hub</h2>
              <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
                We don't just provide resources; we provide a career path. Follow these steps to become a 
                high-earning freelancer on our platform.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {[
                  { title: 'Learn', desc: 'Complete the roadmaps and watch the curated high-quality sessions.' },
                  { title: 'Test', desc: 'Pass our skill assessments to verify your expertise to clients.' },
                  { title: 'Earn', desc: 'Get the Verified Pro badge and gain priority in project matching.' }
                ].map((step, idx) => (
                  <div key={idx} className="p-6">
                    <div className="text-5xl font-black text-primary-500/20 mb-4 tracking-tighter">0{idx + 1}</div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-400">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LearningPage;
