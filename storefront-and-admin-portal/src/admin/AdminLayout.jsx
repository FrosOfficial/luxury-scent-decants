import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dashboard } from './Dashboard';
import { Inquiries } from './Inquiries';
import { Catalog } from './Catalog';
import { LiveChat } from './LiveChat';
import api from '../lib/api';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Sparkles, 
  LogOut, 
  User as UserIcon,
  Menu,
  X,
  Home,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ onExitStorefront }) {
  const { localUser, logout } = useAuth();
  const [activeTab, setActiveTab]               = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [unreadChats, setUnreadChats]           = useState(0);

  // Poll for escalated/new chat sessions every 30s to show a badge count
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const res = await api.get('/admin/chat/sessions');
        const escalated = (res.data.data || []).filter(s => s.is_escalated).length;
        setUnreadChats(escalated);
      } catch {}
    };
    checkUnread();
    const id = setInterval(checkUnread, 30000);
    return () => clearInterval(id);
  }, []);

  // Reset badge when admin opens the chat tab
  useEffect(() => {
    if (activeTab === 'livechat') setUnreadChats(0);
  }, [activeTab]);

  const handleLogout = async () => {
    await logout();
    if (onExitStorefront) onExitStorefront('home');
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'inquiries':
        return <Inquiries />;
      case 'catalog':
        return <Catalog />;
      case 'livechat':
        return <LiveChat />;
      default:
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview Metrics', icon: LayoutDashboard },
    { id: 'inquiries', label: 'Order Inquiries', icon: ClipboardList },
    { id: 'catalog', label: 'Decant Catalog', icon: Sparkles },
    { id: 'livechat', label: 'Live Chat', icon: MessageCircle, badge: unreadChats },
  ];

  return (
    <div className="h-screen bg-brand-emerald-dark flex text-brand-cream relative overflow-hidden font-sans w-full">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-marble opacity-5 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-black/40 border-r border-white/[0.08] h-full relative z-10 shrink-0">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent"></div>

        <div className="p-6 border-b border-white/[0.06] flex flex-col items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-gold/30 shadow-lg shadow-black/40 mb-3 select-none bg-brand-emerald-dark shrink-0 flex items-center justify-center">
            <img 
              src="/Images/logo.webp" 
              alt="Luxury Scent Decants Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          <h2 className="font-serif text-xl font-bold tracking-wider text-brand-cream text-center select-none">
            LUXURY SCENT
          </h2>
          <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-semibold mt-1">
            Admin Console
          </span>
        </div>

        {/* Administrator Profile Card */}
        <div className="p-4 mx-4 mt-6 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
            <UserIcon className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="font-semibold text-sm text-brand-cream truncate leading-tight">
              {localUser?.full_name || 'Administrator'}
            </div>
            <div className="text-[10px] uppercase text-brand-gold font-semibold tracking-wider mt-0.5">
              Administrator
            </div>
          </div>
        </div>

        {/* Navigation Sidebar List */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full py-3 px-4 rounded-sm flex items-center gap-3.5 text-sm transition duration-300 font-semibold cursor-pointer select-none group relative ${
                  isActive 
                    ? 'text-brand-emerald-dark bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-light shadow-xl shadow-brand-gold/10' 
                    : 'text-brand-cream/65 hover:text-brand-cream hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04]'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-brand-emerald-dark' : 'text-brand-gold group-hover:scale-105 transition-transform'}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-brand-emerald-dark/30 text-brand-emerald-dark' : 'bg-brand-gold text-brand-emerald-dark'}`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="activeGlow" 
                    className="absolute inset-0 border border-brand-gold/40 rounded-sm pointer-events-none" 
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/[0.06] space-y-2">
          <button
            onClick={() => onExitStorefront('home')}
            className="w-full py-3 bg-brand-gold/10 border border-brand-gold/25 text-brand-gold text-xs font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Storefront View</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-white/[0.02] border border-white/[0.08] hover:border-red-500/30 text-brand-cream/70 hover:text-red-400 text-xs font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Terminal</span>
          </button>
        </div>
      </aside>

      {/* Header - Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-brand-emerald-dark/90 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-gold/30">
            <img src="/Images/logo.webp" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif text-base font-bold tracking-wide">LUXURY SCENT</span>
        </div>
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 text-brand-cream/80 hover:text-brand-gold transition cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-72 bg-brand-emerald-dark border-r border-brand-gold/20 h-full p-6 flex flex-col z-50 relative"
            >
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-5 right-5 p-2 text-brand-cream/60 hover:text-brand-gold cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-5 mb-6 select-none mt-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-gold/30">
                  <img src="/Images/logo.webp" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-serif text-lg font-bold tracking-wide">LUXURY SCENT</span>
                <span className="text-[8px] uppercase tracking-widest text-brand-gold font-bold bg-brand-gold/10 px-1.5 py-0.5 rounded-sm">Admin</span>
              </div>

              <nav className="flex-grow space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full py-3 px-4 rounded-sm flex items-center gap-3.5 text-sm transition duration-300 font-semibold cursor-pointer ${
                        isActive 
                          ? 'text-brand-emerald-dark bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-light' 
                          : 'text-brand-cream/65 hover:text-brand-cream hover:bg-white/[0.03]'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge > 0 && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-brand-emerald-dark/30 text-brand-emerald-dark' : 'bg-brand-gold text-brand-emerald-dark'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-white/[0.06] pt-4 space-y-2">
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    onExitStorefront('home');
                  }}
                  className="w-full py-3 bg-brand-gold/10 border border-brand-gold/25 text-brand-gold text-xs font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Storefront View</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-3 bg-white/[0.02] border border-white/[0.08] text-brand-cream/70 text-xs font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Panel Content */}
      <main className="flex-1 h-full overflow-y-auto px-6 lg:px-12 pt-24 lg:pt-12 pb-12 relative z-10 w-full">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto"
        >
          {renderActiveContent()}
        </motion.div>
      </main>
    </div>
  );
}
