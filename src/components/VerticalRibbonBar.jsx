import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { marketplaceCategories } from '../constants/categoriesData';

/**
 * VerticalRibbonBar:
 * Premium marquee rotating banner for all active business verticals.
 * Shows ONLY categories with live products.
 * Pauses smoothly in-place on hover without jumping or restarting.
 */
export default function VerticalRibbonBar() {
  const location = useLocation();
  const scrollRef = useRef(null);

  // Render exclusively on the Home page
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  if (!isHomePage) {
    return null;
  }

  const isVerticalActive = (href) => {
    if (!href) return false;
    return location.pathname === href || (href !== '/' && location.pathname.startsWith(href));
  };

  // Filter to show ONLY categories with live products
  const activeProductCategories = marketplaceCategories.filter((cat) => !cat.disabled);

  // Repeat items enough times for seamless continuous marquee loop
  const ribbonItems = Array.from({ length: 6 }, () => activeProductCategories).flat();

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#eef5fc] via-[#f7faff] to-[#eef5fc] border-t border-b border-blue-200/60 shadow-xs select-none relative z-30">
      <div className="max-w-[1500px] mx-auto flex items-center px-2 sm:px-4 py-2 gap-2">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="shrink-0 w-8 h-8 rounded-full bg-white/95 hover:bg-white hover:text-amber-600 text-slate-700 flex items-center justify-center transition-all text-xs cursor-pointer border border-slate-200/90 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 z-10"
          title="Scroll Left"
          aria-label="Scroll Ribbon Left"
        >
          <i className="fa-solid fa-chevron-left text-[11px]" />
        </button>

        {/* Ribbon Marquee Track Container */}
        <div
          ref={scrollRef}
          className="ribbon-track flex-1 overflow-hidden relative"
        >
          <div className="flex items-center gap-3 whitespace-nowrap w-max animate-ribbon-rtl py-0.5">
            {ribbonItems.map((cat, idx) => {
              const active = isVerticalActive(cat.href);

              return (
                <Link
                  key={`${cat.id}-${idx}`}
                  to={cat.href}
                  className={`group relative overflow-hidden shrink-0 flex items-center justify-between pl-3 pr-0 py-0 rounded-2xl transition-all duration-300 cursor-pointer w-[220px] sm:w-[250px] h-[52px] sm:h-[56px] bg-white border ${
                    active
                      ? 'border-amber-500 ring-2 ring-amber-400/60 shadow-md scale-[1.01]'
                      : 'border-slate-200/80 hover:border-amber-400/80 shadow-xs hover:shadow-md'
                  }`}
                >
                  {/* Left Content: Circular Container + Text */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2 py-1.5 z-10">
                    {/* Vibrant Circular Category Icon Container */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs shadow-xs transition-transform duration-300 group-hover:scale-105 ${
                        active
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white font-black'
                          : 'bg-gradient-to-br from-amber-500/95 to-orange-500/95 text-white font-bold group-hover:from-amber-500 group-hover:to-orange-500'
                      }`}
                    >
                      <i className={cat.icon} />
                    </div>

                    {/* High-Contrast Category Labels */}
                    <div className="min-w-0 flex-1">
                      <h4
                        className={`text-xs sm:text-[13px] font-bold tracking-tight truncate leading-tight transition-colors ${
                          active
                            ? 'text-amber-600'
                            : 'text-slate-900 group-hover:text-amber-600'
                        }`}
                      >
                        {cat.label}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate mt-0.5 leading-none">
                        {cat.shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* Right Window: Crisp photographic peek */}
                  {cat.image ? (
                    <div className="relative w-14 sm:w-16 h-full shrink-0 overflow-hidden rounded-r-2xl">
                      <img
                        src={cat.image}
                        alt={cat.label}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Smooth gradient fade into white card */}
                      <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                    </div>
                  ) : null}

                  {/* Active bottom accent bar */}
                  {active && (
                    <div className="absolute left-0 bottom-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="shrink-0 w-8 h-8 rounded-full bg-white/95 hover:bg-white hover:text-amber-600 text-slate-700 flex items-center justify-center transition-all text-xs cursor-pointer border border-slate-200/90 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 z-10"
          title="Scroll Right"
          aria-label="Scroll Ribbon Right"
        >
          <i className="fa-solid fa-chevron-right text-[11px]" />
        </button>
      </div>
    </div>
  );
}
