import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, UserIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register, loading } = useAuth();
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
      navigate(result.user.role === 'provider' ? '/dashboard/provider' : '/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">SL</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Join Smart Local Life today</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'user',     Icon: UserIcon,       label: 'I need services',  sub: 'Browse & book' },
              { value: 'provider', Icon: BriefcaseIcon,  label: 'I provide services', sub: 'List & earn' },
            ].map(({ value, Icon, label, sub }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, role: value })}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  form.role === value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${form.role === value ? 'text-primary-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-semibold ${form.role === value ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200'}`}>{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPwd ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : `Create ${form.role === 'provider' ? 'Provider' : ''} Account`}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
