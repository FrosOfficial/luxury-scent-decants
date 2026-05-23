import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Mail, Copy } from 'lucide-react';

export default function ContactFlow() {
  const email = 'concierge@luxuryscentdecants.com';

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    toast.success('Email copied to clipboard', {
      style: { background: '#022c22', color: '#fdfbf7', border: '1px solid #d4af37' },
      iconTheme: { primary: '#d4af37', secondary: '#022c22' }
    });
  };

  return (
    <section className="py-32 px-4 bg-brand-emerald-dark relative">
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-brand-emerald border border-brand-gold/20 p-12 md:p-16 rounded-3xl backdrop-blur-md shadow-2xl"
        >
          <Mail className="w-12 h-12 text-brand-gold mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-serif text-brand-cream mb-4">Request a Delivery</h2>
          <p className="text-brand-cream/70 mb-10 font-light text-lg">
            Ready to secure your selection? Send us an inquiry for current availability and doorstep delivery arrangements.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={`mailto:${email}`}
              className="px-8 py-4 w-full sm:w-auto bg-brand-gold text-brand-emerald-dark font-bold uppercase tracking-widest text-sm rounded-full hover:bg-brand-gold-light transition-all text-center shadow-lg"
            >
              Email Us
            </a>
            <button 
              onClick={copyEmail}
              className="px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2 border border-brand-gold/50 text-brand-gold font-bold uppercase tracking-widest text-sm rounded-full hover:bg-brand-gold/10 transition-all"
            >
              <Copy size={16} /> Copy Address
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
