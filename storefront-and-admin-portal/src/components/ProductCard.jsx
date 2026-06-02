import { useState, useEffect } from 'react';

export default function ProductCard({ product, index, activeSizeFilter, onSelect }) {
  const hasVolumes = Array.isArray(product.volumes) && product.volumes.length > 0;
  // Track currently selected decant volume (e.g. 5ml, 10ml)
  const [selectedVolume, setSelectedVolume] = useState(hasVolumes ? product.volumes[0].size : '');

  // Automatically update the selected volume pill if the user applies a size filter in the sidebar
  useEffect(() => {
    if (activeSizeFilter && hasVolumes && product.volumes.some(v => v.size === activeSizeFilter)) {
      setSelectedVolume(activeSizeFilter);
    }
  }, [activeSizeFilter, product.volumes, hasVolumes]);

  // Find the price matching the selected volume size
  const currentPrice = hasVolumes ? (product.volumes.find(v => v.size === selectedVolume)?.price || 0) : 0;

  return (
    <div
      className="group relative bg-brand-emerald border border-brand-gold/10 rounded-2xl overflow-hidden hover:border-brand-gold/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-300 flex flex-col h-full card-fade-in"
      // Stagger card fade-in animation based on loop index
      style={{ animationDelay: `${Math.min(index, 7) * 60}ms` }}
    >
      <div
        className="aspect-square relative overflow-hidden cursor-pointer"
        onClick={() => onSelect(product, selectedVolume)}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={400}
          height={400}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-emerald-dark via-brand-emerald-dark/20 to-transparent opacity-80" />

        {/* Scent tags and demographic tags */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1 bg-brand-emerald-dark/80 backdrop-blur text-brand-gold text-[10px] uppercase font-bold tracking-widest rounded-full border border-brand-gold/20">
            {product.scentProfile}
          </span>
          <span className="px-3 py-1 bg-brand-emerald-dark/80 backdrop-blur text-brand-cream/80 text-[10px] uppercase font-bold tracking-widest rounded-full border border-brand-gold/10">
            {product.demographic === 'Masculine' ? 'For Men' : product.demographic === 'Feminine' ? 'For Women' : 'Unisex'}
          </span>
        </div>

        {/* Hover zoom magnifying glass icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-brand-emerald/90 backdrop-blur-sm border border-brand-gold flex items-center justify-center text-brand-gold transform scale-75 group-hover:scale-100 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <span className="text-brand-gold/80 text-xs font-bold uppercase tracking-widest mb-1">{product.brand}</span>
        <h3 className="text-xl md:text-2xl font-serif text-brand-cream mb-4 line-clamp-2">{product.name}</h3>

        <div className="mt-auto">
          {/* Decant volume selectors */}
          <div className="flex flex-wrap gap-2 mb-4">
            {hasVolumes ? (
              product.volumes.map((vol) => (
                <button
                  key={vol.size}
                  onClick={(e) => {
                    // Prevent opening the modal when clicking volume selector pills
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
              ))
            ) : (
              <span className="text-brand-cream/40 text-xs italic">Pricing unavailable</span>
            )}
          </div>

          {/* Pricing detail footer */}
          <div className="flex justify-between items-end pt-4 border-t border-brand-gold/10">
            <div className="flex flex-col">
              <span className="text-brand-cream/50 text-[10px] uppercase tracking-widest mb-1">Decant Price</span>
              <span className="text-brand-gold text-xl font-medium">
                {hasVolumes ? `₱${currentPrice.toLocaleString()}` : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
