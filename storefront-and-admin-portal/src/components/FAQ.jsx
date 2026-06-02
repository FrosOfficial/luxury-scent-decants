import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Compass, Truck, AlertCircle } from 'lucide-react';

const faqData = [
  {
    id: 1,
    question: "How is delivery and shipping handled?",
    answer: "We offer 🚚 Free delivery within Tagum City for all orders. For fragrance enthusiasts outside Tagum City, we also provide 🇵🇭 Nationwide shipping available across the Philippines via local couriers.",
    icon: Truck
  },
  {
    id: 2,
    question: "What is a \"Fresh Decant\"?",
    answer: "A FRESH DECANT is the original luxury perfume poured straight into a clean, premium travel size glass bottle. We bottle it by hand using sterile syringes right when you order so the scent stays 100% fresh and untouched.",
    icon: HelpCircle
  },
  {
    id: 3,
    question: "Am I buying the original full retail bottle?",
    answer: "No, this is NOT A FULL BOTTLE. You are purchasing a premium travel-sized decant (e.g., 2ml, 5ml, 10ml) to test and experience the luxury scent before investing in a full, expensive retail bottle.",
    icon: AlertCircle
  },
  {
    id: 4,
    question: "How do I complete my order?",
    answer: "Once you fill out your delivery and address details on our storefront, select your preferred payment method (Cash on Delivery, E-wallet, or RCBC Online Banking) and finalize the checkout. A premium printable digital invoice receipt will be generated instantly for your records, and our courier will ship the perfume parcel directly to your doorstep!",
    icon: Compass
  }
];

export default function FAQ() {
  const [openId, setOpenId] = useState(1);

  return (
    <section className="py-24 px-4 bg-brand-emerald-dark relative overflow-hidden">
      {/* Background ambient blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-emerald-light/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center p-2 rounded-full border border-brand-gold/20 bg-brand-emerald-dark/60 backdrop-blur-md text-brand-gold mb-4"
          >
            <HelpCircle size={20} className="animate-pulse" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-brand-cream tracking-wide"
          >
            Frequently Asked <span className="text-brand-gold">Questions</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-brand-cream/60 mt-3 text-sm md:text-base max-w-lg mx-auto leading-relaxed"
          >
            Everything you need to know about our premium decants, nationwide shipping, and guest checkout flow.
          </motion.p>
        </div>

        {/* FAQ Accordions List */}
        <div className="space-y-4">
          {faqData.map((item, index) => {
            const Icon = item.icon;
            const isOpen = openId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-brand-gold/30 bg-brand-emerald-dark/70 shadow-[0_4px_30px_rgba(212,175,55,0.05)]'
                    : 'border-brand-gold/10 bg-brand-emerald-dark/40 hover:border-brand-gold/25'
                }`}
              >
                {/* Trigger Button */}
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left font-serif"
                >
                  <div className="flex items-center gap-4">
                    <span className={`p-2 rounded-xl border transition-colors ${
                      isOpen ? 'border-brand-gold/30 text-brand-gold bg-brand-gold/5' : 'border-brand-gold/10 text-brand-cream/60'
                    }`}>
                      <Icon size={18} />
                    </span>
                    <span className={`text-base md:text-lg tracking-wide transition-colors ${
                      isOpen ? 'text-brand-gold font-medium' : 'text-brand-cream hover:text-brand-gold-light'
                    }`}>
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-brand-gold transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Collapsible Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-1 text-sm md:text-base leading-relaxed text-brand-cream/70 pl-[3.5rem] border-t border-brand-gold/5 bg-black/10 font-sans font-light">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
