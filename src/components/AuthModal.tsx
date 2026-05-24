import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTab?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success('Welcome back to Luxury Scent Decants!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        toast.success('Registration successful! Please check your email for confirmation.');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-brand-gold/20 bg-gradient-to-b from-[#03251a] to-[#011611] p-8 shadow-[0_0_50px_rgba(2,28,19,0.8)] z-10"
          >
            {/* Corner Decorative Lights */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-emerald-light/20 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-brand-gold/10 text-brand-cream/60 hover:text-brand-gold hover:border-brand-gold/30 transition-all duration-200"
            >
              <X size={18} />
            </button>

            {/* Title / Logo */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-brand-gold/20 bg-brand-emerald-dark mb-3 text-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <h2 className="font-serif text-2xl text-brand-cream tracking-wide">
                Luxury Scent <span className="text-brand-gold">Decants</span>
              </h2>
              <p className="text-xs text-brand-cream/60 mt-1 font-sans uppercase tracking-[0.1em]">
                {tab === 'login' ? 'Access your exclusive scent vault' : 'Begin your olfactory journey'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-brand-gold/15 mb-6">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`flex-1 pb-2.5 text-xs font-bold tracking-[0.2em] uppercase transition-colors relative ${
                  tab === 'login' ? 'text-brand-gold' : 'text-brand-cream/40 hover:text-brand-cream'
                }`}
              >
                Sign In
                {tab === 'login' && (
                  <motion.div
                    layoutId="auth-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold"
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`flex-1 pb-2.5 text-xs font-bold tracking-[0.2em] uppercase transition-colors relative ${
                  tab === 'signup' ? 'text-brand-gold' : 'text-brand-cream/40 hover:text-brand-cream'
                }`}
              >
                Sign Up
                {tab === 'signup' && (
                  <motion.div
                    layoutId="auth-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold"
                  />
                )}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-cream/30">
                      <User size={15} />
                    </span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Juan Dela Cruz"
                      className="w-full pl-10 pr-4 py-3 bg-brand-emerald-dark/60 border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/60 transition-all font-sans"
                    />
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
                {tab === 'signup' && (
                  <p className="text-[10px] text-brand-gold/70 mt-1.5 pl-1 leading-relaxed font-sans font-light">
                    * Please use your working gmail as a confirmation code will be sent.
                  </p>
                )}
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

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-gold/90 hover:bg-brand-gold text-brand-emerald-dark rounded-xl text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-6 transform active:scale-[0.98]"
              >
                {loading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
