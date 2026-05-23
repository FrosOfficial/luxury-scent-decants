import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../data/products';
import { Search } from 'lucide-react';
import ProductModal from './ProductModal';

interface ProductCardProps {
  product: Product;
  index: number;
  activeSizeFilter?: string;
}

export default function ProductCard({ product, index, activeSizeFilter }: ProductCardProps) {
  const [selectedVolume, setSelectedVolume] = useState<string>(product.volumes[0].size);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (activeSizeFilter && product.volumes.some(v => v.size === activeSizeFilter)) {
      setSelectedVolume(activeSizeFilter);
    }
  }, [activeSizeFilter, product.volumes]);

  const currentPrice = product.volumes.find(v => v.size === selectedVolume)?.price || 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.3, delay: Math.min(index, 7) * 0.06 }}
        className="group relative bg-brand-emerald border border-brand-gold/10 rounded-2xl overflow-hidden hover:border-brand-gold/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-300 flex flex-col h-full"
      >
        <div 
          className="aspect-square relative overflow-hidden cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-emerald-dark via-brand-emerald-dark/20 to-transparent opacity-80" />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="px-3 py-1 bg-brand-emerald-dark/80 backdrop-blur text-brand-gold text-[10px] uppercase font-bold tracking-widest rounded-full border border-brand-gold/20">
              {product.scentProfile}
            </span>
            <span className="px-3 py-1 bg-brand-emerald-dark/80 backdrop-blur text-brand-cream/80 text-[10px] uppercase font-bold tracking-widest rounded-full border border-brand-gold/10">
              {product.demographic === 'Masculine' ? 'For Men' : product.demographic === 'Feminine' ? 'For Women' : 'Unisex'}
            </span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-brand-emerald/90 backdrop-blur-sm border border-brand-gold flex items-center justify-center text-brand-gold transform scale-75 group-hover:scale-100 transition-all duration-300">
              <Search size={20} />
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <span className="text-brand-gold/80 text-xs font-bold uppercase tracking-widest mb-1">{product.brand}</span>
          <h3 className="text-xl md:text-2xl font-serif text-brand-cream mb-4 line-clamp-2">{product.name}</h3>
          
          <div className="mt-auto">
            {/* Volume Selection Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.volumes.map((vol) => (
                <button
                  key={vol.size}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVolume(vol.size);
                  }}
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors border ${
                    selectedVolume === vol.size
                      ? 'bg-brand-gold text-brand-emerald-dark border-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                      : 'bg-brand-emerald-dark text-brand-cream/60 border-brand-gold/20 hover:border-brand-gold/50 hover:text-brand-cream'
                  }`}
                >
                  {vol.size}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-end pt-4 border-t border-brand-gold/10">
              <div className="flex flex-col">
                <span className="text-brand-cream/50 text-[10px] uppercase tracking-widest mb-1">Decant Price</span>
                <span className="text-brand-gold text-xl font-medium">₱{currentPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <ProductModal 
            product={product} 
            onClose={() => setIsModalOpen(false)} 
            selectedVolume={selectedVolume} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
