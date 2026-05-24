import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 15);

    const timer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-emerald-dark"
    >
      {/* Subtle luxury ambient gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center relative z-10 w-full max-w-xs"
      >
        {/* Concentric pulsing gold rings representing scent dispersion */}
        <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border border-brand-gold/30" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-2 rounded-full border border-brand-gold/50" 
          />
          <motion.div 
            animate={{ 
              scale: [0.8, 1.1, 0.8],
              opacity: [0.3, 0.9, 0.3],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-4 rounded-full bg-gradient-to-tr from-brand-gold-dark via-brand-gold to-brand-gold-light opacity-80 shadow-lg shadow-brand-gold/25" 
          />
        </div>

        <motion.h1 
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-4xl font-serif text-transparent bg-clip-text bg-gold-gradient tracking-[0.25em] font-bold pl-4"
        >
          LSD.
        </motion.h1>

        {/* Dynamic scent-vault curating message */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-brand-cream/80 tracking-[0.25em] uppercase text-[10px] font-sans font-medium text-center"
        >
          Curating Scent Vault
        </motion.p>

        {/* Minimalist Golden Progress Indicator */}
        <div className="w-48 h-[1.5px] bg-white/[0.08] rounded-full mt-4 overflow-hidden relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-brand-gold-dark to-brand-gold-light"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[9px] font-mono text-brand-gold/60 mt-2.5 tracking-widest font-semibold uppercase">
          {progress}%
        </span>
      </motion.div>
    </motion.div>
  );
}
