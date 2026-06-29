import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../lib/api';
import { 
  Search, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  MessageSquare,
  Copy,
  X,
  FileText,
  User,
  MapPin,
  Mail,
  Phone,
  ShoppingBag,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Memoized Inquiry Row Component
const InquiryRow = React.memo(({ inquiry, onRowClick, onStatusChange, formatCurrency }) => {
  let statusStyle = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
  if (inquiry.status === 'contacted') statusStyle = 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  if (inquiry.status === 'confirmed') statusStyle = 'text-purple-400 bg-purple-400/10 border-purple-400/20';
  if (inquiry.status === 'fulfilled') statusStyle = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  if (inquiry.status === 'cancelled') statusStyle = 'text-rose-500 bg-rose-500/10 border-rose-500/20';

  return (
    <tr 
      className="hover:bg-white/[0.01] transition duration-150 cursor-pointer"
      onClick={() => onRowClick(inquiry)}
    >
      <td className="py-4 px-6 font-mono font-semibold text-brand-gold select-all">{inquiry.reference_code}</td>
      <td className="py-4 px-6">
        <div className="font-medium text-brand-cream">{inquiry.customer_name}</div>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-xs text-brand-cream/50">{inquiry.customer_phone}</span>
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
            inquiry.payment_status === 'paid' 
              ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' 
              : 'text-brand-gold border-brand-gold/20 bg-brand-gold/5'
          }`}>
            {inquiry.payment_status ? inquiry.payment_status.replace('_', ' ') : 'pending'}
          </span>
        </div>
      </td>
      <td className="py-4 px-6 text-brand-cream/60 text-xs">
        {new Date(inquiry.created_at).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </td>
      <td className="py-4 px-6 text-brand-cream/90 font-medium">
        {formatCurrency(inquiry.total_estimated_price)}
      </td>
      <td className="py-4 px-6">
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${statusStyle}`}>
          {inquiry.status}
        </span>
      </td>
      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
        <select
          value={inquiry.status}
          onChange={(e) => onStatusChange(inquiry.id, e.target.value)}
          className="bg-black/40 border border-white/[0.08] hover:border-brand-gold text-brand-cream text-xs rounded-sm p-1.5 focus:outline-none"
        >
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="confirmed">Confirmed</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </td>
    </tr>
  );
});
InquiryRow.displayName = 'InquiryRow';

// Memoized Standalone Inquiry Details Modal / Drawer to isolate re-render scope
const InquiryDetailModal = React.memo(({ inquiry, onClose, onStatusChange, onPaymentStatusChange, formatCurrency, onPrintWaybill, onDownloadWaybill }) => {
  if (!inquiry) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-brand-emerald-dark border border-brand-gold/30 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-8 text-brand-cream font-sans"
        >
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent"></div>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-brand-cream/60 hover:text-brand-gold transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/[0.08] pb-6 mb-6 gap-4 pr-10 md:pr-12">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-bold tracking-wider text-brand-gold">{inquiry.reference_code}</span>
                <span className="text-xs text-brand-cream/40 uppercase">Inquiry Receipt</span>
              </div>
              <p className="text-xs text-brand-cream/60 mt-1">
                Submitted on {new Date(inquiry.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold uppercase text-brand-gold tracking-wide">Status Workflow:</label>
              <select
                value={inquiry.status}
                onChange={(e) => onStatusChange(inquiry.id, e.target.value)}
                className="bg-black/60 border border-brand-gold/30 text-brand-gold text-xs font-bold uppercase tracking-wider rounded-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              >
                <option value="pending">Pending Review</option>
                <option value="contacted">Customer Contacted</option>
                <option value="confirmed">Order Confirmed</option>
                <option value="fulfilled">Inquiry Fulfilled</option>
                <option value="cancelled">Inquiry Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-4">
                <h3 className="font-serif text-base font-semibold text-brand-cream flex items-center gap-2 border-b border-white/[0.04] pb-2">
                  <User className="w-4.5 h-4.5 text-brand-gold" /> Customer Profile
                </h3>
                <div className="space-y-3 text-sm text-brand-cream/80">
                  <div className="flex gap-3">
                    <span className="font-medium text-brand-cream min-w-[70px]">Name:</span>
                    <span>{inquiry.customer_name}</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="font-medium text-brand-cream min-w-[70px] flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-brand-gold/60" /> Email:
                    </span>
                    <a href={`mailto:${inquiry.customer_email}`} className="text-brand-gold hover:underline font-medium">
                      {inquiry.customer_email}
                    </a>
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="font-medium text-brand-cream min-w-[70px] flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-brand-gold/60" /> Phone:
                    </span>
                    <a href={`tel:${inquiry.customer_phone}`} className="text-brand-gold hover:underline">
                      {inquiry.customer_phone}
                    </a>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="font-medium text-brand-cream min-w-[70px] flex items-center gap-1 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-gold/60" /> Address:
                    </span>
                    <div>
                      <div>{inquiry.delivery_address}</div>
                      <div className="text-xs text-brand-cream/50 mt-0.5">{inquiry.city}, {inquiry.province}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-3">
                <h3 className="font-serif text-base font-semibold text-brand-cream flex items-center gap-2 border-b border-white/[0.04] pb-2">
                  <FileText className="w-4.5 h-4.5 text-brand-gold" /> Special Instructions
                </h3>
                <p className="text-sm text-brand-cream/80 whitespace-pre-line leading-relaxed italic">
                  {inquiry.additional_notes || 'No special requests or instructions provided by client.'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-4">
                <h3 className="font-serif text-base font-semibold text-brand-cream flex items-center gap-2 border-b border-white/[0.04] pb-2">
                  <ShoppingBag className="w-4.5 h-4.5 text-brand-gold" /> Decant Selection Details
                </h3>
                
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {inquiry._isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : inquiry.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/[0.03] text-sm last:border-b-0">
                      <div>
                        <div className="font-medium text-brand-cream">{item.product_name}</div>
                        <div className="text-xs text-brand-cream/50 mt-0.5">{item.product_brand} • Size: {item.volume_size}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-brand-gold">{formatCurrency(item.unit_price * item.quantity)}</div>
                        <div className="text-xs text-brand-cream/40 mt-0.5">{formatCurrency(item.unit_price)} × {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/[0.06] pt-4 space-y-2 text-sm text-brand-cream/70">
                  <div className="flex justify-between items-center">
                    <span>Decant Subtotal:</span>
                    <span className="text-brand-cream font-medium">{formatCurrency(inquiry.total_estimated_price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Courier Shipping:</span>
                    <span className="text-brand-cream font-medium">
                      {formatCurrency(inquiry.shipping_fee || 0)} 
                      <span className="text-[10px] text-brand-gold ml-1.5 font-bold uppercase tracking-wider">({inquiry.delivery_type || 'Standard'})</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/[0.04] text-base font-bold">
                    <span className="text-brand-cream font-serif">Collectible Grand Total:</span>
                    <span className="text-brand-gold text-lg">
                      {formatCurrency(Number(inquiry.total_estimated_price) + Number(inquiry.shipping_fee || 0))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-brand-gold/20 rounded-xl p-5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <FileText className="w-20 h-20 text-brand-gold" />
                </div>

                <h3 className="font-serif text-base font-semibold text-brand-cream flex items-center gap-2 border-b border-white/[0.04] pb-2">
                  <FileText className="w-4.5 h-4.5 text-brand-gold" /> Courier Delivery Waybill
                </h3>
                
                <div className="space-y-1.5 text-xs text-brand-cream/70 leading-relaxed">
                  <p>💳 Payment Settlement: <strong className="text-brand-gold uppercase">
                    {inquiry.payment_method === 'cod' ? 'Cash On Delivery (COD)' :
                     inquiry.payment_method === 'gcash' ? 'GCash e-Wallet' :
                     inquiry.payment_method === 'maya' ? 'Maya e-Wallet' :
                     inquiry.payment_method || 'Cash On Delivery'}
                  </strong></p>
                  <div className="flex items-center gap-2 mt-1">
                    <span>💰 Payment Status:</span>
                    <select
                      value={inquiry.payment_status || 'pending'}
                      onChange={(e) => onPaymentStatusChange(inquiry.id, e.target.value)}
                      className="bg-black/60 border border-brand-gold/30 text-brand-gold text-xs font-bold uppercase tracking-wider rounded-sm p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
                    >
                      <option value="pending" className="text-brand-cream bg-brand-emerald-dark">Pending</option>
                      <option value="pending_payment" className="text-brand-gold bg-brand-emerald-dark">Pending Payment</option>
                      <option value="paid" className="text-emerald-400 bg-brand-emerald-dark">Paid</option>
                      <option value="expired" className="text-rose-400 bg-brand-emerald-dark">Expired</option>
                      <option value="failed" className="text-rose-500 bg-brand-emerald-dark">Failed</option>
                    </select>
                  </div>
                  {inquiry.estimated_delivery_days && (
                    <p>🚚 Transit Estimate: <strong className="text-brand-gold">{inquiry.estimated_delivery_days}</strong></p>
                  )}
                </div>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => onPrintWaybill(inquiry)}
                    className="py-3 bg-gradient-to-r from-brand-gold-dark to-brand-gold text-brand-emerald-dark font-black hover:brightness-110 text-xs tracking-[0.2em] uppercase rounded-sm transition-all shadow-[0_4px_15px_rgba(212,175,55,0.15)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4 stroke-[3]" /> Print Waybill
                  </button>
                  <button
                    onClick={() => onDownloadWaybill(inquiry)}
                    className="py-3 bg-white/[0.02] border border-brand-gold/25 hover:bg-brand-gold/10 text-brand-gold font-bold text-xs tracking-[0.2em] uppercase rounded-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 stroke-[2]" /> Download Label
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
InquiryDetailModal.displayName = 'InquiryDetailModal';

export const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  
  // Decoupled search inputs
  const [search, setSearch] = useState('');
  const [localSearch, setLocalSearch] = useState('');

  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchInquiries = useCallback(async (background = false) => {
    const isBackground = background === true;
    if (!isBackground) setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (status) params.status = status;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get('/admin/inquiries', { params });
      setInquiries(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to,
      });
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      toast.error('Failed to load inquiries.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [page, search, status, startDate, endDate]);

  useEffect(() => {
    fetchInquiries();

    const interval = setInterval(() => {
      fetchInquiries(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchInquiries]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    setPage(1);
    setSearch(localSearch);
  }, [localSearch]);

  const handleClearFilters = useCallback(() => {
    setLocalSearch('');
    setSearch('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }, []);

  const handleRowClick = useCallback(async (inquiry) => {
    try {
      setSelectedInquiry({ ...inquiry, items: [], _isLoading: true });
      const response = await api.get(`/admin/inquiries/${inquiry.id}`);
      setSelectedInquiry(response.data);
    } catch (err) {
      console.error('Error fetching inquiry details:', err);
      toast.error('Failed to load inquiry details.');
      setSelectedInquiry(null);
    }
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setSelectedInquiry(null);
  }, []);

  const handleStatusChange = useCallback(async (inquiryId, newStatus) => {
    try {
      const response = await api.patch(`/admin/inquiries/${inquiryId}/status`, {
        status: newStatus
      });
      
      const updatedInquiry = response.data.inquiry;
      toast.success(`Inquiry status updated to ${newStatus.toUpperCase()}`);
      
      setInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, status: newStatus } : inq));
      
      setSelectedInquiry((currentSelected) => {
        if (currentSelected && currentSelected.id === inquiryId) {
          return updatedInquiry;
        }
        return currentSelected;
      });
    } catch (err) {
      console.error('Error changing inquiry status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  }, []);

  const handlePaymentStatusChange = useCallback(async (inquiryId, newPaymentStatus) => {
    try {
      const response = await api.patch(`/admin/inquiries/${inquiryId}/payment-status`, {
        status: newPaymentStatus
      });
      
      const updatedInquiry = response.data.inquiry;
      toast.success(`Payment status updated to ${newPaymentStatus.toUpperCase()}`);
      
      setInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, payment_status: newPaymentStatus } : inq));
      
      setSelectedInquiry((currentSelected) => {
        if (currentSelected && currentSelected.id === inquiryId) {
          return updatedInquiry;
        }
        return currentSelected;
      });
    } catch (err) {
      console.error('Error changing payment status:', err);
      toast.error(err.response?.data?.message || 'Failed to update payment status.');
    }
  }, []);

  const handlePrintWaybill = useCallback((inquiry) => {
    if (!inquiry) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow pop-ups to print waybills.");
      return;
    }

    const itemsRows = inquiry.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong style="font-size: 14px;">${item.product_name}</strong><br/>
          <span style="font-size: 11px; color: #666;">${item.product_brand}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-family: monospace;">${item.volume_size}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold;">${item.quantity}</td>
      </tr>
    `).join('');

    const subtotalVal = Number(inquiry.total_estimated_price);
    const shippingVal = Number(inquiry.shipping_fee || 0);
    const grandTotalVal = subtotalVal + shippingVal;

    const waybillHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Waybill Courier Label - ${inquiry.reference_code}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 15px; color: #000; background: #fff; margin: 0; }
          .container { width: 100%; max-width: 580px; margin: 0 auto; border: 3px solid #000; padding: 25px; box-sizing: border-box; position: relative; }
          .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .logo-text { font-size: 24px; font-weight: 900; letter-spacing: 2px; margin: 0; }
          .logo-sub { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px; color: #444; margin: 5px 0 0 0; }
          .address-grid { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px dashed #000; padding-bottom: 20px; margin-bottom: 20px; gap: 20px; }
          .address-box { font-size: 13px; line-height: 1.5; }
          .address-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #111; margin-bottom: 6px; border-bottom: 2px solid #000; padding-bottom: 3px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
          .items-table th { background: #eaeaea; text-align: left; padding: 10px; border-bottom: 2px solid #000; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          .totals-bar { display: flex; justify-content: space-between; align-items: center; border-top: 3px solid #000; padding-top: 15px; margin-top: 20px; }
          .badge { display: inline-block; border: 3px solid #000; padding: 6px 14px; font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; }
          .barcode-wrapper { text-align: center; margin: 30px 0 10px 0; }
          .barcode-bar { display: inline-block; width: 3px; height: 45px; background: #000; margin: 0 1px; }
          .barcode-text { font-family: monospace; font-size: 13px; font-weight: bold; margin-top: 6px; letter-spacing: 1px; }
          .cut-line { border-top: 1px dashed #666; margin-top: 35px; padding-top: 8px; text-align: center; font-size: 10px; color: #555; font-style: italic; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo-text">LUXURY SCENT DECANTS</h1>
            <p class="logo-sub">Official Shipping Parcel Waybill</p>
          </div>
          
          <div class="address-grid">
            <div class="address-box">
              <div class="address-title">SHIP FROM (SENDER):</div>
              <strong>Luxury Scent Decants Depot</strong><br/>
              Quimpo Boulevard, Ecoland<br/>
              Davao City, 8000<br/>
              Davao del Sur, Philippines<br/>
              📞 +63 917 123 4567
            </div>
            
            <div class="address-box" style="border-left: 1px dashed #000; padding-left: 20px;">
              <div class="address-title">SHIP TO (RECIPIENT):</div>
              <strong>${inquiry.customer_name}</strong><br/>
              ${inquiry.delivery_address}<br/>
              ${inquiry.city}, ${inquiry.province}<br/>
              📞 ${inquiry.customer_phone}<br/>
              ✉️ ${inquiry.customer_email}
            </div>
          </div>
          
          <div style="font-size: 13px; margin-bottom: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="width: 50%;"><strong>Order Reference:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 14px;">${inquiry.reference_code}</span></td>
                <td style="width: 50%; text-align: right;"><strong>Date Logged:</strong> ${new Date(inquiry.created_at).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="width: 50%;"><strong>Logistics Courier:</strong> ${inquiry.delivery_type || 'Standard Courier'}</td>
                <td style="width: 50%; text-align: right;"><strong>Estimated Transit:</strong> ${inquiry.estimated_delivery_days || 'Nationwide Shipping'}</td>
              </tr>
            </table>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Fragrance Product & Brand Description</th>
                <th style="text-align: center; width: 90px;">Decant Size</th>
                <th style="text-align: center; width: 70px;">Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="totals-bar">
            <div>
              <span class="badge">
                ${inquiry.payment_method === 'cod' ? '💵 COLLECT CASH (COD)' : '✅ PREPAID RECEIPT'}
              </span>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; color: #444; font-weight: bold; text-transform: uppercase; margin-bottom: 3px;">Collectible Invoice Total:</div>
              <div style="font-size: 22px; font-weight: 900; letter-spacing: 0.5px;">₱${grandTotalVal.toLocaleString()}</div>
              <div style="font-size: 10px; color: #555; margin-top: 3px;">(Subtotal: ₱${subtotalVal.toLocaleString()} + Shipping: ₱${shippingVal.toLocaleString()})</div>
            </div>
          </div>

          <div class="barcode-wrapper">
            <div class="barcode-bar" style="width: 4px;"></div>
            <div class="barcode-bar" style="width: 2px;"></div>
            <div class="barcode-bar" style="width: 5px;"></div>
            <div class="barcode-bar" style="width: 1px;"></div>
            <div class="barcode-bar" style="width: 3px;"></div>
            <div class="barcode-bar" style="width: 4px;"></div>
            <div class="barcode-bar" style="width: 2px;"></div>
            <div class="barcode-bar" style="width: 1px;"></div>
            <div class="barcode-bar" style="width: 5px;"></div>
            <div class="barcode-bar" style="width: 3px;"></div>
            <div class="barcode-bar" style="width: 2px;"></div>
            <div class="barcode-bar" style="width: 4px;"></div>
            <div class="barcode-bar" style="width: 1px;"></div>
            <div class="barcode-bar" style="width: 3px;"></div>
            <div class="barcode-text">${inquiry.reference_code}</div>
          </div>
        </div>

        <div class="cut-line">
          ✂️ [ Cut out along dotted border line to paste waybill label directly onto shipping package box ] ✂️
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

    printWindow.document.write(waybillHTML);
    printWindow.document.close();
  }, []);

  const handleDownloadWaybill = useCallback((inquiry) => {
    if (!inquiry) return;
    
    const itemsRows = inquiry.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong style="font-size: 14px;">\${item.product_name}</strong><br/>
          <span style="font-size: 11px; color: #666;">\${item.product_brand}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-family: monospace;">\${item.volume_size}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold;">\${item.quantity}</td>
      </tr>
    `).join('');

    const subtotalVal = Number(inquiry.total_estimated_price);
    const shippingVal = Number(inquiry.shipping_fee || 0);
    const grandTotalVal = subtotalVal + shippingVal;

    const waybillHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Waybill Courier Label - \${inquiry.reference_code}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 15px; color: #000; background: #fff; margin: 0; }
          .container { width: 100%; max-width: 580px; margin: 0 auto; border: 3px solid #000; padding: 25px; box-sizing: border-box; position: relative; }
          .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .logo-text { font-size: 24px; font-weight: 900; letter-spacing: 2px; margin: 0; }
          .logo-sub { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px; color: #444; margin: 5px 0 0 0; }
          .address-grid { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px dashed #000; padding-bottom: 20px; margin-bottom: 20px; gap: 20px; }
          .address-box { font-size: 13px; line-height: 1.5; }
          .address-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #111; margin-bottom: 6px; border-bottom: 2px solid #000; padding-bottom: 3px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
          .items-table th { background: #eaeaea; text-align: left; padding: 10px; border-bottom: 2px solid #000; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          .totals-bar { display: flex; justify-content: space-between; align-items: center; border-top: 3px solid #000; padding-top: 15px; margin-top: 20px; }
          .badge { display: inline-block; border: 3px solid #000; padding: 6px 14px; font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; }
          .barcode-wrapper { text-align: center; margin: 30px 0 10px 0; }
          .barcode-bar { display: inline-block; width: 3px; height: 45px; background: #000; margin: 0 1px; }
          .barcode-text { font-family: monospace; font-size: 13px; font-weight: bold; margin-top: 6px; letter-spacing: 1px; }
          .cut-line { border-top: 1px dashed #666; margin-top: 35px; padding-top: 8px; text-align: center; font-size: 10px; color: #555; font-style: italic; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo-text">LUXURY SCENT DECANTS</h1>
            <p class="logo-sub">Official Shipping Parcel Waybill</p>
          </div>
          
          <div class="address-grid">
            <div class="address-box">
              <div class="address-title">SHIP FROM (SENDER):</div>
              <strong>Luxury Scent Decants Depot</strong><br/>
              Quimpo Boulevard, Ecoland<br/>
              Davao City, 8000<br/>
              Davao del Sur, Philippines<br/>
              📞 +63 917 123 4567
            </div>
            
            <div class="address-box" style="border-left: 1px dashed #000; padding-left: 20px;">
              <div class="address-title">SHIP TO (RECIPIENT):</div>
              <strong>\${inquiry.customer_name}</strong><br/>
              \${inquiry.delivery_address}<br/>
              \${inquiry.city}, \${inquiry.province}<br/>
              📞 \${inquiry.customer_phone}<br/>
              ✉️ \${inquiry.customer_email}
            </div>
          </div>
          
          <div style="font-size: 13px; margin-bottom: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="width: 50%;"><strong>Order Reference:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 14px;">\${inquiry.reference_code}</span></td>
                <td style="width: 50%; text-align: right;"><strong>Date Logged:</strong> \${new Date(inquiry.created_at).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="width: 50%;"><strong>Logistics Courier:</strong> \${inquiry.delivery_type || 'Standard Courier'}</td>
                <td style="width: 50%; text-align: right;"><strong>Estimated Transit:</strong> \${inquiry.estimated_delivery_days || 'Nationwide Shipping'}</td>
              </tr>
            </table>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Fragrance Product & Brand Description</th>
                <th style="text-align: center; width: 90px;">Decant Size</th>
                <th style="text-align: center; width: 70px;">Quantity</th>
              </tr>
            </thead>
            <tbody>
              \${itemsRows}
            </tbody>
          </table>

          <div class="totals-bar">
            <div>
              <span class="badge">
                \${inquiry.payment_method === 'cod' ? '💵 COLLECT CASH (COD)' : '✅ PREPAID RECEIPT'}
              </span>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; color: #444; font-weight: bold; text-transform: uppercase; margin-bottom: 3px;">Collectible Invoice Total:</div>
              <div style="font-size: 22px; font-weight: 900; letter-spacing: 0.5px;">₱\${grandTotalVal.toLocaleString()}</div>
              <div style="font-size: 10px; color: #555; margin-top: 3px;">(Subtotal: ₱\${subtotalVal.toLocaleString()} + Shipping: ₱\${shippingVal.toLocaleString()})</div>
            </div>
          </div>

          <div class="barcode-wrapper">
            <div class="barcode-bar" style="width: 4px;"></div>
            <div class="barcode-bar" style="width: 2px;"></div>
            <div class="barcode-bar" style="width: 5px;"></div>
            <div class="barcode-bar" style="width: 1px;"></div>
            <div class="barcode-bar" style="width: 3px;"></div>
            <div class="barcode-bar" style="width: 4px;"></div>
            <div class="barcode-bar" style="width: 2px;"></div>
            <div class="barcode-bar" style="width: 1px;"></div>
            <div class="barcode-bar" style="width: 5px;"></div>
            <div class="barcode-bar" style="width: 3px;"></div>
            <div class="barcode-bar" style="width: 2px;"></div>
            <div class="barcode-bar" style="width: 4px;"></div>
            <div class="barcode-bar" style="width: 1px;"></div>
            <div class="barcode-bar" style="width: 3px;"></div>
            <div class="barcode-text">\${inquiry.reference_code}</div>
          </div>
        </div>

        <div class="cut-line">
          ✂️ [ Cut out along dotted border line to paste waybill label directly onto shipping package box ] ✂️
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([waybillHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Waybill-\${inquiry.reference_code}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Waybill document downloaded successfully.");
  }, []);

  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(value);
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-wide text-brand-cream">
          Inquiry Intelligence
        </h1>
        <p className="text-sm text-brand-cream/60 mt-1">
          Review, status sync, and communication routing for customer orders.
        </p>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 shadow-xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-gold/60">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              placeholder="Search by Reference, Customer Name, Email, or Phone..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-brand-gold/20 focus:border-brand-gold rounded-sm text-brand-cream placeholder-brand-cream/30 focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm"
            />
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 bg-black/40 border border-brand-gold/20 focus:border-brand-gold rounded-sm text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-brand-gold text-brand-emerald-dark font-semibold text-xs tracking-wider uppercase rounded-sm hover:bg-brand-gold-light active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            {(localSearch || status || startDate || endDate) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="py-2.5 px-4 bg-white/[0.03] border border-white/[0.08] hover:border-brand-gold/40 text-brand-gold text-xs font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-4 text-xs text-brand-cream/60 border-t border-white/[0.04] pt-4">
          <span className="font-semibold uppercase text-brand-gold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Filter by Date Received:
          </span>
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase">Start</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 bg-black/40 border border-brand-gold/20 rounded-sm text-brand-cream focus:outline-none focus:border-brand-gold text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase">End</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 bg-black/40 border border-brand-gold/20 rounded-sm text-brand-cream focus:outline-none focus:border-brand-gold text-xs"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[40vh] gap-4">
          <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-brand-gold font-medium uppercase tracking-widest text-xs">Querying Order Ledger...</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-xs uppercase tracking-wider text-brand-gold font-semibold">
                  <th className="py-4 px-6">Reference</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Date Received</th>
                  <th className="py-4 px-6">Estimated Total</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-sm text-brand-cream/80">
                {inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-brand-cream/40 italic">
                      No customer inquiries match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inquiry) => (
                    <InquiryRow
                      key={inquiry.id}
                      inquiry={inquiry}
                      onRowClick={handleRowClick}
                      onStatusChange={handleStatusChange}
                      formatCurrency={formatCurrency}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="bg-white/[0.02] border-t border-white/[0.06] px-6 py-4 flex items-center justify-between text-xs text-brand-cream/60">
              <div>
                Showing <strong className="font-semibold text-brand-cream">{pagination.from}</strong> to{' '}
                <strong className="font-semibold text-brand-cream">{pagination.to}</strong> of{' '}
                <strong className="font-semibold text-brand-cream">{pagination.total}</strong> results
              </div>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => prev - 1)}
                  className="p-2 border border-white/[0.08] hover:border-brand-gold text-brand-gold rounded-sm disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page === pagination.last_page}
                  onClick={() => setPage(prev => prev + 1)}
                  className="p-2 border border-white/[0.08] hover:border-brand-gold text-brand-gold rounded-sm disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inquiry Detail Modal */}
      <InquiryDetailModal
        inquiry={selectedInquiry}
        onClose={handleCloseDetailModal}
        onStatusChange={handleStatusChange}
        onPaymentStatusChange={handlePaymentStatusChange}
        formatCurrency={formatCurrency}
        onPrintWaybill={handlePrintWaybill}
        onDownloadWaybill={handleDownloadWaybill}
      />
    </div>
  );
};
