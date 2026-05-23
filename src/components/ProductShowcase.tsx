import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../data/products';
import ProductCard from './ProductCard';
import { ChevronDown, Search, X, SlidersHorizontal } from 'lucide-react';
import api, { mapDbProductToFrontend } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
type Size = '2ml' | '3ml' | '5ml' | '10ml' | '15ml' | '30ml';
type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'name-asc' | 'rating';

interface Filters {
  search: string;
  brands: string[];
  seasons: Array<'spring' | 'summer' | 'autumn' | 'winter'>;
  timeOfDay: Array<'day' | 'night'>;
  volumes: Size[];
  demographics: string[];
  sillage: string[];
  accords: string[];
}

const EMPTY_FILTERS: Filters = {
  search: '',
  brands: [],
  seasons: [],
  timeOfDay: [],
  volumes: [],
  demographics: [],
  sillage: [],
  accords: [],
};

const ALL_SIZES: Size[] = ['2ml', '3ml', '5ml', '10ml', '15ml', '30ml'];

const BROWSE_CATEGORIES = [
  { label: 'All Products', key: 'all' },
  { label: 'Luxury Perfumes', key: 'luxury' },
  { label: 'Perfume Bottles', key: 'bottles' },
  { label: 'Fragrance Decants', key: 'decants' },
];

// ─── Checkbox item ────────────────────────────────────────────────────────────
function CheckItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full text-left py-1 group"
    >
      <span className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
        active
          ? 'bg-brand-gold border-brand-gold'
          : 'border-brand-gold/30 group-hover:border-brand-gold/60'
      }`}>
        {active && (
          <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5">
            <path d="M1 4L3.5 6.5L9 1" stroke="#021c13" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={`text-xs transition-colors ${active ? 'text-brand-gold font-semibold' : 'text-brand-cream/60 group-hover:text-brand-cream'}`}>
        {label}
      </span>
    </button>
  );
}

// ─── Accordion section for sidebar ───────────────────────────────────────────
function SidebarSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-brand-gold/10">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3.5 group"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-brand-cream/70 group-hover:text-brand-gold transition-colors">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={`text-brand-gold/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{ maxHeight: open ? '800px' : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="pb-4 space-y-0.5">{children}</div>
      </div>
    </div>
  );
}

// ─── Sort dropdown ────────────────────────────────────────────────────────────
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A–Z' },
  { value: 'rating', label: 'Top Rated' },
];

import toast from 'react-hot-toast';

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductShowcase() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<SortKey>('recommended');
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Load products from local API on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const response = await api.get('/products');
        const dbProducts = Array.isArray(response.data) ? response.data : response.data.data || [];
        const mapped = dbProducts.map((p: any) => mapDbProductToFrontend(p));
        setProductsList(mapped);
      } catch (error) {
        console.error('Failed to load products from API:', error);
        toast.error('Could not load products from backend. Using offline catalog.');
        // Fallback to static products list
        const { products } = await import('../data/products');
        setProductsList(products);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const ALL_BRANDS = useMemo(() => [...new Set(productsList.map(p => p.brand))].sort(), [productsList]);
  const ALL_SILLAGE = useMemo(() => [...new Set(productsList.map(p => p.performance.sillage))].sort(), [productsList]);
  const ALL_ACCORDS = useMemo(() => [...new Set(productsList.flatMap(p => p.mainAccords.map(a => a.name)))].sort(), [productsList]);

  function toggle<T extends string>(key: keyof Filters, value: T) {
    setFilters(prev => {
      const arr = prev[key] as T[];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  }
  const isActive = <T extends string>(key: keyof Filters, value: T) => (filters[key] as T[]).includes(value);

  const activeFilterCount = useMemo(() =>
    filters.brands.length + filters.seasons.length + filters.timeOfDay.length +
    filters.volumes.length + filters.demographics.length + filters.sillage.length +
    filters.accords.length, [filters]);

  const hasActiveFilters = filters.search.trim() !== '' || activeFilterCount > 0;

  const filteredProducts = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    let list = productsList.filter(p => {
      if (q !== '' && !p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
      if (filters.brands.length > 0 && !filters.brands.includes(p.brand)) return false;
      if (filters.seasons.length > 0 && !filters.seasons.some(s => p.usage.seasons[s])) return false;
      if (filters.timeOfDay.includes('day') && !p.usage.day) return false;
      if (filters.timeOfDay.includes('night') && !p.usage.night) return false;
      if (filters.volumes.length > 0 && !filters.volumes.some(v => p.volumes.some(pv => pv.size === v))) return false;
      if (filters.demographics.length > 0 && !filters.demographics.includes(p.demographic)) return false;
      if (filters.sillage.length > 0 && !filters.sillage.includes(p.performance.sillage)) return false;
      if (filters.accords.length > 0 && !filters.accords.some(a => p.mainAccords.some(ma => ma.name === a))) return false;
      return true;
    });

    switch (sortBy) {
      case 'price-asc':  list = [...list].sort((a, b) => (a.volumes.find(v => v.size === '10ml')?.price ?? 0) - (b.volumes.find(v => v.size === '10ml')?.price ?? 0)); break;
      case 'price-desc': list = [...list].sort((a, b) => (b.volumes.find(v => v.size === '10ml')?.price ?? 0) - (a.volumes.find(v => v.size === '10ml')?.price ?? 0)); break;
      case 'name-asc':   list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'rating':     list = [...list].sort((a, b) => b.rating - a.rating); break;
    }
    return list;
  }, [productsList, filters, sortBy]);

  const SidebarContent = () => (
    <aside className="w-full">
      {/* Browse by */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gold/70 mb-3">Browse by</p>
        <ul className="space-y-1">
          {BROWSE_CATEGORIES.map(cat => (
            <li key={cat.key}>
              <button
                onClick={() => setActiveCategory(cat.key)}
                className={`text-sm w-full text-left py-1 transition-colors ${
                  activeCategory === cat.key ? 'text-brand-gold font-semibold' : 'text-brand-cream/50 hover:text-brand-cream'
                }`}
              >
                {activeCategory === cat.key && <span className="mr-1.5 text-brand-gold">›</span>}
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-brand-gold/10 pt-4 space-y-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gold/70 mb-3">Filters</p>

        <SidebarSection title="Brand" defaultOpen>
          {ALL_BRANDS.map(b => <CheckItem key={b} label={b} active={isActive('brands', b)} onClick={() => toggle('brands', b)} />)}
        </SidebarSection>

        <SidebarSection title="For" defaultOpen>
          {([['Masculine', 'Men'], ['Feminine', 'Women'], ['Unisex', 'Unisex']] as [string, string][]).map(([v, l]) => (
            <CheckItem key={v} label={l} active={isActive('demographics', v)} onClick={() => toggle('demographics', v)} />
          ))}
        </SidebarSection>

        <SidebarSection title="Season">
          {(['spring', 'summer', 'autumn', 'winter'] as const).map(s => (
            <CheckItem key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} active={isActive('seasons', s)} onClick={() => toggle('seasons', s)} />
          ))}
        </SidebarSection>

        <SidebarSection title="Time of Day">
          <CheckItem label="Day" active={isActive('timeOfDay', 'day')} onClick={() => toggle('timeOfDay', 'day')} />
          <CheckItem label="Night" active={isActive('timeOfDay', 'night')} onClick={() => toggle('timeOfDay', 'night')} />
        </SidebarSection>

        <SidebarSection title="Decant Size">
          {ALL_SIZES.map(s => <CheckItem key={s} label={s} active={isActive('volumes', s)} onClick={() => toggle('volumes', s)} />)}
          <button 
            onClick={() => setSizeGuideOpen(true)}
            className="mt-3 text-[10px] font-bold text-brand-gold uppercase tracking-widest hover:text-brand-gold-light transition-colors flex items-center justify-center gap-1.5 w-full py-2 bg-brand-emerald-dark/50 hover:bg-brand-emerald-dark border border-brand-gold/15 rounded-lg"
          >
            📏 View Size Guide
          </button>
        </SidebarSection>

        <SidebarSection title="Sillage">
          {ALL_SILLAGE.map(s => <CheckItem key={s} label={s} active={isActive('sillage', s)} onClick={() => toggle('sillage', s)} />)}
        </SidebarSection>

        <SidebarSection title="Main Accords" defaultOpen={false}>
          {ALL_ACCORDS.map(a => <CheckItem key={a} label={a} active={isActive('accords', a)} onClick={() => toggle('accords', a)} />)}
        </SidebarSection>
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => setFilters(EMPTY_FILTERS)}
          className="mt-5 w-full py-2.5 rounded-lg border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5"
        >
          <X size={13} /> Clear All Filters
        </button>
      )}
    </aside>
  );

  const activeSizeFilter = filters.volumes.length > 0 ? filters.volumes[filters.volumes.length - 1] : undefined;

  return (
    <div className="min-h-screen bg-brand-emerald-dark pt-16">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-brand-gold/10 bg-brand-emerald-dark">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
          {/* Breadcrumb */}
          <p className="text-xs text-brand-cream/35 mb-3 tracking-wide">
            Home &rsaquo; <span className="text-brand-cream/60">All Products</span>
          </p>

          {/* Banner */}
          <div
            className="w-full h-36 md:h-48 rounded-2xl overflow-hidden relative mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(120deg, #021c13 0%, #043927 50%, #021c13 100%)' }}
          >
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(ellipse at 70% 50%, #d4af37 0%, transparent 60%)' }} />
            {/* Decorative perfume bottle silhouettes */}
            <div className="absolute right-8 bottom-0 flex items-end gap-4 opacity-20">
              {[44, 28, 38].map(h => (
                <div key={h} className="w-6 rounded-t-full bg-brand-gold" style={{ height: `${h}px` }} />
              ))}
            </div>
            <div className="relative text-center z-10">
              <p className="text-brand-gold uppercase tracking-[0.4em] text-xs mb-2 font-medium">Curated Selection</p>
              <h1 className="text-3xl md:text-4xl font-serif text-brand-cream">All Products</h1>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex gap-8">

        {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
        <div className="hidden lg:block w-56 xl:w-64 shrink-0">
          <div
            id="filter-sidebar-scroll"
            className="sticky top-20 overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 6rem)' }}
          >
            <SidebarContent />
          </div>
        </div>

        {/* ── Right content area ───────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Topbar: search + count + sort + mobile filters */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gold/50 pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search…"
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-brand-emerald border border-brand-gold/15 text-brand-cream placeholder:text-brand-cream/30 text-sm focus:outline-none focus:border-brand-gold/50 transition-colors"
              />
              {filters.search && (
                <button onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-cream/30 hover:text-brand-gold transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Count */}
            <span className="text-brand-cream/40 text-sm shrink-0">
              <span className="text-brand-cream font-semibold">{filteredProducts.length}</span> products
            </span>

            {/* Sort dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setSortOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-emerald border border-brand-gold/15 text-brand-cream/70 text-sm hover:border-brand-gold/40 transition-colors"
              >
                Sort: <span className="text-brand-cream font-medium">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
                <ChevronDown size={14} className={`text-brand-gold/50 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-brand-emerald border border-brand-gold/20 rounded-xl shadow-2xl z-30 py-2 overflow-hidden"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sortBy === opt.value ? 'text-brand-gold font-semibold bg-brand-gold/10' : 'text-brand-cream/70 hover:text-brand-cream hover:bg-brand-emerald-dark'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Size Guide Button */}
            <button
              onClick={() => setSizeGuideOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-emerald border border-brand-gold/15 text-brand-cream/70 hover:border-brand-gold/40 hover:text-brand-gold transition-colors text-sm font-bold shrink-0"
            >
              <span>📏</span>
              <span className="hidden sm:inline">Size Guide</span>
              <span className="sm:hidden">Guide</span>
            </button>

            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold shrink-0 transition-colors ${
                activeFilterCount > 0
                  ? 'bg-brand-gold text-brand-emerald-dark border-brand-gold'
                  : 'bg-brand-emerald border-brand-gold/20 text-brand-cream/70 hover:border-brand-gold/50'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                ...filters.brands.map(v => ({ key: 'brands' as keyof Filters, value: v, label: v })),
                ...filters.demographics.map(v => ({ key: 'demographics' as keyof Filters, value: v, label: v })),
                ...filters.seasons.map(v => ({ key: 'seasons' as keyof Filters, value: v, label: v })),
                ...filters.timeOfDay.map(v => ({ key: 'timeOfDay' as keyof Filters, value: v, label: v })),
                ...filters.volumes.map(v => ({ key: 'volumes' as keyof Filters, value: v, label: v })),
                ...filters.sillage.map(v => ({ key: 'sillage' as keyof Filters, value: v, label: v })),
                ...filters.accords.map(v => ({ key: 'accords' as keyof Filters, value: v, label: v })),
              ].map(({ key, value, label }) => (
                <button
                  key={`${key}-${value}`}
                  onClick={() => toggle(key, value)}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/25 text-brand-gold text-xs font-semibold hover:bg-brand-gold/20 transition-colors capitalize"
                >
                  {label} <X size={11} />
                </button>
              ))}
            </div>
          )}

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-brand-emerald border border-brand-gold/10 rounded-2xl h-96 flex flex-col justify-between p-6">
                  <div className="aspect-square bg-brand-emerald-dark/60 rounded-xl mb-4 w-full h-48" />
                  <div className="space-y-3 flex-1">
                    <div className="h-3 bg-brand-gold/20 rounded w-1/3" />
                    <div className="h-5 bg-brand-cream/10 rounded w-3/4" />
                    <div className="h-3 bg-brand-cream/10 rounded w-1/2" />
                  </div>
                  <div className="h-10 bg-brand-gold/10 rounded-xl w-full mt-4" />
                </div>
              ))
            ) : (
              filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index} 
                  activeSizeFilter={activeSizeFilter} 
                />
              ))
            )}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-24 text-brand-cream/40">
              <p className="text-xl font-serif mb-2">No fragrances found</p>
              <p className="text-sm font-light">Try adjusting your filters or search query.</p>
              <button onClick={() => setFilters(EMPTY_FILTERS)}
                className="mt-6 px-6 py-2.5 rounded-xl border border-brand-gold/30 text-brand-gold text-sm hover:bg-brand-gold/10 transition-colors">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile slide-out sidebar ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              key="mobile-sidebar"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
              className="fixed top-0 left-0 h-full w-72 z-50 flex flex-col bg-[#021c13] border-r border-brand-gold/15 shadow-xl lg:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-brand-gold/10 shrink-0">
                <span className="text-sm font-bold uppercase tracking-widest text-brand-cream">Filters</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 text-brand-cream/50 hover:text-brand-cream">
                  <X size={17} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-3">
                <SidebarContent />
              </div>
              <div className="px-5 py-4 border-t border-brand-gold/10 shrink-0">
                <button onClick={() => setMobileSidebarOpen(false)}
                  className="w-full py-3 rounded-xl bg-brand-gold text-brand-emerald-dark text-sm font-bold uppercase tracking-wider">
                  Show {filteredProducts.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottle Size Guide Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {sizeGuideOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setSizeGuideOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-[#021c13] border border-brand-gold/30 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gold/15 bg-[#011611] shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📏</span>
                  <div>
                    <h3 className="font-serif text-brand-cream text-base md:text-lg leading-tight">Decant Size Reference Guide</h3>
                    <p className="text-[10px] text-brand-gold uppercase tracking-widest mt-0.5">Find your perfect bottle volume</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSizeGuideOpen(false)}
                  className="p-1.5 rounded-full hover:bg-brand-gold/10 text-brand-cream/60 hover:text-brand-gold transition-colors"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col items-center gap-5">
                <div className="relative rounded-xl overflow-hidden border border-brand-gold/20 bg-brand-emerald-dark shadow-inner max-w-sm w-full">
                  <img 
                    src="/Images/size-reference.jpg" 
                    alt="Decant bottle size reference" 
                    className="w-full h-auto object-contain"
                  />
                </div>
                
                {/* Description Text */}
                <div className="text-center max-w-sm">
                  <p className="text-xs text-brand-cream/70 leading-relaxed font-light">
                    Our decants are prepared fresh upon order from 100% authentic designer fragrances, decanted into premium glass bottles. Labeled from <strong className="text-brand-gold font-bold">2ml to 30ml</strong> to match your preference.
                  </p>
                </div>

                {/* Legend list */}
                <div className="grid grid-cols-3 gap-2.5 w-full text-center">
                  {[
                    { ml: '2ml / 3ml', usage: 'Pocket size (~35-50 sprays)' },
                    { ml: '5ml / 10ml', usage: 'Travel size (~75-150 sprays)' },
                    { ml: '15ml / 30ml', usage: 'Full use (~220-450 sprays)' }
                  ].map(item => (
                    <div key={item.ml} className="p-2.5 bg-brand-emerald/40 border border-brand-gold/10 rounded-xl">
                      <div className="text-brand-gold text-xs font-bold font-serif mb-0.5">{item.ml}</div>
                      <div className="text-[8px] text-brand-cream/50 leading-tight uppercase font-medium">{item.usage}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-brand-gold/15 bg-[#011611] shrink-0 flex justify-end">
                <button
                  onClick={() => setSizeGuideOpen(false)}
                  className="px-6 py-2 rounded-xl bg-brand-gold hover:bg-brand-gold-light text-brand-emerald-dark text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
