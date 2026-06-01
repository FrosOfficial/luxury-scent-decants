import { Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-10 text-center text-brand-cream/35 text-xs border-t border-brand-gold/10 space-y-3.5 bg-brand-emerald-dark/40 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-6">
        <a
          href="https://www.instagram.com/luxuryscentdecantsbygai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-gold hover:text-brand-gold-light transition-all duration-300 flex items-center gap-2 font-sans font-bold tracking-[0.2em] uppercase text-[10px] py-1.5 px-4 rounded-full border border-brand-gold/10 bg-brand-gold/5 hover:border-brand-gold/30 hover:bg-brand-gold/10"
        >
          <Instagram size={12} className="text-brand-gold" />
          <span>Our Socials</span>
        </a>
      </div>
      <p className="font-sans font-light tracking-wider">&copy; {new Date().getFullYear()} Luxury Scent Decants. All rights reserved.</p>
    </footer>
  );
}
