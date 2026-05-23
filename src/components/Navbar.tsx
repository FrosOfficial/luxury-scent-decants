import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useInquiryBag } from '../contexts/InquiryBagContext';

type Page = 'home' | 'shop' | 'contact' | 'profile' | 'checkout';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onOpenAuth: () => void;
  onOpenBag: () => void;
}

const navLinks: { id: 'home' | 'shop' | 'contact'; label: string }[] = [
  { id: 'home', label: 'HOME' },
  { id: 'shop', label: 'SHOP' },
  { id: 'contact', label: 'CONTACT' },
];

export default function Navbar({ currentPage, onNavigate, onOpenAuth, onOpenBag }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, localUser } = useAuth();
  const { totalItemsCount } = useInquiryBag();

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 h-16 z-50 border-b border-brand-gold/10"
        style={{ background: 'rgba(2, 28, 19, 0.88)', backdropFilter: 'blur(16px)' }}
      >
        <nav className="max-w-[1400px] mx-auto px-4 md:px-8 h-full flex items-center justify-between gap-6">

          {/* ── Left: Logo ─────────────────────────────────────────────────── */}
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-brand-gold/30 shadow-[0_0_12px_rgba(212,175,55,0.4)] group-hover:border-brand-gold group-hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] transition-all duration-300 shrink-0">
              <img 
                src="/Images/logo.webp" 
                alt="Luxury Scent Decants Logo" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            <span className="font-serif text-brand-cream text-[13px] md:text-sm leading-tight tracking-wide text-left transition-colors group-hover:text-brand-gold">
              Luxury Scents<br className="hidden sm:block" />
              <span className="text-brand-gold text-[10px] md:text-xs tracking-widest uppercase font-sans font-bold"> Decants</span>
            </span>
          </button>

          {/* ── Center: Desktop Nav links ──────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1 md:gap-2">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.id)}
                className="relative px-3 md:px-5 py-2 text-xs font-bold tracking-[0.2em] transition-colors duration-200"
              >
                <span className={currentPage === link.id ? 'text-brand-gold' : 'text-brand-cream/60 hover:text-brand-cream'}>
                  {link.label}
                </span>
                {/* Active indicator underline */}
                <AnimatePresence>
                  {currentPage === link.id && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3 right-3 md:left-5 md:right-5 h-[2px] bg-brand-gold rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>

          {/* ── Right Actions (Desktop) ────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleNavigate('profile')}
                  className={`flex items-center gap-1.5 transition-colors text-xs font-medium tracking-wide border-r border-brand-gold/15 pr-3 ${
                    currentPage === 'profile' ? 'text-brand-gold font-bold' : 'text-brand-cream/60 hover:text-brand-gold'
                  }`}
                >
                  <User size={17} />
                  <span>{localUser?.full_name?.split(' ')[0] || 'Account'}</span>
                </button>
                <button 
                  onClick={logout}
                  className="text-brand-cream/40 hover:text-brand-gold transition-colors p-1.5"
                  title="Log Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 text-brand-cream/60 hover:text-brand-gold transition-colors text-xs font-medium tracking-wide pr-1"
              >
                <User size={17} />
                <span>Log In</span>
              </button>
            )}

            <button 
              onClick={onOpenBag}
              className="relative p-2 text-brand-cream/60 hover:text-brand-gold transition-colors shrink-0"
            >
              <ShoppingBag size={19} />
              {totalItemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-gold text-brand-emerald-dark text-[9px] font-black flex items-center justify-center animate-bounce">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>

          {/* ── Mobile Action Buttons (Mobile Only) ────────────────────────── */}
          <div className="flex md:hidden items-center gap-2.5 shrink-0">
            <button 
              onClick={onOpenBag}
              className="relative p-2 text-brand-cream/60 hover:text-brand-gold transition-colors"
            >
              <ShoppingBag size={19} />
              {totalItemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-gold text-brand-emerald-dark text-[9px] font-black flex items-center justify-center animate-bounce">
                  {totalItemsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="p-2 text-brand-cream/60 hover:text-brand-gold transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </nav>
      </header>

      {/* ── Mobile Menu Overlay & Drawer (Mobile Only) ────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 top-16 bg-black/60 backdrop-blur-md z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide Down Menu Content */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-16 left-0 right-0 border-b border-brand-gold/15 shadow-2xl z-40 overflow-hidden md:hidden"
              style={{ background: 'linear-gradient(to bottom, rgba(2, 28, 19, 0.98), rgba(1, 22, 15, 0.98))' }}
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                {/* Navigation Links with Staggered Slide In */}
                <div className="flex flex-col gap-4">
                  {navLinks.map((link, idx) => (
                    <motion.button
                      key={link.id}
                      onClick={() => handleNavigate(link.id)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, ease: 'easeOut' }}
                      className={`text-left py-2.5 text-xs font-bold tracking-[0.25em] transition-colors border-b border-brand-gold/5 flex items-center justify-between ${
                        currentPage === link.id ? 'text-brand-gold' : 'text-brand-cream/70 hover:text-brand-cream'
                      }`}
                    >
                      <span>{link.label}</span>
                      {currentPage === link.id && <span className="text-brand-gold">✦</span>}
                    </motion.button>
                  ))}

                  {isAuthenticated && (
                    <motion.button
                      onClick={() => handleNavigate('profile')}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15, ease: 'easeOut' }}
                      className={`text-left py-2.5 text-xs font-bold tracking-[0.25em] transition-colors border-b border-brand-gold/5 flex items-center justify-between ${
                        currentPage === 'profile' ? 'text-brand-gold' : 'text-brand-cream/70 hover:text-brand-cream'
                      }`}
                    >
                      <span>MY PROFILE</span>
                      {currentPage === 'profile' && <span className="text-brand-gold">✦</span>}
                    </motion.button>
                  )}
                </div>

                {/* Mobile Log In Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, ease: 'easeOut' }}
                  className="flex flex-col gap-4 pt-4 border-t border-brand-gold/10"
                >
                  {isAuthenticated ? (
                    <button 
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-2.5 w-full py-3 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold tracking-[0.15em] uppercase transition-colors"
                    >
                      <LogOut size={15} />
                      <span>Log Out</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        onOpenAuth();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-2.5 w-full py-3 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/25 text-brand-gold rounded-xl text-xs font-bold tracking-[0.15em] uppercase transition-colors"
                    >
                      <User size={15} />
                      <span>Log In</span>
                    </button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
