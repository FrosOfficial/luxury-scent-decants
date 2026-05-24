import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductShowcase from './components/ProductShowcase';
import BrandStory from './components/BrandStory';
import AuthenticityProcess from './components/AuthenticityProcess';
import FAQ from './components/FAQ';
import UserProfile from './components/UserProfile';
import InquiryForm from './components/InquiryForm';
import AuthModal from './components/AuthModal';
import InquiryBag from './components/InquiryBag';
import Footer from './components/Footer';

type Page = 'home' | 'shop' | 'faq' | 'profile' | 'checkout';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18, ease: 'easeIn' } },
};

function App() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 2000,
          style: {
            background: '#021c13',
            color: '#fdfbf7',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            fontSize: '13px',
            fontFamily: 'sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#d4af37',
              secondary: '#021c13',
            },
          },
        }}
      />
      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <div className="bg-brand-emerald-dark min-h-screen selection:bg-brand-gold selection:text-brand-emerald-dark">
          <Navbar 
            currentPage={currentPage} 
            onNavigate={setCurrentPage} 
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenBag={() => setIsBagOpen(true)}
          />

          <AnimatePresence mode="wait">
            {currentPage === 'home' && (
              <motion.main key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Hero onNavigate={setCurrentPage} />
                <BrandStory />
                <AuthenticityProcess />
                <Footer />
              </motion.main>
            )}

            {currentPage === 'shop' && (
              <motion.main key="shop" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <ProductShowcase />
                <Footer />
              </motion.main>
            )}

            {currentPage === 'faq' && (
              <motion.main key="faq" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <div className="pt-16 min-h-screen flex flex-col justify-center">
                  <FAQ />
                </div>
                <Footer />
              </motion.main>
            )}

            {currentPage === 'profile' && (
              <motion.main key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <div className="pt-24 pb-16 min-h-screen">
                  <UserProfile />
                </div>
                <Footer />
              </motion.main>
            )}

            {currentPage === 'checkout' && (
              <motion.main key="checkout" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <div className="pt-24 pb-16 min-h-screen">
                  <InquiryForm onBack={() => setCurrentPage('shop')} onClose={() => setCurrentPage('shop')} />
                </div>
                <Footer />
              </motion.main>
            )}
          </AnimatePresence>

          {/* Global Modals */}
          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
          <InquiryBag 
            isOpen={isBagOpen} 
            onClose={() => setIsBagOpen(false)} 
            onProceedToForm={() => {
              setIsBagOpen(false);
              setCurrentPage('checkout');
            }}
          />
        </div>
      )}
    </>
  );
}

export default App;

