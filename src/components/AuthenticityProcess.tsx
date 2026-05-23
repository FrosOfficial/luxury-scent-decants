import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, AlertCircle, Play, ExternalLink } from 'lucide-react';

export default function AuthenticityProcess() {
  const facebookVideoUrl = "https://www.facebook.com/profile.php?id=61576288857544";

  return (
    <section className="py-24 bg-gradient-to-b from-[#011611] to-brand-emerald-dark px-4 relative overflow-hidden">
      {/* Decorative Gold Blurs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-emerald-light/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* ── Left Column: Text & Guarantees (7 Cols) ───────────────────── */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/20 bg-brand-gold/5 text-brand-gold text-xs font-bold tracking-widest uppercase font-sans"
              >
                <ShieldCheck size={14} />
                <span>100% Purity Guaranteed</span>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl xl:text-6xl font-serif text-brand-cream leading-tight tracking-wide"
              >
                Our Decanting <br/>
                <span className="text-brand-gold">Craft & Precision</span>
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-brand-cream/70 text-sm md:text-base font-light leading-relaxed max-w-2xl font-sans"
            >
              Every decant is a ritual of absolute precision. We handle your favorite designer and niche fragrances with medical-grade hygiene, ensuring that what reaches your doorstep is identical to the original perfume house bottle.
            </motion.p>

            {/* Quality Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-brand-gold/10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2.5 text-brand-gold">
                  <Sparkles size={16} />
                  <h4 className="text-xs font-bold tracking-widest uppercase">Sterile Workspace</h4>
                </div>
                <p className="text-xs text-brand-cream/60 leading-relaxed font-sans font-light">
                  Hand-decanted using clinical syringes under strict sanitary guidelines. No exposure to air or contamination.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2.5 text-brand-gold">
                  <ShieldCheck size={16} />
                  <h4 className="text-xs font-bold tracking-widest uppercase">100% Authentic</h4>
                </div>
                <p className="text-xs text-brand-cream/60 leading-relaxed font-sans font-light">
                  Direct transfer from authentic designer perfume bottles. Never diluted, never altered, strictly raw juice.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2.5 text-brand-gold">
                  <AlertCircle size={16} />
                  <h4 className="text-xs font-bold tracking-widest uppercase">Premium Glass</h4>
                </div>
                <p className="text-xs text-brand-cream/60 leading-relaxed font-sans font-light">
                  We use heavy, high-grade glass atomizers with premium spray nozzles that deliver a fine, luxurious mist.
                </p>
              </motion.div>
            </div>
          </div>

          {/* ── Right Column: Video/Post Preview (5 Cols) ─────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            {/* Visual Glassmorphic Border Frame */}
            <div className="absolute inset-0 bg-brand-gold/10 rounded-3xl blur-[1px] pointer-events-none border border-brand-gold/20 scale-102" />
            
            <div className="relative rounded-3xl overflow-hidden bg-brand-emerald border border-brand-gold/20 shadow-2xl group flex flex-col">
              {/* Card Banner / Poster */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/40">
                {/* Background image previewing the packaging process */}
                <img 
                  src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800"
                  alt="Packaging Decant Video Poster"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                />
                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                
                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <a 
                    href={facebookVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 h-16 rounded-full border border-brand-gold/40 bg-brand-emerald-dark/80 text-brand-gold flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:border-brand-gold hover:shadow-brand-gold/30 hover:bg-brand-emerald-dark"
                  >
                    <Play size={24} className="fill-brand-gold ml-1 animate-pulse" />
                  </a>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-6 left-6 right-6 text-left">
                  <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-brand-gold mb-1 block font-sans">
                    Behind The Scenes
                  </span>
                  <h3 className="font-serif text-lg text-brand-cream leading-tight">
                    Bleu de Chanel & LV Ombre Nomade packaging for a valued client.
                  </h3>
                </div>
              </div>

              {/* Card Footer Call to Action */}
              <div className="p-5 bg-brand-emerald-dark/80 backdrop-blur-md flex items-center justify-between gap-4 border-t border-brand-gold/15">
                <div className="text-left">
                  <p className="text-xs text-brand-cream/60 font-sans">Watch live packaging on</p>
                  <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mt-0.5">Facebook Video</p>
                </div>
                <a 
                  href={facebookVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-brand-gold text-brand-emerald-dark font-sans font-bold text-[10px] tracking-widest uppercase rounded-lg hover:bg-brand-gold-light transition-all flex items-center gap-1.5 shadow-md"
                >
                  <span>Watch Video</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
