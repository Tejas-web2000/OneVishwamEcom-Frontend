import React, { useState } from 'react';
import { navigateTo } from '../../../config/navigation';
import { cleanProductName } from '../../../utils/searchUtils';
import { useAuth } from '../../../store/authSlice';

import { ONEVISHWAM_VERIFIED_IMAGE, isPlaceholderImage } from '../../../constants/fallbackImage';

export const FALLBACK_IMG = ONEVISHWAM_VERIFIED_IMAGE;

export default React.memo(function CategoryListingCard({
  item,
  link,
  image,
  alt = '',
  overline,
  title,
  price,
  priceSuffix = '',
  location,
  pincode,
  statusBadges = [],
  keyAttributes = [],
  cardPills = [],
  highlightBanner,
  onSelect,
  hidePrice = false,
  children,
}) {
  const [imgError, setImgError] = useState(false);
  const [faved, setFaved] = useState(false);

  // Normalize data
  const rawTitle = title !== undefined ? title : (item?.title || '');
  const cardTitle = cleanProductName(rawTitle);
  const cardLink =
    link ||
    item?.link ||
    item?.detailUrl ||
    (item?.category === 'vehicles' || item?.category === 'automobile'
      ? `/vehicle/${item?.id || item?._id}`
      : item?.category === 'electronics'
      ? `/electronics/${item?.id || item?._id}`
      : item?.category === 'bedding' || item?.category === 'bedding-comfort'
      ? `/bedding/${item?.id || item?._id}`
      : item?.category === 'garments'
      ? `/garment/${item?.id || item?._id}`
      : item?.category === 'grocery'
      ? `/grocery/${item?.id || item?._id}`
      : item?.category === 'jewellery'
      ? `/jewellery/${item?.id || item?._id}`
      : item?.id
      ? `/property/${item.id}`
      : '#');
  const rawImg = image || (Array.isArray(item?.images) ? item.images.find(s => s && !isPlaceholderImage(s)) : '') || item?.image || '';
  const cardImg = isPlaceholderImage(rawImg) ? '' : rawImg;
  const cardPrice = price !== undefined ? price : (item?.price || 'Price on Request');
  const cardPriceSuffix = priceSuffix !== undefined ? priceSuffix : (item?.priceSuffix || '');
  const cardLocation = location !== undefined ? location : (item?.location || '');
  const cardPincode = pincode !== undefined ? pincode : (item?.pincode || '');
  const cardOverline =
    overline !== undefined
      ? overline
      : (item?.overline ||
         item?.propertyType ||
         item?.raw?.propertyType ||
         item?.subcategory ||
         item?.raw?.subcategory ||
         item?.brand ||
         item?.raw?.brand ||
         '');

  const isProperty = Boolean(
    item?.category === 'properties' ||
    item?.category === 'real-estate' ||
    item?.raw?.category === 'properties' ||
    item?.raw?.category === 'real-estate' ||
    item?.propertyType ||
    item?.raw?.propertyType ||
    (cardLink && cardLink.includes('/property'))
  );

  // Badges (max 2 badges to keep cards clean and prevent crowding)
  const rawBadges = statusBadges !== undefined ? statusBadges : (item?.statusBadges || item?.badges || []);
  const badges = (rawBadges || []).slice(0, 2).map((b) => {
    if (typeof b === 'string') return { label: b, className: 'bg-brand-blue text-white' };
    let cls = b.className;
    if (!cls) {
      if (b.variant === 'green') cls = 'bg-emerald-600 text-white';
      else if (b.variant === 'amber') cls = 'bg-amber-500 text-white';
      else if (b.variant === 'blue') cls = 'bg-brand-blue text-white';
      else if (b.variant === 'slate') cls = 'bg-slate-700 text-white';
      else cls = 'bg-brand-blue text-white';
    }
    return { label: b.label, className: cls };
  });

  // Attribute Pills (cardPills) - includes propertyType for properties
  const rawPills = cardPills !== undefined ? cardPills : (keyAttributes !== undefined ? keyAttributes : (item?.cardPills || item?.keyAttributes || []));
  const resolvedPropType = isProperty
    ? (cardOverline || item?.propertyType || item?.raw?.propertyType || item?.subcategory || item?.raw?.subcategory || '')
    : '';

  const combinedPills = [...(rawPills || [])];
  if (isProperty && resolvedPropType) {
    const alreadyHas = combinedPills.some(
      (p) => String(typeof p === 'string' ? p : p.value || '').toLowerCase() === resolvedPropType.toLowerCase()
    );
    if (!alreadyHas) {
      combinedPills.unshift(resolvedPropType);
    }
  }
  const pills = combinedPills.slice(0, 4);

  // Trust highlight banner
  const bannerText =
    highlightBanner !== undefined
      ? highlightBanner
      : (item?.highlightBanner ||
        item?.trustBannerText ||
        (item?.loanApproved ? '100% Pre-Approved Loan Available' : null));

  const shouldHidePrice = Boolean(
    hidePrice ||
    item?.hidePrice ||
    (cardLink && (cardLink.includes('/property') || cardLink.includes('/vehicle'))) ||
    item?.category === 'vehicles' ||
    item?.category === 'automobile' ||
    item?.category === 'properties' ||
    item?.category === 'real-estate' ||
    item?.propertyType ||
    item?.wheelerType
  );

  const { isLoggedIn, openAuthModal } = useAuth();

  const handleClick = (e) => {
    if (onSelect) {
      onSelect(item);
      return;
    }
    if (cardLink && cardLink !== '#') {
      if (!isLoggedIn) {
        if (e && e.preventDefault) e.preventDefault();
        sessionStorage.setItem('vishwam_auth_redirect', cardLink);
        openAuthModal('login');
        return;
      }
      navigateTo(cardLink);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="article"
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-brand-blue/50 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer h-full will-change-transform"
    >
      {/* ── Image Container ── */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 shrink-0">
        {cardImg && !imgError ? (
          <img
            src={cardImg}
            alt={alt || cardTitle}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <img
            src={FALLBACK_IMG}
            alt={cardTitle}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Top-Left Badges */}
        {badges.length > 0 && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 z-10 max-w-[calc(100%-3.25rem)] overflow-hidden">
            {badges.map((b, i) => (
              <span
                key={i}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide shadow-xs backdrop-blur-xs whitespace-nowrap flex items-center gap-1 ${b.className}`}
              >
                <i className="fa-solid fa-bolt text-amber-300 text-[10px]" />
                {b.label}
              </span>
            ))}
          </div>
        )}

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

      {/* ── Card Body (matches ProductCard.jsx 1:1) ── */}
      <div className="p-4 flex flex-col flex-1 gap-2.5">
        {/* Overline / Subcategory */}
        {cardOverline && (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-150/70 text-[11px] font-extrabold uppercase tracking-wider text-brand-blue">
              <i className={`${isProperty ? 'fa-solid fa-house-chimney' : 'fa-solid fa-tag'} text-[10px] text-brand-blue`} />
              {cardOverline}
            </span>
          </div>
        )}

        {/* Title */}
        <div className="min-h-[2.75rem] flex items-start">
          {cardTitle && (
            <h3 className="font-extrabold text-brand-charcoal text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">
              {cardTitle}
            </h3>
          )}
        </div>

        {/* Location */}
        {cardLocation && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 min-w-0">
            <i className="fa-solid fa-location-dot text-brand-blue text-xs shrink-0" />
            <span className="truncate">
              {cardLocation}
              {cardPincode && !/\b\d{6}\b/.test(cardLocation) && !String(cardLocation).includes(cardPincode) ? ` · ${cardPincode}` : ''}
            </span>
          </div>
        )}

        {/* 3 Attribute Pills (cardPills) */}
        {pills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {pills.map((pill, idx) => {
              const label = typeof pill === 'string' ? pill : `${pill.label ? `${pill.label}: ` : ''}${pill.value}`;
              const isPropType = isProperty && Boolean(
                (resolvedPropType && label.toLowerCase() === resolvedPropType.toLowerCase()) ||
                ['flat', 'plot', 'land', 'independent house', 'residential', 'commercial', 'industrial', 'agricultural', 'villa', 'apartment'].some(t => label.toLowerCase() === t)
              );
              const isFacing = label.toLowerCase().includes('facing');
              const isCorner = label.toLowerCase().includes('corner');
              const isBhk = /\d+\s*bhk/i.test(label);
              const isSqft = /sq\.?ft|sqft|sq\s*ft/i.test(label);
              const isBath = /bath/i.test(label);
              return (
                <span
                  key={idx}
                  className={`font-semibold text-xs rounded-lg px-2.5 py-1 whitespace-nowrap truncate max-w-full flex items-center gap-1.5 ${
                    isPropType
                      ? 'bg-blue-50 text-brand-blue border border-blue-200/80 font-bold shadow-2xs'
                      : isCorner
                      ? 'bg-purple-50 text-purple-800 border border-purple-200/80 shadow-2xs'
                      : isFacing
                      ? 'bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {isPropType && <i className="fa-solid fa-house-chimney text-brand-blue text-[11px]" />}
                  {isCorner && <i className="fa-solid fa-vector-square text-purple-600 text-xs" />}
                  {isFacing && <i className="fa-solid fa-compass text-amber-600 text-xs" />}
                  {isBhk && <i className="fa-solid fa-bed text-brand-blue text-[11px]" />}
                  {isSqft && <i className="fa-solid fa-ruler-combined text-brand-blue text-[11px]" />}
                  {isBath && <i className="fa-solid fa-shower text-brand-blue text-[11px]" />}
                  {label}
                </span>
              );
            })}
          </div>
        )}

        {/* Highlight Trust Banner (Green) */}
        {bannerText && (
          <div className="mt-1 flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200/60 px-2.5 py-1">
            <i className="fa-solid fa-circle-check text-xs text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-emerald-700 truncate">
              {bannerText}
            </span>
          </div>
        )}

        {/* ── Card Footer: Are You Interested? ── */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(
                new CustomEvent('onevishwam:open_enquiry_modal', {
                  detail: { title: cardTitle || item?.title || 'Product Enquiry' },
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
