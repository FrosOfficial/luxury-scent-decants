import { motion } from 'framer-motion';
import { Star, Clock, Droplets, ArrowRight, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useInquiryBag } from '../contexts/InquiryBagContext';

export default function ProductModal({ product, onClose, selectedVolume }) {
  // Access global inquiry bag state and functions
  const { addToBag } = useInquiryBag();
  const currentPrice = product.volumes.find(v => v.size === selectedVolume)?.price || product.volumes[0].price;

  // Add the current item to the bag and trigger a toast notification
  const handleInquiry = () => {
    const volPrice = product.volumes.find(v => v.size === selectedVolume) || product.volumes[0];

    addToBag(
      {
        id: product.id,
        name: product.name,
        brand: product.brand,
        image_url: product.image,
        scent_profile: product.scentProfile
      },
      {
        id: volPrice.id || `${product.id}-${volPrice.size}`,
        size: volPrice.size,
        price: volPrice.price
      },
      1
    );

    toast.success(`${product.name} (${selectedVolume}) added to inquiry bag!`, {
      style: { background: '#043927', color: '#fdfbf7', border: '1px solid #d4af37', borderRadius: '16px' },
      iconTheme: { primary: '#d4af37', secondary: '#043927' }
    });

    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Spring transition for physical popping effect when opening */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-brand-emerald-dark border border-brand-gold/30 rounded-2xl md:rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row relative"
        // Prevent click events from closing the modal when clicking inside it
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-brand-cream hover:text-brand-gold transition-colors"
        >
          <X size={20} />
        </button>

        {/* Product image layout */}
        <div className="md:w-5/12 relative aspect-square md:aspect-auto">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-t-2xl md:rounded-l-3xl md:rounded-tr-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-emerald-dark to-transparent opacity-60" />
        </div>

        {/* Product details panel */}
        <div className="md:w-7/12 p-6 md:p-10 flex flex-col gap-8">

          {/* Brand header and rating details */}
          <div>
            <span className="text-brand-gold font-bold uppercase tracking-widest text-xs mb-1 block">
              {product.brand}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-cream mb-2">
              {product.name}
            </h2>
            <div className="flex items-center gap-3 text-brand-cream/80 text-sm">
              <div className="flex items-center text-brand-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} className={i < Math.floor(product.rating) ? '' : 'opacity-40'} />
                ))}
              </div>
              <span className="font-bold text-brand-cream">{product.rating}</span>
              <span>({product.ratingCount} reviews)</span>
            </div>
          </div>

          {/* Performance sillage metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-emerald p-4 rounded-xl border border-brand-gold/10">
              <div className="flex items-center gap-2 text-brand-gold mb-2">
                <Clock size={16} />
                <span className="text-xs uppercase font-bold tracking-wider">Longevity</span>
              </div>
              <p className="text-brand-cream text-sm">{product.performance.longevity}</p>
            </div>
            <div className="bg-brand-emerald p-4 rounded-xl border border-brand-gold/10">
              <div className="flex items-center gap-2 text-brand-gold mb-2">
                <Droplets size={16} />
                <span className="text-xs uppercase font-bold tracking-wider">Sillage</span>
              </div>
              <p className="text-brand-cream text-sm">{product.performance.sillage}</p>
            </div>
          </div>

          {/* Seasonal recommendation matrix */}
          <div className="bg-brand-emerald p-5 rounded-xl border border-brand-gold/10">
            <h4 className="text-xs uppercase text-brand-gold font-bold tracking-wider mb-4">Optimal Usage</h4>
            <div className="flex justify-between items-center mb-4">
               <div className="flex gap-2">
                 <span className={`px-4 py-1 text-xs rounded-full font-medium ${product.usage.day ? 'bg-brand-gold text-brand-emerald-dark' : 'bg-brand-emerald-dark text-brand-cream/50 border border-brand-cream/10'}`}>Day</span>
                 <span className={`px-4 py-1 text-xs rounded-full font-medium ${product.usage.night ? 'bg-brand-gold text-brand-emerald-dark' : 'bg-brand-emerald-dark text-brand-cream/50 border border-brand-cream/10'}`}>Night</span>
               </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['spring', 'summer', 'autumn', 'winter'].map((season) => (
                <div key={season} className={`py-2 text-center text-xs rounded-lg uppercase tracking-wider font-medium ${product.usage.seasons[season] ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/50' : 'bg-brand-emerald-dark text-brand-cream/30'}`}>
                  {season}
                </div>
              ))}
            </div>
          </div>

          {/* Scent accord bar chart animated by framer-motion */}
          <div>
            <h4 className="text-xs uppercase text-brand-gold font-bold tracking-wider mb-4">Main Accords</h4>
            <div className="space-y-3">
              {product.mainAccords.map((accord, idx) => (
                <div key={idx} className="relative h-6 bg-brand-emerald rounded-full overflow-hidden flex items-center px-3 border border-brand-gold/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${accord.percentage}%` }}
                    transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                    className="absolute left-0 top-0 bottom-0 bg-brand-gold/30"
                  />
                  <span className="relative z-10 text-xs text-brand-cream uppercase tracking-wide">{accord.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed top, middle, and base notes */}
          <div>
            <h4 className="text-xs uppercase text-brand-gold font-bold tracking-wider mb-4">Scent Pyramid</h4>
            <div className="flex flex-col gap-3">
              <div className="flex gap-4">
                <span className="text-brand-gold/60 text-xs uppercase w-12 font-medium">Top</span>
                <span className="text-brand-cream/80 text-sm">{product.notes.top.join(', ')}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-brand-gold/60 text-xs uppercase w-12 font-medium">Mid</span>
                <span className="text-brand-cream/80 text-sm">{product.notes.middle.join(', ')}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-brand-gold/60 text-xs uppercase w-12 font-medium">Base</span>
                <span className="text-brand-cream/80 text-sm">{product.notes.base.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Price display and CTA button */}
          <div className="mt-auto pt-6 border-t border-brand-gold/20 flex items-center justify-between">
            <div>
              <span className="text-brand-cream/60 text-xs uppercase tracking-widest block mb-1">Total Price</span>
              <span className="text-3xl font-serif text-brand-gold">₱{currentPrice.toLocaleString()}</span>
            </div>
            <button
              onClick={handleInquiry}
              className="flex items-center gap-2 px-8 py-3 bg-brand-gold text-brand-emerald-dark font-bold uppercase tracking-widest text-sm rounded-full hover:bg-brand-gold-light transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
            >
              Add to Inquiry Bag <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}
