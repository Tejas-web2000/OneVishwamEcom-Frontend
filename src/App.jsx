import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/authSlice';

import PromoToast from './components/PromoToast';
import PromoModal from './components/PromoModal';
import EnquiryModal from './components/EnquiryModal';
import AuthModals from './components/auth/AuthModals';
import SessionTracker from './components/auth/SessionTracker';
import { setNavigate } from './config/navigation';
import PageSkeleton from './components/ui/PageSkeleton';
import { trackUserActivity, resolveSectorFromPath } from './utils/activityTracker';

// Lazy load routes
const AboutPage = lazy(() => import('./pages/about'));
const ContactPage = lazy(() => import('./pages/contact'));
const Home = lazy(() => import('./pages/home'));
const ServicesPage = lazy(() => import('./pages/services'));
const CareersPage = lazy(() => import('./pages/careers'));
const PropertyGallery = lazy(() => import('./pages/services/property/PropertyGallery'));
const PropertyDetails = lazy(() => import('./pages/services/property/PropertyDetails'));
const PostRequirement = lazy(() => import('./pages/services/property/PostRequirement'));
const RequirementSuccess = lazy(() => import('./pages/services/property/RequirementSuccess'));
const AutomobileGallery = lazy(() => import('./pages/services/automobile/AutomobileGallery'));
const VehicleDetails = lazy(() => import('./pages/services/automobile/VehicleDetails'));
const BeddingGallery = lazy(() => import('./pages/services/bedding/BeddingGallery'));
const BeddingDetails = lazy(() => import('./pages/services/bedding/BeddingDetails'));
const LoanDetails = lazy(() => import('./pages/services/finance/LoanDetails'));
const GroceryDetails = lazy(() => import('./pages/services/grocery/GroceryDetails'));
const ElectronicsGallery = lazy(() => import('./pages/services/electronics/ElectronicsGallery'));
const ElectronicsDetails = lazy(() => import('./pages/services/electronics/ElectronicsDetails'));
const JewelleryGallery = lazy(() => import('./pages/services/jewellery/JewelleryGallery'));
const JewelleryDetails = lazy(() => import('./pages/services/jewellery/JewelleryDetails'));
const GarmentDetails = lazy(() => import('./pages/services/garments/GarmentDetails'));
const FinanceLoanGallery = lazy(() => import('./pages/services/finance/FinanceLoanGallery'));
const FinanceDetails = lazy(() => import('./pages/services/finance/FinanceDetails'));
const FinanceServiceSuccess = lazy(() => import('./pages/services/finance/FinanceServiceSuccess'));
const FinanceFlow = lazy(() => import('./services/FinanceFlow'));
const ComingSoon = lazy(() => import('./pages/coming-soon/ComingSoon'));
const ProfileSettings = lazy(() => import('./pages/profile/Settings'));
const NotFoundPage = lazy(() => import('./pages/not-found/NotFoundPage'));

/**
 * Registers React Router's navigate function with the navigateTo() utility so that
 * any component calling navigateTo() gets true client-side SPA navigation instead of
 * going through the DOM CustomEvent indirection layer.
 *
 * Also handles scroll-to-top on every route change.
 */
function RouterSyncEffect() {
  const location = useLocation();
  const navigate = useNavigate();
  const navType = useNavigationType(); // 'PUSH' | 'POP' | 'REPLACE'

  // Register navigate with the module-level utility on mount and whenever it changes.
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  // Keep track of scroll positions per location key
  useEffect(() => {
    const handleScroll = () => {
      try {
        sessionStorage.setItem(`vishwam_scroll_${location.key}`, String(window.scrollY));
      } catch {}
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.key]);

  // Scroll to top on forward navigation ('PUSH') or restore scroll on back navigation ('POP')
  useEffect(() => {
    if (navType === 'POP') {
      try {
        const savedScroll = sessionStorage.getItem(`vishwam_scroll_${location.key}`);
        if (savedScroll !== null) {
          const y = parseInt(savedScroll, 10);
          requestAnimationFrame(() => {
            window.scrollTo({ top: y, behavior: 'instant' });
          });
          return;
        }
      } catch {}
      return;
    }

    if (!location.hash) {
      window.scrollTo(0, 0);
    } else {
      const targetId = location.hash.replace('#', '');
      requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }

    // Auto-capture user sector interest on route change
    const sector = resolveSectorFromPath(location.pathname);
    if (sector) {
      trackUserActivity({ category: sector, path: location.pathname });
    }
  }, [location.pathname, location.hash, location.key, navType]);

  return null;
}

function App() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((s) => s.auth.isLoggedIn);

  // Synchronize authenticated user profile with authoritative MongoDB Atlas record
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchMe());
    }
  }, [dispatch, isLoggedIn]);

  return (
    <>
      <RouterSyncEffect />
      <main>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about-us/*" element={<AboutPage />} />
            <Route path="/enquiry/*" element={<ContactPage />} />
            <Route path="/enquiry" element={<ContactPage />} />
            <Route path="/contact-us/*" element={<ContactPage />} />
            <Route path="/contact-us" element={<ContactPage />} />

            {/* Properties Routes */}
            <Route path="/our-services/properties" element={<PropertyGallery />} />
            <Route path="/properties" element={<PropertyGallery />} />
            <Route path="/our-services/real-estate-property" element={<PropertyGallery />} />
            <Route path="/houseandland" element={<PropertyGallery />} />
            <Route path="/property" element={<PropertyGallery />} />
            <Route path="/property/requirement/success" element={<RequirementSuccess />} />
            <Route path="/property/requirement" element={<PostRequirement />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/our-services/properties/:id" element={<PropertyDetails />} />

            {/* Automobiles Routes */}
            <Route path="/our-services/automobile" element={<AutomobileGallery />} />
            <Route path="/our-services/automobiles" element={<AutomobileGallery />} />
            <Route path="/automobile" element={<AutomobileGallery />} />
            <Route path="/automobiles" element={<AutomobileGallery />} />
            <Route path="/vehicles" element={<AutomobileGallery />} />
            <Route path="/vehicle/:id" element={<VehicleDetails />} />
            <Route path="/vehicles/:id" element={<VehicleDetails />} />
            <Route path="/automobile/:id" element={<VehicleDetails />} />
            <Route path="/automobiles/:id" element={<VehicleDetails />} />

            {/* Jewellery Routes */}
            <Route path="/categories/jewellery" element={<JewelleryGallery />} />
            <Route path="/categories/jewellery/:id" element={<JewelleryDetails />} />
            <Route path="/our-services/jewellery" element={<JewelleryGallery />} />
            <Route path="/our-services/jewellery-gold" element={<JewelleryGallery />} />
            <Route path="/jewellery" element={<JewelleryGallery />} />
            <Route path="/jewellery/:id" element={<JewelleryDetails />} />

            {/* Comfort & Bedding Routes */}
            <Route path="/our-services/bedding-comfort" element={<BeddingGallery />} />
            <Route path="/our-services/comfort" element={<BeddingGallery />} />
            <Route path="/categories/comfort" element={<BeddingGallery />} />
            <Route path="/categories/comfort/:id" element={<BeddingDetails />} />
            <Route path="/comfort" element={<BeddingGallery />} />
            <Route path="/comfort/:id" element={<BeddingDetails />} />
            <Route path="/bedding-comfort" element={<BeddingGallery />} />
            <Route path="/bedding" element={<BeddingGallery />} />
            <Route path="/bedding/:id" element={<BeddingDetails />} />
            <Route path="/bedding-comfort/:id" element={<BeddingDetails />} />

            {/* Finance & Other Verticals */}
            <Route path="/our-services/finance-lending" element={<FinanceLoanGallery />} />
            <Route path="/finance" element={<FinanceLoanGallery />} />
            <Route path="/loans" element={<FinanceLoanGallery />} />
            <Route path="/finance/:id" element={<LoanDetails />} />
            <Route path="/loan/:id" element={<LoanDetails />} />
            <Route path="/finance/*" element={<LoanDetails />} />
            <Route path="/finance-service/success" element={<FinanceServiceSuccess />} />
            <Route path="/finance-service/:id" element={<FinanceDetails />} />
            {/* Categories & Services Overview */}
            <Route path="/categories" element={<ServicesPage />} />
            <Route path="/categories/properties" element={<PropertyGallery />} />
            <Route path="/categories/properties/:id" element={<PropertyDetails />} />
            <Route path="/categories/automobile" element={<AutomobileGallery />} />
            <Route path="/categories/automobile/:id" element={<VehicleDetails />} />
            <Route path="/categories/automobiles" element={<AutomobileGallery />} />
            <Route path="/categories/automobiles/:id" element={<VehicleDetails />} />
            <Route path="/categories/bedding-comfort" element={<BeddingGallery />} />
            <Route path="/categories/bedding-comfort/:id" element={<BeddingDetails />} />
            <Route path="/categories/consumer-electronics" element={<ElectronicsGallery />} />
            <Route path="/categories/consumer-electronics/:id" element={<ElectronicsDetails />} />
            <Route path="/categories/finance-lending" element={<FinanceLoanGallery />} />
            <Route path="/categories/*" element={<ServicesPage />} />
            <Route path="/our-services" element={<ServicesPage />} />
            <Route path="/our-services/*" element={<ServicesPage />} />
            <Route path="/careers/*" element={<CareersPage />} />
            <Route path="/finance-flow" element={<FinanceFlow />} />
            {/* Consumer Electronics Routes */}
            <Route path="/our-services/consumer-electronics" element={<ElectronicsGallery />} />
            <Route path="/consumer-electronics" element={<ElectronicsGallery />} />
            <Route path="/electronics" element={<ElectronicsGallery />} />
            <Route path="/electronics/:id" element={<ElectronicsDetails />} />

            <Route path="/grocery/*" element={<GroceryDetails />} />
            <Route path="/garment/*" element={<GarmentDetails />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/profile/settings" element={<ProfileSettings />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      
      <PromoToast />
      <PromoModal />
      <AuthModals />
      <SessionTracker />
      <EnquiryModal />
    </>
  );
}

export default App;