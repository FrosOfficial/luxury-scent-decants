import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShoppingBag, Save, Loader2, Calendar, Tag, ExternalLink, Check, Truck, CreditCard, Printer, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { regions, provinces, cities, getBarangaysForCity, findMatchingCodes } from '../data/philippines_addresses';
import LuxurySearchableSelect from './LuxurySearchableSelect';

export default function UserProfile() {
  const { localUser, fetchLocalProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [updating, setUpdating] = useState(false);

  // Cascading Address States
  const [regionCode, setRegionCode] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [cityCode, setCityCode] = useState('');
  const [barangay, setBarangay] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Inquiries History States
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Load profile values on mount/update
  useEffect(() => {
    if (localUser) {
      setName(localUser.full_name || '');
      setPhone(localUser.phone || '');
      
      const userProv = localUser.province || '';
      const userCity = localUser.city || '';
      
      const parsed = findMatchingCodes(userProv, userCity);
      if (parsed.regionCode) setRegionCode(parsed.regionCode);
      if (parsed.provinceCode) setProvinceCode(parsed.provinceCode);
      if (parsed.cityCode) setCityCode(parsed.cityCode);
      
      setProvince(parsed.provinceName || userProv);
      setCity(parsed.cityName || userCity);
      
      // Extract street address and barangay if possible from delivery_address
      const rawAddr = localUser.delivery_address || '';
      if (rawAddr) {
        const addressParts = rawAddr.split(',').map(p => p.trim());
        let foundBarangay = '';
        let foundPostal = '';
        let streetParts = [];

        for (let part of addressParts) {
          if (/^\d{4}$/.test(part)) {
            foundPostal = part;
          } else if (part.toLowerCase().includes('barangay')) {
            foundBarangay = part.replace(/barangay/i, '').trim();
          } else {
            streetParts.push(part);
          }
        }

        setStreetAddress(streetParts.join(', '));
        if (foundBarangay) setBarangay(foundBarangay);
        if (foundPostal) setPostalCode(foundPostal);
      } else {
        setStreetAddress('');
        setBarangay('');
        setPostalCode('');
      }
    }
  }, [localUser]);

  // Compile full address whenever parts change
  useEffect(() => {
    let parts = [];
    if (streetAddress.trim()) parts.push(streetAddress.trim());
    if (barangay.trim()) parts.push(`Barangay ${barangay.trim()}`);
    if (postalCode.trim()) parts.push(postalCode.trim());
    setAddress(parts.join(', '));
  }, [streetAddress, barangay, postalCode]);

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
      });
      await fetchLocalProfile();
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        Object.values(validationErrors).forEach((messages) => {
          messages.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintReceipt = (inquiry) => {
    if (!inquiry) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow pop-ups to print receipts.");
      return;
    }

    const itemsRows = inquiry.items.map(item => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eee;">
          <strong style="font-size: 14px; color: #111;">${item.product_name}</strong><br/>
          <span style="font-size: 11px; color: #666;">${item.product_brand}</span>
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: center; font-family: monospace;">${item.volume_size}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: center; font-weight: 600;">${item.quantity}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #111;">₱${(item.unit_price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const subtotalVal = Number(inquiry.total_estimated_price);
    const shippingVal = Number(inquiry.shipping_fee || 0);
    const grandTotalVal = subtotalVal + shippingVal;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${inquiry.reference_code}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; background: #fff; margin: 0; line-height: 1.5; }
          .receipt-box { max-width: 650px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #021c13; padding-bottom: 15px; margin-bottom: 25px; }
          .logo-area { display: flex; align-items: center; gap: 12px; }
          .logo-text { font-size: 20px; font-weight: 800; tracking-wide: 1px; color: #021c13; margin: 0; }
          .logo-sub { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #d4af37; margin: 3px 0 0 0; }
          .ref-details { text-align: right; font-size: 12px; color: #666; font-family: monospace; }
          .ref-code { font-weight: bold; color: #021c13; font-size: 13px; }
          .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
          .info-card { background: #f9fbf9; border: 1px solid #eaeaea; padding: 15px; border-radius: 8px; }
          .info-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #d4af37; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
          .info-val { font-size: 13px; color: #444; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
          .items-table th { background: #021c13; color: #fff; text-align: left; padding: 10px; font-weight: 600; text-transform: uppercase; font-size: 11px; }
          .totals-section { display: flex; justify-content: flex-end; font-size: 13px; color: #555; }
          .totals-table { width: 260px; border-top: 1px solid #eee; padding-top: 10px; }
          .totals-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .grand-total { font-size: 16px; font-weight: bold; color: #021c13; border-top: 1px solid #021c13; padding-top: 8px; margin-top: 8px; }
          .footer-text { text-align: center; font-size: 11px; color: #999; margin-top: 35px; border-top: 1px dashed #eee; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div class="logo-area">
              <div>
                <h1 class="logo-text">LUXURY SCENT DECANTS</h1>
                <p class="logo-sub">Official Digital Invoice Receipt</p>
              </div>
            </div>
            <div class="ref-details">
              <div>Reference Code: <span class="ref-code">${inquiry.reference_code}</span></div>
              <div style="margin-top: 4px;">Date: ${new Date(inquiry.created_at).toLocaleString()}</div>
            </div>
          </div>
          
          <div class="grid-info">
            <div class="info-card">
              <div class="info-title">Recipient Details</div>
              <div class="info-val">
                <strong>${inquiry.customer_name}</strong><br/>
                📞 ${inquiry.customer_phone}<br/>
                ✉️ ${inquiry.customer_email}
              </div>
            </div>
            
            <div class="info-card">
              <div class="info-title">Delivery &amp; Payment</div>
              <div class="info-val">
                📍 ${inquiry.delivery_address}<br/>
                <span style="font-size: 11px; color: #777;">${inquiry.city}, ${inquiry.province}</span><br/>
                <span style="display: inline-block; margin-top: 6px;">Payment Method: <strong>
                  ${inquiry.payment_method === 'cod' ? 'CASH ON DELIVERY (COD)' :
                    inquiry.payment_method === 'gcash' ? 'GCASH E-WALLET' :
                    inquiry.payment_method === 'maya' ? 'MAYA E-WALLET' :
                    inquiry.payment_method === 'rcbc' ? 'ONLINE BANKING (RCBC)' :
                    inquiry.payment_method === 'bank_transfer' ? 'ONLINE BANKING (RCBC)' :
                    inquiry.payment_method.toUpperCase()}
                </strong></span>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Fragrance Product Details</th>
                <th style="text-align: center; width: 80px;">Size</th>
                <th style="text-align: center; width: 60px;">Qty</th>
                <th style="text-align: right; width: 90px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-table">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>₱${subtotalVal.toLocaleString()}</span>
              </div>
              <div class="totals-row">
                <span>🚚 ${inquiry.delivery_type}:</span>
                <span>₱${shippingVal.toLocaleString()}</span>
              </div>
              <div class="totals-row grand-total">
                <span>Grand Total:</span>
                <span>₱${grandTotalVal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="footer-text">
            Thank you for choosing Luxury Scent Decants. Elevate your everyday scent.
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
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
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="09171234567"
                        className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans"
                      />
                    </div>

                  </div>

                  {/* Cascading Region & Province */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Region Selector */}
                    <LuxurySearchableSelect
                      label="Region"
                      required
                      value={regionCode}
                      onChange={(code) => {
                        setRegionCode(code);
                        setProvinceCode('');
                        setCityCode('');
                        setBarangay('');
                        setProvince('');
                        setCity('');
                      }}
                      placeholder="Select Region"
                      options={regions.map(r => ({ value: r.code, label: r.name }))}
                    />

                    {/* Province Selector */}
                    <LuxurySearchableSelect
                      label="Province"
                      required
                      disabled={!regionCode}
                      value={provinceCode}
                      onChange={(code) => {
                        setProvinceCode(code);
                        const selected = provinces.find((p) => p.code === code);
                        setProvince(selected ? selected.name : '');
                        setCityCode('');
                        setBarangay('');
                        setCity('');
                      }}
                      placeholder="Select Province"
                      options={provinces
                        .filter((p) => p.regionCode === regionCode)
                        .map((p) => ({ value: p.code, label: p.name }))}
                    />
                  </div>

                  {/* Cascading City & Barangay */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* City Selector */}
                    <LuxurySearchableSelect
                      label="City / Municipality"
                      required
                      disabled={!provinceCode}
                      value={cityCode}
                      onChange={(code) => {
                        setCityCode(code);
                        const selected = cities.find((c) => c.code === code);
                        setCity(selected ? selected.name : '');
                        setBarangay('');
                      }}
                      placeholder="Select City / Municipality"
                      options={cities
                        .filter((c) => c.provinceCode === provinceCode)
                        .map((c) => ({ value: c.code, label: c.name }))}
                    />

                    {/* Barangay Selector */}
                    <LuxurySearchableSelect
                      label="Barangay"
                      required
                      disabled={!cityCode}
                      value={barangay}
                      onChange={(val) => setBarangay(val)}
                      placeholder="Select Barangay"
                      options={cityCode ? getBarangaysForCity(cityCode, city) : []}
                    />
                  </div>

                  {/* Street & Postal Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Street Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                        Street Name, Building, House No.
                      </label>
                      <input
                        type="text"
                        required
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="e.g. Unit 4B Gold Crest Condo, 123 Mabini St"
                        className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans"
                      />
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="e.g. 1000"
                        className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans"
                      />
                    </div>
                  </div>

                  {/* Helper Full Address Preview */}
                  {address && (
                    <div className="p-3 bg-black/20 border border-white/5 rounded-xl text-xs text-brand-cream/50">
                      <span className="font-bold text-brand-gold/80 block text-[9px] uppercase tracking-widest mb-0.5">Compiled Save Address Preview:</span>
                      {address}, {city}, {province}
                    </div>
                  )}

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
                        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-brand-gold/30 bg-gradient-to-b from-[#03251a] to-[#011611] p-6 md:p-8 shadow-2xl z-10 space-y-6 text-brand-cream font-sans"
                      >
                        {/* Close */}
                        <button
                          onClick={() => setSelectedInquiry(null)}
                          className="absolute top-4 right-4 p-1.5 rounded-full border border-brand-cream/10 text-brand-cream/60 hover:text-brand-gold hover:border-brand-gold/30 transition-all duration-200"
                        >
                          <X size={16} />
                        </button>

                        {/* Receipt Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/[0.08] gap-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                              <ShoppingBag size={18} />
                            </div>
                            <div>
                              <h4 className="font-serif text-base font-bold text-brand-cream">
                                Receipt <span className="text-brand-gold">{selectedInquiry.reference_code}</span>
                              </h4>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border tracking-widest uppercase ${getStatusColor(selectedInquiry.status)} mt-0.5 inline-block`}>
                                {selectedInquiry.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right font-mono text-[10px] text-brand-cream/50">
                            <div>Submitted: {new Date(selectedInquiry.created_at).toLocaleString()}</div>
                          </div>
                        </div>

                        {/* Customer & Billing Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-brand-gold font-serif flex items-center gap-1 pb-1 border-b border-white/[0.04]">
                              <Check size={12} className="text-brand-gold" /> Recipient Details
                            </h5>
                            <div className="space-y-1 text-brand-cream/80">
                              <p className="font-bold text-brand-cream text-sm">{selectedInquiry.customer_name}</p>
                              <p>📞 {selectedInquiry.customer_phone}</p>
                              <p>✉️ {selectedInquiry.customer_email}</p>
                            </div>
                          </div>

                          <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-brand-gold font-serif flex items-center gap-1 pb-1 border-b border-white/[0.04]">
                              <Truck size={12} className="text-brand-gold" /> Delivery &amp; Payment
                            </h5>
                            <div className="space-y-1 text-brand-cream/80">
                              <p className="font-medium text-brand-cream truncate">📍 {selectedInquiry.delivery_address}</p>
                              <p className="text-[10px] text-brand-cream/40">{selectedInquiry.city}, {selectedInquiry.province}</p>
                              <div className="pt-1.5 border-t border-white/[0.04] flex justify-between">
                                <span>Method:</span>
                                <span className="font-bold uppercase text-brand-gold">
                                  {selectedInquiry.payment_method === 'cod' ? 'COD' :
                                   selectedInquiry.payment_method === 'gcash' ? 'GCash' :
                                   selectedInquiry.payment_method === 'maya' ? 'Maya' :
                                   selectedInquiry.payment_method === 'rcbc' ? 'RCBC Online' :
                                   selectedInquiry.payment_method === 'bank_transfer' ? 'RCBC Online' :
                                   selectedInquiry.payment_method || 'COD'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Items Table */}
                        <div className="bg-white/[0.01] border border-white/[0.06] rounded-xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-white/[0.08] bg-white/[0.03] text-[9px] font-bold text-brand-gold uppercase tracking-wider">
                                <th className="py-2.5 px-4">Fragrance Details</th>
                                <th className="py-2.5 px-4 text-center">Size</th>
                                <th className="py-2.5 px-4 text-center">Qty</th>
                                <th className="py-2.5 px-4 text-right">Price</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04] text-brand-cream/85">
                              {selectedInquiry.items?.map((item) => (
                                <tr key={item.id}>
                                  <td className="py-2.5 px-4">
                                    <div className="font-bold text-brand-cream">{item.product_name}</div>
                                    <div className="text-[10px] text-brand-cream/40 mt-0.5">{item.product_brand}</div>
                                  </td>
                                  <td className="py-2.5 px-4 text-center font-mono">{item.volume_size}</td>
                                  <td className="py-2.5 px-4 text-center">{item.quantity}</td>
                                  <td className="py-2.5 px-4 text-right font-bold">₱{(Number(item.unit_price) * item.quantity).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Totals Summary */}
                        <div className="flex justify-end text-xs">
                          <div className="w-full sm:w-72 space-y-2 border-t border-white/[0.08] pt-3">
                            <div className="flex justify-between text-brand-cream/60">
                              <span>Decants Subtotal:</span>
                              <span>₱{Number(selectedInquiry.total_estimated_price).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-brand-cream/60">
                              <span>🚚 {selectedInquiry.delivery_type || 'Standard Courier'}:</span>
                              <span>₱{Number(selectedInquiry.shipping_fee || 0).toLocaleString()}</span>
                            </div>
                            {selectedInquiry.estimated_delivery_days && (
                              <div className="flex justify-between text-[9px] text-brand-gold uppercase tracking-wider font-semibold">
                                <span>Estimated Transit:</span>
                                <span>{selectedInquiry.estimated_delivery_days}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-bold border-t border-brand-gold/20 pt-2 mt-1">
                              <span className="text-brand-cream">Grand Total:</span>
                              <span className="text-brand-gold text-base">
                                ₱{(Number(selectedInquiry.total_estimated_price) + Number(selectedInquiry.shipping_fee || 0)).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                          <button
                            onClick={() => setSelectedInquiry(null)}
                            className="px-4 py-2 border border-white/[0.08] hover:bg-white/[0.04] text-brand-cream rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer"
                          >
                            Close
                          </button>
                          <button
                            onClick={() => handlePrintReceipt(selectedInquiry)}
                            className="px-5 py-2.5 bg-brand-gold text-brand-emerald-dark font-black hover:brightness-110 rounded-lg text-xs tracking-wider uppercase transition-all shadow-[0_4px_15px_rgba(212,175,55,0.15)] flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Printer size={13} />
                            <span>Print Receipt</span>
                          </button>
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
