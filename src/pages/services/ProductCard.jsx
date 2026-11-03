import React, { useState } from 'react';
import { navigateTo } from "../../config/navigation";
import { cleanProductName } from "../../utils/searchUtils";
import { useAuth } from "../../store/authSlice";

import { ONEVISHWAM_VERIFIED_IMAGE, isPlaceholderImage } from "../../constants/fallbackImage";

const FALLBACK_IMG = ONEVISHWAM_VERIFIED_IMAGE;

/**
 * Modern Generic Product / Listing Card.
 */
export default React.memo(function ProductCard({
  link = "#",
  image,
  alt = "",
  overline,
  title,
  price,
  priceSuffix = "",
  priceOverride,
  location,
  pincode,
  tags = [],
  badges = [],
  trustBadge,
  showButton = true,
  theme,
  children,
  hidePrice = false,
  layout = 'grid',
}) {
  const [imgError, setImgError] = useState(false);
  const [faved, setFaved] = useState(false);
  const { isLoggedIn, openAuthModal } = useAuth();

  const isPropertyOrVehicle = Boolean(
    hidePrice ||
    (link && (link.includes('/property') || link.includes('/vehicle'))) ||
    (alt && (String(alt).toLowerCase().includes('property') || String(alt).toLowerCase().includes('vehicle')))
  );

  const handleCardClick = (e) => {
    if (!link || link === '#') return;
    if (!isLoggedIn) {
      if (e && e.preventDefault) e.preventDefault();
      sessionStorage.setItem('vishwam_auth_redirect', link);
      openAuthModal('login');
      return;
    }
    navigateTo(link);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group bg-white rounded-2xl border border-slate-200/90 hover:border-brand-blue/50 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex cursor-pointer will-change-transform ${
        layout === 'list' ? 'flex-col md:flex-row' : 'flex-col h-full'
      }`}
    >
      {/* ── Image Container ── */}
      <div className={`relative overflow-hidden bg-gray-100 shrink-0 ${
        layout === 'list' ? 'md:w-80 md:h-auto aspect-[16/10] md:aspect-auto' : 'aspect-[16/10]'
      }`}>
        {image && !isPlaceholderImage(image) && !imgError ? (
          <img
            src={image}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <img
            src={FALLBACK_IMG}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Top-Left Badges (Homez style) */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          {badges.map((b, i) => (
            <span
              key={i}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide shadow-xs backdrop-blur-xs flex items-center gap-1.5 ${b.className || 'bg-slate-900/80 text-white'}`}
            >
              {b.icon !== false && (
                <i className={`${b.icon || 'fa-solid fa-bolt text-amber-300'} text-[10px]`} />
              )}
              {b.label}
            </span>
          ))}
        </div>

        {/* Top-Right Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFaved(!faved);
          }}
          className="absolute right-3 top-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md backdrop-blur-sm flex items-center justify-center transition-all z-10 cursor-pointer"
          aria-label="Save to favorites"
        >
          <i className={`${faved ? 'fa-solid text-rose-500' : 'fa-regular text-gray-500'} fa-heart text-xs`} />
        </button>
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 flex flex-col flex-1 gap-2.5">
        {/* Overline / Subcategory */}
        {overline && (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-150/70 text-[11px] font-extrabold uppercase tracking-wider text-brand-blue">
              <i className={`${isPropertyOrVehicle ? 'fa-solid fa-house-chimney' : 'fa-solid fa-tag'} text-[10px] text-brand-blue`} />
              {overline}
            </span>
          </div>
        )}

        {/* Title */}
        <div className="min-h-[2.75rem] flex items-start">
          {title && (
            <h3 className="font-extrabold text-brand-charcoal text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">
              {cleanProductName(title)}
            </h3>
          )}
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 min-w-0">
            <i className="fa-solid fa-location-dot text-brand-blue text-xs shrink-0" />
            <span className="truncate">
              {location}
              {pincode && !/\b\d{6}\b/.test(location) && !String(location).includes(pincode) ? ` · ${pincode}` : ""}
            </span>
          </div>
        )}

        {/* Specs / Detail Tags (Homez style metadata) */}
        {tags.length > 0 && (() => {
          const splitTags = tags.flatMap((t) => {
            if (!t) return [];
            const str = String(t).trim();
            if (/[\u00b7\u2022\u2219\u2027\u25cf\u25cb\u2043\u2218•·|]/.test(str)) {
              return str.split(/\s*[\u00b7\u2022\u2219\u2027\u25cf\u25cb\u2043\u2218•·|]\s*/).map((s) => s.trim()).filter(Boolean);
            }
            return [str];
          });
          return (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {splitTags.map((t, i) => {
                if (!t) return null;
                const tStr = String(t).trim();
                const isPropType = isPropertyOrVehicle && ['flat', 'plot', 'land', 'independent house', 'residential', 'commercial', 'industrial', 'agricultural', 'villa', 'apartment'].some(type => tStr.toLowerCase() === type);
                const isFacing = tStr.startsWith('Door Facing') || tStr.startsWith('Facing');
                const isCorner = tStr.startsWith('Corner');
                const isBhk = /\d+\s*bhk/i.test(tStr);
                const isSqft = /sq\.?ft|sqft|sq\s*ft|acres?|guntas?/i.test(tStr);
                const isUnits = /\b\d+\s*units?\b/i.test(tStr);
                const isBath = /bath/i.test(tStr);
                return (
                  <span
                    key={i}
                    className={`font-semibold text-xs rounded-lg px-2.5 py-1 max-w-full inline-flex items-center gap-1.5 ${
                      isPropType
                        ? 'bg-blue-50 text-brand-blue border border-blue-200/80 font-bold shadow-2xs'
                        : isCorner
                        ? 'bg-purple-50 text-purple-800 border border-purple-200/80 shadow-2xs'
                        : isFacing
                        ? 'bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs'
                        : isUnits
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isPropType && <i className="fa-solid fa-house-chimney text-brand-blue text-[11px] shrink-0" />}
                    {isCorner && <i className="fa-solid fa-vector-square text-purple-600 text-xs shrink-0" />}
                    {isFacing && <i className="fa-solid fa-compass text-amber-600 text-xs shrink-0" />}
                    {isBhk && <i className="fa-solid fa-bed text-brand-blue text-[11px] shrink-0" />}
                    {isSqft && <i className="fa-solid fa-ruler-combined text-brand-blue text-[11px] shrink-0" />}
                    {isUnits && <i className="fa-solid fa-building text-emerald-600 text-[11px] shrink-0" />}
                    {isBath && <i className="fa-solid fa-shower text-brand-blue text-[11px] shrink-0" />}
                    <span className="truncate">{t}</span>
                  </span>
                );
              })}
            </div>
          );
        })()}

        {/* Trust Badge (e.g. Bank Approved) */}
        {trustBadge && (
          <div className="pt-0.5">
            {typeof trustBadge === 'string' ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-150/80 px-2.5 py-1 text-xs font-bold text-brand-blue">
                <i className="fa-solid fa-building-columns text-[10px] text-brand-blue" />
                {trustBadge}
              </span>
            ) : (
              trustBadge
            )}
          </div>
        )}

        {/* Extra children (Agent info, Loan banners, etc.) */}
        {children && <div className="pt-1">{children}</div>}

        {/* ── Card Footer: Are You Interested? ── */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(
                new CustomEvent('onevishwam:open_enquiry_modal', {
                  detail: { title: title || 'Product Enquiry' },
                })
              );
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-extrabold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-[0.98]"
          >
            <i className="fa-solid fa-handshake-angle text-xs text-slate-950" />
            <span>Are You Interested?</span>
          </button>
        </div>
      </div>
    </div>
  );
});
