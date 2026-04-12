import { useState, useRef, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon, XMarkIcon,
  PaperAirplaneIcon, SparklesIcon, TrashIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import ServiceCard from '../services/ServiceCard';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAIStore from '../../hooks/useAIStore';

const SUGGESTIONS = [
  'I need a professional PPT for a seminar',
  'Find me a React developer under ₹2000',
  'Best SEO experts for a startup',
  'UI/UX designer for mobile app',
  'Video editor for YouTube',
];

const INITIAL_MESSAGE = (user) => ({
  role: 'assistant',
  content: `Hi${user ? ` ${user.name.split(' ')[0]}` : ''}! Welcome to C2C. 👋 I'm your career assistant. Tell me what freelance service you need — like "I need a professional PPT" or "find a web developer".`,
  services: [],
});

const AIChatbot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const setAIFilters = useAIStore((state) => state.setAIFilters);
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => [INITIAL_MESSAGE(user)]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, open]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    setHistory((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', {
        message: msg,
        history: history.map((m) => ({ role: m.role, content: m.content })),
      });
      setHistory((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: data.reply, 
          services: data.services || [],
          extracted: data.extracted 
        },
      ]);

      // If on services page and AI extracted filters, we could auto-sync 
      // but for "Professional" feel, we'll show a button or do it if certain
      if (data.intent === 'search_service' && data.extracted?.category) {
        // Option: navigate('/services'); 
      }
    } catch {
      setHistory((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I ran into an issue. Please try again!', services: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        {/* Teaser FAB for logged-out users */}
        <button
          onClick={() => navigate('/login')}
          style={{ right: '48px', bottom: '48px', left: 'auto' }}
          className="fixed z-[9999] w-14 h-14 rounded-2xl bg-primary-600 hover:bg-primary-700
                     text-white shadow-2xl flex items-center justify-center transition-all duration-300
                     hover:scale-110"
          aria-label="AI Assistant — login to use"
        >
          <SparklesIcon className="w-6 h-6" />
          <span className="absolute inset-0 rounded-2xl border-2 border-primary-400 animate-ping opacity-30" />
        </button>
        {/* Tooltip hint */}
        <div style={{ right: '110px', bottom: '48px' }} className="fixed z-[9999] hidden sm:flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-2 shadow-lg text-xs text-gray-600 dark:text-gray-300 pointer-events-none">
          <SparklesIcon className="w-3.5 h-3.5 text-primary-500" />
          AI Assistant — <span className="font-medium text-primary-600">Login to chat</span>
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setOpen(true)}
            style={{ 
              right: '48px', 
              bottom: '48px', 
              left: 'auto',
              position: 'fixed'
            }}
            className="z-[9999] w-14 h-14 rounded-2xl bg-primary-600 hover:bg-primary-700
                       text-white shadow-2xl flex items-center justify-center transition-all duration-300
                       hover:scale-110 relative"
            aria-label="Open AI chat"
          >
            <SparklesIcon className="w-6 h-6" />
            <span className="absolute inset-0 rounded-2xl border-2 border-primary-400 animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div 
            key="chat-window"
            initial={{ opacity: 0, y: 40, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="z-[9999] w-96 max-w-[calc(100vw-80px)] flex flex-col
                       card shadow-2xl overflow-hidden" 
            style={{ 
              height: '580px', 
              right: '48px', 
              bottom: '48px',
              left: 'auto',
              position: 'fixed'
            }}
          >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <SparklesIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">AI Assistant</p>
                <p className="text-xs text-primary-200">Powered by Vinnu</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Clear chat */}
              <button
                onClick={() => setHistory([INITIAL_MESSAGE(user)])}
                className="p-1.5 rounded-lg hover:bg-white/20 transition text-white/70 hover:text-white"
                title="Clear chat"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
            <AnimatePresence initial={false}>
              {history.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-br-sm shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm rounded-bl-sm border border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      {msg.content || (msg.role === 'assistant' ? "Generating response..." : "")}
                    </div>
                  </div>

                  {/* AI Extracted Actions */}
                  {msg.role === 'assistant' && msg.extracted?.category && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mt-2 flex gap-2"
                    >
                      <button
                        onClick={() => {
                          setAIFilters(msg.extracted);
                          navigate('/services');
                        }}
                        className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 
                                   rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 
                                   dark:text-primary-400 hover:bg-primary-200 transition-all border border-primary-200 dark:border-primary-800 flex items-center gap-1.5"
                      >
                        < SparklesIcon className="w-3 h-3" />
                        Apply Search Filters
                      </button>
                    </motion.div>
                  )}

                  {/* Service cards from AI response */}
                  {msg.services?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">Found {msg.services.length} services:</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {msg.services.slice(0, 3).map((svc) => (
                          <ServiceCard key={svc._id} service={svc} compact />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {history.length <= 1 && (
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex gap-1.5 overflow-x-auto flex-shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30
                             text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800
                             hover:bg-primary-100 dark:hover:bg-primary-900/60 transition flex-shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask me anything..."
                className="input-field text-sm py-2"
                disabled={loading}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="btn-primary px-3 py-2 flex-shrink-0"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
