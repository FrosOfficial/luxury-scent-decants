import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useInquiryBag } from '../contexts/InquiryBagContext';

export default function InquiryBag({ isOpen, onClose, onProceedToForm }) {
  const { items, removeFromBag, updateQuantity, totalEstimatedPrice, totalItemsCount } = useInquiryBag();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-hidden"
        >
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md pointer-events-auto"
            >
              <div
                className="h-full flex flex-col shadow-2xl border-l border-brand-gold/15"
                style={{ background: 'linear-gradient(to bottom, #021c13, #011611)' }}
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-brand-gold/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={18} className="text-brand-gold" />
                    <h3 className="font-serif text-lg text-brand-cream">
                      Inquiry <span className="text-brand-gold">Bag</span>
                    </h3>
                    <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                      {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full border border-brand-cream/10 text-brand-cream/60 hover:text-brand-gold hover:border-brand-gold/30 transition-all duration-200"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" id="filter-sidebar-scroll">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                      <div className="w-16 h-16 rounded-full border border-brand-gold/10 flex items-center justify-center mb-4 text-brand-cream/20">
                        <ShoppingBag size={28} />
                      </div>
                      <p className="text-sm font-medium text-brand-cream/60">Your inquiry bag is empty.</p>
                      <p className="text-xs text-brand-cream/30 mt-1 max-w-[200px]">Add exquisite scent decants from our collection to begin.</p>
                      <button
                        onClick={onClose}
                        className="mt-6 px-5 py-2.5 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/20 text-brand-gold rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
                      >
                        Keep Exploring
                      </button>
                    </div>
                  ) : (
                    items.map((item, index) => (
                      <motion.div
                        key={`${item.product.id}-${item.volumePricing.id}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-4 p-4 rounded-xl bg-brand-emerald-dark/40 border border-brand-gold/5 hover:border-brand-gold/10 transition-all duration-200 group relative"
                      >
                        {/* Image */}
                        <div className="w-16 h-20 rounded-lg overflow-hidden border border-brand-gold/10 bg-brand-emerald-dark shrink-0">
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <span className="text-[9px] font-bold text-brand-gold tracking-widest uppercase block mb-0.5">
                              {item.product.brand}
                            </span>
                            <h4 className="font-serif text-sm text-brand-cream truncate pr-6 group-hover:text-brand-gold transition-colors">
                              {item.product.name}
                            </h4>
                            <span className="text-[10px] text-brand-cream/50 font-sans block mt-0.5">
                              Decant Size: <strong className="text-brand-cream/80">{item.volumePricing.size}</strong>
                            </span>
                          </div>

                          {/* Controls & Price */}
                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center rounded-lg border border-brand-gold/15 bg-brand-emerald-dark/80 px-1 py-0.5">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.volumePricing.id, item.quantity - 1)}
                                className="p-1 hover:text-brand-gold text-brand-cream/60 transition-colors"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="px-2 text-xs font-bold text-brand-cream min-w-[20px] text-center font-sans">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.volumePricing.id, item.quantity + 1)}
                                className="p-1 hover:text-brand-gold text-brand-cream/60 transition-colors"
                              >
                                <Plus size={10} />
                              </button>
                            </div>

                            {/* Price */}
                            <span className="font-sans text-xs font-black text-brand-cream/90">
                              ₱{(item.volumePricing.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromBag(item.product.id, item.volumePricing.id)}
                          className="absolute top-3 right-3 text-brand-cream/20 hover:text-red-400 p-1 transition-colors rounded-full"
                          aria-label="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Footer / Summary */}
                {items.length > 0 && (
                  <div className="px-6 py-6 border-t border-brand-gold/10 bg-brand-emerald-dark/60 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-brand-cream/60 font-sans tracking-wide">Estimated Total:</span>
                      <span className="font-serif text-lg text-brand-gold font-bold">
                        ₱{totalEstimatedPrice.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-[10px] text-brand-cream/40 leading-relaxed text-center">
                      * No payments are made on this website. Submitting will register your inquiry &amp; let you copy order details directly to Messenger.
                    </p>

                    <button
                      onClick={onProceedToForm}
                      className="w-full py-4 bg-brand-gold/90 hover:bg-brand-gold text-brand-emerald-dark rounded-xl text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 group transform active:scale-[0.98]"
                    >
                      <span>Proceed to Inquiry</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
