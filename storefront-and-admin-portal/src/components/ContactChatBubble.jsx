import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ChevronDown, User, Bot, Headphones, Loader } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

// ─── Simple markdown-like renderer for bold (**text**) ───────────────────────
function RenderMessage({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        // Convert newline characters to line breaks
        return part.split('\n').map((line, j, arr) => (
          <span key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ));
      })}
    </span>
  );
}

const SESSION_KEY = 'lsd_chat_session_id';

export default function ContactChatBubble() {
  const { isAuthenticated, localUser } = useAuth();
  const [isOpen, setIsOpen]           = useState(false);
  const [phase, setPhase]             = useState('form'); // 'form' | 'chat'
  const [messages, setMessages]       = useState([]);
  const [sessionId, setSessionId]     = useState(() => localStorage.getItem(SESSION_KEY));
  const [isEscalated, setIsEscalated] = useState(false);
  const [sending, setSending]         = useState(false);
  const [formData, setFormData]       = useState({ name: '', email: '' });
  const [formError, setFormError]     = useState('');
  const [inputText, setInputText]     = useState('');
  const [hasUnread, setHasUnread]     = useState(false);
  const [echoReady, setEchoReady]     = useState(false);
  const [isClosed, setIsClosed]       = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const echoRef        = useRef(null);
  const channelRef     = useRef(null);

  // ─── Scroll to bottom when messages change ──────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Focus input when chat opens ────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && phase === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
    if (isOpen) setHasUnread(false);
  }, [isOpen, phase]);

  // ─── Init Laravel Echo (Pusher / Reverb Fallback) ──────────────────────────
  useEffect(() => {
    const initEcho = async () => {
      try {
        const { default: Echo }  = await import('laravel-echo');
        const { default: Pusher } = await import('pusher-js');
        window.Pusher = Pusher;

        const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
        const config = pusherKey
          ? {
              broadcaster: 'pusher',
              key: pusherKey,
              cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
              forceTLS: true,
            }
          : {
              broadcaster:  'reverb',
              key:          import.meta.env.VITE_REVERB_APP_KEY,
              wsHost:       import.meta.env.VITE_REVERB_HOST || 'localhost',
              wsPort:       parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
              wssPort:      parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
              forceTLS:     (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
              enabledTransports: ['ws', 'wss'],
              disableStats: true,
            };

        echoRef.current = new Echo(config);

        setEchoReady(true);
      } catch (err) {
        console.warn('[Chat] Echo init failed:', err);
      }
    };

    initEcho();

    return () => {
      channelRef.current?.stopListening('.message.sent');
      echoRef.current?.disconnect();
    };
  }, []);

  // ─── Subscribe to chat channel when session exists ──────────────────────────
  useEffect(() => {
    if (!echoReady || !sessionId || !echoRef.current) return;

    // Leave any existing subscription
    if (channelRef.current) {
      channelRef.current.stopListening('.message.sent');
    }

    channelRef.current = echoRef.current.channel(`chat.${sessionId}`);
    channelRef.current.listen('.message.sent', (data) => {
      // Avoid adding our own user-sent messages (the api call already adds them)
      if (data.sender === 'admin' || data.sender === 'system') {
        setMessages(prev => {
          // Deduplicate by ID
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, {
            id:         data.id,
            sender:     data.sender,
            message:    data.message,
            created_at: data.created_at,
          }];
        });
        if (!isOpen) setHasUnread(true);
      }
    });

    return () => {
      channelRef.current?.stopListening('.message.sent');
    };
  }, [echoReady, sessionId, isOpen]);

  // ─── Load existing session from localStorage ─────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      setSessionId(stored);
      setPhase('chat');
      loadMessages(stored);
    }
  }, []);

  // ─── Auto-polling fallback for active chat messages ─────────────────────────
  useEffect(() => {
    if (!sessionId || phase !== 'chat') return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/chat/sessions/${sessionId}/messages`);
        
        setMessages(prev => {
          const incoming = res.data.messages || [];
          const tempMessages = prev.filter(m => String(m.id).startsWith('temp-'));
          const nonTempPrev = prev.filter(m => !String(m.id).startsWith('temp-'));
          
          const hasChanged = incoming.length !== nonTempPrev.length || 
                            incoming.some((m, idx) => nonTempPrev[idx]?.id !== m.id);
                            
          if (hasChanged) {
            return [...incoming, ...tempMessages];
          }
          return prev;
        });
        
        setIsEscalated(res.data.session?.is_escalated ?? false);
        setIsClosed(res.data.session?.is_closed ?? false);
      } catch (err) {
        if (err.response?.status === 404) {
          localStorage.removeItem(SESSION_KEY);
          setSessionId(null);
          setPhase('form');
        }
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [sessionId, phase]);

  const loadMessages = async (sid) => {
    try {
      const res = await api.get(`/chat/sessions/${sid}/messages`);
      setMessages(res.data.messages || []);
      setIsEscalated(res.data.session?.is_escalated ?? false);
      setIsClosed(res.data.session?.is_closed ?? false);
    } catch {
      // Session might have expired — reset
      localStorage.removeItem(SESSION_KEY);
      setSessionId(null);
      setPhase('form');
    }
  };

  // ─── Start a new chat session ────────────────────────────────────────────────
  const handleStartChat = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    if (!isAuthenticated && (!formData.name.trim() || !formData.email.trim())) {
      setFormError('Please enter both your name and email to continue.');
      return;
    }
    if (!isAuthenticated) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setFormError('Please enter a valid email address.');
        return;
      }
    }

    setSending(true);
    try {
      const payload = isAuthenticated
        ? {}
        : {
            guest_name:  formData.name.trim(),
            guest_email: formData.email.trim(),
          };

      const res = await api.post('/chat/sessions', payload);

      const { session, welcome_message } = res.data;
      localStorage.setItem(SESSION_KEY, session.id);
      setSessionId(session.id);
      setIsClosed(false);
      setMessages([welcome_message]);
      setPhase('chat');
    } catch (err) {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleStartNewChat = () => {
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    setPhase('form');
    setMessages([]);
    setIsClosed(false);
    setIsEscalated(false);
  };

  // ─── Send a message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending || !sessionId) return;

    // Optimistically add user message
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id:         tempId,
      sender:     'user',
      message:    text,
      created_at: new Date().toISOString(),
    }]);
    setInputText('');
    setSending(true);

    try {
      const res = await api.post(`/chat/sessions/${sessionId}/messages`, { message: text });

      // Replace temp message + add AI reply
      setMessages(prev => {
        const without = prev.filter(m => m.id !== tempId);
        const results = [...without, res.data.message];
        if (res.data.ai_reply) results.push(res.data.ai_reply);
        return results;
      });

      if (res.data.escalated) setIsEscalated(true);
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // ─── Escalate to seller manually ─────────────────────────────────────────────
  const handleEscalate = async () => {
    if (!sessionId || isEscalated) return;
    try {
      const res = await api.post(`/chat/sessions/${sessionId}/escalate`);
      if (res.data.message) {
        setMessages(prev => [...prev, res.data.message]);
      }
      setIsEscalated(true);
    } catch {}
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const senderConfig = {
    user: {
      label:   'You',
      bgClass: 'bg-brand-gold/20 border border-brand-gold/30',
      textClass: 'text-brand-cream',
      align:   'items-end',
      icon:    <User size={12} />,
    },
    admin: {
      label:   'Seller',
      bgClass: 'bg-emerald-900/60 border border-emerald-700/40',
      textClass: 'text-brand-cream',
      align:   'items-start',
      icon:    <Headphones size={12} />,
    },
    system: {
      label:   'Assistant',
      bgClass: 'bg-white/5 border border-white/10',
      textClass: 'text-brand-cream/85',
      align:   'items-start',
      icon:    <Bot size={12} />,
    },
  };

  return (
    <>
      {/* Floating Bubble Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {!isOpen && hasUnread && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              className="bg-brand-gold text-brand-emerald-dark text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
            >
              New message!
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          id="chat-bubble-btn"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(o => !o)}
          className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #d4af37, #f5e6a0, #b38728)',
            boxShadow: '0 8px 32px rgba(212,175,55,0.5)',
          }}
          aria-label="Open live chat"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={22} className="text-brand-emerald-dark" strokeWidth={2.5} />
              </motion.span>
            ) : (
              <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <MessageCircle size={22} className="text-brand-emerald-dark" strokeWidth={2.5} />
              </motion.span>
            )}
          </AnimatePresence>

          {/* Unread badge dot */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-brand-emerald-dark animate-pulse" />
          )}
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chat-window"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: 'linear-gradient(160deg, #0a1f16 0%, #011611 100%)',
              border: '1px solid rgba(212,175,55,0.2)',
              height: '520px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.08)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 shrink-0"
              style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))', borderBottom: '1px solid rgba(212,175,55,0.15)' }}
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-brand-gold/30 shrink-0">
                <img src="/Images/logo.webp" alt="Luxury Scent" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-sm font-bold text-brand-gold leading-tight">Luxury Scent Decants</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-brand-cream/50 uppercase tracking-wider">
                    {isEscalated ? 'Connected to Seller' : 'AI Assistant Active'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-brand-cream/40 hover:text-brand-cream transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Phase: Registration Form */}
            {phase === 'form' && (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-5">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={28} className="text-brand-gold" />
                  </div>
                  <h3 className="font-serif text-lg text-brand-cream mb-1">Chat with Us</h3>
                  <p className="text-xs text-brand-cream/50 leading-relaxed">
                    {isAuthenticated 
                      ? `Hello ${localUser?.full_name || 'there'}! Click start to begin chatting with our assistant or seller.`
                      : 'Enter your details to start chatting. Our AI will try to answer instantly, or connect you with our seller.'}
                  </p>
                </div>

                {isAuthenticated ? (
                  <div className="w-full flex flex-col gap-3">
                    <motion.button
                      onClick={() => handleStartChat()}
                      disabled={sending}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      id="chat-start-btn"
                      className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #d4af37, #f5e6a0, #b38728)', color: '#011611' }}
                    >
                      {sending ? <Loader size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                      {sending ? 'Starting...' : 'Start Chat'}
                    </motion.button>
                  </div>
                ) : (
                  <form onSubmit={handleStartChat} className="w-full flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-brand-gold mb-1 block">Your Name</label>
                      <input
                        type="text"
                        id="chat-guest-name"
                        value={formData.name}
                        onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                        placeholder="e.g. Juan dela Cruz"
                        className="w-full bg-white/5 border border-white/10 focus:border-brand-gold/40 rounded-lg px-3 py-2.5 text-sm text-brand-cream placeholder-brand-cream/25 outline-none transition"
                        style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-brand-gold mb-1 block">Email Address</label>
                      <input
                        type="email"
                        id="chat-guest-email"
                        value={formData.email}
                        onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                        placeholder="e.g. juan@email.com"
                        className="w-full bg-white/5 border border-white/10 focus:border-brand-gold/40 rounded-lg px-3 py-2.5 text-sm text-brand-cream placeholder-brand-cream/25 outline-none transition"
                        style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                      />
                    </div>

                    {formError && (
                      <p className="text-red-400 text-xs">{formError}</p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={sending}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      id="chat-start-btn"
                      className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #d4af37, #f5e6a0, #b38728)', color: '#011611' }}
                    >
                      {sending ? <Loader size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                      {sending ? 'Starting...' : 'Start Chat'}
                    </motion.button>
                  </form>
                )}
              </div>
            )}

            {/* Phase: Active Chat */}
            {phase === 'chat' && (
              <>
                {/* Messages list */}
                <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(212,175,55,0.3) transparent' }}>
                  {messages.map((msg) => {
                    const cfg = senderConfig[msg.sender] || senderConfig.system;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        className={`flex flex-col ${cfg.align} gap-1`}
                      >
                        <div className={`flex items-center gap-1 text-[10px] uppercase tracking-wider text-brand-cream/35`}>
                          {cfg.icon}
                          <span>{cfg.label}</span>
                        </div>
                        <div
                          className={`max-w-[82%] px-3 py-2.5 rounded-xl text-sm leading-relaxed ${cfg.bgClass} ${cfg.textClass}`}
                          style={{ wordBreak: 'break-word' }}
                        >
                          <RenderMessage text={msg.message} />
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {isClosed ? (
                  <div className="px-4 py-4 shrink-0 flex flex-col gap-3 text-center border-t border-brand-gold/10 bg-black/10">
                    <p className="text-xs text-brand-cream/50 uppercase tracking-wider">
                      🔒 This conversation has been closed by the seller.
                    </p>
                    <button
                      onClick={handleStartNewChat}
                      className="w-full py-2.5 rounded-lg text-xs font-semibold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 border border-brand-gold/30 hover:bg-brand-gold/10 text-brand-gold transition"
                    >
                      Start New Chat
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Talk to Seller button */}
                    {!isEscalated && (
                      <div className="px-4 pb-2 shrink-0">
                        <button
                          id="chat-talk-to-seller-btn"
                          onClick={handleEscalate}
                          className="w-full py-2 text-xs uppercase tracking-widest text-brand-gold border border-brand-gold/25 rounded-lg hover:bg-brand-gold/10 transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Headphones size={13} />
                          Talk to Seller
                        </button>
                      </div>
                    )}

                    {isEscalated && (
                      <div className="px-4 pb-2 shrink-0">
                        <div className="w-full py-2 text-xs uppercase tracking-widest text-emerald-400 border border-emerald-700/40 rounded-lg flex items-center justify-center gap-2 bg-emerald-900/20">
                          <Headphones size={13} />
                          Connected to Seller
                        </div>
                      </div>
                    )}

                    {/* Input bar */}
                    <div
                      className="px-3 pb-3 pt-2 shrink-0 flex items-end gap-2"
                      style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}
                    >
                      <textarea
                        ref={inputRef}
                        id="chat-message-input"
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        disabled={sending}
                        className="flex-1 bg-white/5 border border-white/10 focus:border-brand-gold/35 rounded-xl px-3 py-2 text-sm text-brand-cream placeholder-brand-cream/25 outline-none transition resize-none max-h-24 disabled:opacity-60"
                        style={{ userSelect: 'text', WebkitUserSelect: 'text', scrollbarWidth: 'none' }}
                      />
                      <motion.button
                        id="chat-send-btn"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSend}
                        disabled={!inputText.trim() || sending}
                        className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #d4af37, #b38728)' }}
                        aria-label="Send message"
                      >
                        {sending ? (
                          <Loader size={15} className="text-brand-emerald-dark animate-spin" />
                        ) : (
                          <Send size={15} className="text-brand-emerald-dark" />
                        )}
                      </motion.button>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
