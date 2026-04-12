import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  EnvelopeIcon, KeyIcon, LockClosedIcon, 
  ArrowLeftIcon, CheckCircleIcon 
} from '@heroicons/react/24/outline';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.success) {
        toast.success(data.message);
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 4) return toast.error('Please enter 4-digit OTP');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      if (data.success) {
        toast.success(data.message);
        setStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { email, otp, newPassword });
      if (data.success) {
        toast.success(data.message);
        setStep(4);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8 bg-white dark:bg-gray-900 shadow-2xl rounded-3xl border border-gray-100 dark:border-gray-800">
          
          {/* Step 1: Email */}
          {step === 1 && (
            <div className="animate-enter">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                  <EnvelopeIcon className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Enter your registered email to receive a 4-digit reset code.</p>
              </div>

              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="input-field"
                  />
                </div>
                <button disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
                <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition">
                  <ArrowLeftIcon className="w-4 h-4" /> Back to Login
                </Link>
              </form>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <div className="animate-enter">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600">
                  <KeyIcon className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify OTP</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">We've sent a 4-digit code to <span className="font-semibold text-gray-900 dark:text-white">{email}</span></p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="flex justify-center">
                  <input
                    required
                    type="text"
                    maxLength="4"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="0000"
                    className="w-32 text-center text-3xl font-bold tracking-[0.5em] py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 bg-transparent outline-none transition-all"
                  />
                </div>
                <button disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
                <div className="text-center">
                  <button type="button" onClick={() => setStep(1)} className="text-sm text-primary-600 hover:underline">
                    Resend Code or Change Email
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <div className="animate-enter">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                  <LockClosedIcon className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set New Password</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Create a secure password for your account.</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                  <input
                    required
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="input-field"
                  />
                </div>
                <button disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center animate-enter py-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                <CheckCircleIcon className="w-12 h-12" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Success!</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Your password has been reset successfully. You can now log in with your new password.</p>
              <Link to="/login" className="btn-primary w-full justify-center py-3">
                Proceed to Login
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
