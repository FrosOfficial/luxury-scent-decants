import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShoppingBag, Save, Loader2, Calendar, Tag, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const { localUser, fetchLocalProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [facebook, setFacebook] = useState('');
  const [updating, setUpdating] = useState(false);

  // Inquiries History States
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Load profile values on mount/update
  useEffect(() => {
    if (localUser) {
      setName(localUser.full_name || '');
      setPhone(localUser.phone || '');
      setAddress(localUser.delivery_address || '');
      setCity(localUser.city || '');
      setProvince(localUser.province || '');
      setFacebook(localUser.facebook_profile || '');
    }
  }, [localUser]);

  // Load inquiries history
  useEffect(() => {
    if (activeTab === 'inquiries') {
      loadInquiries();
    }
  }, [activeTab]);

  const loadInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const response = await api.get('/inquiries');
      setInquiries(response.data.data || []);
    } catch (error) {
      console.error('Failed to load inquiries:', error);
      toast.error('Could not load inquiry history');
    } finally {
      setLoadingInquiries(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put('/me', {
        full_name: name,
        phone,
        delivery_address: address,
        city,
        province,
        facebook_profile: facebook,
      });
      await fetchLocalProfile();
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'contacted': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'confirmed': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'fulfilled': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'cancelled': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default: return 'bg-brand-cream/10 text-brand-cream/60 border-brand-cream/10';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-brand-cream tracking-wide">
          My <span className="text-brand-gold">Account</span>
        </h1>
        <p className="text-xs text-brand-cream/50 mt-1 uppercase tracking-widest font-sans">
          Manage your personal details and view your fragrance decant inquiries
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Columns: Sidebar Tabs (3 Cols) */}
        <div className="md:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full px-4 py-3.5 rounded-xl border text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-3 ${
              activeTab === 'profile'
                ? 'bg-brand-gold text-brand-emerald-dark border-brand-gold shadow-[0_4px_15px_rgba(212,175,55,0.2)]'
                : 'bg-brand-emerald-dark/40 border-brand-gold/10 text-brand-cream/70 hover:bg-brand-emerald-dark/80 hover:text-brand-cream'
            }`}
          >
            <User size={15} />
            <span>Profile Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full px-4 py-3.5 rounded-xl border text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-3 ${
              activeTab === 'inquiries'
                ? 'bg-brand-gold text-brand-emerald-dark border-brand-gold shadow-[0_4px_15px_rgba(212,175,55,0.2)]'
                : 'bg-brand-emerald-dark/40 border-brand-gold/10 text-brand-cream/70 hover:bg-brand-emerald-dark/80 hover:text-brand-cream'
            }`}
          >
            <ShoppingBag size={15} />
            <span>Inquiry History</span>
          </button>
        </div>

        {/* Right Columns: Main Content Panel (9 Cols) */}
        <div className="md:col-span-9">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' ? (
              <motion.div
                key="profile-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 md:p-8 rounded-2xl border border-brand-gold/15 bg-brand-emerald-dark/40 backdrop-blur-md"
              >
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <h3 className="font-serif text-lg text-brand-cream tracking-wide border-b border-brand-gold/10 pb-3 flex items-center gap-2">
                    <User size={18} className="text-brand-gold" />
                    <span>Personal Profile Details</span>
                  </h3>

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

                    {/* Email (Readonly) */}
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        disabled
                        value={localUser?.email || ''}
                        className="w-full px-4 py-3 bg-brand-emerald-dark/40 border border-brand-gold/5 rounded-xl text-brand-cream/50 text-sm focus:outline-none font-sans cursor-not-allowed"
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
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+63 917 123 4567"
                        className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans"
                      />
                    </div>

                    {/* Facebook Profile */}
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                        Facebook Profile or Username
                      </label>
                      <input
                        type="text"
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
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        placeholder="Metro Manila"
                        className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-3.5 bg-brand-gold text-brand-emerald-dark font-black rounded-xl text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(212,175,55,0.2)] disabled:opacity-50"
                  >
                    {updating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Save Changes</span>
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="inquiries-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* List Container */}
                <div className="p-6 md:p-8 rounded-2xl border border-brand-gold/15 bg-brand-emerald-dark/40 backdrop-blur-md">
                  <h3 className="font-serif text-lg text-brand-cream tracking-wide border-b border-brand-gold/10 pb-3 flex items-center gap-2 mb-6">
                    <ShoppingBag size={18} className="text-brand-gold" />
                    <span>My Inquiries History</span>
                  </h3>

                  {loadingInquiries ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <Loader2 size={24} className="text-brand-gold animate-spin mb-3" />
                      <p className="text-xs text-brand-cream/40">Loading your inquiry history...</p>
                    </div>
                  ) : inquiries.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full border border-brand-gold/10 flex items-center justify-center mb-4 text-brand-cream/20">
                        <ShoppingBag size={20} />
                      </div>
                      <p className="text-sm font-medium text-brand-cream/60">No inquiries found.</p>
                      <p className="text-xs text-brand-cream/30 mt-1 max-w-[240px]">Once you submit a scent decant inquiry, it will be cataloged here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inquiries.map((inquiry) => (
                        <div
                          key={inquiry.id}
                          className="p-5 rounded-xl border border-brand-gold/5 bg-brand-emerald-dark/40 hover:border-brand-gold/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif text-sm text-brand-cream font-bold">
                                {inquiry.reference_code}
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${getStatusColor(inquiry.status)}`}>
                                {inquiry.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-cream/50">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} className="text-brand-gold/60" />
                                {new Date(inquiry.created_at).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Tag size={12} className="text-brand-gold/60" />
                                {inquiry.items?.length || 0} decants
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-brand-gold/5 pt-3 sm:border-t-0 sm:pt-0 shrink-0">
                            <div>
                              <span className="text-[10px] text-brand-cream/40 block text-left sm:text-right">Est. Total:</span>
                              <span className="font-sans text-sm font-black text-brand-gold">
                                ₱{Number(inquiry.total_estimated_price).toLocaleString()}
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedInquiry(inquiry)}
                              className="px-4 py-2 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/20 text-brand-gold rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
                            >
                              <span>View Details</span>
                              <ExternalLink size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Inquiry Details Modal */}
                <AnimatePresence>
                  {selectedInquiry && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedInquiry(null)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xs"
                      />

                      {/* Modal Panel */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-brand-gold/20 bg-gradient-to-b from-[#03251a] to-[#011611] p-6 shadow-2xl z-10 space-y-6"
                      >
                        {/* Close */}
                        <button
                          onClick={() => setSelectedInquiry(null)}
                          className="absolute top-4 right-4 p-1.5 rounded-full border border-brand-cream/10 text-brand-cream/60 hover:text-brand-gold hover:border-brand-gold/30 transition-all duration-200"
                        >
                          <CloseIcon size={16} />
                        </button>

                        <div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${getStatusColor(selectedInquiry.status)} mb-2 inline-block`}>
                            {selectedInquiry.status}
                          </span>
                          <h4 className="font-serif text-lg text-brand-cream">
                            Inquiry <span className="text-brand-gold">{selectedInquiry.reference_code}</span>
                          </h4>
                          <span className="text-[10px] text-brand-cream/40 font-sans mt-0.5 block">
                            Submitted on {new Date(selectedInquiry.created_at).toLocaleString()}
                          </span>
                        </div>

                        {/* Items list inside details */}
                        <div className="space-y-3 max-h-56 overflow-y-auto pr-1" id="filter-sidebar-scroll">
                          {selectedInquiry.items?.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center gap-3 p-3 rounded-lg border border-brand-gold/5 bg-brand-emerald-dark/40 text-xs"
                            >
                              <div>
                                <span className="text-[9px] text-brand-gold font-bold uppercase tracking-widest block mb-0.5">{item.product_brand}</span>
                                <span className="font-serif text-brand-cream font-bold">{item.product_name}</span>
                                <span className="text-[10px] text-brand-cream/50 block mt-0.5">Size: {item.volume_size}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-brand-cream/60 block text-[10px]">{item.quantity} × ₱{Number(item.unit_price).toLocaleString()}</span>
                                <span className="font-sans font-bold text-brand-cream">₱{(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Profile Snapshots */}
                        <div className="grid grid-cols-2 gap-4 text-xs border-t border-brand-gold/10 pt-4 text-brand-cream/70">
                          <div className="space-y-1">
                            <span className="text-[9px] text-brand-cream/40 uppercase block font-bold tracking-wider">Customer Name</span>
                            <span className="font-medium text-brand-cream/80">{selectedInquiry.customer_name}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-brand-cream/40 uppercase block font-bold tracking-wider">Facebook</span>
                            <span className="font-medium text-brand-cream/80">{selectedInquiry.facebook_profile}</span>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <span className="text-[9px] text-brand-cream/40 uppercase block font-bold tracking-wider">Shipping Address</span>
                            <span className="font-medium text-brand-cream/80 leading-relaxed">
                              {selectedInquiry.delivery_address}, {selectedInquiry.city}, {selectedInquiry.province}
                            </span>
                          </div>
                        </div>

                        {/* Total Summary */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-brand-gold/5 border border-brand-gold/10">
                          <span className="text-xs text-brand-cream/60 font-sans uppercase font-bold tracking-wider">Estimated Total</span>
                          <span className="font-serif text-lg text-brand-gold font-bold">
                            ₱{Number(selectedInquiry.total_estimated_price).toLocaleString()}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Helper X Close icon
const CloseIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
