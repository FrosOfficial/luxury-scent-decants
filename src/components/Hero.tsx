import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '../data/products';

type Page = 'home' | 'shop' | 'faq';
interface HeroProps { onNavigate: (page: Page) => void; }

// ─── LV bottle data (Images5 official press shots) ────────────────────────
const LV_BOTTLES = [
  {
    src:         '/Images/louis-vuitton/louis-vuitton-imagination--LP0219_PM2_Front view.webp',
    name:        'Imagination',
    tagline:     'The freedom of the open sky',
    accords:     ['Aquatic', 'Woody', 'Citrus'],
    bottleTint:  'rgba(160,220,200,0.13)',
  },
  {
    src:         '/Images/louis-vuitton/louis-vuitton-ombre-nomade--LP0095_PM2_Front view.webp',
    name:        'Ombre Nomade',
    tagline:     'A journey through ancient souks',
    accords:     ['Oud', 'Smoky', 'Woody'],
    bottleTint:  'rgba(140,70,10,0.16)',
  },
  {
    src:         '/Images/louis-vuitton/louis-vuitton-symphony--LP0249_PM2_Front view.webp',
    name:        'Symphony',
    tagline:     'An ode to feminine florals',
    accords:     ['Floral', 'Powdery', 'Sweet'],
    bottleTint:  'rgba(200,150,215,0.13)',
  },
];

// Prices from products.ts
const lvPrices = Object.fromEntries(
  LV_BOTTLES.map(b => [
    b.name,
    products.find(p => p.brand === 'Louis Vuitton' && p.name === b.name)?.volumes ?? [],
  ])
);

// ─── Variants ─────────────────────────────────────────────────────────────
const bottleVariants = {
  enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 70 : -70, scale: 0.93 }),
  center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.42, ease: 'easeOut' } },
  exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -70 : 70, scale: 0.93, transition: { duration: 0.28, ease: 'easeIn' } }),
};

const infoVariants = {
  enter:  { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:   { opacity: 0, y: -8, transition: { duration: 0.22, ease: 'easeIn' } },
};

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 18 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
});

const goldText: React.CSSProperties = {
  background: 'linear-gradient(90deg,#bf953f,#fcf6ba,#b38728,#fcf6ba,#aa771c)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

export default function Hero({ onNavigate }: HeroProps) {
  const [idx,    setIdx]    = useState(0);
  const [dir,    setDir]    = useState(1);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const bottle  = LV_BOTTLES[idx];
  const volumes = lvPrices[bottle.name];

  // Auto-cycle every 5 s, pause on hover
  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => {
      setDir(1);
      setIdx(i => (i + 1) % LV_BOTTLES.length);
    }, 5000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [paused, idx]);

  // Keyboard arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setDir(-1);
        setIdx(i => (i - 1 + LV_BOTTLES.length) % LV_BOTTLES.length);
        if (timer.current) clearInterval(timer.current);
      } else if (e.key === 'ArrowRight') {
        setDir(1);
        setIdx(i => (i + 1) % LV_BOTTLES.length);
        if (timer.current) clearInterval(timer.current);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const goTo = (target: number) => {
    setDir(target > idx ? 1 : -1);
    setIdx(target);
    if (timer.current) clearInterval(timer.current);
  };

  return (
    <section
      className="relative w-full min-h-[92vh] flex flex-col items-center justify-center overflow-hidden pt-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Static amber/gold background ──────────────────────────────────── */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg,#1a0d00 0%,#3b1f00 35%,#2a1500 65%,#0d0600 100%)' }} />

      {/* Ambient gold glows */}
      <div className="absolute inset-0 opacity-[0.09] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 15% 50%,#d4af37 0%,transparent 55%), radial-gradient(circle at 85% 30%,#a07010 0%,transparent 55%)' }} />

      {/* Per-bottle colour tint — cross-fades */}
      <AnimatePresence mode="sync">
        <motion.div key={`tint-${idx}`} className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ background: `radial-gradient(circle at 50% 65%,${bottle.bottleTint} 0%,transparent 70%)` }} />
      </AnimatePresence>

      {/* Gold shimmer top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-50 z-10" />

      {/* ── Three-column layout ────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto flex-1 flex items-center">
        <div className="w-full px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-[1fr_1.3fr_1fr] gap-6 items-center">

          {/* ── LEFT: static brand copy + per-bottle info ──────────────────── */}
          <div className="flex flex-col gap-4 text-center md:text-left">
            <motion.p {...fadeUp(0.04)} className="text-brand-gold uppercase tracking-[0.35em] text-xs font-bold">
              ✦ Exclusive Collection ✦
            </motion.p>

            <motion.h1 {...fadeUp(0.1)}
              className="text-5xl md:text-6xl xl:text-7xl font-serif leading-[0.92] tracking-tight"
              style={{ color: '#f5e6c8' }}
            >
              BEST<br />
              <span style={goldText}>SELLERS</span>
            </motion.h1>

            <motion.p {...fadeUp(0.16)} className="text-sm md:text-base font-light leading-relaxed"
              style={{ color: 'rgba(245,230,200,0.62)' }}>
              Three iconic Louis Vuitton masterpieces — cycle through and discover your signature.
            </motion.p>

            {/* Per-bottle: name, tagline, accord pills, prices */}
            <AnimatePresence mode="wait">
              <motion.div key={`info-${idx}`} variants={infoVariants}
                initial="enter" animate="center" exit="exit"
                className="flex flex-col gap-3 mt-1"
              >
                <div>
                  <p className="text-brand-gold font-serif text-2xl leading-tight">{bottle.name}</p>
                  <p className="text-[11px] uppercase tracking-widest mt-0.5"
                    style={{ color: 'rgba(245,230,200,0.45)' }}>{bottle.tagline}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                  {bottle.accords.map(a => (
                    <span key={a}
                      className="px-2.5 py-0.5 rounded-full border border-brand-gold/30 text-brand-gold text-[10px] font-bold uppercase tracking-wider">
                      {a}
                    </span>
                  ))}
                </div>

                {volumes.length > 0 && (
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    {volumes.filter(v => ['5ml','10ml','30ml'].includes(v.size)).map(v => (
                      <div key={v.size} className="text-center">
                        <div className="text-brand-gold text-base font-bold">₱{v.price.toLocaleString()}</div>
                        <div className="text-[10px] uppercase tracking-widest"
                          style={{ color: 'rgba(245,230,200,0.4)' }}>{v.size}</div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── CENTER: Big animated bottle + inner dot nav ─────────────────── */}
          <div className="relative flex items-center justify-center h-[420px] md:h-[540px]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={`bottle-${idx}`} custom={dir}
                variants={bottleVariants} initial="enter" animate="center" exit="exit"
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  animate={{ y: [0, -14, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <img
                    src={bottle.src}
                    alt={bottle.name}
                    draggable={false}
                    className="object-contain select-none"
                    style={{
                      height:   'min(460px, 70vh)',
                      width:    'auto',
                      maxWidth: '360px',
                      filter:   'drop-shadow(0 44px 64px rgba(0,0,0,0.72)) drop-shadow(0 12px 24px rgba(212,175,55,0.2))',
                    }}
                  />
                  {/* Glow puddle beneath bottle */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full blur-3xl"
                    style={{ width: '50%', height: '24px', background: 'rgba(212,175,55,0.22)' }} />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Inner bottle dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {LV_BOTTLES.map((b, i) => (
                <button key={b.name} onClick={() => goTo(i)} aria-label={b.name}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width:      i === idx ? '22px' : '7px',
                    height:     '7px',
                    background: i === idx ? '#d4af37' : 'rgba(253,251,247,0.28)',
                    boxShadow:  i === idx ? '0 0 8px rgba(212,175,55,0.55)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── RIGHT: House info + CTA ──────────────────────────────────────── */}
          <div className="flex flex-col gap-5 items-center md:items-end text-center md:text-right">
            <motion.div {...fadeUp(0.08)}>
              <p className="text-xs uppercase tracking-[0.4em] mb-1"
                style={{ color: 'rgba(245,230,200,0.42)' }}>House of</p>
              <h2 className="text-3xl md:text-4xl font-serif" style={{ color: '#f5e6c8' }}>
                Louis<br />Vuitton
              </h2>
            </motion.div>

            <motion.div {...fadeUp(0.14)} className="w-10 h-[1px]"
              style={{ background: '#d4af37', opacity: 0.45 }} />

            {/* Tagline synced to active bottle */}
            <AnimatePresence mode="wait">
              <motion.p key={`tagline-${idx}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}
                className="text-base md:text-lg font-light italic"
                style={{ color: 'rgba(245,230,200,0.65)' }}>
                "{bottle.tagline}"
              </motion.p>
            </AnimatePresence>

            <motion.p {...fadeUp(0.22)} className="text-sm font-light leading-relaxed max-w-xs"
              style={{ color: 'rgba(245,230,200,0.48)' }}>
              Crafted in Grasse, France — each Louis Vuitton fragrance is a rare olfactory journey bottled in exclusivity.
            </motion.p>

            <motion.button {...fadeUp(0.28)}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('shop')}
              className="px-10 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-sm"
              style={{
                background: 'linear-gradient(135deg,#d4af37,#f5e6a0,#b38728)',
                color:      '#1a0d00',
                boxShadow:  '0 8px 30px rgba(212,175,55,0.45)',
              }}>
              Shop Now →
            </motion.button>

            <motion.button {...fadeUp(0.34)} onClick={() => onNavigate('shop')}
              className="text-xs uppercase tracking-[0.25em] hover:text-brand-gold transition-colors"
              style={{ color: 'rgba(245,230,200,0.38)' }}>
              View All 78 Fragrances
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom fade to page background */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom,transparent,#011611)' }} />
    </section>
  );
}
