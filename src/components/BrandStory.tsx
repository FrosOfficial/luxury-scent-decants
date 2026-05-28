import { motion } from 'framer-motion';

export default function BrandStory() {
  return (
    <section className="py-32 relative overflow-hidden bg-brand-emerald">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(212,175,55,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(212,175,55,0.1) 0%, transparent 50%)' }} />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-brand-gold uppercase tracking-[0.3em] text-sm mb-6 block font-medium">Want to Sniff?</span>
          <h2 className="text-4xl md:text-6xl font-serif text-brand-cream mb-8 leading-tight">
            The Luxury of Choice, <br/> Without the Commitment.
          </h2>
          <div className="w-24 h-[1px] bg-brand-gold mx-auto mb-8 opacity-50" />
          <p className="text-lg md:text-xl text-brand-cream/80 font-light leading-relaxed max-w-3xl mx-auto">
            We believe that finding your signature scent is an intimate journey. 
            Our decants allow you to experience niche and designer fragrances 
            exactly as the perfumer intended, expertly rebottled in premium glass 
            atomizers. Perfect for discovering, traveling, and collecting.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
