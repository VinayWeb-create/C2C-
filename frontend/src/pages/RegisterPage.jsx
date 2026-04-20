import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

import { GoogleLogin } from '@react-oauth/google';

const RegisterPage = () => {
  const { register, googleLogin, loading } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: '', email: '', password: '', phone: '', role: 'user' });
  const [showPwd, setShowPwd] = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!form.name  || form.name.trim().length < 2)         e.name     = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))    e.email    = 'Valid email is required';
    if (!form.password || form.password.length < 6)          e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register(form);
    if (result.success) {
      navigate('/dashboard/user');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) {
      if (result.user.role === 'admin') navigate('/dashboard/admin');
      else if (result.user.role === 'provider') navigate('/dashboard/provider');
      else navigate('/dashboard/user');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-10 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full -mr-16 -mt-16 blur-2xl" />

          <div className="text-center mb-10 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-600/20">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Join C2C Academy</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium italic">Your journey to corporate excellence starts here.</p>
          </div>

          {/* Merit Info Banner */}
          <div className="mb-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800/50 flex gap-4 items-start">
             <ShieldCheckIcon className="w-6 h-6 text-primary-600 flex-shrink-0" />
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-700 dark:text-primary-300">Merit Policy</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                   All users join as <strong>Learners</strong>. Unlock <strong>Provider Status</strong> by earning professional badges.
                </p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Name */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex. Vinay Rok"
                className={`input-field rounded-2xl py-4 bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 transition-all ${errors.name ? 'ring-2 ring-red-400' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1 font-bold">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@company.com"
                className={`input-field rounded-2xl py-4 bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 transition-all ${errors.email ? 'ring-2 ring-red-400' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1 font-bold">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password"
                  className={`input-field rounded-2xl py-4 pr-12 bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 transition-all ${errors.password ? 'ring-2 ring-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition"
                >
                  {showPwd ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1 font-bold">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-3xl text-xs uppercase tracking-widest shadow-xl shadow-primary-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Secure Account...
                </span>
              ) : 'Start Your Journey'}
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 uppercase text-[10px] font-bold tracking-widest leading-none">Or join with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google signup failed')}
              text="signup_with"
              theme="outline"
              size="large"
              width="320"
              shape="pill"
            />
          </div>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-10">
            Already a member?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-black hover:underline">
              Sign In →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
