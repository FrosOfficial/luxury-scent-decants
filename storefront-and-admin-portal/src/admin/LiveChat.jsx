import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Bot, Headphones, User, Loader, RefreshCw, Inbox } from 'lucide-react';
import api from '../lib/api';

// ─── Simple markdown bold renderer ───────────────────────────────────────────
function RenderMessage({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
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

function formatRelativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const senderConfig = {
  user: {
    label: 'Guest',
    align: 'items-end',
    bubbleClass: 'bg-white/8 border border-white/10',
    icon: <User size={11} />,
  },
  admin: {
    label: 'You (Seller)',
    align: 'items-end',
    bubbleClass: 'bg-brand-gold/15 border border-brand-gold/30',
    icon: <Headphones size={11} />,
  },
  system: {
    label: 'AI Assistant',
    align: 'items-start',
    bubbleClass: 'bg-emerald-900/40 border border-emerald-700/30',
    icon: <Bot size={11} />,
  },
};

export function LiveChat() {
  const [sessions, setSessions]     = useState([]);
  const [activeId, setActiveId]     = useState(null);
  const [messages, setMessages]     = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [replyText, setReplyText]   = useState('');
  const [sending, setSending]       = useState(false);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadMap, setUnreadMap]   = useState({});

  const messagesEndRef = useRef(null);
  const replyRef       = useRef(null);
  const echoRef        = useRef(null);
  const channelRef     = useRef(null);
  const sessionsChannelRef = useRef(null);

  // ─── Auto-scroll on new messages ────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Load sessions list ──────────────────────────────────────────────────────
  const loadSessions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get('/admin/chat/sessions');
      setSessions(res.data.data || []);
    } catch {
      //
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // ─── Init Echo for admin private channel (Pusher / Reverb Fallback) ────────
  useEffect(() => {
    const initEcho = async () => {
      try {
        const { default: Echo }   = await import('laravel-echo');
        const { default: Pusher } = await import('pusher-js');
        window.Pusher = Pusher;

        const token = localStorage.getItem('lsd_auth_token');
        const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
        const config = pusherKey
          ? {
              broadcaster: 'pusher',
              key: pusherKey,
              cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
              forceTLS: true,
              authEndpoint: `${import.meta.env.VITE_API_BASE_URL?.replace('/v1', '')}/broadcasting/auth`,
              auth: {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
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
              authEndpoint: `${import.meta.env.VITE_API_BASE_URL?.replace('/v1', '')}/broadcasting/auth`,
              auth: {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            };

        echoRef.current = new Echo(config);

        // Subscribe to admin-chats private channel for new message notifications
        sessionsChannelRef.current = echoRef.current.private('admin-chats');
        sessionsChannelRef.current.listen('.message.sent', (data) => {
          // Update session list if a message arrived for an existing session
          setSessions(prev => {
            const idx = prev.findIndex(s => s.id === data.chat_session_id);
            if (idx === -1) {
              // New session — reload list
              loadSessions(true);
              return prev;
            }
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              last_message:    data.message,
              last_message_at: data.created_at,
            };
            // Sort escalated first
            updated.sort((a, b) => Number(b.is_escalated) - Number(a.is_escalated));
            return updated;
          });

          // If this is for the currently open conversation, add the message
          setActiveId(current => {
            if (current === data.chat_session_id && data.sender !== 'admin') {
              setMessages(prev => {
                if (prev.some(m => m.id === data.id)) return prev;
                return [...prev, data];
              });
            } else if (current !== data.chat_session_id && data.sender === 'user') {
              // Mark as unread
              setUnreadMap(m => ({ ...m, [data.chat_session_id]: true }));
            }
            return current;
          });
        });

      } catch (err) {
        console.warn('[Admin Chat] Echo init failed:', err);
      }
    };

    initEcho();

    return () => {
      channelRef.current?.stopListening('.message.sent');
      sessionsChannelRef.current?.stopListening('.message.sent');
      echoRef.current?.disconnect();
    };
  }, [loadSessions]);

  // ─── Subscribe to the per-session channel when admin opens a conversation ───
  useEffect(() => {
    if (!echoRef.current || !activeId) return;

    if (channelRef.current) {
      channelRef.current.stopListening('.message.sent');
    }

    channelRef.current = echoRef.current.channel(`chat.${activeId}`);
    channelRef.current.listen('.message.sent', (data) => {
      if (data.sender !== 'admin') {
        setMessages(prev => {
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    });

    return () => channelRef.current?.stopListening('.message.sent');
  }, [activeId]);

  // ─── Auto-polling fallback for conversations list and active messages ────────
  useEffect(() => {
    const interval = setInterval(async () => {
      // Refresh sessions list silently
      await loadSessions(true);
      
      // If there is an active session, refresh its messages silently too
      if (activeId) {
        try {
          const res = await api.get(`/admin/chat/sessions/${activeId}`);
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
          setActiveSession(res.data.session);
        } catch {}
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [activeId, loadSessions]);

  // ─── Load messages when a session is selected ────────────────────────────────
  const openSession = async (session) => {
    setActiveId(session.id);
    setActiveSession(session);
    setUnreadMap(m => ({ ...m, [session.id]: false }));
    setMessages([]);
    try {
      const res = await api.get(`/admin/chat/sessions/${session.id}`);
      setMessages(res.data.messages || []);
      setActiveSession(res.data.session);
    } catch {}
  };

  // ─── Admin Reply ─────────────────────────────────────────────────────────────
  const handleReply = async () => {
    const text = replyText.trim();
    if (!text || sending || !activeId) return;

    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id:         tempId,
      sender:     'admin',
      message:    text,
      created_at: new Date().toISOString(),
    }]);
    setReplyText('');
    setSending(true);

    try {
      const res = await api.post(`/admin/chat/sessions/${activeId}/reply`, { message: text });
      setMessages(prev => prev.map(m => m.id === tempId ? res.data.message : m));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
      replyRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-brand-cream mb-1">Live Chat</h1>
          <p className="text-brand-cream/50 text-sm">Manage guest conversations in real time.</p>
        </div>
        <button
          onClick={() => loadSessions(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest text-brand-gold border border-brand-gold/25 rounded-lg hover:bg-brand-gold/10 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* ── Sessions List ── */}
        <div className="w-72 shrink-0 flex flex-col bg-black/30 border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <p className="text-xs uppercase tracking-widest text-brand-gold font-semibold">
              Conversations
              {sessions.length > 0 && (
                <span className="ml-2 text-brand-cream/40">({sessions.length})</span>
              )}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader size={20} className="text-brand-gold animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <Inbox size={24} className="text-brand-cream/20" />
                <p className="text-xs text-brand-cream/30 text-center px-4">No conversations yet</p>
              </div>
            ) : (
              sessions.map(session => {
                const isActive  = activeId === session.id;
                const hasUnread = unreadMap[session.id];
                return (
                  <button
                    key={session.id}
                    onClick={() => openSession(session)}
                    className={`w-full px-4 py-3 text-left transition border-b border-white/[0.04] cursor-pointer ${
                      isActive
                        ? 'bg-brand-gold/10 border-l-2 border-l-brand-gold'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium text-brand-cream truncate flex-1 mr-2">
                        {session.display_name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasUnread && (
                          <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                        )}
                        {session.is_escalated && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-800/60 text-emerald-400 border border-emerald-700/40">
                            Live
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-brand-cream/40 truncate">{session.display_email}</p>
                    {session.last_message && (
                      <p className="text-[11px] text-brand-cream/30 mt-1 truncate">{session.last_message}</p>
                    )}
                    <p className="text-[10px] text-brand-cream/25 mt-1">
                      {formatRelativeTime(session.last_message_at || session.created_at)}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat Pane ── */}
        <div className="flex-1 flex flex-col bg-black/30 border border-white/[0.06] rounded-xl overflow-hidden min-w-0">
          {activeSession ? (
            <>
              {/* Conversation Header */}
              <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between shrink-0">
                <div>
                  <p className="font-semibold text-brand-cream text-sm">{activeSession.display_name}</p>
                  <p className="text-[11px] text-brand-cream/40">{activeSession.display_email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {activeSession.is_escalated ? (
                    <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-700/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Connected to Seller
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-white/5 text-brand-cream/40 border border-white/10 flex items-center gap-1">
                      <Bot size={10} />
                      AI Handling
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(212,175,55,0.2) transparent' }}>
                {messages.map(msg => {
                  const cfg = senderConfig[msg.sender] || senderConfig.system;
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} gap-1`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-brand-cream/30 uppercase tracking-wider">
                        {cfg.icon}
                        <span>{msg.sender === 'user' ? (activeSession?.display_name || 'Guest') : cfg.label}</span>
                        <span className="text-brand-cream/20">·</span>
                        <span>{formatRelativeTime(msg.created_at)}</span>
                      </div>
                      <div
                        className={`max-w-[72%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed text-brand-cream/90 ${cfg.bubbleClass}`}
                        style={{ wordBreak: 'break-word' }}
                      >
                        <RenderMessage text={msg.message} />
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <div
                className="px-4 py-3 shrink-0 flex items-end gap-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <textarea
                  ref={replyRef}
                  id="admin-chat-reply-input"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your reply…"
                  rows={2}
                  disabled={sending}
                  className="flex-1 bg-white/5 border border-white/10 focus:border-brand-gold/35 rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder-brand-cream/25 outline-none transition resize-none max-h-32 disabled:opacity-60"
                  style={{ userSelect: 'text', WebkitUserSelect: 'text', scrollbarWidth: 'none' }}
                />
                <motion.button
                  id="admin-chat-send-btn"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleReply}
                  disabled={!replyText.trim() || sending}
                  className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #d4af37, #b38728)' }}
                  aria-label="Send reply"
                >
                  {sending ? (
                    <Loader size={16} className="text-brand-emerald-dark animate-spin" />
                  ) : (
                    <Send size={16} className="text-brand-emerald-dark" />
                  )}
                </motion.button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
              <div className="w-16 h-16 rounded-full bg-brand-gold/5 border border-brand-gold/15 flex items-center justify-center">
                <MessageCircle size={28} className="text-brand-gold/40" />
              </div>
              <div>
                <p className="text-brand-cream/40 text-sm">Select a conversation</p>
                <p className="text-brand-cream/25 text-xs mt-1">Click any session on the left to view and reply</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
