import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function AuthModal({ isOpen, onClose, onSuccess, initialTab = 'login' }) {
  // Toggle between sign in and sign up screens
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  // Toggle backend request processing
  const [loading, setLoading] = useState(false);
  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Email Verification States
  const [step, setStep] = useState('auth'); // 'auth', 'verify', 'forgot', 'reset'
  const [verificationCode, setVerificationCode] = useState('');
  const [resending, setResending] = useState(false);

  // Pull login/register functions from AuthContext
  const { login, register, verifyEmail, resendVerification, forgotPassword, resetPassword } = useAuth();

  const handleForgotPassword = () => {
    setStep('forgot');
  };

  // Reset all state when closing so the modal starts fresh next time
  useEffect(() => {
    if (!isOpen) {
      setTab('login');
      setStep('auth');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setMiddleInitial('');
      setShowPassword(false);
      setVerificationCode('');
    }
  }, [isOpen]);

  // Handle registration and login forms — now calls Laravel directly
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tab === 'login') {
        // POST /auth/login to Laravel, stores token in localStorage
        await login(email, password);
        toast.success('Welcome back to Luxury Scent Decants!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        // Guard against password mismatches on registration
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        // POST /auth/register to Laravel
        const data = await register(firstName, lastName, middleInitial, email, password, confirmPassword);
        if (data?.requires_verification) {
          toast.success('Account registered! A 6-digit verification code has been sent to your email.');
          setStep('verify');
        } else {
          toast.success('Account created! Welcome to Luxury Scent Decants.');
          if (onSuccess) onSuccess();
          onClose();
        }
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requires_verification) {
        toast.error(err.response.data.message || 'Please verify your email.');
        setStep('verify');
        return;
      }
      // Laravel returns errors in err.response.data.message or err.response.data.errors
      const msg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        err.message ||
        'An error occurred. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error('Verification code must be exactly 6 digits.');
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(email, verificationCode);
      toast.success('Verification successful! Welcome to Luxury Scent Decants.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        err.message ||
        'Verification failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification(email);
      toast.success('A new verification code has been sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('A 6-digit password reset code has been sent to your email.');
      setVerificationCode('');
      setPassword('');
      setConfirmPassword('');
      setStep('reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email address not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error('Verification code must be exactly 6 digits.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, verificationCode, password, confirmPassword);
      toast.success('Your password has been reset successfully! Please sign in with your new password.');
      setVerificationCode('');
      setPassword('');
      setConfirmPassword('');
      setStep('auth');
      setTab('login');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        err.message ||
        'Failed to reset password. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Transparent dark screen overlay behind the modal */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Main modal container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-brand-gold/20 bg-gradient-to-b from-[#03251a] to-[#011611] p-8 shadow-[0_0_50px_rgba(2,28,19,0.8)] z-10"
          >
            {/* Visual background ambient glow blur highlights */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-emerald-light/20 rounded-full blur-2xl pointer-events-none" />

            {/* Click to close the modal */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-brand-gold/10 text-brand-cream/60 hover:text-brand-gold hover:border-brand-gold/30 transition-all duration-200"
            >
              <X size={18} />
            </button>

            {/* Brand details and logo header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-brand-gold/20 bg-brand-emerald-dark mb-3 overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                <img
                  src="/Images/logo.webp"
                  alt="Luxury Scent Decants Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="font-serif text-2xl text-brand-cream tracking-wide">
                Luxury Scent <span className="text-brand-gold">Decants</span>
              </h2>
              <p className="text-xs text-brand-cream/60 mt-1 font-sans uppercase tracking-[0.1em]">
                {step === 'forgot'
                  ? 'Request password reset code'
                  : step === 'reset'
                  ? 'Set your new password'
                  : step === 'verify'
                  ? 'Verify your email address'
                  : tab === 'login'
                  ? 'Access your exclusive scent vault'
                  : 'Begin your olfactory journey'}
              </p>
            </div>

            {step === 'verify' ? (
              <form onSubmit={handleVerifySubmit} className="space-y-6">
                <div className="text-center mb-2">
                  <p className="text-xs text-brand-cream/70 font-sans">
                    We sent a 6-digit verification code to your email address:
                  </p>
                  <p className="text-sm font-bold text-brand-gold font-sans mt-1">
                    {email}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-cream/30">
                      <Lock size={15} />
                    </span>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="e.g. 123456"
                      className="w-full pl-10 pr-4 py-3 bg-brand-emerald-dark/60 border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/60 transition-all font-sans text-center tracking-[0.3em] font-bold text-lg"
                    />
                  </div>
                </div>

                {/* Submit action button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-brand-gold/90 hover:bg-brand-gold text-brand-emerald-dark rounded-xl text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-2 transform active:scale-[0.98]"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="flex flex-col gap-2.5 items-center justify-center pt-2">
                  <button
                    type="button"
                    disabled={resending}
                    onClick={handleResend}
                    className="text-[10px] font-bold text-brand-gold/75 hover:text-brand-gold uppercase tracking-widest transition-colors focus:outline-none disabled:opacity-50"
                  >
                    {resending ? 'Resending Code...' : 'Resend Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('auth')}
                    className="text-[9px] font-bold text-brand-cream/40 hover:text-brand-cream/70 uppercase tracking-widest transition-colors focus:outline-none mt-1"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            ) : step === 'forgot' ? (
              <form onSubmit={handleForgotSubmit} className="space-y-6">
                <div className="text-center mb-2">
                  <p className="text-xs text-brand-cream/70 font-sans">
                    Enter your email address and we'll send you a 6-digit code to reset your password.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-cream/30">
                      <Mail size={15} />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. customer@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-brand-emerald-dark/60 border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/60 transition-all font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-brand-gold/90 hover:bg-brand-gold text-brand-emerald-dark rounded-xl text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-2 transform active:scale-[0.98]"
                >
                  {loading ? 'Sending Code...' : 'Send Reset Code'}
                </button>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('auth')}
                    className="text-[9px] font-bold text-brand-cream/40 hover:text-brand-cream/70 uppercase tracking-widest transition-colors focus:outline-none"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            ) : step === 'reset' ? (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="text-center mb-2">
                  <p className="text-xs text-brand-cream/70 font-sans">
                    We sent a 6-digit password reset code to:
                  </p>
                  <p className="text-sm font-bold text-brand-gold font-sans mt-1">
                    {email}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                    6-Digit Reset Code
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-cream/30">
                      <Lock size={15} />
                    </span>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="e.g. 123456"
                      className="w-full pl-10 pr-4 py-3 bg-brand-emerald-dark/60 border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/60 transition-all font-sans text-center tracking-[0.3em] font-bold text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-cream/30">
                      <Lock size={15} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-brand-emerald-dark/60 border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/60 transition-all font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brand-cream/30 hover:text-brand-gold transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-cream/30">
                      <Lock size={15} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-brand-emerald-dark/60 border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/60 transition-all font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-brand-gold/90 hover:bg-brand-gold text-brand-emerald-dark rounded-xl text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-4 transform active:scale-[0.98]"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('forgot')}
                    className="text-[9px] font-bold text-brand-cream/40 hover:text-brand-cream/70 uppercase tracking-widest transition-colors focus:outline-none"
                  >
                    ← Back
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Navigation tab links to switch screens with custom CSS slider lines */}
                <div className="flex border-b border-brand-gold/15 mb-6">
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className={`flex-1 pb-2.5 text-xs font-bold tracking-[0.2em] uppercase transition-colors relative ${
                      tab === 'login' ? 'text-brand-gold' : 'text-brand-cream/40 hover:text-brand-cream'
                    }`}
                  >
                    Sign In
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold transition-all duration-300 transform ${
                        tab === 'login' ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('signup')}
                    className={`flex-1 pb-2.5 text-xs font-bold tracking-[0.2em] uppercase transition-colors relative ${
                      tab === 'signup' ? 'text-brand-gold' : 'text-brand-cream/40 hover:text-brand-cream'
                    }`}
                  >
                    Sign Up
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold transition-all duration-300 transform ${
                        tab === 'signup' ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Authentication form inputs */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {tab === 'signup' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Last Name */}
                        <div>
                          <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                            Last Name
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-cream/30">
                              <User size={15} />
                            </span>
                            <input
                              type="text"
                              required
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="e.g. Dela Cruz"
                              className="w-full pl-10 pr-4 py-3 bg-brand-emerald-dark/60 border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/60 transition-all font-sans"
                            />
                          </div>
                        </div>

                        {/* First Name */}
                        <div>
                          <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                            First Name
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-cream/30">
                              <User size={15} />
                            </span>
                            <input
                              type="text"
                              required
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="e.g. Juan"
                              className="w-full pl-10 pr-4 py-3 bg-brand-emerald-dark/60 border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/60 transition-all font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Middle Initial (Optional) */}
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                          Middle Initial <span className="text-brand-cream/30">(Optional)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-cream/30">
                            <User size={15} />
                          </span>
                          <input
                            type="text"
                            value={middleInitial}
                            onChange={(e) => setMiddleInitial(e.target.value.slice(0, 10))}
                            placeholder="e.g. D"
                            className="w-full pl-10 pr-4 py-3 bg-brand-emerald-dark/60 border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/60 transition-all font-sans"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-cream/30">
                        <Mail size={15} />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. customer@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-brand-emerald-dark/60 border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/60 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-cream/30">
                        <Lock size={15} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-brand-emerald-dark/60 border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/60 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brand-cream/30 hover:text-brand-gold transition-colors"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {tab === 'login' && (
                    <div className="flex justify-end -mt-2">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[10px] font-bold text-brand-gold/75 hover:text-brand-gold uppercase tracking-widest transition-colors focus:outline-none"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {tab === 'signup' && (
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-cream/30">
                          <Lock size={15} />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 bg-brand-emerald-dark/60 border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/60 transition-all font-sans"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit action button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-brand-gold/90 hover:bg-brand-gold text-brand-emerald-dark rounded-xl text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-6 transform active:scale-[0.98]"
                  >
                    {loading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
