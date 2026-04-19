import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, SparklesIcon, ShieldCheckIcon, StarIcon, ArrowRightIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';
import ServiceCard from '../components/services/ServiceCard';
import Loader from '../components/common/Loader';
import { CATEGORIES, CATEGORY_ICONS } from '../utils/helpers';
import useLocation from '../hooks/useLocation';
import toast from 'react-hot-toast';

const HomePage = () => {
  const navigate = useNavigate();
  const { location, getLocation } = useLocation();
  const [search,   setSearch]   = useState('');
  const [trending, setTrending] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/ai/trending')
      .then(({ data }) => setTrending(data.services || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/services?search=${encodeURIComponent(search)}`);
  };

  const handleCategoryClick = (cat) =>
    navigate(`/services?category=${encodeURIComponent(cat)}`);

  const [nearMeLoading, setNearMeLoading] = useState(false);

  const handleNearMe = async () => {
    setNearMeLoading(true);
    try {
      const coords = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => reject(err),
          { timeout: 8000 }
        );
      });
      navigate(`/services?lat=${coords.lat}&lng=${coords.lng}`);
    } catch {
      toast.error('Could not get your location. Please enable location access.');
    } finally {
      setNearMeLoading(false);
    }
  };

  return (
    <div className="page-enter">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-primary-800 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-400 rounded-full filter blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm mb-6 border border-white/20">
            <SparklesIcon className="w-4 h-4 text-amber-400" />
            Empowering the Next Generation of Freelancers
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
            From <span className="text-amber-400">Classroom</span><br />
            to <span className="text-primary-300 underline decoration-amber-400 underline-offset-8">Corporate Career</span>
          </h1>
          <p className="text-lg text-primary-100 mb-10 max-w-2xl mx-auto">
            Get high-end digital services: Web Dev, SEO, Graphic Design, PPTs & more. 
            Bridging the gap between talented students and corporate needs.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Try "Professional PPT" or "React Developer"...'
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm shadow-xl"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold rounded-2xl text-sm transition whitespace-nowrap shadow-lg shadow-amber-400/20"
            >
              Find Experts
            </button>
          </form>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-primary-200">
            {[['2.5k+', 'Active Freelancers'], ['500+', 'Corporate Projects'], ['98%', 'Client Satisfaction']].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-white">{num}</div>
                <div className="text-[10px] uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Explore Digital Expertise</h2>
            <p className="text-sm text-gray-500 mt-1">Specialized services for modern business needs</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {CATEGORIES.slice(0, 16).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl card hover:shadow-2xl 
                         hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300
                         hover:-translate-y-1 group border-gray-100"
            >
              <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{CATEGORY_ICONS[cat]}</span>
              <span className="text-[10px] text-gray-700 dark:text-gray-300 font-bold text-center uppercase tracking-tighter leading-tight">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Trending Services ── */}
      <section className="page-container pt-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">🔥 Popular Projects</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Highly demanded services by corporate clients</p>
          </div>
          <button onClick={() => navigate('/services')} className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 hover:text-primary-700 transition">
            Browse Gallery →
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Loader size="lg" /></div>
        ) : trending.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trending.map((svc) => <ServiceCard key={svc._id} service={svc} />)}
          </div>
        ) : (
          <div className="text-center py-20 card bg-gray-50 dark:bg-gray-900 border-dashed border-2">
            <p className="text-5xl mb-4">🚀</p>
            <p className="text-gray-400 font-medium mb-6">The next big project is waiting for you.</p>
            <button onClick={() => navigate('/services')} className="btn-primary px-8">
              Explore All Skills
            </button>
          </div>
        )}
      </section>

      {/* ── Why Choose Us ── */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-950 py-24 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title text-3xl">Why C2C?</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">Providing a safe and professional environment for both campus talent and corporate entities.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: SparklesIcon, title: 'Skills-First Platform', desc: 'Focus on your digital portfolio. Our AI helps match your skills to specific corporate requirements.' },
              { icon: ShieldCheckIcon, title: 'Secure Deliveries', desc: 'Protected milestones and clear deliverables ensure both the client and the freelancer are always safe.' },
              { icon: StarIcon, title: 'Career Growth', desc: 'Not just tasks — build a career. Get professional reviews that enhance your corporate resume.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group p-8 rounded-3xl bg-gray-50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 border border-transparent hover:border-primary-500/20 hover:shadow-2xl transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Learning Hub Promo ── */}
      <section className="page-container py-20">
        <div className="bg-primary-50 dark:bg-primary-900/10 rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 border border-primary-100 dark:border-primary-900/20">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-6">
              <AcademicCapIcon className="w-4 h-4" />
              C2C Academy
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              Master the Skills, <br />
              <span className="text-primary-600">Own Your Career.</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-lg">
              Get access to curated roadmaps, video resources, and professional notes. 
              Pass our assessment tests to earn a verified professional badge.
            </p>
            <button 
              onClick={() => navigate('/learning')}
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition shadow-xl shadow-primary-600/20 inline-flex items-center gap-2"
            >
              Start Learning Now
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {[
              { label: 'Web Dev', icon: '💻', color: 'bg-blue-500' },
              { label: 'Design', icon: '🎨', color: 'bg-pink-500' },
              { label: 'Marketing', icon: '🚀', color: 'bg-amber-500' },
              { label: 'Video', icon: '🎬', color: 'bg-purple-500' },
            ].map((item, idx) => (
              <div 
                key={item.label}
                className={`p-6 rounded-3xl ${item.color} text-white shadow-xl transform ${idx % 2 === 0 ? 'translate-y-4' : '-translate-y-4'} hover:scale-105 transition-transform cursor-pointer`}
                onClick={() => navigate('/learning')}
              >
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <span className="font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
       {/* ── PLACEMENT ZONE PROMO ── */}
  <section className="page-container pt-0 pb-8">
    <div className="rounded-[3rem] overflow-hidden relative bg-gray-950 border border-gray-800">
 
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />
      {/* Glow orbs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-500/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-500/15 rounded-full blur-[100px]" />
 
      <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center gap-12">
 
        {/* Left content */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-cyan-400 mb-6">
            <span>⚡</span> New — Placement Preparation Zone
          </div>
 
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Practice. Prepare.
            <span className="block bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Get Hired.
            </span>
          </h2>
 
          <p className="text-gray-400 text-lg mb-10 max-w-lg leading-relaxed">
            Integrated aptitude tests, technical quizzes, mock interviews and study notes — designed to get C2C members placed at top companies.
          </p>
 
          {/* Feature tiles */}
          <div className="grid grid-cols-2 gap-3 mb-10 max-w-lg">
            {[
              { icon: BrainCircuit, label: 'CRT Aptitude',   sub: '500+ questions', color: 'text-teal-400',   bg: 'bg-teal-500/10' },
              { icon: Code2,        label: 'Tech Quizzes',   sub: 'C, Java, Python',  color: 'text-violet-400', bg: 'bg-violet-500/10' },
              { icon: Mic,          label: 'Mock Interview', sub: 'HR + Technical',  color: 'text-rose-400',   bg: 'bg-rose-500/10' },
              { icon: BookOpen,     label: 'Study Notes',    sub: 'DBMS, OS, CN',    color: 'text-amber-400',  bg: 'bg-amber-500/10' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={\`flex items-center gap-3 p-4 \${item.bg} rounded-2xl border border-white/5\`}>
                  <Icon className={\`w-5 h-5 \${item.color} flex-shrink-0\`} />
                  <div>
                    <p className="text-white text-sm font-bold">{item.label}</p>
                    <p className="text-gray-500 text-xs">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
 
          <button
            onClick={() => navigate('/placement')}
            className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-black rounded-2xl hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-violet-500/20 inline-flex items-center gap-3"
          >
            Open Placement Zone
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
 
        {/* Right mockup */}
        <div className="flex-shrink-0 w-full md:w-80">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="ml-2 text-[10px] text-gray-600 font-mono">placemint.ct.ws</span>
            </div>
            <div className="space-y-3">
              {['Dashboard', 'CRT Practice', 'Technical Quiz', 'Interview Prep', 'Quiz History', 'Study Notes'].map((item, i) => (
                <div key={item} className="flex items-center gap-3">
                  <div className={\`w-2 h-2 rounded-full \${i === 1 ? 'bg-cyan-400' : 'bg-gray-700'}\`} />
                  <div className={\`h-3 rounded-full \${i === 1 ? 'bg-cyan-400/30 w-3/4' : 'bg-gray-800 w-' + (i % 2 === 0 ? '2/3' : '1/2')}\`} />
                </div>
              ))}
            </div>
            <div className="mt-5 h-24 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/5 rounded-xl flex items-center justify-center">
              <p className="text-xs text-gray-500 font-bold">Live Placement App</p>
            </div>
          </div>
        </div>
 
      </div>
    </div>
  </section>
`;

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="p-12 rounded-[3rem] bg-gradient-to-r from-primary-600 to-indigo-700 text-white shadow-3xl shadow-primary-600/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start your first project?</h2>
            <p className="text-primary-100 mb-10 max-w-md mx-auto">
              Join C2C today and turn your classroom skills into corporate success.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-10 py-4 bg-white text-primary-700 font-bold rounded-2xl hover:bg-gray-100 transition shadow-xl"
              >
                Sign Up as Freelancer
              </button>
              <button
                onClick={() => navigate('/services')}
                className="px-10 py-4 bg-primary-800 text-white font-bold rounded-2xl hover:bg-primary-900 transition border border-white/10"
              >
                Hire Top Talent
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
