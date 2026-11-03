import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from '../../store/locationSlice';
import API from '../../services/api';

/* ── Slide Backgrounds for Homez Hero Banner ── */
const HERO_SLIDES = [
  {
    id: 'properties',
    category: 'Properties',
    title: 'Find Your Dream Home',
    subtitle: 'Over 10,000+ verified apartments, residential plots, villas & commercial spaces across Bengaluru.',
    link: '/categories/properties',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80',
    badgeIcon: 'fa-solid fa-house-chimney',
    ctaText: 'Explore Properties',
  },
  {
    id: 'all-services',
    category: 'All Categories',
    title: 'Discover Verified Ecosystem Services',
    subtitle: 'Everything in one trusted platform — verified properties, automobiles, electronics & comfort living.',
    link: '/categories',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80',
    badgeIcon: 'fa-solid fa-shapes',
    ctaText: 'Explore All Categories',
  },
  {
    id: 'automobile',
    category: 'Automobiles',
    title: 'Find Your Dream Automobile',
    subtitle: 'Verified new and certified pre-owned family cars, two-wheelers & commercial transports.',
    link: '/categories/automobile',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=80',
    badgeIcon: 'fa-solid fa-car',
    ctaText: 'Explore Automobiles',
  },
  {
    id: 'electronics',
    category: 'Consumer Electronics',
    title: 'Find Top Brand Appliances',
    subtitle: 'Energy-saving 5-star ACs, double door refrigerators, washing machines & smart entertainment.',
    link: '/categories/consumer-electronics',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1800&q=80',
    badgeIcon: 'fa-solid fa-tv',
    ctaText: 'Explore Electronics',
  },
  {
    id: 'bedding',
    category: 'Comfort',
    title: 'Find Doctor-Approved Comfort',
    subtitle: 'Orthopedic memory foam mattresses, pillows & bedsheets at genuine factory-direct prices.',
    link: '/categories/bedding-comfort',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1800&q=80',
    badgeIcon: 'fa-solid fa-bed',
    ctaText: 'Explore Comfort',
  },
];

/* ── Category Badges Styling for Live Dropdown ── */
const CATEGORY_BADGE_STYLES = {
  properties: 'bg-blue-50 text-blue-700 border border-blue-200',
  vehicles: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  automobile: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  electronics: 'bg-purple-50 text-purple-700 border border-purple-200',
  'consumer-electronics': 'bg-purple-50 text-purple-700 border border-purple-200',
  bedding: 'bg-amber-50 text-amber-700 border border-amber-200',
  'bedding-comfort': 'bg-amber-50 text-amber-700 border border-amber-200',
  finance: 'bg-sky-50 text-sky-700 border border-sky-200',
  'finance-lending': 'bg-sky-50 text-sky-700 border border-sky-200',
};

/* ── 5 Category Search Tabs ── */
const SEARCH_TABS = [
  {
    id: 'all',
    label: 'All Categories',
    shortLabel: 'All',
    icon: 'fa-solid fa-shapes',
    route: '/categories',
    placeholder: 'Search across properties, automobiles, electronics, comfort...',
  },
  {
    id: 'properties',
    label: 'Properties',
    shortLabel: 'Properties',
    icon: 'fa-solid fa-house-chimney',
    route: '/categories/properties',
    placeholder: 'Search flats, plots, villas in Bengaluru...',
  },
  {
    id: 'automobile',
    label: 'Automobiles',
    shortLabel: 'Auto',
    icon: 'fa-solid fa-car',
    route: '/categories/automobile',
    placeholder: 'Search cars, bikes, SUVs, commercial fleets...',
  },
  {
    id: 'consumer-electronics',
    label: 'Electronics',
    shortLabel: 'Electronics',
    icon: 'fa-solid fa-tv',
    route: '/categories/consumer-electronics',
    placeholder: 'Search TVs, ACs, double door refrigerators, appliances...',
  },
  {
    id: 'bedding-comfort',
    label: 'Comfort',
    shortLabel: 'Comfort',
    icon: 'fa-solid fa-bed',
    route: '/categories/bedding-comfort',
    placeholder: 'Search orthopedic mattresses, pillows, bedsheets...',
  },
];

/* ── Illustrated Vector Icons (Lineal Color Style with Dark Outline & Accents) ── */
function PropertiesVectorIcon({ className = 'w-10 h-10' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="42" y="14" width="6" height="12" rx="1.5" fill="#fca5a5" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="48" cy="9" r="2" fill="#93c5fd" opacity="0.8" />
      <circle cx="51" cy="5" r="1.5" fill="#93c5fd" opacity="0.6" />
      <path d="M10 28L32 10L54 28" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 26L32 12L51 26" fill="#60a5fa" />
      <rect x="15" y="27" width="34" height="27" rx="3" fill="#eff6ff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="20" y="33" width="10" height="10" rx="2" fill="#bae6fd" stroke="#1e293b" strokeWidth="2" />
      <line x1="25" y1="33" x2="25" y2="43" stroke="#1e293b" strokeWidth="1.5" />
      <line x1="20" y1="38" x2="30" y2="38" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M36 54V41C36 39.8954 36.8954 39 38 39H44C45.1046 39 46 39.8954 46 41V54" fill="#fbbf24" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="43" cy="47" r="1" fill="#1e293b" />
      <path d="M6 16L7.5 13L9 16L12 17.5L9 19L7.5 22L6 19L3 17.5L6 16Z" fill="#fbbf24" />
      <path d="M57 38L58 36L59 38L61 39L59 40L58 42L57 40L55 39L57 38Z" fill="#38bdf8" />
    </svg>
  );
}

function VehiclesVectorIcon({ className = 'w-10 h-10' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M16 28L23 16H41L48 28" fill="#a7f3d0" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="32" y1="16" x2="32" y2="28" stroke="#1e293b" strokeWidth="2" />
      <path d="M8 36C8 31.578 11.578 28 16 28H48C52.422 28 56 31.578 56 36V43C56 44.1046 55.1046 45 54 45H10C8.89543 45 8 44.1046 8 43V36Z" fill="#34d399" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="8" y="32" width="4" height="6" rx="1.5" fill="#fde047" stroke="#1e293b" strokeWidth="1.5" />
      <rect x="52" y="32" width="4" height="6" rx="1.5" fill="#fde047" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="19" cy="46" r="7" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
      <circle cx="19" cy="46" r="3" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="45" cy="46" r="7" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
      <circle cx="45" cy="46" r="3" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M54 20L55 18L56 20L58 21L56 22L55 24L54 22L52 21L54 20Z" fill="#fbbf24" />
      <line x1="3" y1="38" x2="6" y2="38" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
      <line x1="1" y1="42" x2="5" y2="42" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ElectronicsVectorIcon({ className = 'w-10 h-10' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="9" y="12" width="46" height="32" rx="4" fill="#f3e8ff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="13" y="16" width="38" height="24" rx="2" fill="#c084fc" />
      <path d="M16 18L32 18L22 38L14 38L16 18Z" fill="#ffffff" fillOpacity="0.3" />
      <circle cx="32" cy="28" r="3" fill="#ffffff" fillOpacity="0.4" />
      <path d="M26 44L24 50H40L38 44" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#e2e8f0" />
      <line x1="20" y1="50" x2="44" y2="50" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52 8L53.5 5L55 8L58 9.5L55 11L53.5 14L52 11L49 9.5L52 8Z" fill="#fbbf24" />
      <path d="M6 24L7 22L8 24L10 25L8 26L7 28L6 26L4 25L6 24Z" fill="#a855f7" />
    </svg>
  );
}

function BeddingVectorIcon({ className = 'w-10 h-10' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 48V20C12 18.8954 12.8954 18 14 18H20C21.1046 18 22 18.8954 22 20V48" fill="#fed7aa" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="12" y1="46" x2="12" y2="54" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="54" y1="46" x2="54" y2="54" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="18" y="27" width="10" height="9" rx="3" fill="#ffedd5" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" transform="rotate(-6 18 27)" />
      <rect x="25" y="28" width="10" height="9" rx="3" fill="#fff7ed" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" transform="rotate(4 25 28)" />
      <rect x="18" y="36" width="36" height="8" rx="2" fill="#fff" stroke="#1e293b" strokeWidth="2" />
      <path d="M26 36H52C53.1046 36 54 36.8954 54 38V47C54 48.1046 53.1046 49 52 49H26V36Z" fill="#fb923c" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M26 36C29 36 29 41 32 41H54" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 14L39.5 11L41 14L44 15.5L41 17L39.5 20L38 17L35 15.5L38 14Z" fill="#fbbf24" />
      <path d="M49 22L50 20L51 22L53 23L51 24L50 26L49 24L47 23L49 22Z" fill="#f97316" />
    </svg>
  );
}

function AllServicesVectorIcon({ className = 'w-10 h-10' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="12" y="12" width="16" height="16" rx="4" fill="#fca5a5" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="36" y="12" width="16" height="16" rx="4" fill="#93c5fd" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="12" y="36" width="16" height="16" rx="4" fill="#a7f3d0" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="36" y="36" width="16" height="16" rx="4" fill="#fed7aa" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="20" cy="20" r="3" fill="#ffffff" fillOpacity="0.8" />
      <path d="M41 17L47 23M47 17L41 23" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="44" r="3" fill="#ffffff" fillOpacity="0.8" />
      <circle cx="44" cy="44" r="3" fill="#ffffff" fillOpacity="0.8" />
      <path d="M56 28L57 26L58 28L60 29L58 30L57 32L56 30L54 29L56 28Z" fill="#fbbf24" />
      <path d="M6 34L7 32L8 34L10 35L8 36L7 38L6 36L4 35L6 34Z" fill="#38bdf8" />
    </svg>
  );
}

/* ── The 5 Main Categories for Marketplace Points Module ── */
const FIVE_CATEGORIES = [
  {
    id: 'all-services',
    title: 'All Categories',
    link: '/categories',
    Icon: AllServicesVectorIcon,
    bgGlow: 'bg-rose-50/90 group-hover:bg-rose-100/90',
  },
  {
    id: 'properties',
    title: 'Properties',
    link: '/categories/properties',
    Icon: PropertiesVectorIcon,
    bgGlow: 'bg-blue-50/90 group-hover:bg-blue-100/90',
  },
  {
    id: 'automobile',
    title: 'Automobiles',
    link: '/categories/automobile',
    Icon: VehiclesVectorIcon,
    bgGlow: 'bg-emerald-50/90 group-hover:bg-emerald-100/90',
  },
  {
    id: 'consumer-electronics',
    title: 'Electronics',
    link: '/categories/consumer-electronics',
    Icon: ElectronicsVectorIcon,
    bgGlow: 'bg-purple-50/90 group-hover:bg-purple-100/90',
  },
  {
    id: 'bedding-comfort',
    title: 'Comfort',
    link: '/categories/bedding-comfort',
    Icon: BeddingVectorIcon,
    bgGlow: 'bg-orange-50/90 group-hover:bg-orange-100/90',
  },
];

/* ── Popular Search Chips with Category Targeting ── */
const POPULAR_CHIPS = [
  { label: 'Gated Plots Bengaluru', category: 'properties' },
  { label: '3 BHK Whitefield', category: 'properties' },
  { label: 'Maruti Brezza', category: 'automobile' },
  { label: 'Orthopedic Mattress', category: 'bedding-comfort' },
  { label: '5 Star AC', category: 'consumer-electronics' },
  { label: 'Commercial Spaces', category: 'properties' },
];

/* ── Address Highlight Helper matching NoBroker / Google Places Autocomplete UI ── */
function highlightAddress(text, query) {
  if (!text) return '';
  if (!query || !query.trim()) return text;

  const q = query.trim().toLowerCase();
  const lower = text.toLowerCase();

  // 1. Direct substring match
  const idx = lower.indexOf(q);
  if (idx !== -1) {
    return (
      <span>
        {text.slice(0, idx)}
        <strong className="font-extrabold text-slate-900">{text.slice(idx, idx + q.length)}</strong>
        {text.slice(idx + q.length)}
      </span>
    );
  }

  // 2. Token match (e.g. banshenkari matching Banashankari in first word)
  const words = text.split(/(\s+)/);
  let matched = false;
  return (
    <span>
      {words.map((word, i) => {
        if (!matched && word.trim() && (word.toLowerCase().startsWith(q) || q.startsWith(word.toLowerCase().slice(0, 4)))) {
          matched = true;
          return <strong key={i} className="font-extrabold text-slate-900">{word}</strong>;
        }
        return word;
      })}
    </span>
  );
}

/* Helper to resolve the correct gallery page route for any category */
function getGalleryRouteForCategory(category) {
  const cat = String(category || '').toLowerCase();
  if (cat === 'all' || cat === 'all-services') {
    return '/categories';
  }
  if (cat === 'properties' || cat === 'property' || cat === 'real-estate') {
    return '/categories/properties';
  }
  if (cat === 'jewellery' || cat === 'jewellery-gold' || cat === 'gold') {
    return '/categories/jewellery';
  }
  if (cat === 'automobiles' || cat === 'automobile' || cat === 'vehicles' || cat === 'vehicle') {
    return '/categories/automobile';
  }
  if (cat === 'electronics' || cat === 'consumer-electronics') {
    return '/categories/consumer-electronics';
  }
  if (cat === 'comfort' || cat === 'bedding' || cat === 'bedding-comfort') {
    return '/categories/bedding-comfort';
  }
  if (cat === 'finance' || cat === 'finance-lending' || cat === 'loans') {
    return '/categories/finance-lending';
  }
  return '/categories/properties';
}

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(0);
  const total = HERO_SLIDES.length;

  const [internalQuery, setInternalQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Live Multi-Category Search State
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { selectedCity = 'bengaluru' } = useLocation();

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  /* Autoplay */
  useEffect(() => {
    if (isPaused || total <= 1) return;
    timerRef.current = setInterval(next, 6500);
    return () => clearInterval(timerRef.current);
  }, [isPaused, next, total]);

  /* Touch Swiping */
  const onTouchStart = (e) => { touchStartX.current = e.changedTouches[0].screenX; };
  const onTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].screenX;
    if (diff > 50) next();
    else if (diff < -50) prev();
  };

  /* Close search suggestions on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Live Backend Database Multi-Category Search Query Hook ── */
  useEffect(() => {
    const q = internalQuery.trim();
    if (!q) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();

    const debounceTimer = setTimeout(async () => {
      try {
        const res = await API.get('/search', {
          params: {
            q,
            category: activeCategory,
            city: selectedCity,
            limit: 25,
          },
          signal: controller.signal,
        });
        const items = res.data?.data?.items || res.data?.items || [];
        setSuggestions(items);
      } catch (err) {
        if (err?.code !== 'ERR_CANCELED' && err?.name !== 'CanceledError') {
          console.error('Live search error:', err.message);
          setSuggestions([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [internalQuery, activeCategory, selectedCity]);

  /* Product click handler: navigates to the gallery page with the product filtered */
  const handleProductClick = (item) => {
    setShowSuggestions(false);
    setInternalQuery(item.title);
    const galleryBase = getGalleryRouteForCategory(item.category);
    const itemId = item.id || item._id || '';
    const qParam = encodeURIComponent(item.title);
    const idParam = itemId ? `&id=${encodeURIComponent(itemId)}` : '';
    navigate(`${galleryBase}?q=${qParam}${idParam}`);
  };

  /* Search submission handler */
  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const q = internalQuery.trim();
    setShowSuggestions(false);

    if (activeCategory === 'all') {
      // If user typed a query, check if suggestions belong to one category (e.g. they typed "Brezza" -> Vehicles)
      if (suggestions.length > 0) {
        const firstCat = suggestions[0].category;
        const allSame = suggestions.every((s) => s.category === firstCat);
        if (allSame) {
          const galleryBase = getGalleryRouteForCategory(firstCat);
          navigate(`${galleryBase}${q ? `?q=${encodeURIComponent(q)}` : ''}`);
          return;
        }
      }
      // General search across all categories
      navigate(`/categories${q ? `?q=${encodeURIComponent(q)}` : ''}`);
      return;
    }

    // Specific category tab active
    const targetTab = SEARCH_TABS.find((t) => t.id === activeCategory);
    const base = targetTab?.route || '/categories';
    navigate(`${base}${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  };

  const handleChipClick = (chip) => {
    const chipText = typeof chip === 'string' ? chip : chip.label;
    const cat = typeof chip === 'object' && chip.category ? chip.category : null;
    setShowSuggestions(false);

    if (cat) {
      setActiveCategory(cat);
      const targetTab = SEARCH_TABS.find((t) => t.id === cat);
      const base = targetTab?.route || '/categories';
      setInternalQuery(chipText);
      navigate(`${base}?q=${encodeURIComponent(chipText)}`);
    } else {
      setInternalQuery(chipText);
      const targetTab = SEARCH_TABS.find((t) => t.id === activeCategory);
      const base = targetTab?.route || '/categories';
      navigate(`${base}?q=${encodeURIComponent(chipText)}`);
    }
  };

  const activeSlide = HERO_SLIDES[current];
  const currentTab = SEARCH_TABS.find((t) => t.id === activeCategory) || SEARCH_TABS[0];

  return (
    <div className="relative w-full">
      {/* ═══════════════════════════════════════════════════════════
          1. Category Navigation Bar (Sticky/Stacked at Top)
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-slate-200/95 via-[#dbe7f4] to-slate-200/95 py-3.5 sm:py-4 border-b-2 border-slate-300 shadow-xs relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 5 Category Cards Grid with Lineal Color Vector Icons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {FIVE_CATEGORIES.map((item) => {
              const IconComponent = item.Icon;
              return (
                <Link
                  key={item.id}
                  to={item.link}
                  className="group bg-white hover:bg-slate-50 rounded-2xl py-3.5 sm:py-4 px-3.5 sm:px-4.5 border-2 border-slate-300/90 hover:border-brand-blue shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3 sm:gap-3.5 cursor-pointer min-h-[72px] sm:min-h-[78px]"
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    {/* Lineal Illustrated Icon Container (Borderless, Larger Size) */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${item.bgGlow} p-2 flex items-center justify-center shadow-xs group-hover:scale-108 transition-all duration-300 shrink-0`}>
                      <IconComponent className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
                    </div>

                    {/* Category Title */}
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 group-hover:text-brand-blue text-sm sm:text-base transition-colors leading-snug truncate">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. Cinema Hero Banner (Reduced Brightness Balanced Slate)
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative w-full bg-gradient-to-b from-[#9eb3c9] via-[#b0c4d9] to-[#94abc2]">
        {/* Background Ambient Glows & Carousel Slides Layer (Strictly Clipped) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* ── Ambient Soft Glow Lights (Balanced Slate & Muted Cool Tones) ── */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[380px] bg-gradient-to-tr from-slate-500/20 via-sky-500/15 to-blue-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 left-10 w-96 h-96 bg-slate-500/20 rounded-full blur-3xl" />
          <div className="absolute -top-10 right-10 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl" />

          {/* Background Image Carousel with Luminous Soft Overlay */}
          {HERO_SLIDES.map((slide, idx) => {
            const active = idx === current;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ease-in-out ${active ? 'opacity-100' : 'opacity-0'
                  }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover scale-105 transition-transform duration-[4000ms] ease-out opacity-40"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchpriority={idx === 0 ? 'high' : 'auto'}
                  draggable={false}
                />
                {/* Balanced Slate Overlay with reduced brightness and crisp depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#8fa5bc]/85 via-[#a1b7cd]/75 to-[#859cb3]/85" />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#859cb3] via-[#859cb3]/60 to-transparent" />
              </div>
            );
          })}
        </div>

        <section
          className="relative w-full min-h-[460px] sm:min-h-[510px] md:min-h-[550px] flex flex-col justify-start items-center text-center px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 md:pt-14 pb-16 sm:pb-20"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          aria-roledescription="carousel"
          aria-label="Homez Hero Banner"
        >

          {/* ── Outer Chevrons (< and > Side Sliders) ── */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="hidden sm:flex absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900/85 hover:bg-slate-950 text-white hover:text-sky-300 items-center justify-center backdrop-blur-md border border-slate-700 transition-all hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
            aria-label="Previous slide"
          >
            <i className="fa-solid fa-chevron-left text-sm" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); next(); }}
            className="hidden sm:flex absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900/85 hover:bg-slate-950 text-white hover:text-sky-300 items-center justify-center backdrop-blur-md border border-slate-700 transition-all hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
            aria-label="Next slide"
          >
            <i className="fa-solid fa-chevron-right text-sm" />
          </button>

          {/* ── Center Banner Content ── */}
          <div className="relative z-30 max-w-5xl mx-auto w-full pt-1 sm:pt-2">
            {/* Tag / Pill-badge: THE BEST WAY TO */}
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/85 border border-slate-700/90 shadow-md backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="text-slate-100 text-xs sm:text-[13px] font-black uppercase tracking-[0.2em]">
                  THE BEST WAY TO
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              </div>
            </div>

            {/* Main Headline (Strictly One Line) */}
            <div className="flex flex-col items-center justify-center w-full">
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-[42px] font-black text-slate-950 tracking-tight leading-tight text-center drop-shadow-xs whitespace-nowrap">
                {activeSlide.title} in Bengaluru
              </h1>
            </div>

            {/* Description Paragraph */}
            <div className="min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center mt-2 sm:mt-3">
              <p className="text-xs sm:text-base text-slate-800 font-bold max-w-2xl mx-auto leading-relaxed drop-shadow-2xs">
                {activeSlide.subtitle}
              </p>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                Category Tabs & Search Bar Components
                ═══════════════════════════════════════════════════════════ */}
            <div className="mt-6 sm:mt-8 w-full max-w-5xl mx-auto px-1 sm:px-4">
              <div className="flex flex-row items-end justify-center gap-2 sm:gap-3 w-full">
                {/* ── Left Column: 5 Search Tabs on top, Search Input Box directly below ──
                    Both are child elements of this column and share w-full, guaranteeing 
                    that the search input area is 100% equivalent to the 5 options width. */}
                <div ref={searchContainerRef} className="relative flex-1 max-w-3xl lg:max-w-4xl min-w-0 flex flex-col z-40">
                  {/* 5 Equivalent Search Tabs */}
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-2 sm:mb-2.5 relative z-20 w-full">
                    {SEARCH_TABS.map((tab) => {
                      const isActive = activeCategory === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveCategory(tab.id)}
                          className={`w-full inline-flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 h-10 sm:h-11 text-[11px] sm:text-xs md:text-sm rounded-xl font-bold transition-all cursor-pointer truncate ${isActive
                            ? 'bg-white text-slate-950 font-black shadow-md border-2 border-slate-400 z-20 ring-2 ring-slate-400/20'
                            : 'bg-slate-200/90 hover:bg-white text-slate-800 hover:text-slate-950 font-extrabold border-2 border-slate-300 shadow-xs'
                            }`}
                        >
                          <i className={`${tab.icon} text-[10px] sm:text-xs shrink-0 ${isActive ? 'text-[#eb4e52]' : 'text-slate-600'}`} />
                          <span className="hidden sm:inline truncate">{tab.label}</span>
                          <span className="inline sm:hidden truncate">{tab.shortLabel || tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Distinct Search Input Box (100% width matching the 5 tabs above) */}
                  <div className="relative w-full flex items-center min-w-0 bg-white rounded-xl sm:rounded-2xl shadow-[0_15px_35px_-10px_rgba(15,23,42,0.25)] border-2 border-slate-400 px-3.5 sm:px-5 h-[48px] sm:h-[54px] z-10">
                    <i className="fa-solid fa-location-dot text-slate-500 text-sm sm:text-base mr-2.5 sm:mr-3 shrink-0" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={internalQuery}
                      onChange={(e) => {
                        setInternalQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchSubmit(e);
                        if (e.key === 'Escape') setShowSuggestions(false);
                      }}
                      placeholder={
                        activeCategory === 'properties'
                          ? "Search locality, landmark, project or builder (e.g. Banashankari, Whitefield)..."
                          : currentTab.placeholder
                      }
                      className="w-full border-0 p-0 text-xs sm:text-sm md:text-base font-bold text-slate-950 placeholder:text-slate-500 outline-none bg-transparent"
                    />
                    {internalQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setInternalQuery('');
                          setSuggestions([]);
                          setAddressSuggestions([]);
                        }}
                        className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors shrink-0 ml-2 cursor-pointer"
                        aria-label="Clear search"
                      >
                        <i className="fa-solid fa-xmark text-[10px]" />
                      </button>
                    )}
                  </div>

                  {/* ── CRISP SOLID (NON-BLURRED) LIVE SEARCH DROPDOWN ── */}
                  {showSuggestions && (internalQuery.trim().length > 0 || suggestions.length > 0) && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.40)] border-2 border-slate-400 z-50 overflow-hidden text-left animate-fade-in max-h-[440px] flex flex-col">
                      {/* Header Bar */}
                      <div className="flex items-center justify-between px-5 py-2.5 bg-slate-100 border-b-2 border-slate-200 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {internalQuery ? (
                              <>Results for &ldquo;<span className="text-[#eb4e52]">{internalQuery}</span>&rdquo;</>
                            ) : (
                              'Popular Inventory'
                            )}
                          </span>
                          {isSearching && (
                            <i className="fa-solid fa-spinner animate-spin text-[#eb4e52] text-xs" />
                          )}
                        </div>
                        <div className="text-[11px] font-extrabold text-slate-600">
                          {suggestions.length} {suggestions.length === 1 ? 'product' : 'products'}
                        </div>
                      </div>

                      {/* Single Clean Full-Width Column: All Products */}
                      <div className="overflow-y-auto flex-1 divide-y divide-slate-200 bg-white">
                        {suggestions.length > 0 ? (
                          suggestions.slice(0, 8).map((item) => {
                            const categoryName =
                              item.categoryLabel ||
                              (item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : '');
                            const locationName = item.location || item.locality || item.city || '';
                            const detailLine = [categoryName, locationName].filter(Boolean).join(' · ') || 'Verified Product';

                            return (
                              <div
                                key={`${item.category}-${item.id || item._id}`}
                                onClick={() => handleProductClick(item)}
                                className="px-5 py-3 hover:bg-slate-100 transition-colors cursor-pointer group"
                              >
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#eb4e52] transition-colors truncate">
                                  {highlightAddress(item.title, internalQuery)}
                                </h4>
                                <p className="text-[11px] sm:text-xs text-slate-600 font-medium truncate mt-0.5">
                                  {detailLine}
                                </p>
                              </div>
                            );
                          })
                        ) : !isSearching ? (
                          <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                            <i className="fa-solid fa-box-open text-slate-400 text-2xl block" />
                            <p className="text-sm font-semibold text-slate-800">No products found for &ldquo;{internalQuery}&rdquo;</p>
                            <button
                              type="button"
                              onClick={handleSearchSubmit}
                              className="text-xs font-bold text-[#eb4e52] hover:underline cursor-pointer"
                            >
                              Search all categories →
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {/* Bottom Global Action Bar */}
                      <div className="px-5 py-2.5 bg-slate-100 border-t-2 border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium text-[11px]">
                          Press <kbd className="px-1.5 py-0.5 bg-white border-2 border-slate-300 rounded font-mono text-[10px] text-slate-800 font-bold">Enter</kbd> to search
                        </span>
                        <button
                          type="button"
                          onClick={handleSearchSubmit}
                          className="font-black text-[#eb4e52] hover:text-[#d94145] flex items-center gap-1 cursor-pointer"
                        >
                          <span>See full results</span>
                          <i className="fa-solid fa-arrow-right text-[10px]" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Right Column: Separate Search Button in that same line ── */}
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="shrink-0 h-[48px] sm:h-[54px] bg-[#eb4e52] hover:bg-[#d94145] text-white font-extrabold px-4 sm:px-9 text-xs sm:text-sm md:text-base rounded-xl sm:rounded-2xl border-2 border-red-600/90 shadow-[0_15px_35px_-10px_rgba(235,78,82,0.45)] hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 z-30"
                >
                  <i className="fa-solid fa-magnifying-glass text-xs sm:text-sm" />
                  <span>Search</span>
                </button>
              </div>

              {/* Trending Section */}
              <div className="mt-5 flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide py-1">
                <span className="rounded-full bg-slate-900 text-slate-100 px-3.5 py-1.5 text-xs font-black shadow-sm border border-slate-800 flex items-center gap-1.5 shrink-0">
                  <i className="fa-solid fa-fire text-[#eb4e52] text-xs" /> TRENDING:
                </span>
                {POPULAR_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="shrink-0 rounded-full bg-slate-100 hover:bg-white text-slate-800 hover:text-brand-blue px-4 py-1.5 text-xs font-bold shadow-xs border-2 border-slate-300 hover:border-brand-blue transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {chip.label || chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Slide Indicators (Bottom of Hero - Lower Z-Index so search dropdown floats above) */}
          <div className="absolute bottom-5 z-10 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700 shadow-md">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-white' : 'w-1.5 bg-slate-500 hover:bg-slate-400'
                  }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* ── Seamless Gradient Melting Hero Slate into Below Section (Behind Content & Dropdown) ── */}
          <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-slate-200/50 via-slate-200/15 to-transparent pointer-events-none z-0" />
        </section>
      </div>
    </div>
  );
}
