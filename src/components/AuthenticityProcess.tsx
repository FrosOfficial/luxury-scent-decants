import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, Droplet } from 'lucide-react';

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

const videoList = [
  {
    id: 'fb-video-0',
    reelUrl: 'https://www.facebook.com/reel/4438367186422327/',
    iframeUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F4438367186422327%2F&show_text=false&width=267&t=0',
    title: 'Nautica Voyage'
  },
  {
    id: 'fb-video-1',
    reelUrl: 'https://www.facebook.com/reel/1561286295439086/',
    iframeUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1561286295439086%2F&show_text=false&width=267&t=0',
    title: 'Louis Vuitton Imagination'
  },
  {
    id: 'fb-video-2',
    reelUrl: 'https://www.facebook.com/reel/1490751416034494/',
    iframeUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1490751416034494%2F&show_text=false&width=267&t=0',
    title: 'Creed Aventus and Creed Cologne'
  }
];

export default function AuthenticityProcess() {
  const [useFallback, setUseFallback] = useState(false);
  const playersRef = useRef<{ [key: string]: any }>({});
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Start a 3.5s timeout. If XFBML hasn't parsed successfully in this time,
    // we use standard bulletproof iframes as a fallback.
    timerRef.current = setTimeout(() => {
      console.log('FB SDK load timeout, falling back to static iframes.');
      setUseFallback(true);
    }, 3500);

    // Set up global SDK callback
    window.fbAsyncInit = function() {
      if (!window.FB) return;
      
      window.FB.init({
        xfbml: true,
        version: 'v18.0'
      });

      // Listen for players to become ready
      window.FB.Event.subscribe('xfbml.ready', function(msg: any) {
        if (msg.type === 'video') {
          console.log('FB Player Ready:', msg.id);
          playersRef.current[msg.id] = msg.instance;
          
          // Once at least one FB player is ready, disable the fallback
          setUseFallback(false);
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }

          // Subscribe to finishedPlaying event
          msg.instance.subscribe('finishedPlaying', () => {
            console.log('Video finished:', msg.id);
            const currentIndex = parseInt(msg.id.replace('fb-video-', ''));
            const nextIndex = (currentIndex + 1) % videoList.length;
            const nextPlayer = playersRef.current[`fb-video-${nextIndex}`];
            if (nextPlayer) {
              console.log('Autoplay next:', `fb-video-${nextIndex}`);
              nextPlayer.play();
            }
          });
        }
      });
    };

    // Inject Facebook SDK if not already present
    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.async = true;
      js.defer = true;
      document.body.appendChild(js);
    } else if (window.FB) {
      // If already present, parse the page for fb-video elements and clear timer if already loaded
      window.FB.XFBML.parse();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-[#011611] to-brand-emerald-dark px-4 relative overflow-hidden">
      {/* Decorative Gold Blurs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-emerald-light/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* ── Top Header Section ─────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/20 bg-brand-gold/5 text-brand-gold text-xs font-bold tracking-widest uppercase font-sans mx-auto"
          >
            <ShieldCheck size={14} />
            <span>100% Purity Guaranteed</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-cream leading-tight tracking-wide"
          >
            Our Decanting <span className="text-brand-gold">Craft & Precision</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-brand-cream/70 text-sm md:text-base font-light leading-relaxed max-w-2xl mx-auto font-sans"
          >
            Every decant is a ritual of absolute precision. We handle your favorite designer and niche fragrances with medical-grade hygiene, ensuring that what reaches your doorstep is identical to the original perfume house bottle.
          </motion.p>
        </div>

        {/* ── Main Content Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: 3 Guarantees (Stacked) (4/12 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ x: 6, borderColor: 'rgba(212, 175, 55, 0.4)' }}
              className="p-5 rounded-2xl bg-brand-emerald-dark/40 border border-brand-gold/15 backdrop-blur-md transition-all duration-300 flex gap-4 text-left group"
            >
              <div className="text-brand-gold p-3 rounded-xl bg-brand-gold/5 border border-brand-gold/10 h-fit transition-colors group-hover:bg-brand-gold/10">
                <Droplet size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold tracking-widest uppercase text-brand-cream">Clean Workspace</h4>
                <p className="text-xs text-brand-cream/60 leading-relaxed font-sans font-light">
                  Decanted with sterile syringes in a super clean space. No air or dirt gets in. Just pure untouched perfume.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ x: 6, borderColor: 'rgba(212, 175, 55, 0.4)' }}
              className="p-5 rounded-2xl bg-brand-emerald-dark/40 border border-brand-gold/15 backdrop-blur-md transition-all duration-300 flex gap-4 text-left group"
            >
              <div className="text-brand-gold p-3 rounded-xl bg-brand-gold/5 border border-brand-gold/10 h-fit transition-colors group-hover:bg-brand-gold/10">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold tracking-widest uppercase text-brand-cream">100% Authentic</h4>
                <p className="text-xs text-brand-cream/60 leading-relaxed font-sans font-light">
                  Straight from the original bottle to yours. We never dilute or alter anything. You're getting 100% raw, authentic fragrance, always.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ x: 6, borderColor: 'rgba(212, 175, 55, 0.4)' }}
              className="p-5 rounded-2xl bg-brand-emerald-dark/40 border border-brand-gold/15 backdrop-blur-md transition-all duration-300 flex gap-4 text-left group"
            >
              <div className="text-brand-gold p-3 rounded-xl bg-brand-gold/5 border border-brand-gold/10 h-fit transition-colors group-hover:bg-brand-gold/10">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold tracking-widest uppercase text-brand-cream">Premium Glass</h4>
                <p className="text-xs text-brand-cream/60 leading-relaxed font-sans font-light">
                  No cheap plastic here. We only use thick, premium glass bottles with high-quality sprayers that give you a perfect, satisfying mist.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: 3-Video Collage (8/12 Cols) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 justify-center justify-items-center">
              {videoList.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col items-center gap-4 p-3.5 rounded-2xl bg-brand-emerald-dark/60 border border-brand-gold/15 shadow-2xl group hover:border-brand-gold/30 transition-all duration-300 w-full max-w-[295px]"
                >
                  {/* Outer border container */}
                  <div className="w-[267px] h-[476px] rounded-xl overflow-hidden bg-black/40 relative shadow-inner flex items-center justify-center">
                    {useFallback ? (
                      <iframe
                        src={video.iframeUrl}
                        width="267"
                        height="476"
                        style={{ border: 'none', overflow: 'hidden' }}
                        scrolling="no"
                        frameBorder="0"
                        allowFullScreen={true}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        id={video.id}
                        className="fb-video"
                        data-href={video.reelUrl}
                        data-width="267"
                        data-height="476"
                        data-show-text="false"
                        data-autoplay="false"
                        data-allowfullscreen="true"
                      />
                    )}
                  </div>
                  
                  {/* Bottom Video Metadata */}
                  <div className="text-center space-y-0.5">
                    <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-brand-gold block">
                      Authenticity Reel 0{index + 1}
                    </span>
                    <h4 className="text-xs font-medium text-brand-cream/80 font-sans tracking-wide">
                      {video.title}
                    </h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
