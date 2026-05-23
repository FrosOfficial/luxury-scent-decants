import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clipboard, Check, ExternalLink, ArrowLeft, Loader2, Sparkles, MessageCircle } from 'lucide-react';
import { useInquiryBag } from '../contexts/InquiryBagContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface InquiryFormProps {
  onBack: () => void;
  onClose: () => void;
}

export default function InquiryForm({ onBack, onClose }: InquiryFormProps) {
  const { items, totalEstimatedPrice, submitInquiry } = useInquiryBag();
  const { localUser, isAuthenticated } = useAuth();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [facebook, setFacebook] = useState('');
  const [notes, setNotes] = useState('');

  // States
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Pre-fill fields if user is authenticated and has profile data
  useEffect(() => {
    if (localUser) {
      setName(localUser.full_name || '');
      setEmail(localUser.email || '');
      setPhone(localUser.phone || '');
      setAddress(localUser.delivery_address || '');
      setCity(localUser.city || '');
      setProvince(localUser.province || '');
      setFacebook(localUser.facebook_profile || '');
    }
  }, [localUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your inquiry bag is empty.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await submitInquiry({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        delivery_address: address,
        city: city,
        province: province,
        facebook_profile: facebook,
        additional_notes: notes,
      });

      setResult(response);
      toast.success('Inquiry registered in our system!');

      // Copy order details automatically
      if (response.messenger_message) {
        await navigator.clipboard.writeText(response.messenger_message);
        setCopied(true);
        toast.success('Order summary copied to clipboard!');
      }
    } catch (error: any) {
      console.error('Inquiry Submission Error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Redirect countdown
  useEffect(() => {
    if (!result) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Trigger redirect
      window.open(result.messenger_url, '_blank');
    }
  }, [result, countdown]);

  const copyMessage = async () => {
    if (result?.messenger_message) {
      await navigator.clipboard.writeText(result.messenger_message);
      setCopied(true);
      toast.success('Order summary copied to clipboard!');
    }
  };

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-gradient-to-b from-[#03251a] to-[#011611] border border-brand-gold/25 rounded-2xl shadow-[0_0_50px_rgba(2,28,19,0.8)] text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-emerald-light/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-brand-gold/30 bg-brand-emerald-dark mb-6 text-brand-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]">
          <MessageCircle size={28} className="animate-pulse" />
        </div>

        <h2 className="font-serif text-2xl md:text-3xl text-brand-cream tracking-wide">
          Inquiry <span className="text-brand-gold">Logged Successfully!</span>
        </h2>
        <p className="text-sm text-brand-cream/60 mt-2 font-sans max-w-md mx-auto">
          Reference Code: <strong className="text-brand-gold">{result.reference_code}</strong>
        </p>

        {/* Copy Area */}
        <div className="my-8 p-6 rounded-xl border border-brand-gold/15 bg-brand-emerald-dark/60 max-w-lg mx-auto text-left space-y-4">
          <h4 className="text-xs font-bold tracking-widest text-brand-gold uppercase flex items-center justify-between border-b border-brand-gold/10 pb-2">
            <span>READY-TO-PASTE MESSENGER SUMMARY</span>
            <span className="text-[10px] text-brand-cream/40 font-normal tracking-normal normal-case">Copied to clipboard!</span>
          </h4>
          <pre className="text-xs font-mono text-brand-cream/80 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all" id="filter-sidebar-scroll">
            {result.messenger_message}
          </pre>
          <button
            onClick={copyMessage}
            className={`w-full py-2.5 rounded-lg border text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
              copied
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-brand-gold/10 border-brand-gold/25 text-brand-gold hover:bg-brand-gold/20'
            }`}
          >
            {copied ? <Check size={14} /> : <Clipboard size={14} />}
            <span>{copied ? 'Copied Successfully!' : 'Copy Order Summary'}</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-6 max-w-md mx-auto">
          <div className="text-sm text-brand-cream/70 leading-relaxed font-sans">
            <p className="font-bold text-brand-gold">Next Steps:</p>
            <ol className="list-decimal pl-5 space-y-2 mt-2 text-left text-xs">
              <li>Open the Facebook Messenger chat by clicking below.</li>
              <li>Paste the pre-copied order summary directly into the conversation.</li>
              <li>Our team will verify the stock and message you back to finalize!</li>
            </ol>
          </div>

          <div className="bg-brand-gold/5 border border-brand-gold/10 p-4 rounded-xl">
            <p className="text-xs text-brand-cream/60">
              Redirecting you to official Facebook Messenger in <strong className="text-brand-gold font-sans text-sm">{countdown}s</strong>...
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-brand-emerald-dark border border-brand-gold/15 text-brand-cream rounded-xl text-xs font-bold tracking-widest uppercase transition-colors hover:bg-brand-emerald-light/20"
            >
              Back to Shop
            </button>
            <a
              href={result.messenger_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-brand-gold text-brand-emerald-dark font-black rounded-xl text-xs tracking-widest uppercase transition-all shadow-[0_4px_15px_rgba(212,175,55,0.2)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 group"
            >
              <span>Launch Messenger Now</span>
              <ExternalLink size={13} className="group-hover:translate-y-[-1px] group-hover:translate-x-[1px] transition-transform" />
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Back Link */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold tracking-widest text-brand-gold hover:text-brand-gold-light transition-colors uppercase mb-6"
      >
        <ArrowLeft size={14} />
        <span>Return to Inquiry Bag</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 Cols */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div className="p-6 md:p-8 rounded-2xl border border-brand-gold/15 bg-brand-emerald-dark/40 backdrop-blur-md space-y-6">
            <h2 className="font-serif text-xl text-brand-cream tracking-wide flex items-center gap-2 pb-4 border-b border-brand-gold/10">
              <Sparkles size={18} className="text-brand-gold" />
              <span>Customer Information</span>
            </h2>

            {!isAuthenticated && (
              <div className="p-4 rounded-xl bg-brand-gold/5 border border-brand-gold/15 text-xs text-brand-cream/60 leading-relaxed">
                💡 <span className="font-bold text-brand-cream">Tip:</span> Logging in or signing up will securely save your details for faster guest checkouts and enable you to view your complete inquiry history!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@example.com"
                  className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contact Phone */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+63 917 123 4567"
                  className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans"
                />
              </div>

              {/* Facebook Profile Link */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                  Facebook Profile or Username
                </label>
                <input
                  type="text"
                  required
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="facebook.com/juandelacruz"
                  className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                Complete Delivery Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House Number, Street Name, Barangay"
                className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Makati City"
                  className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans"
                />
              </div>

              {/* Province */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                  Province / State
                </label>
                <input
                  type="text"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Metro Manila"
                  className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                Additional Notes or Special Instructions
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special packaging requests, convenient delivery timing, etc."
                className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4.5 bg-brand-gold text-brand-emerald-dark font-black rounded-xl text-xs tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_4px_25px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] disabled:opacity-50 flex items-center justify-center gap-2 transform active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>LOGGING INQUIRY...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>GENERATE & REDIRECT TO MESSENGER</span>
              </>
            )}
          </button>
        </form>

        {/* Right Sidebar: 5 Cols Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-brand-gold/15 bg-brand-emerald-dark/60 backdrop-blur-md space-y-4">
            <h3 className="font-serif text-lg text-brand-cream tracking-wide pb-3 border-b border-brand-gold/10">
              Inquiry <span className="text-brand-gold">Summary</span>
            </h3>

            {/* Items */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1" id="filter-sidebar-scroll">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.volumePricing.id}`}
                  className="flex gap-3 text-xs border-b border-brand-gold/5 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="w-10 h-12 rounded border border-brand-gold/10 overflow-hidden shrink-0 bg-brand-emerald-dark">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-brand-cream truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[10px] text-brand-cream/50 mt-0.5">
                        {item.volumePricing.size} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-sans font-bold text-brand-cream/90 text-right">
                      ₱{(item.volumePricing.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-brand-gold/15 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-brand-cream/60">
                <span>Items Subtotal:</span>
                <span>₱{totalEstimatedPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-brand-cream/60">
                <span>Estimated Shipping:</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">TBD in Messenger</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-brand-gold/5 pt-2">
                <span className="text-brand-cream">Estimated Total:</span>
                <span className="text-brand-gold">₱{totalEstimatedPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
