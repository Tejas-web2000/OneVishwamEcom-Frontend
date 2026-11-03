import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

// Fallback announcements if backend is unreachable or loading
const FALLBACK_ANNOUNCEMENTS = [
  {
    _id: 'seed-1',
    message: '🎉 Flat 15% discount on certified orthopedic mattresses this season! Limited stock available.',
    type: 'offer',
    link: '/categories/bedding-comfort',
    badgeText: 'FESTIVE OFFER',
    priority: 10,
    active: true,
  },
  {
    _id: 'seed-2',
    message: '🏡 4 new luxury flats & gated plots verified in Bengaluru today! Explore top deals.',
    type: 'product_update',
    link: '/categories/properties',
    badgeText: 'JUST LISTED',
    priority: 8,
    active: true,
  },
  {
    _id: 'seed-3',
    message: '✨ Explore all verified services across properties, automobiles, electronics and home comfort.',
    type: 'offer',
    link: '/categories',
    badgeText: 'ALL SERVICES',
    priority: 7,
    active: true,
  },
  {
    _id: 'seed-4',
    message: '🚗 Certified pre-owned family automobiles and bikes updated with instant loan assistance.',
    type: 'product_update',
    link: '/categories/automobile',
    badgeText: 'FLEET UPDATE',
    priority: 6,
    active: true,
  },
];

const TYPE_STYLES = {
  offer: {
    badge: 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950',
    icon: 'fa-solid fa-gift',
  },
  product_update: {
    badge: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950',
    icon: 'fa-solid fa-fire',
  },
  alert: {
    badge: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white',
    icon: 'fa-solid fa-bell',
  },
  general: {
    badge: 'bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950',
    icon: 'fa-solid fa-bullhorn',
  },
};

// Module-level in-memory cache to prevent duplicate / excessive network requests
let cachedAnnouncements = null;
let lastFetchTime = 0;
let inFlightPromise = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export default function TopNotificationBar({ isScrolled }) {
  const [announcements, setAnnouncements] = useState(() => cachedAnnouncements || FALLBACK_ANNOUNCEMENTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fadeState, setFadeState] = useState('in'); // 'in' | 'out'
  const timerRef = useRef(null);

  // 1. Fetch active announcements with in-memory caching and request deduplication
  const fetchAnnouncements = useCallback(async (force = false) => {
    const now = Date.now();
    // Serve from in-memory cache if still valid
    if (!force && cachedAnnouncements && now - lastFetchTime < CACHE_TTL_MS) {
      setAnnouncements(cachedAnnouncements);
      return;
    }

    // Deduplicate concurrent requests (e.g. React 18 StrictMode double-mount)
    if (inFlightPromise) {
      try {
        const items = await inFlightPromise;
        if (Array.isArray(items) && items.length > 0) {
          setAnnouncements(items);
        }
      } catch {}
      return;
    }

    try {
      inFlightPromise = (async () => {
        const res = await API.get('/announcements');
        return res.data?.data?.announcements || res.data?.announcements || [];
      })();

      const items = await inFlightPromise;
      if (Array.isArray(items) && items.length > 0) {
        cachedAnnouncements = items;
        lastFetchTime = Date.now();
        setAnnouncements(items);
      }
    } catch {
      // Keep fallbacks silently if backend endpoint is unavailable
    } finally {
      inFlightPromise = null;
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // 2. Slow, smooth message carousel transition
  const goToNext = useCallback(() => {
    if (announcements.length <= 1) return;
    setFadeState('out');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
      setFadeState('in');
    }, 700); // 700ms slow fade out, then fade in next message
  }, [announcements.length]);

  const goToPrev = useCallback(() => {
    if (announcements.length <= 1) return;
    setFadeState('out');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
      setFadeState('in');
    }, 700);
  }, [announcements.length]);

  useEffect(() => {
    if (isPaused || announcements.length <= 1) return;

    timerRef.current = setInterval(() => {
      goToNext();
    }, 5500); // Slow 5.5s display time per notification

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, announcements.length, goToNext]);

  if (!announcements.length) return null;

  const currentItem = announcements[currentIndex] || announcements[0];
  const typeCfg = TYPE_STYLES[currentItem?.type] || TYPE_STYLES.general;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`w-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white select-none overflow-hidden transition-all duration-300 ease-in-out pointer-events-auto border-b border-slate-800/80 shadow-xs relative z-10 ${
        isScrolled
          ? 'h-0 opacity-0 -translate-y-full py-0 border-b-0 pointer-events-none'
          : 'py-2 sm:py-2.5 min-h-[38px] sm:min-h-[40px] opacity-100 translate-y-0'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-3 text-xs">
        {/* Left Arrow (Desktop) */}
        {announcements.length > 1 && (
          <button
            type="button"
            onClick={goToPrev}
            className="hidden sm:flex text-slate-400 hover:text-white transition-colors p-1"
            title="Previous notification"
            aria-label="Previous notification"
          >
            <i className="fa-solid fa-chevron-left text-[10px]" />
          </button>
        )}

        {/* Center Notification Content with Slow Fade/Slide Transition */}
        <div className="flex-1 flex items-center justify-center min-w-0 overflow-hidden">
          <div
            className={`flex items-center gap-2 sm:gap-3 transition-all duration-700 ease-in-out transform ${
              fadeState === 'in'
                ? 'opacity-100 translate-y-0 filter blur-0'
                : 'opacity-0 -translate-y-2 filter blur-xs'
            }`}
          >
            {/* Pulsing Pill Badge */}
            <span
              className={`shrink-0 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1.5 ${typeCfg.badge}`}
            >
              <i className={`${typeCfg.icon} text-[9px]`} />
              <span>{currentItem.badgeText || (currentItem.type === 'offer' ? 'OFFER' : 'UPDATE')}</span>
            </span>

            {/* Notification Text */}
            <p className="text-[11px] sm:text-xs font-medium text-slate-200 truncate max-w-[280px] sm:max-w-xl md:max-w-2xl">
              {currentItem.message}
            </p>

            {/* Direct Link Action */}
            {currentItem.link && (
              <Link
                to={currentItem.link}
                className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 ml-1"
              >
                <span>View</span>
                <i className="fa-solid fa-arrow-right text-[9px]" />
              </Link>
            )}
          </div>
        </div>

        {/* Right Arrow (Desktop) + Counter Dots */}
        <div className="flex items-center gap-2 shrink-0">
          {announcements.length > 1 && (
            <>
              {/* Pagination Dots */}
              <div className="hidden md:flex items-center gap-1">
                {announcements.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setFadeState('out');
                      setTimeout(() => {
                        setCurrentIndex(i);
                        setFadeState('in');
                      }, 400);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={goToNext}
                className="hidden sm:flex text-slate-400 hover:text-white transition-colors p-1"
                title="Next notification"
                aria-label="Next notification"
              >
                <i className="fa-solid fa-chevron-right text-[10px]" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

