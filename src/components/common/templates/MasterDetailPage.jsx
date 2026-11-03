import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import EnquiryModal from '../../EnquiryModal';
import Breadcrumbs from '../Breadcrumbs';
import { useAuth } from '../../../store/authSlice';
import AuthRequiredView from '../../auth/AuthRequiredView';
import CategoryListingCard from './CategoryListingCard';
import { ONEVISHWAM_VERIFIED_IMAGE, isPlaceholderImage } from '../../../constants/fallbackImage';
import oneVishwamLogo from '../../../assets/logo.png';
import VerifiedPartnerBadge from '../VerifiedPartnerBadge';
import { contactInfo, getPropertyContactInfo } from '../../../constants/footerContent';
import { cleanProductName } from '../../../utils/searchUtils';
import { trackUserActivity, resolveSectorFromPath } from '../../../utils/activityTracker';

const defaultBaseUrl = 'https://asia-south1-onevishwam.cloudfunctions.net/api';
const activeApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || defaultBaseUrl;
const API_ORIGIN = (() => {
  try {
    return new URL(activeApiUrl).origin;
  } catch {
    return 'https://asia-south1-onevishwam.cloudfunctions.net';
  }
})();

function resolveImage(src) {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
  if (src.startsWith('/assets/') || src.startsWith('/src/assets/')) return src;
  return `${API_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`;
}

const DEFAULT_FEATURE_ICONS = {
  'Swimming Pool': 'fa-person-swimming',
  '24×7 Security': 'fa-shield-halved',
  '24/7 Security': 'fa-shield-halved',
  Gym: 'fa-dumbbell',
  Gymnasium: 'fa-dumbbell',
  'Power Backup': 'fa-bolt',
  'Club House': 'fa-building-flag',
  Clubhouse: 'fa-building-flag',
  Garden: 'fa-tree',
  Park: 'fa-tree',
  CCTV: 'fa-video',
  'EV Charging': 'fa-charging-station',
  'Wi-Fi': 'fa-wifi',
  'Air Conditioning': 'fa-snowflake',
  Sunroof: 'fa-sun',
  'Touchscreen Infotainment': 'fa-tablet-screen-button',
  'Reverse Camera': 'fa-video',
  'Cruise Control': 'fa-gauge-high',
  'Alloy Wheels': 'fa-circle-notch',
  'Leather Seats': 'fa-couch',
  'Keyless Entry': 'fa-key',
  'Push Button Start': 'fa-power-off',
  'Dual Airbags': 'fa-shield-heart',
  '6 Airbags': 'fa-shield-halved',
  'ABS with EBD': 'fa-car-burst',
  'Hill Hold Assist': 'fa-mountain',
  'Wireless Charger': 'fa-bolt',
  'Apple CarPlay & Android Auto': 'fa-mobile-screen',
  '4K Ultra HD': 'fa-tv',
  OLED: 'fa-display',
  'Dolby Atmos': 'fa-volume-high',
  'Dolby Vision': 'fa-film',
  '120Hz Refresh Rate': 'fa-clock-rotate-left',
  'Smart TV': 'fa-tv',
  Bluetooth: 'fa-bluetooth',
  'Voice Assistant': 'fa-microphone',
  'Orthopedic Support': 'fa-bone',
  'Memory Foam': 'fa-bed',
  'Zero Motion Transfer': 'fa-shield',
  Hypoallergenic: 'fa-heart-pulse',
  'Breathable Fabric': 'fa-wind',
  'Washable Cover': 'fa-shirt',
  '10-Year Warranty': 'fa-award',
};

function GalleryModal({ items = [], index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  const current = items[index] || items[0];

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-20 cursor-pointer"
        aria-label="Close modal"
      >
        <i className="fa-solid fa-xmark text-xl" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/25 transition-all z-20 shadow-lg cursor-pointer"
        aria-label="Previous image"
      >
        <i className="fa-solid fa-chevron-left text-xl" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/25 transition-all z-20 shadow-lg cursor-pointer"
        aria-label="Next image"
      >
        <i className="fa-solid fa-chevron-right text-xl" />
      </button>
      <div className="absolute top-5 left-6 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white/90 text-xs font-semibold z-20">
        {index + 1} / {items.length}
      </div>
      <div className="max-h-[85vh] max-w-[92vw] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {current?.type === 'video' ? (
          <video
            src={current.url}
            autoPlay
            loop
            muted
            playsInline
            controls
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        ) : (
          <img
            src={resolveImage(current?.url || current)}
            alt=""
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = ONEVISHWAM_VERIFIED_IMAGE;
            }}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl select-none"
          />
        )}
      </div>
    </div>
  );
}

function getGoogleMapsDirectUrl(mapUrl) {
  if (!mapUrl || typeof mapUrl !== 'string') return '';
  const trimmed = mapUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const directCoord = trimmed.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
  if (directCoord) {
    return `https://www.google.com/maps/search/?api=1&query=${directCoord[1]},${directCoord[2]}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

function getGoogleMapsEmbedUrl(mapUrl) {
  if (!mapUrl || typeof mapUrl !== 'string') return '';
  const trimmed = mapUrl.trim();
  if (!trimmed) return '';

  // If already an embed URL
  if (trimmed.includes('/embed') || trimmed.includes('output=embed')) {
    return trimmed;
  }

  // If coordinates: e.g. "12.9716, 77.5946" or "12.9716,77.5946"
  const coordMatch = trimmed.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
  if (coordMatch) {
    return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=m&z=15&output=embed&iwloc=near`;
  }

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const urlObj = new URL(trimmed);
      const qParam = urlObj.searchParams.get('q') || urlObj.searchParams.get('query');
      if (qParam) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(qParam)}&t=m&z=15&output=embed&iwloc=near`;
      }
      const placeMatch = trimmed.match(/\/place\/([^/@?]+)/);
      if (placeMatch) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(placeMatch[1]))}&t=m&z=15&output=embed&iwloc=near`;
      }
      const atCoordMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atCoordMatch) {
        return `https://maps.google.com/maps?q=${atCoordMatch[1]},${atCoordMatch[2]}&t=m&z=15&output=embed&iwloc=near`;
      }
      return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&t=m&z=15&output=embed&iwloc=near`;
    }
  } catch {
    // fallback
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&t=m&z=15&output=embed&iwloc=near`;
}

/**
 * MasterDetailPage
 * Master centralized detail page template modeled after Homez Single V1.
 * Supports a 2-column layout (8-column content + 4-column sticky sidebar),
 * 5-photo luxury mosaic gallery, interactive mortgage/EMI calculator,
 * unit floor plans, nearby landmarks, verified reviews, and Schedule a Tour widget.
 */
export default function MasterDetailPage({
  item,
  categoryName = 'Marketplace',
  categoryLink = '/our-services/properties',
  similarItems = [],
  itemLinkPrefix = '/property/',
  loading = false,
  error = null,
  bentoTitle = 'Overview',
  featuresTitle = 'Features & Amenities',
  headerExtra = null,
  bentoHighlights: customBentoHighlights = null,
  floorPlans = [],
  pdfUrl: customPdfUrl = null,
  amenities = null,
  children = null,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname || '';

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [reachedFooter, setReachedFooter] = useState(false);
  const [fpGalleryOpen, setFpGalleryOpen] = useState(false);
  const [fpGalleryIndex, setFpGalleryIndex] = useState(0);
  const [activeFloorPlanTab, setActiveFloorPlanTab] = useState(0);

  const heroRef = useRef(null);
  const similarRef = useRef(null);

  // Filter Discover Our Featured Properties to products which have real images
  const featuredListings = useMemo(() => {
    const hasPhoto = (sp) => {
      if (!sp) return false;
      const imgs = Array.isArray(sp.images) ? sp.images : [];
      const realFromImgs = imgs.some((s) => s && !isPlaceholderImage(s) && s !== ONEVISHWAM_VERIFIED_IMAGE);
      if (realFromImgs) return true;
      const direct = sp.image || sp.coverImage || sp.imageUrl;
      return direct && !isPlaceholderImage(direct) && direct !== ONEVISHWAM_VERIFIED_IMAGE;
    };
    const withPhotos = (similarItems || []).filter(hasPhoto);
    return withPhotos.length > 0 ? withPhotos : (similarItems || []);
  }, [similarItems]);

  const activeId = item ? (item._id || item.id) : null;

  // Track recently viewed items in localStorage
  useEffect(() => {
    if (!item) return;
    try {
      const STORAGE_KEY = `vishwam_recently_viewed_${categoryName.toLowerCase().replace(/\s+/g, '_')}`;
      const storedJson = localStorage.getItem(STORAGE_KEY);
      let storedList = storedJson ? JSON.parse(storedJson) : [];
      if (!Array.isArray(storedList)) storedList = [];

      const filtered = storedList.filter((x) => String(x._id || x.id) !== String(activeId));
      const updated = [item, ...filtered].slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRecentlyViewed(filtered.slice(0, 8));
    } catch (e) {
      console.warn('Recently viewed storage notice:', e);
    }
  }, [item, activeId, categoryName]);

  // Track user activity in backend
  useEffect(() => {
    if (!item || !activeId) return;
    const sector = resolveSectorFromPath(pathname) || categoryName.toLowerCase().trim();
    const title = cleanProductName(item.title || item.name || item.projectName || item.headline || 'Property/Listing');
    const price = item.price || item.displayPrice || item.rate || '';
    const loc = item.address || item.location || item.city || item.area || '';
    const img = resolveImage(item.images?.[0] || item.image || item.photos?.[0] || '');

    trackUserActivity({
      category: sector,
      listingId: String(activeId),
      title,
      price: String(price),
      location: String(loc),
      image: String(img),
      path: pathname,
    });
  }, [item, activeId, categoryName, pathname]);

  // Scroll to top on mount / id change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeId]);

  // Scroll listener for sticky floating bottom action bar
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const isPast = rect.bottom < 80;
        setScrolledPastHero((prev) => (prev !== isPast ? isPast : prev));
      } else {
        const isPast = window.scrollY > 450;
        setScrolledPastHero((prev) => (prev !== isPast ? isPast : prev));
      }

      const footerEl = document.querySelector('footer');
      if (footerEl) {
        const fRect = footerEl.getBoundingClientRect();
        const nearFooter = fRect.top <= window.innerHeight;
        setReachedFooter((prev) => (prev !== nearFooter ? nearFooter : prev));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver to hide sticky bar when footer enters view
  useEffect(() => {
    const footerEl = document.querySelector('footer');
    if (!footerEl || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setReachedFooter(entry.isIntersecting);
      },
      { rootMargin: '0px 0px 0px 0px', threshold: 0 }
    );

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, []);

  const goBack = () => {
    if (window.history.state?.idx > 0 || window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(categoryLink || '/categories');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = item?.title || `OneVishwam ${categoryName}`;
    const text = `Check out this listing on OneVishwam: ${title}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') console.warn('Share API failed:', err);
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert('Listing link copied to clipboard!');
    } catch {
      prompt('Copy the link manually:', url);
    }
  };

  const mediaItems = useMemo(() => {
    if (!item) return [{ type: 'image', url: ONEVISHWAM_VERIFIED_IMAGE }];
    const rawList = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : (item.image ? [item.image] : []);

    const imgs = rawList
      .filter((img) => img && !isPlaceholderImage(typeof img === 'object' ? img.url : img))
      .map((img) => ({
        type: 'image',
        url: typeof img === 'object' ? img.url || img : img,
      }));

    if (item.videoUrl && typeof item.videoUrl === 'string' && item.videoUrl.trim() !== '') {
      imgs.push({ type: 'video', url: item.videoUrl });
    }
    return imgs.length > 0 ? imgs : [{ type: 'image', url: ONEVISHWAM_VERIFIED_IMAGE }];
  }, [item]);

  const floorPlanImages = useMemo(() => {
    if (!item) return [];
    if (Array.isArray(floorPlans) && floorPlans.length > 0) return floorPlans;
    const fp = item.floorPlanImages || item.floorPlans || item.floorPlanMap;
    if (Array.isArray(fp)) return fp.filter(Boolean);
    if (typeof fp === 'string' && fp) return [fp];
    return [];
  }, [item, floorPlans]);

  const fpMediaItems = useMemo(
    () => floorPlanImages.map((img) => ({ type: 'image', url: typeof img === 'object' ? img.url || img : img })),
    [floorPlanImages]
  );

  const pdfUrl = customPdfUrl || item?.pdfUrl || item?.floorPlanPdf || item?.brochure || item?.pdf || null;
  const hasFloorPlans = floorPlanImages.length > 0 || Boolean(pdfUrl);

  const goPrev = useCallback(() => {
    if (!mediaItems.length) return;
    setCurrentImageIndex((i) => (i === 0 ? mediaItems.length - 1 : i - 1));
  }, [mediaItems.length]);

  const goNext = useCallback(() => {
    if (!mediaItems.length) return;
    setCurrentImageIndex((i) => (i === mediaItems.length - 1 ? 0 : i + 1));
  }, [mediaItems.length]);

  const goFpPrev = useCallback(() => {
    if (!fpMediaItems.length) return;
    setFpGalleryIndex((i) => (i === 0 ? fpMediaItems.length - 1 : i - 1));
  }, [fpMediaItems.length]);

  const goFpNext = useCallback(() => {
    if (!fpMediaItems.length) return;
    setFpGalleryIndex((i) => (i === fpMediaItems.length - 1 ? 0 : i + 1));
  }, [fpMediaItems.length]);

  const { isLoggedIn, openAuthModal } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      sessionStorage.setItem('vishwam_auth_redirect', window.location.pathname + window.location.search);
      openAuthModal('login');
    }
  }, [isLoggedIn, openAuthModal]);

  if (!isLoggedIn) {
    return (
      <AuthRequiredView
        title={`Login Required to View ${categoryName || 'Product'}`}
        message="Please log in or register to view full specifications, pricing, gallery photos, and contact details."
        backUrl={categoryLink}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center gap-3 text-gray-400 bg-gray-50">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-brand-blue" />
        <span className="text-sm font-medium">Loading details...</span>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen pt-32 text-center bg-gray-50 px-4">
        <div className="mx-auto max-w-md bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <h1 className="text-xl font-bold text-brand-charcoal mb-2">Item Not Found</h1>
          <p className="text-sm text-gray-500 mb-6">The listing you are searching for might have been sold or removed.</p>
          <button
            onClick={goBack}
            className="w-full rounded-xl bg-brand-blue py-2.5 text-sm font-semibold text-white hover:bg-brand-navy transition-colors cursor-pointer"
          >
            &larr; Back to {categoryName}
          </button>
        </div>
      </div>
    );
  }

  const itemTitle = cleanProductName(item.title);

  // Entity Type Resolution: Precise separation of Vehicle vs Property vs General
  const isVehicle = Boolean(
    categoryName === 'Automobiles' ||
    categoryName === 'Vehicles' ||
    categoryName === 'Automobiles & Vehicles' ||
    itemLinkPrefix?.includes('vehicle') ||
    itemLinkPrefix?.includes('automobile') ||
    item?.category === 'vehicles' ||
    item?.category === 'automobile' ||
    item?.category === 'automobiles' ||
    item?.category === 'Commercial' ||
    item?.category === 'SUV' ||
    item?.category === 'Hatchback' ||
    item?.category === 'Sedan' ||
    item?.category === 'Luxury' ||
    item?.wheelerType ||
    item?.fuelType ||
    item?.transmission ||
    (item?.variants && item?.variants.length > 0 && !item?.propertyType)
  );

  const isProperty = Boolean(
    !isVehicle && (
      categoryName === 'Properties' ||
      categoryName === 'Real Estate' ||
      itemLinkPrefix?.includes('property') ||
      item?.category === 'real-estate' ||
      item?.category === 'properties' ||
      item?.category === 'property' ||
      item?.propertyType ||
      item?.bhk ||
      item?.bedrooms
    )
  );

  const activeContact = isVehicle ? contactInfo : getPropertyContactInfo(item.title);
  const currentMedia = mediaItems[currentImageIndex] || mediaItems[0];

  // Badges normalization
  const badges = item.statusBadges || item.badges || [];
  const statusPill = badges[0] || null;

  // Partner / Enterprise normalization
  const agentDisplayName =
    typeof item.agent === 'object'
      ? (typeof item.agent?.name === 'object'
          ? item.agent?.name?.name || item.agent?.name?.email || ''
          : item.agent?.name || '')
      : item.agent || '';

  const enterpriseName =
    item.showroom?.name ||
    item.enterpriseName ||
    item.companyName ||
    item.brand ||
    item.seller?.name ||
    agentDisplayName ||
    null;

  const partnerDisplayName =
    item.channelPartnerName ||
    (item.vendorName && item.vendorName.toLowerCase() !== 'onevishwam' ? item.vendorName : null) ||
    enterpriseName ||
    'One Vishwam';

  const enterpriseLogo =
    item.showroom?.logo ||
    item.enterpriseLogo ||
    item.companyLogo ||
    item.brandLogo ||
    item.seller?.logo ||
    null;

  // Bento Highlights normalization
  const bentoHighlights = customBentoHighlights || item.overviewHighlights || item.keyAttributes || [
    { label: 'Category', value: item.category || categoryName, icon: 'fa-layer-group', color: 'text-blue-600 bg-blue-50' },
    { label: 'Condition', value: item.condition === 'new' ? 'Brand New' : (item.condition || 'Pre-Owned'), icon: 'fa-certificate', color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Location', value: item.location || item.city || 'Bangalore', icon: 'fa-location-dot', color: 'text-amber-600 bg-amber-50' },
    { label: 'Verification', value: '100% Inspected', icon: 'fa-circle-check', color: 'text-purple-600 bg-purple-50' },
  ];

  // Features normalization
  const featuresList = (amenities && amenities.length > 0) ? amenities : (item.features || item.amenities || [
    'Brand Genuine Guarantee',
    'Official Manufacturer Warranty',
    'Instant Loan & EMI Assistance',
    'Doorstep Delivery',
    'Verified Inspection Report',
    '7-Day Return / Exchange Policy',
  ]);

  // Location and Google Maps normalization - map & related buttons only shown if mapUrl has data
  const rawLocUrl = (
    item.mapUrl ||
    item.showroom?.mapUrl ||
    item.raw?.mapUrl ||
    item.details?.mapUrl ||
    ''
  ).trim();

  // ONLY generate embedMapUrl and directMapUrl if mapUrl has actual data
  const hasMapData = Boolean(rawLocUrl);
  const embedMapUrl = hasMapData ? getGoogleMapsEmbedUrl(rawLocUrl) : '';
  const directMapUrl = hasMapData ? getGoogleMapsDirectUrl(rawLocUrl) : '';

  const hasLocationDetails = Boolean(item.address || item.showroom?.address || item.location || item.city || item.locality || item.pincode);
  const hasLocationOrMap = hasMapData || hasLocationDetails;

  // Specifications
  const specSections = item.specifications || [];

  // Property-Specific Overview Extraction
  const isPlot = Boolean(
    isProperty && (
      item.isPlot ||
      (item.propertyType && String(item.propertyType).toLowerCase().includes('plot')) ||
      (item.subcategory && String(item.subcategory).toLowerCase().includes('plot'))
    )
  );

  const bedsDisplay = isProperty ? (item.bhk || item.bedrooms || item.bedroom || (isPlot ? 'N/A (Plot)' : '3 Bedrooms')) : null;
  const bathsDisplay = isProperty ? (item.bathrooms ? (String(item.bathrooms).includes('bath') ? item.bathrooms : `${item.bathrooms} Bathrooms`) : (isPlot ? 'N/A' : '2 Bathrooms')) : null;
  const yearBuiltDisplay = isProperty
    ? (item.possession || item.possessionStatus || item.yearBuilt || (item.condition === 'new' ? 'New Construction' : 'Ready to Move'))
    : (item.year ? `Model Year ${item.year}` : (item.condition === 'new' ? 'Brand New' : 'Verified'));
  const garageDisplay = isProperty ? (item.parking || item.garage || (isPlot ? 'N/A' : '1 Covered Parking')) : null;
  const sqftDisplay = isProperty ? (item.area || item.superBuiltUpArea || item.dimensions || '1,450 Sq.Ft') : null;
  const propertyTypeDisplay = isProperty ? (item.propertyType || item.subcategory || categoryName || 'Apartment') : null;

  // Vehicle-Specific Metadata Extraction
  const vehicleFuelDisplay = item.fuelType || item.fuel || 'Petrol & CNG';
  const vehicleTransDisplay = item.transmission || 'Manual & Automatic';
  const vehicleTypeDisplay = item.category || item.bodyType || item.wheelerType || '4-Wheeler';
  const vehicleYearDisplay = item.year ? `Model Year ${item.year}` : (item.condition === 'new' ? 'Brand New' : 'Verified');

  // Vehicle Highlights for the Overview Grid (plain computation to respect hooks rules)
  const vehicleHighlights = (() => {
    if (!isVehicle) return [];
    if (customBentoHighlights && customBentoHighlights.length > 0) return customBentoHighlights;
    if (item.overviewHighlights && item.overviewHighlights.length > 0) return item.overviewHighlights;
    if (item.keyAttributes && item.keyAttributes.length > 0) {
      const iconMap = ['fa-car-side', 'fa-tag', 'fa-gas-pump', 'fa-shield-halved', 'fa-gear', 'fa-building'];
      const colorMap = [
        'text-blue-600 bg-blue-50',
        'text-emerald-600 bg-emerald-50',
        'text-purple-600 bg-purple-50',
        'text-indigo-600 bg-indigo-50',
        'text-cyan-600 bg-cyan-50',
        'text-teal-600 bg-teal-50',
      ];
      return item.keyAttributes.slice(0, 6).map((attr, idx) => ({
        label: attr.label,
        value: attr.value,
        icon: iconMap[idx % iconMap.length],
        color: colorMap[idx % colorMap.length],
      }));
    }
    return [
      { label: 'Fuel System', value: vehicleFuelDisplay, icon: 'fa-gas-pump', color: 'text-purple-600 bg-purple-50' },
      { label: 'Transmission', value: vehicleTransDisplay, icon: 'fa-gear', color: 'text-blue-600 bg-blue-50' },
      { label: 'Segment / Body', value: vehicleTypeDisplay, icon: 'fa-car', color: 'text-indigo-600 bg-indigo-50' },
      { label: 'Condition', value: item.condition === 'new' ? 'Brand New' : 'Certified Pre-Owned', icon: 'fa-certificate', color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Model Year', value: String(item.year || '2026'), icon: 'fa-calendar-check', color: 'text-amber-600 bg-amber-50' },
      { label: 'Authorized Dealership', value: item.showroom?.name || item.location || 'Kalyani Motors Bangalore', icon: 'fa-building', color: 'text-teal-600 bg-teal-50' },
    ];
  })();

  // Numeric Price for Mortgage Calculator (only applies to properties)
  let numericPrice = 7500000;
  if (isProperty && item?.price) {
    const match = String(item.price).replace(/,/g, '').match(/([\d.]+)/);
    if (match) {
      let val = parseFloat(match[1]);
      const lower = String(item.price).toLowerCase();
      if (lower.includes('cr')) val = val * 10000000;
      else if (lower.includes('lakh') || lower.includes('lac')) val = val * 100000;
      else if (val < 10000) val = val * 100000; // e.g., 75 -> 75 Lakhs
      numericPrice = Math.round(val);
    }
  }

  // Price per sqft computation - ONLY for properties
  let pricePerSqftDisplay = null;
  if (isProperty) {
    if (item?.pricePerSqft) {
      pricePerSqftDisplay = item.pricePerSqft;
    } else if (item?.priceSuffix && String(item.priceSuffix).toLowerCase().includes('sq')) {
      pricePerSqftDisplay = item.priceSuffix;
    } else if (numericPrice > 0 && sqftDisplay) {
      const sqftMatch = String(sqftDisplay).replace(/,/g, '').match(/([\d.]+)/);
      if (sqftMatch) {
        const sqftNum = parseFloat(sqftMatch[1]);
        if (sqftNum > 100) {
          const rate = Math.round(numericPrice / sqftNum);
          pricePerSqftDisplay = `₹${rate.toLocaleString('en-IN')}/sq ft`;
        }
      }
    }
  }

  const isPropertyOrVehicle = isProperty;

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Lightbox Modals */}
      {galleryOpen && (
        <GalleryModal
          items={mediaItems}
          index={currentImageIndex}
          onClose={() => setGalleryOpen(false)}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
      {fpGalleryOpen && (
        <GalleryModal
          items={fpMediaItems}
          index={fpGalleryIndex}
          onClose={() => setFpGalleryOpen(false)}
          onPrev={goFpPrev}
          onNext={goFpNext}
        />
      )}

      {/* Enquiry Modal */}
      <EnquiryModal
        open={enquiryOpen}
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        propertyTitle={item.title}
        propertyId={item.id || item._id}
      />

      {/* ─── TOP NAVIGATION & BREADCRUMBS ─── */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
                title="Go back"
              >
                <i className="fa-solid fa-arrow-left text-[11px]" />
                <span>Back</span>
              </button>
              <Breadcrumbs
                categoryName={categoryName}
                categoryLink={categoryLink}
                itemTitle={itemTitle}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
                  isSaved ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className={`${isSaved ? 'fa-solid text-rose-500' : 'fa-regular'} fa-heart`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-share-nodes" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── HOMEZ SINGLE V1 HERO HEADER ─── */}
      <div ref={heroRef} className="bg-white border-b border-gray-200/70 pt-4 sm:pt-5 pb-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Title, Location, Badges, Bed/Bath/Sqft */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-blue/10 text-brand-blue text-[11px] font-bold px-3 py-0.5">
                  {item.category || item.brand || categoryName}
                </span>

                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-3 py-0.5 inline-flex items-center gap-1.5">
                  <i className="fa-solid fa-circle text-[6px] text-emerald-500" />
                  {statusPill?.label || item.possession || 'For Sale'}
                </span>

                {item.loanApproved && (
                  <span className="rounded-full bg-blue-50 text-brand-blue border border-blue-200 text-[11px] font-bold px-2.5 py-0.5 inline-flex items-center gap-1">
                    <i className="fa-solid fa-circle-check text-[10px]" /> Loan Pre-Approved
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {itemTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center gap-1.5 font-medium text-gray-700">
                  <i className="fa-solid fa-location-dot text-rose-500 shrink-0" />
                  <span>{item.address || item.showroom?.address || item.location || 'Bangalore, Karnataka'}</span>
                </span>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <span className="flex items-center gap-1 text-gray-500">
                  <i className="fa-regular fa-clock text-xs" />
                  <span>Verified Listing</span>
                </span>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <span className="font-semibold text-gray-400">
                  ID: #{String(item.id || item._id || 'RT48').slice(-6)}
                </span>
              </div>

              {/* Header Meta Row: Vehicle vs Property vs Generic */}
              {isVehicle ? (
                <div className="flex flex-wrap items-center gap-5 pt-1 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-gas-pump text-emerald-600 text-sm" />
                    <span>{vehicleFuelDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-gear text-brand-blue text-sm" />
                    <span>{vehicleTransDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-car text-indigo-600 text-sm" />
                    <span>{vehicleTypeDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-calendar-check text-amber-600 text-sm" />
                    <span>{vehicleYearDisplay}</span>
                  </div>
                </div>
              ) : isProperty ? (
                <div className="flex flex-wrap items-center gap-5 pt-1 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-bed text-brand-blue text-sm" />
                    <span>{bedsDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-shower text-cyan-600 text-sm" />
                    <span>{bathsDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-vector-square text-emerald-600 text-sm" />
                    <span>{sqftDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-house-chimney text-amber-600 text-sm" />
                    <span>{propertyTypeDisplay}</span>
                  </div>
                </div>
              ) : (
                item.cardPills && item.cardPills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-sm font-semibold text-gray-700">
                    {item.cardPills.map((pill, idx) => (
                      <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                        {pill}
                      </span>
                    ))}
                  </div>
                )
              )}

              {headerExtra && (
                <div className="pt-2">
                  {headerExtra}
                </div>
              )}
            </div>

            {/* Right 4 Cols: Actions, Price & Rate */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-3 pt-0">
              {(directMapUrl || pdfUrl) && (
                <div className="flex items-center gap-2 mb-1">
                  {directMapUrl && (
                    <a
                      href={directMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
                      title="View on Google Maps"
                    >
                      <i className="fa-solid fa-map-location-dot text-sm" />
                    </a>
                  )}
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
                      title="Download Brochure PDF"
                    >
                      <i className="fa-solid fa-file-pdf text-rose-500 text-sm" />
                    </a>
                  )}
                </div>
              )}

              <div className="lg:text-end flex flex-col items-start lg:items-end gap-3 w-full">
                {/* ── Co-Branding / Verification Partner Badge ── */}
                <VerifiedPartnerBadge partnerName={partnerDisplayName} />

                {isVehicle ? (
                  <div className="w-full bg-gradient-to-br from-slate-50 via-sky-50/40 to-blue-50/50 border border-sky-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5 lg:text-start">
                    <div className="flex items-center justify-between gap-3 border-b border-sky-100 pb-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-brand-blue uppercase tracking-wider">
                        <i className="fa-solid fa-car text-brand-blue text-xs" />
                        Dealership Offer &amp; Assistance
                      </span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5">
                        Verified Deal
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-sm font-black text-slate-900 leading-snug">
                        Best On-Road Price on Request
                      </div>
                      <p className="text-[11px] font-medium text-slate-600 leading-tight">
                        Authorized showroom pricing, exchange bonus &amp; doorstep test drive.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5 w-full">
                      <button
                        type="button"
                        onClick={() => setEnquiryOpen(true)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        <i className="fa-solid fa-paper-plane text-xs" />
                        <span>Enquire Now</span>
                      </button>
                      <a
                        href={`tel:${activeContact.phoneTel || '+918546996622'}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        <i className="fa-solid fa-phone text-xs" />
                        <span>Call: {activeContact.phoneDisplay || '+91 85469 96622'}</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setEnquiryOpen(true)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                    >
                      <i className="fa-solid fa-paper-plane text-xs" />
                      <span>Enquire Now</span>
                    </button>
                    <a
                      href={`tel:${activeContact.phoneTel || '+918546996622'}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                    >
                      <i className="fa-solid fa-phone text-xs" />
                      <span>Call: {activeContact.phoneDisplay || '+91 85469 96622'}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── 5-PHOTO LUXURY MOSAIC GALLERY (Homez Single V1) ─── */}
          <div className="mt-5">
            {mediaItems.length <= 1 ? (
              <div
                onClick={() => setGalleryOpen(true)}
                className="relative h-[340px] sm:h-[460px] lg:h-[520px] rounded-2xl overflow-hidden bg-gray-900 shadow-sm cursor-pointer group"
              >
                <img
                  src={resolveImage(currentMedia?.url || currentMedia)}
                  alt={item.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = ONEVISHWAM_VERIFIED_IMAGE;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <button className="absolute bottom-5 right-5 rounded-xl bg-white/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-brand-charcoal hover:bg-white transition-colors flex items-center gap-2 shadow-lg cursor-pointer">
                  <i className="fa-solid fa-expand" /> View Fullscreen
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-[360px] sm:h-[460px] lg:h-[500px] rounded-2xl overflow-hidden">
                {/* Main Hero Photo (Left 2x2) */}
                <div
                  onClick={() => { setCurrentImageIndex(0); setGalleryOpen(true); }}
                  className="md:col-span-2 md:row-span-2 relative overflow-hidden bg-gray-900 cursor-pointer group"
                >
                  {mediaItems[0]?.type === 'video' ? (
                    <video src={mediaItems[0].url} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <img
                      src={resolveImage(mediaItems[0]?.url || mediaItems[0])}
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = ONEVISHWAM_VERIFIED_IMAGE;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  <div className="absolute top-4 left-4 rounded-lg bg-black/60 backdrop-blur-md px-3 py-1 text-xs text-white font-semibold">
                    Featured
                  </div>
                  {mediaItems.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setGalleryOpen(true); }}
                      className="md:hidden absolute bottom-3 right-3 rounded-xl bg-black/65 hover:bg-black/80 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg active:scale-95 z-20 cursor-pointer"
                    >
                      <i className="fa-solid fa-images text-[11px]" />
                      <span>1 / {mediaItems.length} Photos</span>
                    </button>
                  )}
                </div>

                {/* Right 4 Grid Photos */}
                {mediaItems.slice(1, 5).map((media, idx) => {
                  const actualIdx = idx + 1;
                  const hasMore = mediaItems.length > 5 && idx === 3;

                  return (
                    <div
                      key={actualIdx}
                      onClick={() => { setCurrentImageIndex(actualIdx); setGalleryOpen(true); }}
                      className="relative overflow-hidden bg-gray-900 cursor-pointer group hidden md:block"
                    >
                      {media.type === 'video' ? (
                        <div className="relative w-full h-full">
                          <video src={media.url} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <i className="fa-solid fa-play text-white text-lg" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={resolveImage(media.url)}
                          alt={`${item.title} - ${actualIdx + 1}`}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = ONEVISHWAM_VERIFIED_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                      {/* View All Photos Overlay on the 4th Slot */}
                      {hasMore && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-3 text-center group-hover:bg-black/70 transition-colors">
                          <i className="fa-solid fa-images text-xl mb-1 text-amber-400" />
                          <span className="text-sm font-bold">+{mediaItems.length - 4} More</span>
                          <span className="text-[11px] text-gray-300">View all photos</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mobile Thumbnails & Gallery CTA */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <i className="fa-solid fa-camera text-brand-blue" />
                <span>{mediaItems.length} Photos &amp; Media available</span>
              </div>
              <button
                onClick={() => setGalleryOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
              >
                <i className="fa-solid fa-table-cells" /> Show all photos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN 2-COLUMN SECTION (Homez col-lg-8 & col-lg-4 Layout) ─── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ════ LEFT 8-COLUMN CONTENT (col-lg-8) ════ */}
          <div className="lg:col-span-8 space-y-8">
            {children}

            {/* 1. OVERVIEW WIDGET */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-6">{bentoTitle}</h4>

              {isVehicle ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {vehicleHighlights.map((hl, idx) => {
                    const iconClass = hl.icon || 'fa-car';
                    const colorClass = hl.color || 'text-brand-blue bg-blue-50';
                    return (
                      <div key={idx} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-white hover:shadow-2xs transition-all">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 ${colorClass}`}>
                          <i className={`fa-solid ${iconClass}`} />
                        </div>
                        <div className="min-w-0">
                          <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                            {hl.label || hl.key}
                          </h6>
                          <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5 truncate" title={String(hl.value || '')}>
                            {hl.value || 'Verified'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : isProperty ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  {/* 1. Bedroom */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center text-lg shrink-0">
                      <i className="fa-solid fa-bed" />
                    </div>
                    <div>
                      <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bedroom</h6>
                      <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">{bedsDisplay}</p>
                    </div>
                  </div>

                  {/* 2. Bath */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-lg shrink-0">
                      <i className="fa-solid fa-shower" />
                    </div>
                    <div>
                      <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bath</h6>
                      <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">{bathsDisplay}</p>
                    </div>
                  </div>

                  {/* 3. Year Built / Possession */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">
                      <i className="fa-solid fa-calendar-check" />
                    </div>
                    <div>
                      <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Year Built / Status</h6>
                      <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">{yearBuiltDisplay}</p>
                    </div>
                  </div>

                  {/* 4. Garage */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
                      <i className="fa-solid fa-warehouse" />
                    </div>
                    <div>
                      <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Garage / Parking</h6>
                      <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">{garageDisplay}</p>
                    </div>
                  </div>

                  {/* 5. Sqft */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shrink-0">
                      <i className="fa-solid fa-expand" />
                    </div>
                    <div>
                      <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sqft / Area</h6>
                      <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">{sqftDisplay}</p>
                    </div>
                  </div>

                  {/* 6. Property Type */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg shrink-0">
                      <i className="fa-solid fa-house-chimney" />
                    </div>
                    <div>
                      <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Property Type</h6>
                      <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">{propertyTypeDisplay}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  {bentoHighlights.map((hl, idx) => (
                    <div key={idx} className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 ${hl.color || 'text-brand-blue bg-blue-50'}`}>
                        <i className={`fa-solid ${hl.icon || 'fa-tag'}`} />
                      </div>
                      <div>
                        <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{hl.label || hl.key}</h6>
                        <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">{hl.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. DESCRIPTION WIDGET */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <h4 className="text-lg sm:text-xl font-bold text-slate-900">
                {isVehicle ? 'Vehicle Description' : isProperty ? 'Property Description' : 'Product Description'}
              </h4>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
                {showFullDesc || !item.description || item.description.length < 350
                  ? item.description || (isVehicle
                      ? `${itemTitle} available with verified inspection, manufacturer warranty support, and pre-approved vehicle loans under the OneVishwam Automotive Network.`
                      : isProperty
                      ? `${itemTitle} verified and listed on OneVishwam. Inspected for quality, legal authenticity, and pre-approved for priority bank financing and buyer protection.`
                      : `${itemTitle} verified and listed on OneVishwam with quality assurance and priority service.`)
                  : item.description.slice(0, 350) + '...'}
              </p>

              {item.description && item.description.length > 350 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-navy transition-colors pt-1 cursor-pointer"
                >
                  {showFullDesc ? 'Show Less' : 'Show More'}
                  <i className={`fa-solid fa-chevron-${showFullDesc ? 'up' : 'down'} text-[10px]`} />
                </button>
              )}

              {/* Quick Feature Badges */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                {item.loanApproved && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-3 py-1 text-xs font-semibold">
                    <i className="fa-solid fa-circle-check" /> 100% Pre-Approved Loan
                  </span>
                )}
                {item.highlightBanner && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/70 px-3 py-1 text-xs font-semibold">
                    <i className="fa-solid fa-stamp" /> {item.highlightBanner}
                  </span>
                )}
                {enterpriseName && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 text-gray-700 px-3 py-1 text-xs font-semibold">
                    <i className="fa-solid fa-user-check" /> Verified by {enterpriseName}
                  </span>
                )}
              </div>
            </div>

            {/* 3. DETAILS TABLE WIDGET */}
            {isProperty ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-6">Property Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                  <div className="divide-y divide-gray-100">
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Property ID</span>
                      <span className="font-bold text-slate-900">RT{String(item.id || item._id || '48').slice(-4).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Pricing</span>
                      <button
                        type="button"
                        onClick={() => setEnquiryOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold text-xs shadow-2xs hover:shadow-sm transition-all cursor-pointer"
                      >
                        <i className="fa-solid fa-handshake-angle text-xs" />
                        <span>Are You Interested?</span>
                      </button>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Property Size</span>
                      <span className="font-bold text-slate-900">{sqftDisplay}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Bathrooms</span>
                      <span className="font-bold text-slate-900">{bathsDisplay}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Bedrooms</span>
                      <span className="font-bold text-slate-900">{bedsDisplay}</span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Garage</span>
                      <span className="font-bold text-slate-900">{garageDisplay}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Door Facing</span>
                      <span className="font-bold text-slate-900">{item.facing || 'East Facing'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Year Built / Status</span>
                      <span className="font-bold text-slate-900">{yearBuiltDisplay}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Property Type</span>
                      <span className="font-bold text-slate-900">{propertyTypeDisplay}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Property Status</span>
                      <span className="font-bold text-emerald-600">{statusPill?.label || 'For Sale'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : isVehicle ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center text-base">
                    <i className="fa-solid fa-car" />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900">Vehicle Specifications &amp; Overview</h4>
                    <p className="text-xs text-gray-500">Certified automobile technical parameters and showroom details</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                  <div className="divide-y divide-gray-100">
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Vehicle ID</span>
                      <span className="font-bold text-slate-900">VH#{String(item.id || item._id || '01').slice(-6)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Brand</span>
                      <span className="font-bold text-slate-900">{item.brand || 'Maruti Suzuki'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Model</span>
                      <span className="font-bold text-slate-900">{item.model || itemTitle}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Fuel Type</span>
                      <span className="font-bold text-slate-900">{vehicleFuelDisplay}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Transmission</span>
                      <span className="font-bold text-slate-900">{vehicleTransDisplay}</span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Segment / Body</span>
                      <span className="font-bold text-slate-900">{vehicleTypeDisplay}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Condition</span>
                      <span className="font-bold text-emerald-600">{item.condition === 'new' ? 'Brand New' : 'Certified Pre-Owned'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Model Year</span>
                      <span className="font-bold text-slate-900">{item.year || '2026'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">KM Driven</span>
                      <span className="font-bold text-slate-900">{item.kmDriven !== undefined ? `${item.kmDriven} km` : '0 km (New)'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm">
                      <span className="font-semibold text-gray-500">Authorized Dealership</span>
                      <span className="font-bold text-slate-900 truncate max-w-[200px]" title={item.showroom?.name || item.location}>{item.showroom?.name || item.location || 'Kalyani Motors Bangalore'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 4. ADDRESS & GOOGLE MAPS WIDGET */}
            {hasLocationOrMap && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900">Address</h4>
                  {directMapUrl && (
                    <a
                      href={directMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
                    >
                      <i className="fa-solid fa-map-location-dot" /> Open Google Maps
                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 divide-y md:divide-y-0 divide-gray-100">
                  <div className="space-y-3 py-2 md:py-0">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-500">Address</span>
                      <span className="font-bold text-slate-900 text-right">{item.address || item.location || 'Bangalore'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-500">City</span>
                      <span className="font-bold text-slate-900">{item.city || 'Bengaluru'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-500">State / Zone</span>
                      <span className="font-bold text-slate-900">{item.zone || 'Karnataka'}</span>
                    </div>
                  </div>
                  <div className="space-y-3 py-2 md:py-0">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-500">Locality</span>
                      <span className="font-bold text-slate-900">{item.locality || item.city || 'Bangalore Urban'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-500">Country</span>
                      <span className="font-bold text-slate-900">India</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-500">Pincode</span>
                      <span className="font-bold text-slate-900">{item.pincode || '560001'}</span>
                    </div>
                  </div>
                </div>

                {/* Embedded Responsive Google Map - Only show if mapUrl has non-empty data */}
                {embedMapUrl && (
                  <div className="mt-6 rounded-2xl overflow-hidden border border-gray-200/80 h-64 sm:h-72 w-full">
                    <iframe
                      src={embedMapUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                      title={isVehicle ? "Showroom Location Map" : isProperty ? "Property Location Map" : "Location Map"}
                      aria-label={isVehicle ? "Showroom Location Map" : isProperty ? "Property Location Map" : "Location Map"}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 5. FEATURES & AMENITIES WIDGET */}
            {featuresList.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900">{featuresTitle}</h4>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {featuresList.length} Verified Highlights
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3.5 gap-x-6">
                  {featuresList.map((feat, idx) => {
                    const featName = typeof feat === 'string' ? feat : feat.name;
                    return (
                      <div key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                        <i className="fa-solid fa-circle text-[7px] text-amber-500 shrink-0" />
                        <span className="truncate">{featName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. FLOOR PLANS WIDGET (Properties Only) */}
            {isProperty && hasFloorPlans && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900">Floor Plans</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Architectural dimensions, unit blueprint, and master site schematics</p>
                  </div>
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      <i className="fa-solid fa-file-pdf text-red-500" />
                      <span>Download Blueprint Brochure (PDF)</span>
                    </a>
                  )}
                </div>

                <div className="space-y-3">
                  {fpMediaItems.length > 0 ? (
                    fpMediaItems.map((fp, i) => (
                      <div key={i} className="rounded-xl border border-gray-200/90 overflow-hidden">
                        <button
                          onClick={() => setActiveFloorPlanTab(activeFloorPlanTab === i ? -1 : i)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50/70 hover:bg-gray-100/80 transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-slate-900">
                              {i === 0 ? 'Master Floor Plan' : i === 1 ? 'First Floor Plan' : `Unit Layout ${i + 1}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                            <span className="hidden sm:inline"><span className="text-gray-400 font-normal">Size:</span> {sqftDisplay}</span>
                            <span className="hidden sm:inline"><span className="text-gray-400 font-normal">Bedrooms:</span> {bedsDisplay}</span>
                            <span className="hidden sm:inline"><span className="text-gray-400 font-normal">Baths:</span> {bathsDisplay}</span>
                            <i className={`fa-solid fa-chevron-${activeFloorPlanTab === i ? 'up' : 'down'} text-gray-400 text-xs ml-2`} />
                          </div>
                        </button>
                        {activeFloorPlanTab === i && (
                          <div
                            onClick={() => { setFpGalleryIndex(i); setFpGalleryOpen(true); }}
                            className="p-6 bg-white flex flex-col items-center justify-center cursor-pointer group border-t border-gray-100"
                          >
                            <img
                              src={resolveImage(fp.url || fp)}
                              alt={`Floor Plan ${i + 1}`}
                              className="max-h-80 w-auto object-contain group-hover:scale-102 transition-transform duration-300"
                            />
                            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                              <i className="fa-solid fa-magnifying-glass-plus" /> Click image to zoom &amp; inspect
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      Floor plans and architectural layouts are available on request through your dedicated advisor.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Specifications Section if passed */}
            {specSections.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base">
                    <i className="fa-solid fa-table-list" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Detailed Technical Specifications</h2>
                    <p className="text-xs text-gray-500">Comprehensive manufacturer parameters and configurations</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {specSections.map((sec, secIdx) => (
                    <div key={secIdx} className="rounded-2xl border border-gray-100 bg-gray-50/60 overflow-hidden">
                      <div className="bg-gray-100/80 px-4 py-3 border-b border-gray-200/60">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                          {sec.title}
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-100 p-2">
                        {sec.items.map((it, itIdx) => (
                          <div key={itIdx} className="flex justify-between items-center py-2 px-3 text-xs">
                            <span className="font-semibold text-gray-500">{it.label}</span>
                            <span className="font-bold text-slate-900 text-right">{it.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ════ RIGHT 4-COLUMN STICKY SIDEBAR (col-lg-4) ════ */}
          <div className="lg:col-span-4 space-y-6 sticky top-24 self-start">
            {/* Contact Action Card */}
            <div className="rounded-2xl border border-gray-200/80 p-6 sm:p-7 bg-white shadow-sm space-y-4">
              {/* Co-Branding / Verification Partner Badge */}
              <div className="flex justify-center pb-1">
                <VerifiedPartnerBadge partnerName={partnerDisplayName} />
              </div>

              <div className="space-y-3">
                <a
                  href={`tel:${activeContact.phoneTel || '+918546996622'}`}
                  className="w-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-slate-800 py-3 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
                >
                  <i className="fa-solid fa-phone text-brand-blue text-sm" />
                  <span>Call: {activeContact.phoneDisplay || '+91 85469 96622'}</span>
                </a>

                <a
                  href={`https://wa.me/${activeContact.whatsapp || '918546996622'}?text=${encodeURIComponent(`Hello, I am interested in viewing: ${itemTitle} (${window.location.href})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
                >
                  <i className="fa-brands fa-whatsapp text-base" />
                  <span>Chat on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
                >
                  <i className="fa-solid fa-paper-plane text-xs" />
                  <span>{isProperty ? 'Contact Agent' : 'Enquire Now'}</span>
                </button>
              </div>
            </div>

            {/* Sticky Card 3: OneVishwam Assurance Banner */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#d9ebfa] via-[#e8f2fb] to-[#cfe4f6] text-slate-900 p-5 space-y-3 shadow-sm border border-sky-200/90 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-300/40 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex items-center gap-2">
                <i className="fa-solid fa-award text-brand-blue text-base" />
                <span className="text-xs font-black tracking-wide uppercase text-slate-950">OneVishwam Assurance</span>
              </div>
              <ul className="relative z-10 text-xs space-y-2 text-slate-700 font-bold">
                {isVehicle ? (
                  <>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-600 text-xs shrink-0" />
                      <span>100% Authorized Dealership Warranty</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-600 text-xs shrink-0" />
                      <span>Doorstep Test Drive Assistance Available</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-600 text-xs shrink-0" />
                      <span>Pre-Approved Vehicle Loan & Fast Delivery</span>
                    </li>
                  </>
                ) : isProperty ? (
                  <>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-600 text-xs shrink-0" />
                      <span>100% Verified Legal Clear Titles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-600 text-xs shrink-0" />
                      <span>Zero Brokerage on Direct Builder Bookings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-600 text-xs shrink-0" />
                      <span>Free Guided Site Visit with Pickup Facility</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-600 text-xs shrink-0" />
                      <span>100% Genuine Verified Products</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-600 text-xs shrink-0" />
                      <span>Direct Manufacturer Pricing & Deals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-600 text-xs shrink-0" />
                      <span>Dedicated Advisor & Support Assistance</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* ═══ BOTTOM FULL-WIDTH: Discover Similar Items Slider ═══ */}
        {featuredListings.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-200/80">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {isVehicle ? 'Discover Similar Vehicles & Automobiles' : isProperty ? 'Discover Our Featured Properties' : 'Discover Similar Products'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isVehicle
                    ? 'Explore comparable verified hatchbacks, sedans, SUVs, and commercial vehicles'
                    : isProperty
                    ? 'Explore comparable verified listings and premier projects in Bangalore'
                    : 'Explore comparable verified listings in this category'}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => { similarRef.current?.scrollBy({ left: -340, behavior: 'smooth' }); }}
                  className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
                  aria-label="Previous listings"
                >
                  <i className="fa-solid fa-arrow-left-long" />
                </button>
                <button
                  onClick={() => { similarRef.current?.scrollBy({ left: 340, behavior: 'smooth' }); }}
                  className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
                  aria-label="Next listings"
                >
                  <i className="fa-solid fa-arrow-right-long" />
                </button>
              </div>
            </div>

            <div
              ref={similarRef}
              className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide"
            >
              {featuredListings.map((sp) => (
                <div key={sp.id || sp._id} className="w-[280px] sm:w-[320px] lg:w-[340px] flex-shrink-0 snap-start">
                  <CategoryListingCard
                    item={sp}
                    link={`${itemLinkPrefix}${sp.id || sp._id}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ RECENTLY VIEWED (If user has browsed other items) ═══ */}
        {recentlyViewed.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200/60">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center text-sm">
                <i className="fa-solid fa-clock-rotate-left" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recently Viewed {categoryName}</h3>
                <p className="text-xs text-gray-500">Pick up right where you left off</p>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide">
              {recentlyViewed.map((sp, i) => (
                <div key={(sp.id || sp._id) + '-recent-' + i} className="w-[260px] sm:w-[290px] lg:w-[310px] flex-shrink-0 snap-start">
                  <CategoryListingCard
                    item={sp}
                    link={`${itemLinkPrefix}${sp.id || sp._id}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── SLEEK STICKY BOTTOM ACTION BAR (Shows on scroll, auto-hides before footer) ─── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-in-out ${
          scrolledPastHero && !reachedFooter ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {mediaItems[0]?.url && (
              <img
                src={resolveImage(mediaItems[0].url)}
                alt={itemTitle}
                className="hidden sm:block w-11 h-11 rounded-xl object-cover border border-gray-200 shrink-0 shadow-2xs"
              />
            )}
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                {itemTitle}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="text-xs font-extrabold text-amber-600 hover:text-amber-700 underline flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-solid fa-handshake-angle text-[10px]" />
                  <span>Are You Interested?</span>
                </button>
                {(item.locality || item.location) && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-gray-400 truncate">
                    <span>•</span>
                    <i className="fa-solid fa-location-dot text-[9px] text-rose-500" />
                    <span>{item.locality || item.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Co-Branding / Verification Partner Badge on wider viewports */}
            <VerifiedPartnerBadge partnerName={partnerDisplayName} className="hidden xl:inline-flex" />
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-xl border transition-colors cursor-pointer ${
                isSaved ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              <i className={`${isSaved ? 'fa-solid text-rose-500' : 'fa-regular'} fa-heart text-sm`} />
            </button>

            <button
              onClick={() => setEnquiryOpen(true)}
              className="rounded-xl bg-slate-900 px-3.5 sm:px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <i className="fa-solid fa-paper-plane text-xs" />
              <span>Enquire Now</span>
            </button>

            <a
              href={`tel:${activeContact.phoneTel || '+918546996622'}`}
              className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 px-3.5 sm:px-4 py-2.5 text-xs font-bold text-slate-950 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-phone text-xs" />
              <span className="hidden sm:inline">Call: {activeContact.phoneDisplay || '+91 85469 96622'}</span>
              <span className="sm:hidden">Call</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
