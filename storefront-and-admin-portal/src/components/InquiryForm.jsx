import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, Loader2, Sparkles, Receipt, Truck, CreditCard, Printer, Home } from 'lucide-react';
import { useInquiryBag } from '../contexts/InquiryBagContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function InquiryForm({ onBack, onClose }) {
  const { items, totalEstimatedPrice, submitInquiry } = useInquiryBag();
  const { localUser, isAuthenticated } = useAuth();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Shipping Calculator States
  const [shippingFee, setShippingFee] = useState(0);
  const [deliveryType, setDeliveryType] = useState('Enter delivery address to compute');
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState('');

  // States
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Pre-fill fields if user is authenticated and has profile data
  useEffect(() => {
    if (localUser) {
      setName(localUser.full_name || '');
      setEmail(localUser.email || '');
      setPhone(localUser.phone || '');
      setAddress(localUser.delivery_address || '');
      setCity(localUser.city || '');
      setProvince(localUser.province || '');
    }
  }, [localUser]);

  // Delivery Calculator effect
  useEffect(() => {
    const provLower = (province || '').toLowerCase();
    const cityLower = (city || '').toLowerCase();
    const addressLower = (address || '').toLowerCase();

    const isDavao = 
      provLower.includes('davao') || 
      cityLower.includes('davao') || 
      addressLower.includes('davao');

    if (provLower || cityLower || addressLower) {
      if (isDavao) {
        setShippingFee(50);
        setDeliveryType('Davao Local Express');
        setEstimatedDeliveryDays('1-2 Business Days');
      } else {
        setShippingFee(150);
        setDeliveryType('J&T Express Nationwide');
        setEstimatedDeliveryDays('4-7 Business Days');
      }
    } else {
      setShippingFee(0);
      setDeliveryType('Enter delivery address to compute');
      setEstimatedDeliveryDays('');
    }
  }, [province, city, address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your checkout bag is empty.');
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
        additional_notes: notes,
        payment_method: paymentMethod,
        shipping_fee: shippingFee,
        delivery_type: deliveryType,
        estimated_delivery_days: estimatedDeliveryDays,
      });

      setResult(response.inquiry);
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Order Checkout Error:', error);
      toast.error(error.response?.data?.message || 'Failed to check out order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (result) {
    const grandTotal = Number(result.total_estimated_price) + Number(result.shipping_fee);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl mx-auto p-6 md:p-10 bg-gradient-to-b from-[#03251a] to-[#011611] border border-brand-gold/30 rounded-2xl shadow-2xl relative text-brand-cream font-sans print:bg-white print:text-black print:border-none print:shadow-none print:p-0"
      >
        {/* Top gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent print:hidden" />

        {/* Printable Receipt Frame */}
        <div className="space-y-8 print:text-black">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-white/[0.08] print:border-black/20 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-gold/30 bg-[#021c13] flex items-center justify-center shrink-0 print:hidden">
                <Receipt size={24} className="text-brand-gold" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-wide text-brand-cream print:text-black">LUXURY SCENT DECANTS</h1>
                <p className="text-[10px] uppercase tracking-widest text-brand-gold font-semibold mt-0.5 print:text-black/60">Digital Invoice Receipt</p>
              </div>
            </div>
            <div className="text-left md:text-right font-mono text-xs text-brand-cream/60 print:text-black/60">
              <div>Reference Code: <strong className="text-brand-gold font-bold select-all print:text-black">{result.reference_code}</strong></div>
              <div className="mt-1">Date: {new Date(result.created_at).toLocaleString()}</div>
            </div>
          </div>

          {/* Customer & Billing Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-3 print:border-black/10 print:bg-black/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold print:text-black font-serif flex items-center gap-1.5 border-b border-white/[0.04] print:border-black/5 pb-2">
                <Check size={14} className="text-brand-gold" /> Recipient Details
              </h3>
              <div className="space-y-1.5 text-brand-cream/80 print:text-black/80">
                <p className="font-semibold text-brand-cream print:text-black text-base">{result.customer_name}</p>
                <p className="flex items-center gap-2">📞 {result.customer_phone}</p>
                <p className="flex items-center gap-2">✉️ {result.customer_email}</p>
              </div>
            </div>

            <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-3 print:border-black/10 print:bg-black/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold print:text-black font-serif flex items-center gap-1.5 border-b border-white/[0.04] print:border-black/5 pb-2">
                <Truck size={14} className="text-brand-gold" /> Delivery & Payment
              </h3>
              <div className="space-y-1.5 text-brand-cream/80 print:text-black/80">
                <p className="font-medium text-brand-cream print:text-black flex items-center gap-1">
                  📍 {result.delivery_address}
                </p>
                <p className="text-xs text-brand-cream/50 print:text-black/50 ml-5">{result.city}, {result.province}</p>
                <div className="pt-1.5 border-t border-white/[0.04] print:border-black/5 flex justify-between text-xs">
                  <span>Method:</span>
                  <span className="font-bold uppercase text-brand-gold print:text-black">
                    {result.payment_method === 'cod' ? 'Cash On Delivery (COD)' : 
                     result.payment_method === 'gcash' ? 'GCash e-Wallet' : 
                     result.payment_method === 'maya' ? 'Maya e-Wallet' : 
                     result.payment_method === 'rcbc' ? 'Online Banking (RCBC)' : 
                     result.payment_method === 'bank_transfer' ? 'Online Banking (RCBC)' : 
                     result.payment_method}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions (If Prepaid) */}
          {result.payment_method !== 'cod' && (
            <div className="p-5 rounded-xl border border-brand-gold/20 bg-brand-gold/5 text-xs text-brand-cream/90 space-y-2 print:border-black/20 print:bg-black/5 print:text-black">
              <p className="font-bold text-brand-gold flex items-center gap-1.5 uppercase tracking-wider">
                <CreditCard size={14} /> Settlement Instructions (Prepaid Order)
              </p>
              {result.payment_method === 'gcash' && (
                <p>Please send GCash transfer of <strong className="text-brand-gold font-bold print:text-black">{formatCurrency(grandTotal)}</strong> to account number <strong className="text-brand-gold font-mono font-bold select-all print:text-black">0917-123-4567</strong> (Name: Luxury Scent Decants). Upload your payment receipt screenshot or present it upon delivery.</p>
              )}
              {result.payment_method === 'maya' && (
                <p>Please send Maya transfer of <strong className="text-brand-gold font-bold print:text-black">{formatCurrency(grandTotal)}</strong> to account number <strong className="text-brand-gold font-mono font-bold select-all print:text-black">0917-123-4567</strong> (Name: Luxury Scent Decants). Present reference screenshot on verification.</p>
              )}
              {(result.payment_method === 'bank_transfer' || result.payment_method === 'rcbc') && (
                <p>Please send RCBC Online Banking transfer of <strong className="text-brand-gold font-bold print:text-black">{formatCurrency(grandTotal)}</strong> to RCBC Account <strong className="text-brand-gold font-mono font-bold select-all print:text-black">1234-5678-9012</strong> (Account Name: Luxury Scent Decants). Upload your payment receipt screenshot or present it upon verification.</p>
              )}
            </div>
          )}

          {/* Items Table */}
          <div className="bg-white/[0.01] border border-white/[0.06] rounded-xl overflow-hidden print:border-black/10">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-brand-gold uppercase tracking-wider print:border-black/10 print:bg-black/5 print:text-black">
                  <th className="py-3.5 px-5">Fragrance Details</th>
                  <th className="py-3.5 px-5 text-center">Size</th>
                  <th className="py-3.5 px-5 text-center">Qty</th>
                  <th className="py-3.5 px-5 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-brand-cream/85 print:divide-black/5 print:text-black">
                {result.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-brand-cream print:text-black">{item.product_name}</div>
                      <div className="text-xs text-brand-cream/40 mt-0.5 print:text-black/50">{item.product_brand}</div>
                    </td>
                    <td className="py-3.5 px-5 text-center font-mono">{item.volume_size}</td>
                    <td className="py-3.5 px-5 text-center">{item.quantity}</td>
                    <td className="py-3.5 px-5 text-right font-bold">{formatCurrency(item.unit_price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div className="flex justify-end text-sm">
            <div className="w-full md:w-80 space-y-2 border-t border-white/[0.08] pt-4 print:border-black/10">
              <div className="flex justify-between text-brand-cream/60 print:text-black/60">
                <span>Decants Subtotal:</span>
                <span>{formatCurrency(result.total_estimated_price)}</span>
              </div>
              <div className="flex justify-between text-brand-cream/60 print:text-black/60">
                <span className="flex items-center gap-1.5">
                  🚚 {result.delivery_type}:
                </span>
                <span>{formatCurrency(result.shipping_fee)}</span>
              </div>
              {result.estimated_delivery_days && (
                <div className="flex justify-between text-[10px] text-brand-gold uppercase tracking-wider print:text-black/60 font-semibold pl-5">
                  <span>Estimated Delivery Window:</span>
                  <span>{result.estimated_delivery_days}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-brand-gold/20 pt-2 print:border-black/10 mt-2">
                <span className="text-brand-cream print:text-black">Grand Bill Total:</span>
                <span className="text-brand-gold text-lg print:text-black">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons (Hidden when printing) */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-10 pt-6 border-t border-white/[0.08] print:hidden">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-brand-emerald-dark border border-brand-gold/20 text-brand-cream hover:bg-brand-emerald-light/20 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Home size={14} /> Continue Shopping
          </button>
          <button
            onClick={handlePrint}
            className="px-7 py-3 bg-brand-gold text-brand-emerald-dark font-black hover:brightness-110 text-xs tracking-widest uppercase rounded-lg transition-all shadow-[0_4px_15px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer size={14} /> Print Receipt
          </button>
        </div>
      </motion.div>
    );
  }

  const subtotal = totalEstimatedPrice;
  const grandTotal = subtotal + shippingFee;

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
              <span>Checkout Order Details</span>
            </h2>

            {!isAuthenticated && (
              <div className="p-4 rounded-xl bg-brand-gold/5 border border-brand-gold/15 text-xs text-brand-cream/60 leading-relaxed">
                💡 <span className="font-bold text-brand-cream">Tip:</span> Logging in will securely save your details for faster checkouts and allow you to track your orders in real time.
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

            <div className="grid grid-cols-1 gap-4">
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
              {/* Province */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
                  Province
                </label>
                <input
                  type="text"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="e.g. Davao del Sur, Cebu, Metro Manila"
                  className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans"
                />
              </div>

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
                  placeholder="e.g. Davao City, Makati"
                  className="w-full px-4 py-3 bg-brand-emerald-dark border border-brand-gold/15 rounded-xl text-brand-cream text-sm placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors font-sans"
                />
              </div>
            </div>

            {/* Direct Payment Channels Selector */}
            <div className="p-5 rounded-xl border border-brand-gold/15 bg-brand-emerald-dark/60 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold border-b border-brand-gold/10 pb-2 flex items-center gap-1.5">
                <CreditCard size={14} /> Settlement Payment Method
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cash on Delivery */}
                <label className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all duration-300 relative select-none ${
                  paymentMethod === 'cod' 
                    ? 'border-brand-gold bg-brand-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                    : 'border-white/10 bg-black/20 hover:border-brand-gold/30'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wider text-brand-cream">Cash On Delivery (COD)</p>
                      <p className="text-[10px] text-brand-cream/40 mt-1">Settle locally at your doorstep</p>
                    </div>
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 accent-brand-gold cursor-pointer"
                    />
                  </div>
                </label>

                {/* E-wallet (GCash, Maya) */}
                <div 
                  className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all duration-300 relative select-none ${
                    (paymentMethod === 'gcash' || paymentMethod === 'maya')
                      ? 'border-brand-gold bg-brand-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                      : 'border-white/10 bg-black/20 hover:border-brand-gold/30'
                  }`}
                  onClick={() => {
                    if (paymentMethod !== 'gcash' && paymentMethod !== 'maya') {
                      setPaymentMethod('gcash');
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wider text-brand-cream">E-wallet (GCash, Maya)</p>
                      <p className="text-[10px] text-brand-cream/40 mt-1">Maya and GCash e-wallets</p>
                    </div>
                    <input
                      type="radio"
                      name="payment_method_group"
                      checked={paymentMethod === 'gcash' || paymentMethod === 'maya'}
                      readOnly
                      className="w-4 h-4 accent-brand-gold cursor-pointer"
                    />
                  </div>

                  {(paymentMethod === 'gcash' || paymentMethod === 'maya') && (
                    <div className="mt-3 pt-3 border-t border-brand-gold/15 flex flex-col gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('gcash')}
                        className={`w-full py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          paymentMethod === 'gcash'
                            ? 'bg-brand-gold text-brand-emerald-dark font-black shadow-[0_2px_8px_rgba(212,175,55,0.2)]'
                            : 'bg-black/40 text-brand-cream/60 hover:text-brand-cream border border-white/5 hover:bg-black/60'
                        }`}
                      >
                        GCash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('maya')}
                        className={`w-full py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          paymentMethod === 'maya'
                            ? 'bg-brand-gold text-brand-emerald-dark font-black shadow-[0_2px_8px_rgba(212,175,55,0.2)]'
                            : 'bg-black/40 text-brand-cream/60 hover:text-brand-cream border border-white/5 hover:bg-black/60'
                        }`}
                      >
                        Maya
                      </button>
                    </div>
                  )}
                </div>

                {/* Online Banking (RCBC) */}
                <label className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all duration-300 relative select-none ${
                  paymentMethod === 'rcbc' 
                    ? 'border-brand-gold bg-brand-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                    : 'border-white/10 bg-black/20 hover:border-brand-gold/30'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wider text-brand-cream">Online Banking (RCBC)</p>
                      <p className="text-[10px] text-brand-cream/40 mt-1">Wire transfer via RCBC account</p>
                    </div>
                    <input
                      type="radio"
                      name="payment_method"
                      value="rcbc"
                      checked={paymentMethod === 'rcbc'}
                      onChange={() => setPaymentMethod('rcbc')}
                      className="w-4 h-4 accent-brand-gold cursor-pointer"
                    />
                  </div>
                </label>
              </div>

              {/* Dynamic instruction details depending on selection */}
              <div className="mt-4 p-4 rounded-lg bg-black/40 border border-white/[0.04] text-xs text-brand-cream/70">
                {paymentMethod === 'cod' && (
                  <p>🔹 <strong className="text-brand-gold">COD Info:</strong> Please prepare exact cash matching your grand bill total upon physical courier arrival at your address.</p>
                )}
                {paymentMethod === 'gcash' && (
                  <p>🔹 <strong className="text-brand-gold">GCash Info:</strong> You will be given Biller GCash numbers on the final digital receipt window to settle the amount instantly.</p>
                )}
                {paymentMethod === 'maya' && (
                  <p>🔹 <strong className="text-brand-gold">Maya Info:</strong> You will receive our e-Wallet Maya details in the next confirmation receipt screen.</p>
                )}
                {(paymentMethod === 'bank_transfer' || paymentMethod === 'rcbc') && (
                  <p>🔹 <strong className="text-brand-gold">RCBC Info:</strong> Settle the invoice via RCBC online bank transfer credentials provided in your digital invoice receipt.</p>
                )}
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
            className="w-full py-4.5 bg-brand-gold text-brand-emerald-dark font-black rounded-xl text-xs tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_4px_25px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] disabled:opacity-50 flex items-center justify-center gap-2 transform active:scale-[0.99] cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>PROCESSING SECURE BILLING...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Settle Order &amp; Generate Invoice</span>
              </>
            )}
          </button>
        </form>

        {/* Right Sidebar: 5 Cols Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-brand-gold/15 bg-brand-emerald-dark/60 backdrop-blur-md space-y-4">
            <h3 className="font-serif text-lg text-brand-cream tracking-wide pb-3 border-b border-brand-gold/10">
              Checkout <span className="text-brand-gold">Summary</span>
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
                      <p className="text-[10px] text-brand-cream/50 mt-0.5 font-sans">
                        {item.volumePricing.size} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-sans font-bold text-brand-cream/90 text-right">
                      {formatCurrency(item.volumePricing.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Shopee-like Price Calculations */}
            <div className="border-t border-brand-gold/15 pt-4 space-y-2.5">
              <div className="flex justify-between text-xs text-brand-cream/60">
                <span>Items Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-xs text-brand-cream/60 items-center">
                <span>Shipping Fee:</span>
                {shippingFee > 0 ? (
                  <span className="font-bold text-brand-cream">{formatCurrency(shippingFee)}</span>
                ) : (
                  <span className="text-brand-gold text-[10px] font-semibold uppercase tracking-wider">Compute Address</span>
                )}
              </div>

              {shippingFee > 0 && (
                <div className="p-3 bg-[#021c13] rounded-lg border border-brand-gold/10 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-brand-gold uppercase tracking-wider font-bold">
                    <span className="flex items-center gap-1">🚚 Delivery Courier:</span>
                    <span>{deliveryType}</span>
                  </div>
                  {estimatedDeliveryDays && (
                    <div className="flex justify-between items-center text-[9px] text-brand-cream/50 uppercase tracking-widest">
                      <span>Estimated Delivery:</span>
                      <span>{estimatedDeliveryDays}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between text-sm font-bold border-t border-brand-gold/10 pt-3.5 mt-2">
                <span className="text-brand-cream">Grand Bill Total:</span>
                <span className="text-brand-gold text-base">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
