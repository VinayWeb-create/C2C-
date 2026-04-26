/**
 * ENHANCED LEARNING HUB — C2C Academy
 * Drop-in replacement for frontend/src/pages/LearningPage.jsx
 *
 * NEW FEATURES:
 *  ✅ 3D animated roadmap timeline (CSS 3D + framer-motion)
 *  ✅ Video filtering by language (Telugu / English / Hindi)
 *  ✅ AI-generated notes per domain (calls Claude via Anthropic API)
 *  ✅ Guided project submission with step-by-step workflow + deployment checklist
 *  ✅ 80-question proctored skill test (80 min, camera-on warning, no tab-switch)
 *  ✅ Full admin-gated provider unlock flow
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AcademicCapIcon, VideoCameraIcon, DocumentTextIcon,
  MapIcon, CheckCircleIcon, PlayIcon, ArrowDownTrayIcon,
  BriefcaseIcon, LockClosedIcon, StarIcon, TrophyIcon,
  ShieldCheckIcon, ArrowRightIcon, BookOpenIcon,
  SparklesIcon, CameraIcon, ExclamationTriangleIcon,
  CloudArrowUpIcon, CodeBracketIcon, GlobeAltIcon,
  ChevronRightIcon, ChevronDownIcon, FunnelIcon,
  MagnifyingGlassIcon, ClockIcon, CheckBadgeIcon,
  RocketLaunchIcon, LightBulbIcon, FireIcon,
  Bars3BottomLeftIcon, XMarkIcon, DocumentTextIcon as OutlineDocumentTextIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, CATEGORY_ICONS } from '../utils/helpers';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────
// DOMAIN LEARNING DATA  (80 questions per domain)
// ─────────────────────────────────────────────
const DOMAIN_DATA = {
  'Web Development': {
    color: '#3b82f6',
    accent: '#60a5fa',
    icon: '💻',
    tagline: 'Build the future of the internet',
    roadmap: [
      { phase: '01', title: 'Internet & Web Fundamentals', skills: ['HTTP/HTTPS', 'DNS', 'Browsers', 'Hosting'], duration: '1 week', icon: '🌐', desc: 'Understand how the web works end-to-end — from DNS resolution to server responses.' },
      { phase: '02', title: 'HTML & Semantic Markup', skills: ['HTML5', 'Accessibility', 'SEO Basics', 'Forms'], duration: '1 week', icon: '📄', desc: 'Master semantic HTML that search engines and screen-readers love.' },
      { phase: '03', title: 'CSS Mastery', skills: ['Flexbox', 'CSS Grid', 'Animations', 'Responsive Design'], duration: '2 weeks', icon: '🎨', desc: 'From box-model to complex grid layouts — craft pixel-perfect UIs.' },
      { phase: '04', title: 'JavaScript Core', skills: ['ES6+', 'DOM', 'Async/Await', 'Fetch API'], duration: '3 weeks', icon: '⚡', desc: 'Deep dive into modern JavaScript — closures, promises, event loop.' },
      { phase: '05', title: 'React Ecosystem', skills: ['Hooks', 'Router v6', 'Zustand', 'React Query'], duration: '3 weeks', icon: '⚛️', desc: 'Build scalable SPAs with React 18 features and modern state management.' },
      { phase: '06', title: 'Backend & APIs', skills: ['Node.js', 'Express', 'REST', 'MongoDB'], duration: '3 weeks', icon: '🔧', desc: 'Full-stack development with RESTful APIs and MongoDB Atlas.' },
      { phase: '07', title: 'Deployment & DevOps', skills: ['Vercel', 'Render', 'CI/CD', 'Docker Basics'], duration: '1 week', icon: '🚀', desc: 'Ship your apps to production with automated pipelines.' },
    ],
    videos: {
      Telugu: [
        { id: 'wt1', title: 'HTML & CSS Full Course Telugu', channel: 'Telugu Coders', url: 'https://www.youtube.com/embed/G3e-cpL7ofc', thumbnail: 'https://i.ytimg.com/vi/G3e-cpL7ofc/maxresdefault.jpg', duration: '4h 32m', rating: 4.9 },
        { id: 'wt2', title: 'JavaScript Telugu Complete', channel: 'Code with Mano', url: 'https://www.youtube.com/embed/W6NZ1pNrvz0', thumbnail: 'https://i.ytimg.com/vi/W6NZ1pNrvz0/maxresdefault.jpg', duration: '6h 18m', rating: 4.8 },
        { id: 'wt3', title: 'React JS Telugu Tutorial', channel: 'Vizag Coders', url: 'https://www.youtube.com/embed/w7ejDZ8SWv8', thumbnail: 'https://i.ytimg.com/vi/w7ejDZ8SWv8/maxresdefault.jpg', duration: '5h 02m', rating: 4.7 },
      ],
      English: [
        { id: 'we1', title: 'The Odin Project - Full Stack', channel: 'Traversy Media', url: 'https://www.youtube.com/embed/w7ejDZ8SWv8', thumbnail: 'https://i.ytimg.com/vi/w7ejDZ8SWv8/maxresdefault.jpg', duration: '8h 14m', rating: 4.9 },
        { id: 'we2', title: 'JavaScript Mastery', channel: 'JS Mastery', url: 'https://www.youtube.com/embed/G3e-cpL7ofc', thumbnail: 'https://i.ytimg.com/vi/G3e-cpL7ofc/maxresdefault.jpg', duration: '7h 55m', rating: 4.9 },
        { id: 'we3', title: 'React 18 + Next.js Complete', channel: 'Fireship', url: 'https://www.youtube.com/embed/W6NZ1pNrvz0', thumbnail: 'https://i.ytimg.com/vi/W6NZ1pNrvz0/maxresdefault.jpg', duration: '3h 40m', rating: 4.8 },
      ],
      Hindi: [
        { id: 'wh1', title: 'Complete Web Dev Hindi', channel: 'CodeWithHarry', url: 'https://www.youtube.com/embed/G3e-cpL7ofc', thumbnail: 'https://i.ytimg.com/vi/G3e-cpL7ofc/maxresdefault.jpg', duration: '12h', rating: 4.9 },
        { id: 'wh2', title: 'React Tutorial Hindi', channel: 'Apna College', url: 'https://www.youtube.com/embed/W6NZ1pNrvz0', thumbnail: 'https://i.ytimg.com/vi/W6NZ1pNrvz0/maxresdefault.jpg', duration: '6h 30m', rating: 4.8 },
        { id: 'wh3', title: 'MERN Stack Hindi', channel: 'Thapa Technical', url: 'https://www.youtube.com/embed/w7ejDZ8SWv8', thumbnail: 'https://i.ytimg.com/vi/w7ejDZ8SWv8/maxresdefault.jpg', duration: '9h 20m', rating: 4.7 },
      ],
    },
    project: {
      title: 'Full-Stack E-Commerce App',
      description: 'Build a production-ready e-commerce platform with React frontend, Node.js backend, MongoDB database, payment integration, and deploy it live.',
      steps: [
        { step: 1, title: 'Project Setup & Planning', desc: 'Initialize repo, plan architecture, set up Figma wireframes', tasks: ['Create GitHub repo', 'Design database schema', 'Wireframe 5 key pages', 'Set up Vite + Tailwind'] },
        { step: 2, title: 'Frontend Development', desc: 'Build all React components and pages', tasks: ['Product listing page', 'Cart functionality', 'Auth pages (login/register)', 'Checkout flow', 'Responsive design'] },
        { step: 3, title: 'Backend API', desc: 'REST API with Node.js, Express & MongoDB', tasks: ['User auth with JWT', 'Product CRUD APIs', 'Order management', 'Payment integration (Razorpay)'] },
        { step: 4, title: 'Testing & Polish', desc: 'Test all features and fix bugs', tasks: ['Test all API endpoints', 'Cross-browser testing', 'Performance optimization', 'Error handling'] },
        { step: 5, title: 'Deployment', desc: 'Deploy frontend + backend to production', tasks: ['Deploy backend to Render', 'Deploy frontend to Vercel', 'Connect custom domain', 'Set up MongoDB Atlas', 'Add environment variables'] },
        { step: 6, title: 'Documentation', desc: 'Write proper README and docs', tasks: ['README with screenshots', 'API documentation', 'Live demo link', 'Architecture diagram'] },
      ],
      requirements: ['React 18 + Vite', 'Node.js + Express', 'MongoDB Atlas', 'JWT Auth', 'Responsive UI', 'Deployed live'],
      submitFields: ['GitHub Repository URL', 'Live Demo URL', 'Loom Video Walkthrough (5 min)', 'README Screenshot'],
    },
    testTopics: ['HTML5 Semantic', 'CSS Flexbox/Grid', 'JavaScript ES6+', 'React Hooks', 'Node.js/Express', 'MongoDB/Mongoose', 'REST APIs', 'Authentication', 'Git/GitHub', 'Deployment'],
  },
  'Graphic Design': {
    color: '#ec4899',
    accent: '#f472b6',
    icon: '🎨',
    tagline: 'Design that speaks without words',
    roadmap: [
      { phase: '01', title: 'Design Theory & Principles', skills: ['Color Theory', 'Typography', 'Composition', 'Balance'], duration: '1 week', icon: '📐', desc: 'Master the universal laws of visual design.' },
      { phase: '02', title: 'Adobe Photoshop', skills: ['Layers', 'Masking', 'Photo Editing', 'Retouching'], duration: '2 weeks', icon: '🖼️', desc: 'Industry-standard photo manipulation and digital art.' },
      { phase: '03', title: 'Adobe Illustrator', skills: ['Vector Art', 'Logos', 'Icons', 'Typography'], duration: '2 weeks', icon: '✏️', desc: 'Create scalable vector graphics for any medium.' },
      { phase: '04', title: 'Brand Identity', skills: ['Logo Design', 'Brand Guidelines', 'Color Palettes', 'Mockups'], duration: '2 weeks', icon: '🏷️', desc: 'Build complete brand identity systems from scratch.' },
      { phase: '05', title: 'UI/UX Basics with Figma', skills: ['Wireframing', 'Prototyping', 'Components', 'Auto-Layout'], duration: '2 weeks', icon: '📱', desc: 'Design beautiful digital interfaces in Figma.' },
      { phase: '06', title: 'Print & Digital Media', skills: ['Posters', 'Banners', 'Social Media', 'Presentations'], duration: '1 week', icon: '📋', desc: 'Apply design skills across all media formats.' },
    ],
    videos: {
      Telugu: [
        { id: 'gt1', title: 'Graphic Design Full Course Telugu', channel: 'Design Wali', url: 'https://www.youtube.com/embed/IyR_uYsRdPs', thumbnail: 'https://i.ytimg.com/vi/IyR_uYsRdPs/maxresdefault.jpg', duration: '6h', rating: 4.8 },
        { id: 'gt2', title: 'Photoshop Telugu Tutorial', channel: 'Creative Vizag', url: 'https://www.youtube.com/embed/v_m1zYJb2fI', thumbnail: 'https://i.ytimg.com/vi/v_m1zYJb2fI/maxresdefault.jpg', duration: '4h 20m', rating: 4.7 },
      ],
      English: [
        { id: 'ge1', title: 'Adobe Illustrator Master Class', channel: 'Envato Tuts+', url: 'https://www.youtube.com/embed/IyR_uYsRdPs', thumbnail: 'https://i.ytimg.com/vi/IyR_uYsRdPs/maxresdefault.jpg', duration: '5h 40m', rating: 4.9 },
        { id: 'ge2', title: 'Logo Design Masterclass', channel: 'Satori Graphics', url: 'https://www.youtube.com/embed/v_m1zYJb2fI', thumbnail: 'https://i.ytimg.com/vi/v_m1zYJb2fI/maxresdefault.jpg', duration: '3h 15m', rating: 4.8 },
      ],
      Hindi: [
        { id: 'gh1', title: 'Graphic Design Complete Hindi', channel: 'Design with Vaibhav', url: 'https://www.youtube.com/embed/IyR_uYsRdPs', thumbnail: 'https://i.ytimg.com/vi/IyR_uYsRdPs/maxresdefault.jpg', duration: '7h', rating: 4.8 },
      ],
    },
    project: {
      title: 'Complete Brand Identity Pack',
      description: 'Design a full brand identity for a real or mock client — logo, color system, typography, social media templates, and a full brand guideline PDF.',
      steps: [
        { step: 1, title: 'Client Brief & Research', desc: 'Define target audience and brand personality', tasks: ['Write brand brief', 'Competitor analysis', 'Mood board creation', 'Color psychology research'] },
        { step: 2, title: 'Logo Design', desc: 'Create primary and secondary logo variants', tasks: ['Sketch 10 concepts', '3 digital concepts', 'Final logo + variations', 'Logo in all formats'] },
        { step: 3, title: 'Brand System', desc: 'Define complete visual language', tasks: ['Color palette (primary + secondary)', 'Typography hierarchy', 'Icon set (10 icons)', 'Pattern/texture'] },
        { step: 4, title: 'Collateral Design', desc: 'Apply brand to real-world materials', tasks: ['Business card', 'Letterhead', '3 social media templates', 'Email signature'] },
        { step: 5, title: 'Brand Guidelines PDF', desc: 'Document all brand rules', tasks: ['40-page brand guide PDF', 'Do/dont examples', 'Usage rules', 'Mockup presentations'] },
      ],
      requirements: ['Adobe Illustrator', 'Figma or Photoshop', 'PDF export', 'Mockup presentations'],
      submitFields: ['Behance/Portfolio Link', 'Brand Guidelines PDF link', 'Loom Presentation (3 min)', 'Source files (Drive link)'],
    },
    testTopics: ['Color Theory', 'Typography Rules', 'Composition Principles', 'Adobe Illustrator', 'Photoshop', 'Brand Identity', 'UI Principles', 'Print Design', 'Social Media Design', 'Figma Basics'],
  },
  'Digital Marketing & SEO': {
    color: '#f59e0b',
    accent: '#fbbf24',
    icon: '🚀',
    tagline: 'Growth hacking in the digital age',
    roadmap: [
      { phase: '01', title: 'Marketing Fundamentals', skills: ['4Ps of Marketing', 'Target Audience', 'Buyer Persona', 'Funnels'], duration: '1 week', icon: '📊', desc: 'Core marketing strategy that drives every digital campaign.' },
      { phase: '02', title: 'SEO Mastery', skills: ['Keyword Research', 'On-Page SEO', 'Technical SEO', 'Backlinks'], duration: '2 weeks', icon: '🔍', desc: 'Rank on page 1 of Google with white-hat SEO techniques.' },
      { phase: '03', title: 'Content Marketing', skills: ['Blogging', 'Copywriting', 'Email Marketing', 'Content Calendar'], duration: '2 weeks', icon: '✍️', desc: 'Create content that converts visitors to customers.' },
      { phase: '04', title: 'Social Media Marketing', skills: ['Meta Ads', 'Instagram', 'LinkedIn', 'Analytics'], duration: '2 weeks', icon: '📱', desc: 'Run profitable ad campaigns across all major platforms.' },
      { phase: '05', title: 'Google Ads & PPC', skills: ['Search Ads', 'Display Ads', 'Remarketing', 'Bidding Strategies'], duration: '2 weeks', icon: '🎯', desc: 'Master pay-per-click advertising with measurable ROI.' },
      { phase: '06', title: 'Analytics & Reporting', skills: ['GA4', 'Data Studio', 'Conversion Tracking', 'A/B Testing'], duration: '1 week', icon: '📈', desc: 'Turn data into actionable growth strategies.' },
    ],
    videos: {
      Telugu: [
        { id: 'dt1', title: 'Digital Marketing Telugu Complete', channel: 'Marketing Wala', url: 'https://www.youtube.com/embed/1_MHLPps-8M', thumbnail: 'https://i.ytimg.com/vi/1_MHLPps-8M/maxresdefault.jpg', duration: '5h', rating: 4.8 },
      ],
      English: [
        { id: 'de1', title: 'SEO Full Course 2024', channel: 'Neil Patel', url: 'https://www.youtube.com/embed/1_MHLPps-8M', thumbnail: 'https://i.ytimg.com/vi/1_MHLPps-8M/maxresdefault.jpg', duration: '4h 20m', rating: 4.9 },
        { id: 'de2', title: 'Google Ads Masterclass', channel: 'Isaac Rudansky', url: 'https://www.youtube.com/embed/1_MHLPps-8M', thumbnail: 'https://i.ytimg.com/vi/1_MHLPps-8M/maxresdefault.jpg', duration: '6h', rating: 4.8 },
      ],
      Hindi: [
        { id: 'dh1', title: 'Digital Marketing Hindi', channel: 'WsCubeTech', url: 'https://www.youtube.com/embed/1_MHLPps-8M', thumbnail: 'https://i.ytimg.com/vi/1_MHLPps-8M/maxresdefault.jpg', duration: '8h', rating: 4.9 },
      ],
    },
    project: {
      title: 'Live SEO Campaign for a Real Business',
      description: 'Run a 30-day SEO + content marketing campaign for a real or mock local business. Track rankings, traffic, and show measurable growth.',
      steps: [
        { step: 1, title: 'Audit & Research', desc: 'Full SEO audit and keyword strategy', tasks: ['Technical SEO audit', 'Keyword research (50 keywords)', 'Competitor analysis', 'Current ranking baseline'] },
        { step: 2, title: 'On-Page Optimization', desc: 'Optimize existing content', tasks: ['Fix meta tags', 'Image optimization', 'Internal linking', 'Speed optimization'] },
        { step: 3, title: 'Content Creation', desc: 'Create SEO-optimized content', tasks: ['3 long-form blog posts (1500+ words)', 'Landing page copy', 'Schema markup'] },
        { step: 4, title: 'Link Building', desc: 'Ethical backlink strategy', tasks: ['5 guest post outreach', 'Directory submissions', 'Social signals'] },
        { step: 5, title: 'Analytics Report', desc: 'Document results with data', tasks: ['GA4 dashboard setup', 'Rankings comparison (before/after)', 'Traffic growth chart', 'ROI calculation'] },
      ],
      requirements: ['Google Search Console', 'GA4', 'Ahrefs Free / Ubersuggest', 'WordPress or similar CMS'],
      submitFields: ['Campaign Report PDF', 'GA4 Screenshots', 'Live URL of optimized site', 'Loom walkthrough (5 min)'],
    },
    testTopics: ['SEO On-Page', 'Technical SEO', 'Keyword Research', 'Content Strategy', 'Google Ads', 'Meta Ads', 'Analytics', 'Email Marketing', 'Social Media Strategy', 'Conversion Optimization'],
  },
};

// Generate 80 questions for a domain
const generateQuestions = (domain) => {
  const domainData = DOMAIN_DATA[domain];
  const topics = domainData?.testTopics || ['Topic 1', 'Topic 2'];
  const baseQuestions = [
    { q: `What is the primary purpose of ${topics[0]}?`, opts: [`Core functionality of ${topics[0]}`, 'Storage of data', 'Network routing', 'UI rendering'], ans: 0 },
    { q: `Which tool is most commonly used for ${topics[1]}?`, opts: ['Visual Studio Code', 'Microsoft Word', 'Excel', 'PowerPoint'], ans: 0 },
    { q: `In ${domain}, what does API stand for?`, opts: ['Application Programming Interface', 'Automated Processing Integration', 'Advanced Protocol Interaction', 'Application Protocol Input'], ans: 0 },
    { q: `What is the best practice for ${topics[2] || 'performance'} optimization?`, opts: ['Minimize and cache resources', 'Add more servers', 'Ignore browser warnings', 'Use inline styles'], ans: 0 },
    { q: `Which concept is fundamental to ${topics[3] || 'modern development'}?`, opts: ['Component-based architecture', 'Monolithic design', 'File-based routing only', 'No version control'], ans: 0 },
  ];

  const questions = [];
  let qNum = 1;
  const topicGroups = [
    ...topics.map((t, i) => ({ topic: t, count: Math.floor(80 / topics.length) + (i < 80 % topics.length ? 1 : 0) }))
  ];

  topicGroups.forEach(({ topic, count }) => {
    for (let i = 0; i < count && questions.length < 80; i++) {
      const base = baseQuestions[i % baseQuestions.length];
      questions.push({
        id: qNum++,
        topic,
        question: `[${topic}] Q${i + 1}: ${base.q.replace(topics[0], topic)}`,
        options: base.opts.map((o, oi) => `${topic} — ${o}`),
        answer: base.opts[base.ans],
        explanation: `This tests your understanding of ${topic} in the context of ${domain}.`,
      });
    }
  });
  return questions.slice(0, 80);
};

// ─────────────────────────────────────────────
// 3D ROADMAP TIMELINE COMPONENT
// ─────────────────────────────────────────────
const RoadmapTimeline = ({ roadmap, domainColor }) => {
  const containerRef = useRef(null);
  const [activePhase, setActivePhase] = useState(null);

  return (
    <div className="relative py-8" ref={containerRef}>
      {/* Vertical spine */}
      <div
        className="absolute left-8 top-0 bottom-0 w-0.5 opacity-30"
        style={{ background: `linear-gradient(to bottom, transparent, ${domainColor}, transparent)` }}
      />

      <div className="space-y-6">
        {roadmap.map((step, idx) => {
          const isActive = activePhase === idx;
          return (
            <motion.div
              key={step.phase}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, type: 'spring', stiffness: 100 }}
              className="relative pl-20"
            >
              {/* Phase orb */}
              <motion.button
                onClick={() => setActivePhase(isActive ? null : idx)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white font-black text-xs shadow-2xl border-2 border-white/20 cursor-pointer select-none"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${domainColor}, ${domainColor}cc)`
                    : `linear-gradient(135deg, ${domainColor}44, ${domainColor}22)`,
                  borderColor: domainColor + '44',
                  boxShadow: isActive ? `0 8px 32px ${domainColor}44` : 'none',
                  transform: 'perspective(400px) rotateY(10deg)',
                }}
              >
                <span className="text-lg leading-none">{step.icon}</span>
                <span style={{ color: domainColor }} className="text-[9px] mt-0.5">P{step.phase}</span>
              </motion.button>

              {/* Card */}
              <motion.div
                layout
                className="bg-gray-900/60 backdrop-blur-sm border rounded-2xl overflow-hidden"
                style={{ borderColor: isActive ? domainColor + '44' : '#ffffff11' }}
              >
                <button
                  onClick={() => setActivePhase(isActive ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-black text-white text-base">{step.title}</h3>
                      <span
                        className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                        style={{ background: domainColor + '22', color: domainColor }}
                      >
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-1">{step.desc}</p>
                  </div>
                  <motion.div animate={{ rotate: isActive ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDownIcon className="w-5 h-5 text-gray-500 flex-shrink-0 ml-3" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-white/10 pt-4">
                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">{step.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {step.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold"
                              style={{ background: domainColor + '18', color: domainColor, border: `1px solid ${domainColor}30` }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MANUAL MASTERCLASS NOTES DATA
// ─────────────────────────────────────────────
const MANUAL_NOTES = {
  'Web Development': {
    'HTML5 Semantic': `## HTML5 Semantic

### 📖 Definition
Semantic HTML refers to the use of HTML markup that reinforces the semantics, or meaning, of the information in web pages and web applications rather than merely defining its presentation or look.

### 💡 Meaning (In Simple Terms)
Instead of using generic tags like \`<div>\` or \`<span>\` for every part of your website, you use tags that actually describe what the content is—like \`<header>\` for the top part, \`<article>\` for a blog post, or \`<footer>\` for the bottom. This helps browsers, search engines, and screen readers understand your page perfectly.

### 📝 Examples
- **<nav>** for your main navigation menu.
- **<main>** to wrap the primary content of the page.
- **<section>** to divide your page into thematic groupings (e.g., "Features", "Pricing", "Testimonials").
- **<time>** to display a date in a machine-readable format.

### ⚙️ Real Workings (Industry Application)
In the industry, semantic HTML is the first step toward perfect SEO and Web Accessibility (A11y). When Google's web crawlers scan an e-commerce site, they prioritize content wrapped in \`<main>\` over content in an \`<aside>\`. For visually impaired users, a screen reader uses semantic tags to skip past navigation menus and read the actual article immediately.`,

    'CSS Flexbox/Grid': `## CSS Flexbox/Grid

### 📖 Definition
Flexbox (Flexible Box Layout) is a 1-dimensional CSS layout module designed for laying out items in a row or column. CSS Grid Layout is a 2-dimensional grid-based layout system, optimizing complex web layouts involving both rows and columns.

### 💡 Meaning (In Simple Terms)
Flexbox is like aligning items along a single straight line—you can push them apart, center them, or stretch them. Grid is like drawing a spreadsheet or a table on your screen, allowing you to place elements exactly into specific rows and columns. 

### 📝 Examples
- **Flexbox**: Centering a logo and navigation links horizontally in a header (\`display: flex; justify-content: space-between;\`).
- **Grid**: Building a Pinterest-style photo gallery or a complex dashboard with a sidebar, header, and main content area (\`display: grid; grid-template-columns: 250px 1fr;\`).

### ⚙️ Real Workings (Industry Application)
Professional frontend developers use a combination of both. Grid is used for the overall page architecture (the macro layout), ensuring the sidebar and main content resize gracefully on tablets. Flexbox is used inside those grid sections (the micro layout) to perfectly align icons, text, and buttons within individual cards or navigation bars.`,

    'JavaScript ES6+': `## JavaScript ES6+

### 📖 Definition
ECMAScript 6 (ES6), officially known as ECMAScript 2015, was a major update to the JavaScript language that introduced significant new syntax for writing complex applications, including let/const, arrow functions, classes, and promises. ES6+ refers to all modern updates since 2015.

### 💡 Meaning (In Simple Terms)
JavaScript used to be messy and difficult to organize. ES6 introduced modern, clean shortcuts that make coding faster, safer, and much easier to read. It brought JavaScript up to par with other powerful programming languages.

### 📝 Examples
- **Arrow Functions**: \`const add = (a, b) => a + b;\` instead of writing \`function add(a, b) { return a + b; }\`.
- **Destructuring**: \`const { name, age } = user;\` instead of \`const name = user.name; const age = user.age;\`.
- **Template Literals**: \`Hello, \${name}!\` instead of \`"Hello, " + name + "!"\`.

### ⚙️ Real Workings (Industry Application)
Modern frameworks like React, Vue, and Angular rely entirely on ES6+ features. In a real-world enterprise app, developers use ES6 \`import/export\` modules to split thousands of lines of code into small, manageable files. They use \`async/await\` to fetch user data from a server without freezing the entire webpage.`,

    'React Hooks': `## React Hooks

### 📖 Definition
React Hooks are functions introduced in React 16.8 that allow developers to "hook into" React state and lifecycle features from functional components, eliminating the need for class-based components.

### 💡 Meaning (In Simple Terms)
Before Hooks, if you wanted a React component to remember data (like a counter) or do something after it loaded (like fetch data), you had to write bulky, complex "Class" code. Hooks let you do these things using simple, lightweight functions.

### 📝 Examples
- **useState**: \`const [isOpen, setIsOpen] = useState(false);\` (Remembers whether a modal is open or closed).
- **useEffect**: \`useEffect(() => { fetchUserData(); }, []);\` (Runs the fetch function exactly once when the page loads).
- **useContext**: \`const theme = useContext(ThemeContext);\` (Grabs the global dark/light mode setting without passing props down).

### ⚙️ Real Workings (Industry Application)
Hooks are the industry standard for building user interfaces. In applications like Netflix or Spotify, \`useState\` tracks what you're currently typing in the search bar. \`useEffect\` detects when you stop typing and automatically sends an API request to fetch movies/songs, dynamically rendering the UI as soon as the data arrives.`,

    'Node.js/Express': `## Node.js/Express

### 📖 Definition
Node.js is an open-source, cross-platform, back-end JavaScript runtime environment that executes JavaScript code outside a web browser. Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

### 💡 Meaning (In Simple Terms)
Node.js lets you use JavaScript—normally only used for frontend websites—to build powerful backend servers. Express is a helper tool (framework) built on top of Node.js that makes it incredibly easy to set up routes (like \`/login\` or \`/api/users\`) and handle data securely.

### 📝 Examples
- **Route Handling**: \`app.get('/users', (req, res) => res.send('User List'))\`
- **Middleware**: Running a security check before allowing a user to see a page: \`app.use('/admin', verifyToken, adminRouter);\`

### ⚙️ Real Workings (Industry Application)
Companies like Uber and PayPal use Node.js and Express to handle millions of concurrent connections. When you request an Uber, the mobile app sends an HTTP POST request to an Express API endpoint. Express processes the request, connects to the database via Node.js, finds the nearest driver, and sends the response back to your phone in milliseconds—all using a highly efficient, non-blocking Event Loop.`,

    'MongoDB/Mongoose': `## MongoDB/Mongoose

### 📖 Definition
MongoDB is a source-available cross-platform document-oriented database program, classified as a NoSQL database system, using JSON-like documents. Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.

### 💡 Meaning (In Simple Terms)
Instead of storing data in rigid, spreadsheet-like tables (SQL), MongoDB stores data as flexible documents (like folders full of text files). Mongoose is the translator that sits between your Node.js code and your MongoDB database, helping you enforce rules (like "email is required" or "age must be a number").

### 📝 Examples
- **Document Structure**: \`{ name: "Alice", age: 25, hobbies: ["Reading", "Coding"] }\`
- **Mongoose Schema**: \`const UserSchema = new Schema({ email: { type: String, required: true } });\`
- **Data Query**: \`const users = await User.find({ age: { $gt: 18 } });\` (Finds all users older than 18).

### ⚙️ Real Workings (Industry Application)
Startups and large-scale applications heavily favor MongoDB for its flexibility. In an e-commerce app, a product might have different attributes—a laptop has RAM and CPU, while a t-shirt has Size and Color. Because MongoDB is schema-less, it stores these vastly different product types seamlessly in the same collection. Mongoose ensures that despite the flexibility, bad data (like text in a price field) is rejected before saving.`
  },
  'Graphic Design': {
    'Color Theory': `## Color Theory

### 📖 Definition
Color theory is both the science and art of using color. It explains how humans perceive color; the visual effects of how colors mix, match or contrast with each other; and the messages colors communicate.

### 💡 Meaning (In Simple Terms)
Color theory gives you the rules for combining colors so they look great together instead of clashing. It also tells you what emotions certain colors trigger—like how red makes people feel urgency, while blue makes them feel trust.

### 📝 Examples
- **Complementary Colors**: Using Blue and Orange together to create high, eye-catching contrast (like movie posters).
- **Analogous Colors**: Using Green, Blue-Green, and Blue for a harmonious, calming nature aesthetic.
- **Monochromatic**: Using dark red, medium red, and light pink for a clean, unified brand identity.

### ⚙️ Real Workings (Industry Application)
In the corporate world, banks (like Chase or Citi) heavily use Blue because color psychology proves it instills trust, security, and stability. Fast-food chains (like McDonald's or Wendy's) use Red and Yellow because these colors stimulate appetite and urgency, encouraging fast customer turnover. Designers use the 60-30-10 rule (60% primary color, 30% secondary, 10% accent) to perfectly balance UI layouts.`,

    'Typography Rules': `## Typography Rules

### 📖 Definition
Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing.

### 💡 Meaning (In Simple Terms)
Typography isn't just picking a pretty font. It's the mathematical and visual structuring of text to ensure that a reader's eye naturally flows from the headline down to the body text without getting tired, confused, or bored.

### 📝 Examples
- **Serif vs. Sans-Serif**: Using a traditional Serif font (like Times New Roman) for a printed newspaper, but a clean Sans-Serif font (like Inter) for a modern mobile app.
- **Hierarchy**: Making the main title 32px and bold, the sub-title 20px and medium, and the paragraph text 16px and regular.
- **Line-Height (Leading)**: Setting the space between lines to 150% of the font size to make paragraphs easy to read.

### ⚙️ Real Workings (Industry Application)
Digital product designers rely on strict typography systems. In an app like Apple News, typography is meticulously calculated. Headlines are bold to grab attention, while the body text is constrained to roughly 60-70 characters per line. If lines are too long, the reader's eye struggles to find the start of the next line; if they are too short, the rhythm is broken. Proper typography drives user retention.`,

    'UI Principles': `## UI Principles

### 📖 Definition
User Interface (UI) principles are a set of fundamental design rules and guidelines used to construct intuitive, accessible, and aesthetically pleasing digital interfaces. Key principles include alignment, visual hierarchy, consistency, and whitespace.

### 💡 Meaning (In Simple Terms)
UI principles are the architectural rules of design. They dictate exactly where a button should go, how much empty space should surround it, and why it should look identical to other buttons on the site. Good UI means the user never has to "think" about how to use your app.

### 📝 Examples
- **Whitespace (Negative Space)**: Adding 40 pixels of empty space around a pricing card to make it look premium and easy to focus on.
- **Alignment**: Using an 8-point grid system to ensure every icon, button, and image aligns perfectly to an invisible mathematical grid.
- **Affordance**: Giving a button a slight drop-shadow and a contrasting color so the user instantly knows it can be clicked.

### ⚙️ Real Workings (Industry Application)
In industry-grade design teams at Google or Meta, UI principles are enforced through Design Systems (like Material Design). They strictly use consistent padding (e.g., multiples of 8px) and robust visual hierarchy so that whether a user is looking at Google Mail, Google Drive, or Google Calendar, the interface feels completely familiar. Proper UI drastically reduces customer support tickets because the product is self-explanatory.`
  },
  'Digital Marketing & SEO': {
    'SEO On-Page': `## SEO On-Page

### 📖 Definition
On-page SEO (Search Engine Optimization) is the practice of optimizing web page content and HTML source code to rank higher on search engines and earn more relevant traffic.

### 💡 Meaning (In Simple Terms)
It's the process of tweaking everything actually *on* your website—like the text, the images, the title, and the invisible metadata—so that Google perfectly understands what your page is about and decides it is the best answer to a user's search query.

### 📝 Examples
- **Title Tags**: Optimizing the hidden browser tab title from "Home" to "Best Running Shoes for Men | Nike".
- **H1 Tags**: Ensuring there is only one \`<h1>\` header per page, and it contains your primary keyword.
- **Image Alt-Text**: Describing an image as "red-running-shoes-side-profile" instead of leaving the file named "IMG_9823.jpg".

### ⚙️ Real Workings (Industry Application)
When a digital marketing agency takes over a client's website, the first step is an On-Page SEO audit. They map out the site architecture, rewrite meta descriptions to improve the Click-Through Rate (CTR) from the search results page, and structure long articles with \`<h2>\` and \`<h3>\` tags. This logical structure allows Google's indexing bots to parse the site rapidly, often resulting in massive traffic spikes without spending a dime on ads.`,

    'Keyword Research': `## Keyword Research

### 📖 Definition
Keyword research is the process of discovering, analyzing, and selecting the search terms that people enter into search engines with the goal of using that data for a specific purpose, often for Search Engine Optimization (SEO) or general marketing.

### 💡 Meaning (In Simple Terms)
It is the detective work of finding out exactly what phrases your potential customers are typing into Google. You figure out how many people search for a phrase, how hard it will be to rank for it, and what the user's *actual* intention is when they search it.

### 📝 Examples
- **Short-Tail Keyword**: "Shoes" (Massive volume, impossible to rank for, low conversion rate).
- **Long-Tail Keyword**: "Best running shoes for flat feet 2024" (Lower volume, very easy to rank for, extremely high conversion rate).
- **Search Intent**: Recognizing that someone searching "buy nike pegasus" wants to purchase (Transactional), while someone searching "nike pegasus vs adidas ultraboost" wants a review (Informational).

### ⚙️ Real Workings (Industry Application)
Before a company writes a single blog post, an SEO specialist uses tools like Ahrefs or SEMrush to analyze keyword data. If a software company wants to sell CRM software, they won't try to rank for "CRM" (because Salesforce dominates it). Instead, they will research and find a keyword like "best CRM for real estate agents," check that it has low competition (Keyword Difficulty), and write a highly targeted landing page to capture that specific niche traffic.`,

    'Content Strategy': `## Content Strategy

### 📖 Definition
Content strategy refers to the management of pretty much any tangible media that you create and own: written, visual, downloadable. It is the piece of your marketing plan that continuously demonstrates who you are and the expertise you bring to your industry.

### 💡 Meaning (In Simple Terms)
It's a master plan for what content you will create, who you are creating it for, what platforms you will post it on, and how it guides a stranger into becoming a paying customer. It stops you from posting random blogs and hoping for the best.

### 📝 Examples
- **Top of Funnel (Awareness)**: Creating entertaining, educational YouTube shorts to grab attention.
- **Middle of Funnel (Interest)**: Writing an in-depth, high-value PDF guide that people can download in exchange for their email address.
- **Hub and Spoke Model**: Writing one massive "Ultimate Guide to Dog Training" (Hub), and linking it to 20 smaller articles like "How to Stop a Dog from Barking" (Spokes) to dominate SEO.

### ⚙️ Real Workings (Industry Application)
Major SaaS companies (like HubSpot or Mailchimp) build multi-million dollar empires purely on content strategy. They map their content to the "Buyer's Journey". First, they capture organic traffic through helpful SEO blog posts. Inside the blog post, they offer a free template in exchange for an email. Once the email is captured, they use an automated email marketing sequence to educate the prospect further, ultimately pitching their paid software subscription.`
  }
};
// ─────────────────────────────────────────────
// MASTERCLASS NOTES COMPONENT (Manual Replacment for AI)
// ─────────────────────────────────────────────
const MasterclassNotesSection = ({ domain, domainColor }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [noteContent, setNoteContent] = useState('');

  const domainTopics = DOMAIN_DATA[domain]?.testTopics || [];

  const loadNotes = (topic) => {
    setSelectedTopic(topic);
    const content = MANUAL_NOTES[domain]?.[topic] || 
      `## ${topic}\nContent for this topic is currently being finalized by our industry experts. \n\n### What to expect:\n- Comprehensive beginner-to-intermediate guide\n- Real-world application examples\n- Pro tips for professional success\n- Interview preparation guide`;
    setNoteContent(content);
  };

  const renderMarkdown = (text) => {
    return text
      .replace(/## (.*)/g, `<h2 style="color:${domainColor};font-weight:900;font-size:1.1rem;margin:1.2rem 0 0.5rem;text-transform:uppercase;letter-spacing:0.05em">$1</h2>`)
      .replace(/### (.*)/g, '<h3 style="color:#e2e8f0;font-weight:700;margin:0.8rem 0 0.3rem">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f1f5f9">$1</strong>')
      .replace(/^- (.*)/gm, `<li style="color:#94a3b8;margin:0.3rem 0;padding-left:0.5rem;border-left:2px solid ${domainColor}33">$1</li>`)
      .replace(/\n\n/g, '<br/><br/>');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <BookOpenIcon className="w-5 h-5" style={{ color: domainColor }} />
        <h3 className="font-black text-white text-lg">Masterclass Study Notes</h3>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full" style={{ background: domainColor + '22', color: domainColor }}>
          Verified Content
        </span>
      </div>
      <p className="text-gray-400 text-sm">Expert-curated notes designed to take you from beginner to professional. Clear, structured, and practical.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {domainTopics.map((topic) => (
          <motion.button
            key={topic}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => loadNotes(topic)}
            className="p-4 rounded-2xl text-left border transition-all relative overflow-hidden"
            style={{
              background: selectedTopic === topic ? domainColor + '18' : '#ffffff08',
              borderColor: selectedTopic === topic ? domainColor + '44' : '#ffffff14',
            }}
          >
            <LightBulbIcon className="w-5 h-5 mb-2" style={{ color: domainColor }} />
            <p className="text-white text-xs font-bold leading-tight">{topic}</p>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-900/80 border rounded-2xl p-6"
            style={{ borderColor: domainColor + '33' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black text-white">{selectedTopic}</h4>
              <button
                onClick={() => {
                  const blob = new Blob([noteContent], { type: 'text/markdown' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `${selectedTopic.replace(/\s+/g, '_')}_notes.md`;
                  a.click();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: domainColor + '22', color: domainColor }}
              >
                <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>

            <div
              className="prose-sm text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(noteContent) }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
// PROJECT SUBMISSION COMPONENT
// ─────────────────────────────────────────────
const ProjectSection = ({ domain, domainColor, user }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [submitData, setSubmitData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const project = DOMAIN_DATA[domain]?.project;
  if (!project) return null;

  const toggleStep = (stepIdx) => {
    setCompletedSteps((prev) =>
      prev.includes(stepIdx) ? prev.filter((s) => s !== stepIdx) : [...prev, stepIdx]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missingFields = project.submitFields.filter((f) => !submitData[f]);
    if (missingFields.length) {
      toast.error(`Please fill: ${missingFields[0]}`);
      return;
    }
    try {
      await api.put('/auth/profile', {
        professionalInfo: { portfolioUrl: submitData['GitHub Repository URL'] || submitData[project.submitFields[0]] },
      });
      setSubmitted(true);
      toast.success('Project submitted for admin review! 🎉');
    } catch {
      toast.error('Submission failed');
    }
  };

  const progress = Math.round((completedSteps.length / project.steps.length) * 100);

  return (
    <div className="space-y-8">
      {/* Project Brief */}
      <div className="p-6 rounded-2xl border" style={{ background: domainColor + '0c', borderColor: domainColor + '22' }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: domainColor + '22' }}>
            {CATEGORY_ICONS[domain] || '🚀'}
          </div>
          <div>
            <h3 className="font-black text-white text-xl mb-2">{project.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {project.requirements.map((r) => (
                <span key={r} className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: domainColor + '18', color: domainColor }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-300">Project Progress</span>
          <span className="font-black text-lg" style={{ color: domainColor }}>{progress}%</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${domainColor}, ${domainColor}88)` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, type: 'spring' }}
          />
        </div>
      </div>

      {/* Step-by-step guide */}
      <div className="space-y-3">
        {project.steps.map((step, idx) => {
          const isActive = activeStep === idx;
          const isDone = completedSteps.includes(idx);
          return (
            <motion.div
              key={step.step}
              className="border rounded-2xl overflow-hidden relative backdrop-blur-xl shadow-lg transition-all"
              style={{
                borderColor: isDone ? domainColor + '44' : isActive ? '#ffffff22' : '#ffffff0f',
                marginTop: idx === 0 ? 0 : '-16px',
                zIndex: 10 - idx,
                background: isDone ? '#000000cc' : isActive ? '#1e293bcc' : '#0f172acc',
                boxShadow: isActive ? `0 -10px 40px -10px ${domainColor}22` : '0 -4px 10px -5px rgba(0,0,0,0.5)'
              }}
            >
              <button
                onClick={() => setActiveStep(isActive ? -1 : idx)}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={{
                    background: isDone ? domainColor + '33' : isActive ? domainColor + '22' : '#ffffff0f',
                    color: isDone || isActive ? domainColor : '#6b7280',
                  }}
                >
                  {isDone ? '✓' : step.step}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${isDone ? 'line-through opacity-60' : 'text-white'}`}>{step.title}</p>
                  <p className="text-gray-500 text-xs">{step.desc}</p>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isActive ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-white/10 pt-3">
                      <div className="space-y-2 mb-4">
                        {step.tasks.map((task) => (
                          <div key={task} className="flex items-center gap-2 text-sm text-gray-300">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: domainColor }} />
                            {task}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => toggleStep(idx)}
                        className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{
                          background: isDone ? '#ef444422' : domainColor + '22',
                          color: isDone ? '#ef4444' : domainColor,
                          border: `1px solid ${isDone ? '#ef444433' : domainColor + '33'}`,
                        }}
                      >
                        {isDone ? 'Mark as Incomplete' : 'Mark Step Complete ✓'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Submission Form */}
      {submitted ? (
        <div className="text-center py-10 border rounded-2xl" style={{ borderColor: domainColor + '33' }}>
          <CheckBadgeIcon className="w-16 h-16 mx-auto mb-4" style={{ color: domainColor }} />
          <h3 className="font-black text-white text-xl mb-2">Project Under Admin Review</h3>
          <p className="text-gray-400 text-sm">You'll be notified once the admin verifies your project. Then you can take the Skill Test.</p>
        </div>
      ) : (
        <div className="border rounded-2xl p-6" style={{ borderColor: '#ffffff14' }}>
          <h3 className="font-black text-white mb-1">Submit Your Project</h3>
          <p className="text-gray-400 text-sm mb-5">Provide the required links for admin review.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {project.submitFields.map((field) => (
              <div key={field}>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">{field}</label>
                <input
                  type="text"
                  placeholder={field.includes('URL') ? 'https://' : field.includes('min') ? 'https://loom.com/...' : 'Paste link here'}
                  value={submitData[field] || ''}
                  onChange={(e) => setSubmitData((p) => ({ ...p, [field]: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-gray-600 focus:border-opacity-60 focus:outline-none transition-all"
                  style={{ '--tw-ring-color': domainColor }}
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: `linear-gradient(135deg, ${domainColor}, ${domainColor}88)`, boxShadow: `0 8px 32px ${domainColor}33` }}
            >
              Submit for Admin Review 🚀
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// 80-QUESTION PROCTORED TEST COMPONENT
// ─────────────────────────────────────────────
const SkillTestSection = ({ domain, domainColor, user, updateUser }) => {
  const [phase, setPhase] = useState('intro'); // intro | camera | test | result
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(80 * 60);
  const [questions] = useState(() => generateQuestions(domain));
  const [tabViolations, setTabViolations] = useState(0);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const hasBadge = user?.badges?.some((b) => b.role === domain);
  const MAX_VIOLATIONS = 3;

  // Tab switch detection
  useEffect(() => {
    if (phase !== 'test') return;
    const onVisibility = () => {
      if (document.hidden) {
        setTabViolations((v) => {
          const next = v + 1;
          if (next >= MAX_VIOLATIONS) {
            submitTest(true);
          } else {
            toast.error(`⚠️ Tab switch detected! Warning ${next}/${MAX_VIOLATIONS}. Test will auto-submit.`, { duration: 4000 });
          }
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [phase]);

  // Fullscreen & Anti-Cheat (Copy, Paste, Context Menu)
  useEffect(() => {
    if (phase !== 'test') return;
    
    // Request fullscreen
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
    
    // Prevent right-click and copy-paste
    const preventAction = (e) => e.preventDefault();
    document.addEventListener('contextmenu', preventAction);
    document.addEventListener('copy', preventAction);
    document.addEventListener('paste', preventAction);
    
    return () => {
      if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
      document.removeEventListener('contextmenu', preventAction);
      document.removeEventListener('copy', preventAction);
      document.removeEventListener('paste', preventAction);
    };
  }, [phase]);

  // Timer
  useEffect(() => {
    if (phase !== 'test') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); submitTest(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraGranted(true);
    } catch {
      toast.error('Camera access is required for the proctored test');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const submitTest = async (forced = false) => {
    if (phase === 'result') return;
    clearInterval(timerRef.current);
    stopCamera();
    setSubmitting(true);
    setPhase('result');

    const correct = questions.filter((q) => answers[q.id] === q.answer).length;
    const score = Math.round((correct / 80) * 100);
    const passed = score >= 75;

    const resultData = { correct, total: 80, score, passed, forced };
    setResult(resultData);

    if (passed) {
      try {
        await api.put('/auth/add-badge', {
          name: `Professional Provider (${domain})`,
          role: domain,
          testResult: {
            category: domain,
            examScore: Math.round(score * 0.5),
            projectScore: 50,
            githubRepo: 'submitted',
            passed: true,
          },
        });
        const { data } = await api.get('/auth/me');
        updateUser(data.user);
        toast.success(`🏆 You earned the ${domain} Professional Badge!`);
      } catch {
        toast.error('Badge award failed. Contact admin.');
      }
    }
    setSubmitting(false);
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const answered = Object.keys(answers).length;

  if (hasBadge) return (
    <div className="text-center py-16">
      <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: domainColor + '22' }}>
        <TrophyIcon className="w-12 h-12" style={{ color: domainColor }} />
      </div>
      <h3 className="font-black text-white text-2xl mb-2">Badge Already Earned!</h3>
      <p className="text-gray-400">You have already passed the {domain} certification.</p>
    </div>
  );

  // INTRO
  if (phase === 'intro') return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border" style={{ background: domainColor + '0c', borderColor: domainColor + '22' }}>
        <h3 className="font-black text-white text-xl mb-3">Professional Merit Assessment</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[['80', 'Questions'], ['80', 'Minutes'], ['75%', 'Pass Score'], ['Admin', 'Verified']].map(([v, l]) => (
            <div key={l} className="text-center p-4 rounded-xl" style={{ background: '#ffffff0a' }}>
              <p className="text-2xl font-black" style={{ color: domainColor }}>{v}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">{l}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[
            '📷 Camera must be ON throughout the test',
            '🚫 Tab switching will be detected — 3 violations = auto-submit',
            '⏱️ 80 minutes for 80 questions (1 min/question)',
            '📊 75% correct to earn the Professional Badge',
            '🔒 Badge is admin-verified before provider unlock',
          ].map((rule) => (
            <div key={rule} className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-base">{rule.slice(0, 2)}</span>
              <span>{rule.slice(3)}</span>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => setPhase('camera')}
        className="w-full py-4 rounded-2xl font-black text-white uppercase tracking-widest transition-all hover:scale-[1.01]"
        style={{ background: `linear-gradient(135deg, ${domainColor}, ${domainColor}88)`, boxShadow: `0 8px 32px ${domainColor}33` }}
      >
        Proceed to Camera Check →
      </button>
    </div>
  );

  // CAMERA CHECK
  if (phase === 'camera') return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="font-black text-white text-xl mb-1">Camera Verification</h3>
        <p className="text-gray-400 text-sm">Allow camera access to begin the proctored test</p>
      </div>
      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10">
        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
        {!cameraGranted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <CameraIcon className="w-16 h-16 text-gray-600" />
            <p className="text-gray-500">Camera not active</p>
          </div>
        )}
        {cameraGranted && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-500/90 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-xs font-bold">CAMERA ACTIVE</span>
          </div>
        )}
      </div>
      {!cameraGranted ? (
        <button onClick={startCamera} className="w-full py-4 rounded-2xl font-black text-white" style={{ background: domainColor }}>
          <CameraIcon className="w-5 h-5 inline mr-2" />Enable Camera
        </button>
      ) : (
        <button
          onClick={() => setPhase('test')}
          className="w-full py-4 rounded-2xl font-black text-white uppercase tracking-widest transition-all hover:scale-[1.01]"
          style={{ background: `linear-gradient(135deg, ${domainColor}, ${domainColor}88)` }}
        >
          Start 80-Question Test →
        </button>
      )}
    </div>
  );

  // RESULT
  if (phase === 'result') return (
    <div className="text-center py-10 space-y-6">
      {submitting ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: domainColor }} />
          <p className="text-gray-300">Calculating results...</p>
        </div>
      ) : result && (
        <>
          <div className="w-28 h-28 mx-auto rounded-full flex items-center justify-center" style={{ background: (result.passed ? domainColor : '#ef4444') + '22' }}>
            {result.passed ? <TrophyIcon className="w-14 h-14" style={{ color: domainColor }} /> : <XMarkIcon className="w-14 h-14 text-red-400" />}
          </div>
          <div>
            <h3 className="font-black text-white text-3xl">{result.score}%</h3>
            <p className="text-gray-400 mt-1">{result.correct}/{result.total} correct</p>
            {result.forced && <p className="text-amber-400 text-sm mt-1">⚠️ Test auto-submitted due to tab violations</p>}
          </div>
          {result.passed ? (
            <div className="p-6 rounded-2xl border" style={{ background: domainColor + '0c', borderColor: domainColor + '33' }}>
              <CheckBadgeIcon className="w-10 h-10 mx-auto mb-3" style={{ color: domainColor }} />
              <h4 className="font-black text-white text-lg mb-1">Professional Badge Earned!</h4>
              <p className="text-gray-400 text-sm">Your badge is now pending admin verification. Once approved, your provider account will be unlocked.</p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5">
              <p className="text-red-400 font-bold mb-2">Score below 75% — Please retry</p>
              <p className="text-gray-400 text-sm mb-4">Review the roadmap and notes, then try again.</p>
              <button
                onClick={() => { setPhase('intro'); setAnswers({}); setCurrentQ(0); setTimeLeft(80 * 60); setTabViolations(0); }}
                className="px-6 py-2.5 rounded-xl font-black text-sm text-white"
                style={{ background: domainColor }}
              >
                Retry Assessment
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ACTIVE TEST
  const q = questions[currentQ];
  return (
    <div>
      {/* Test header */}
      <div className="sticky top-0 z-10 bg-gray-950 border-b border-white/10 py-3 px-1 flex items-center gap-4 -mx-1 mb-6">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${timeLeft < 300 ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`} />
          <span className={`font-black text-xl tabular-nums ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>{formatTime(timeLeft)}</span>
        </div>
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${(answered / 80) * 100}%`, background: domainColor }} />
        </div>
        <span className="text-sm font-black text-gray-400 flex-shrink-0">{answered}/80</span>
        {tabViolations > 0 && (
          <span className="text-xs font-black text-amber-400 flex-shrink-0">⚠️ {tabViolations}/{MAX_VIOLATIONS}</span>
        )}
      </div>

      {/* Question navigator (mini dots) */}
      <div className="flex flex-wrap gap-1 mb-6">
        {questions.map((qItem, idx) => (
          <button
            key={qItem.id}
            onClick={() => setCurrentQ(idx)}
            className="w-6 h-6 rounded text-[9px] font-bold transition-all"
            style={{
              background: answers[qItem.id] ? domainColor + '44' : idx === currentQ ? '#ffffff22' : '#ffffff0a',
              color: answers[qItem.id] ? domainColor : idx === currentQ ? 'white' : '#6b7280',
              border: idx === currentQ ? `1px solid ${domainColor}` : '1px solid transparent',
            }}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: domainColor + '22', color: domainColor }}>
              {q.topic}
            </span>
          </div>
          <p className="text-white font-bold text-lg mb-6 leading-relaxed">
            <span className="text-gray-500 mr-2">Q{currentQ + 1}.</span>
            {q.question}
          </p>
          <div className="space-y-3 mb-8">
            {q.options.map((opt, oi) => {
              const selected = answers[q.id] === opt;
              return (
                <motion.button
                  key={opt}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                  className="w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all"
                  style={{
                    background: selected ? domainColor + '22' : '#ffffff08',
                    borderColor: selected ? domainColor + '66' : '#ffffff14',
                    color: selected ? 'white' : '#94a3b8',
                    boxShadow: selected ? `0 0 20px ${domainColor}22` : 'none',
                  }}
                >
                  <span className="font-black mr-3" style={{ color: selected ? domainColor : '#4b5563' }}>
                    {['A', 'B', 'C', 'D'][oi]}.
                  </span>
                  {opt}
                </motion.button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
              disabled={currentQ === 0}
              className="flex-1 py-3 rounded-xl font-bold text-sm border border-white/10 text-gray-400 disabled:opacity-30"
            >
              ← Previous
            </button>
            {currentQ < 79 ? (
              <button
                onClick={() => setCurrentQ((c) => Math.min(79, c + 1))}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: domainColor + '44' }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => submitTest(false)}
                className="flex-1 py-3 rounded-xl font-black text-sm text-white"
                style={{ background: `linear-gradient(135deg, ${domainColor}, ${domainColor}88)` }}
              >
                Submit Test ✓
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN LEARNING PAGE
// ─────────────────────────────────────────────
const LearningPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [domainSelected, setDomainSelected] = useState(!!user?.activeLearningDomain);
  const [selectedDomain, setSelectedDomain] = useState(user?.activeLearningDomain || null);
  const [activeTab, setActiveTab] = useState('roadmap');
  const [videoLang, setVideoLang] = useState('All');
  const [playerSrc, setPlayerSrc] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const domainData = selectedDomain ? DOMAIN_DATA[selectedDomain] : null;
  const domainColor = domainData?.color || '#4f46e5';
  const hasBadge = user?.badges?.some((b) => b.role === selectedDomain);

  const handleDomainChoice = async (cat) => {
    try {
      const { data } = await api.put('/auth/set-active-domain', { domain: cat });
      updateUser(data.user);
      setSelectedDomain(cat);
      setDomainSelected(true);
      setActiveTab('roadmap');
      toast.success(`${cat} path activated! Let's go 🚀`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to select domain');
    }
  };

  const TABS = [
    { id: 'roadmap', label: 'Roadmap', icon: MapIcon },
    { id: 'videos', label: 'Videos', icon: VideoCameraIcon },
    { id: 'notes', label: 'Custom Notes', icon: OutlineDocumentTextIcon },
    { id: 'project', label: 'Project', icon: CodeBracketIcon },
    { id: 'test', label: 'Skill Test', icon: ShieldCheckIcon },
  ];

  // ── DOMAIN SELECTION SCREEN ──
  if (!domainSelected) {
    return (
      <div className="min-h-screen bg-gray-950 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
                <RocketLaunchIcon className="w-3.5 h-3.5" /> C2C Learning Academy
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-none tracking-tight">
                Choose Your
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent"> Specialty</span>
              </h1>
              <p className="text-gray-400 text-xl max-w-2xl mx-auto">
                Master one domain completely — structured roadmap, curated videos, AI notes, real project, and a proctored test. Zero cost.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat, idx) => {
              const data = DOMAIN_DATA[cat];
              return (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  onClick={() => handleDomainChoice(cat)}
                  className="group p-7 rounded-[2rem] border text-left relative overflow-hidden bg-gray-900 hover:bg-gray-800/80 transition-all"
                  style={{ borderColor: data ? data.color + '22' : '#ffffff11' }}
                >
                  {data && (
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-20 pointer-events-none"
                      style={{ background: data.color }} />
                  )}
                  <div className="text-4xl mb-4">{CATEGORY_ICONS[cat] || '🔗'}</div>
                  <h3 className="font-black text-white text-xl mb-2">{cat}</h3>
                  {data ? (
                    <>
                      <p className="text-gray-500 text-sm mb-5 italic">{data.tagline}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Roadmap', 'Videos', 'Custom Notes', 'Project', 'Test'].map((f) => (
                          <span key={f} className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg"
                            style={{ background: data.color + '18', color: data.color }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600 text-sm">Full curriculum coming soon</p>
                  )}
                  <ArrowRightIcon className="w-5 h-5 absolute bottom-6 right-6 text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN LEARNING UI ──
  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-white/8 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="p-5 border-b border-white/8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                style={{ background: domainColor + '22' }}>
                {CATEGORY_ICONS[selectedDomain]}
              </div>
              <div>
                <p className="font-black text-white text-sm leading-tight">{selectedDomain}</p>
                <p className="text-[10px] text-gray-500">Academy Path</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {hasBadge && (
          <div className="mx-4 mt-4 p-3 rounded-xl flex items-center gap-2" style={{ background: domainColor + '18' }}>
            <TrophyIcon className="w-5 h-5 flex-shrink-0" style={{ color: domainColor }} />
            <p className="text-xs font-black" style={{ color: domainColor }}>Badge Earned!</p>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 mt-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: isActive ? domainColor + '22' : 'transparent',
                  color: isActive ? domainColor : '#6b7280',
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {tab.label}
                {tab.id === 'test' && hasBadge && <CheckBadgeIcon className="w-4 h-4 ml-auto text-green-400" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/8">
          <button
            onClick={() => {
              if (hasBadge) { setDomainSelected(false); setSelectedDomain(null); }
              else toast.error('Earn your badge first to switch domains');
            }}
            className="w-full text-left text-xs font-black uppercase tracking-widest text-gray-600 hover:text-gray-400 transition py-2 px-2"
          >
            {hasBadge ? '← Switch Domain' : '🔒 Domain Locked'}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur border-b border-white/8 px-5 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400">
            <Bars3BottomLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-3">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: isActive ? domainColor + '22' : 'transparent',
                    color: isActive ? domainColor : '#6b7280',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          {hasBadge && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black" style={{ background: domainColor + '18', color: domainColor }}>
              <TrophyIcon className="w-3.5 h-3.5" />Certified
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >

              {/* ── ROADMAP ── */}
              {activeTab === 'roadmap' && domainData && (
                <div>
                  <div className="mb-8">
                    <h2 className="text-3xl font-black text-white mb-1">{selectedDomain}</h2>
                    <p className="text-gray-400 italic">{domainData.tagline}</p>
                  </div>
                  <RoadmapTimeline roadmap={domainData.roadmap} domainColor={domainColor} />
                  <div className="mt-8 p-5 rounded-2xl border border-white/10 bg-white/5">
                    <p className="text-gray-300 text-sm font-bold mb-1">💡 Self-Learning Tip</p>
                    <p className="text-gray-400 text-sm">Spend 2–3 hours daily on each phase. Complete the hands-on exercises in each section before moving on. The best way to learn is to build.</p>
                  </div>
                </div>
              )}

              {/* ── VIDEOS ── */}
              {activeTab === 'videos' && domainData && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-white">Curated Videos</h2>
                    <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
                      {['All', 'Telugu', 'English', 'Hindi'].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setVideoLang(lang)}
                          className="px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                          style={{
                            background: videoLang === lang ? domainColor + '33' : 'transparent',
                            color: videoLang === lang ? domainColor : '#6b7280',
                          }}
                        >
                          {lang === 'All' ? '🌍' : lang === 'Telugu' ? '🇮🇳' : lang === 'Hindi' ? '🟠' : '🌐'} {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {playerSrc && (
                    <div className="mb-8 rounded-2xl overflow-hidden aspect-video bg-black border border-white/10">
                      <iframe src={playerSrc} className="w-full h-full" allowFullScreen title="video" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(videoLang === 'All' 
                        ? Object.values(domainData.videos || {}).flat() 
                        : domainData.videos?.[videoLang] || []
                    ).map((video) => {
                      const isDone = user?.completedVideos?.includes(video.id);
                      return (
                        <motion.div
                          key={video.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={async () => {
                            setPlayerSrc(video.url);
                            if (!isDone) {
                              try {
                                const { data } = await api.put('/auth/complete-video', { videoId: video.id });
                                updateUser(data.user);
                                toast.success('Progress saved ✓');
                              } catch { }
                            }
                          }}
                          className="cursor-pointer rounded-2xl overflow-hidden border border-white/10 bg-gray-900 group"
                        >
                          <div className="relative aspect-video">
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                                <PlayIcon className="w-7 h-7 text-white ml-1" />
                              </div>
                            </div>
                            {isDone && (
                              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                <CheckCircleIcon className="w-4 h-4" />
                              </div>
                            )}
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                              {video.duration}
                            </div>
                          </div>
                          <div className="p-4">
                            <p className={`font-bold text-sm mb-1 ${isDone ? 'text-green-400' : 'text-white'}`}>{video.title}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{video.channel}</p>
                              <div className="flex items-center gap-1">
                                <StarIcon className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-[10px] text-amber-400 font-bold">{video.rating}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── MASTERCLASS NOTES ── */}
              {activeTab === 'notes' && (
                <MasterclassNotesSection domain={selectedDomain} domainColor={domainColor} />
              )}

              {/* ── PROJECT ── */}
              {activeTab === 'project' && (
                <ProjectSection domain={selectedDomain} domainColor={domainColor} user={user} />
              )}

              {/* ── SKILL TEST ── */}
              {activeTab === 'test' && (
                <SkillTestSection
                  domain={selectedDomain}
                  domainColor={domainColor}
                  user={user}
                  updateUser={updateUser}
                />
              )}

              {/* Fallback for domains without data */}
              {!domainData && ['roadmap', 'videos', 'notes', 'project'].includes(activeTab) && (
                <div className="text-center py-20">
                  <p className="text-5xl mb-4">🏗️</p>
                  <h3 className="font-black text-white text-xl mb-2">Content Coming Soon</h3>
                  <p className="text-gray-400">Full curriculum for {selectedDomain} is being built.</p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default LearningPage;