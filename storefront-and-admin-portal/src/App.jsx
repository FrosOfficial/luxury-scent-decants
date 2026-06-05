import { useState, lazy, Suspense, useTransition, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BrandStory from './components/BrandStory';
import Footer from './components/Footer';
import AdminLayout from './admin/AdminLayout';
import { useAuth } from './contexts/AuthContext';

const ProductShowcase    = lazy(() => import('./components/ProductShowcase'));
const AuthenticityProcess = lazy(() => import('./components/AuthenticityProcess'));
const FAQ                = lazy(() => import('./components/FAQ'));
const UserProfile        = lazy(() => import('./components/UserProfile'));
const InquiryForm        = lazy(() => import('./components/InquiryForm'));
const AuthModal          = lazy(() => import('./components/AuthModal'));
const InquiryBag         = lazy(() => import('./components/InquiryBag'));
const ContactChatBubble  = lazy(() => import('./components/ContactChatBubble'));

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.1, ease: 'easeIn' } },
};

function App() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [, startTransition] = useTransition();

  const { isAdmin } = useAuth();
  const [prevIsAdmin, setPrevIsAdmin] = useState(false);

  // Watch admin authentication state to redirect admins upon login
  useEffect(() => {
    if (isAdmin && !prevIsAdmin) {
      setCurrentPage('admin');
    }
    setPrevIsAdmin(isAdmin);
  }, [isAdmin, prevIsAdmin]);

  const navigate = useCallback((page) => {
    startTransition(() => {
      setCurrentPage(page);
    });
  }, []);

  return (
    <>
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
          {currentPage === 'admin' ? (
            <Suspense fallback={
              <div className="bg-brand-emerald-dark min-h-screen flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                <p className="text-brand-gold font-medium uppercase tracking-widest text-xs">Entering Admin Terminals...</p>
              </div>
            }>
              <AdminLayout onExitStorefront={navigate} />
            </Suspense>
          ) : (
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
                {/* Floating chat bubble — visible on all storefront pages */}
                <ContactChatBubble />
              </Suspense>
            </div>
          )}
        </Suspense>
      )}
    </>
  );
}

export default App;
