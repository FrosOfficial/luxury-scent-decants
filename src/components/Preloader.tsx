import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-emerald-dark"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mb-8 rounded-full border-t-2 border-b-2 border-brand-gold" 
        />
        <h1 className="text-3xl font-serif text-transparent bg-clip-text bg-gold-gradient tracking-widest">
          LSD.
        </h1>
        <p className="mt-4 text-brand-cream/60 tracking-[0.3em] uppercase text-xs">
          Presentation Loading
        </p>
      </motion.div>
    </motion.div>
  );
}
