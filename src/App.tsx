import { useState, lazy, Suspense, useTransition, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BrandStory from './components/BrandStory';
import Footer from './components/Footer';

const ProductShowcase = lazy(() => import('./components/ProductShowcase'));
const AuthenticityProcess = lazy(() => import('./components/AuthenticityProcess'));
const FAQ = lazy(() => import('./components/FAQ'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const InquiryForm = lazy(() => import('./components/InquiryForm'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const InquiryBag = lazy(() => import('./components/InquiryBag'));


type Page = 'home' | 'shop' | 'faq' | 'profile' | 'checkout';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.1, ease: 'easeIn' } },
};

function App() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [, startTransition] = useTransition();

  const navigate = useCallback((page: Page) => {
    startTransition(() => {
      setCurrentPage(page);
    });
  }, []);

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
        <Suspense fallback={<div className="bg-brand-emerald-dark min-h-screen" />}>
        <div className="bg-brand-emerald-dark min-h-screen selection:bg-brand-gold selection:text-brand-emerald-dark">
          <Navbar 
            currentPage={currentPage} 
            onNavigate={navigate} 
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenBag={() => setIsBagOpen(true)}
          />

          <AnimatePresence mode="wait">
            {currentPage === 'home' && (
              <motion.main key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Hero onNavigate={navigate} />
                <BrandStory />
                <Suspense fallback={null}>
                  <AuthenticityProcess />
                </Suspense>
                <Footer />
              </motion.main>
            )}

            {currentPage === 'shop' && (
              <motion.main key="shop" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Suspense fallback={<div className="min-h-screen bg-brand-emerald-dark" />}>
                  <ProductShowcase />
                </Suspense>
                <Footer />
              </motion.main>
            )}

            {currentPage === 'faq' && (
              <motion.main key="faq" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <div className="pt-16 min-h-screen flex flex-col justify-center">
                  <Suspense fallback={null}>
                    <FAQ />
                  </Suspense>
                </div>
                <Footer />
              </motion.main>
            )}

            {currentPage === 'profile' && (
              <motion.main key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <div className="pt-24 pb-16 min-h-screen">
                  <Suspense fallback={null}>
                    <UserProfile />
                  </Suspense>
                </div>
                <Footer />
              </motion.main>
            )}

            {currentPage === 'checkout' && (
              <motion.main key="checkout" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <div className="pt-24 pb-16 min-h-screen">
                  <Suspense fallback={null}>
                    <InquiryForm onBack={() => navigate('shop')} onClose={() => navigate('shop')} />
                  </Suspense>
                </div>
                <Footer />
              </motion.main>
            )}
          </AnimatePresence>

          {/* Global Modals */}
          <Suspense fallback={null}>
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
            <InquiryBag 
              isOpen={isBagOpen} 
              onClose={() => setIsBagOpen(false)} 
              onProceedToForm={() => {
                setIsBagOpen(false);
                navigate('checkout');
              }}
            />
          </Suspense>
        </div>
        </Suspense>
      )}
    </>
  );
}

export default App;

