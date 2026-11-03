import React, { useState } from 'react';
import { navigateTo } from '../../../../config/navigation';
import { useAuth } from '../../../../store/authSlice';
import { formatINR, withRupeeSymbol } from '../priceUtils';
import { normalizeListing } from './normalizeListing';
import SoldOutRibbon from '../../../../components/ui/SoldOutRibbon';
import { ONEVISHWAM_VERIFIED_IMAGE, isPlaceholderImage } from '../../../../constants/fallbackImage';

const FALLBACK_IMG = ONEVISHWAM_VERIFIED_IMAGE;

const EMPTY_ARRAY = [];

const THEME_BORDER_CLASSES = {
  blue: 'border-2 border-brand-blue/40 hover:border-brand-blue ring-1 ring-brand-blue/20',
  property: 'border-2 border-brand-blue/40 hover:border-brand-blue ring-1 ring-brand-blue/20',
  gold: 'border-2 border-amber-400/80 hover:border-amber-500 ring-1 ring-amber-400/20',
  amber: 'border-2 border-amber-400/80 hover:border-amber-500 ring-1 ring-amber-400/20',
  jewellery: 'border-2 border-amber-400/80 hover:border-amber-500 ring-1 ring-amber-400/20',
  red: 'border-2 border-red-400/80 hover:border-red-500 ring-1 ring-red-400/20',
  automobile: 'border-2 border-red-400/80 hover:border-red-500 ring-1 ring-red-400/20',
  vehicle: 'border-2 border-red-400/80 hover:border-red-500 ring-1 ring-red-400/20',
  emerald: 'border-2 border-emerald-400/80 hover:border-emerald-500 ring-1 ring-emerald-400/20',
  grocery: 'border-2 border-emerald-400/80 hover:border-emerald-500 ring-1 ring-emerald-400/20',
  rose: 'border-2 border-rose-400/80 hover:border-rose-500 ring-1 ring-rose-400/20',
  garments: 'border-2 border-rose-400/80 hover:border-rose-500 ring-1 ring-rose-400/20',
  indigo: 'border-2 border-indigo-400/80 hover:border-indigo-500 ring-1 ring-indigo-400/20',
  finance: 'border-2 border-indigo-400/80 hover:border-indigo-500 ring-1 ring-indigo-400/20',
};

function getThemeBorderClass(theme, link, overline, sector) {
  if (theme && THEME_BORDER_CLASSES[theme.toLowerCase()]) {
    return THEME_BORDER_CLASSES[theme.toLowerCase()];
  }
  const str = `${sector || ''} ${link || ''} ${overline || ''}`.toLowerCase();
  if (str.includes('jewellery') || str.includes('gold')) return THEME_BORDER_CLASSES.jewellery;
  if (str.includes('vehicle') || str.includes('automobile')) return THEME_BORDER_CLASSES.automobile;
  if (str.includes('grocery') || str.includes('food')) return THEME_BORDER_CLASSES.grocery;
  if (str.includes('garment') || str.includes('fashion') || str.includes('clothing')) return THEME_BORDER_CLASSES.garments;
  if (str.includes('finance') || str.includes('loan')) return THEME_BORDER_CLASSES.finance;
  return THEME_BORDER_CLASSES.property;
}

/**
 * Universal Master Listing Card Component
 * Supports direct props or auto-normalization from raw sector items.
 */
export const ListingCard = React.memo(function ListingCard({
  item,
  sector,
  config,
  link,
  image,
  alt = '',
  overline,
  title,
  price,
  priceSuffix = '',
  priceType,
  priceOverride,
  location,
  pincode,
  tags,
  badges,
  showButton = true,
  buttonText = 'View Details',
  theme,
  children,
  // Sold-out override props (when not using normalizeListing)
  isSoldOut: isSoldOutProp,
  isInactive: isInactiveProp,
  availabilityStatus: availabilityStatusProp,
}) {
  const [imgError, setImgError] = useState(false);
  const { isLoggedIn, openAuthModal } = useAuth();

  // Normalize if item is provided
  const normalized = item ? normalizeListing(item, sector || config?.sector || '') : null;

  // Determine sold-out/inactive state from props or normalized data
  const isSoldOut = isSoldOutProp ?? normalized?.isSoldOut ?? false;
  const isInactive = isInactiveProp ?? normalized?.isInactive ?? false;
  const availabilityStatus = availabilityStatusProp ?? normalized?.availabilityStatus ?? 'available';

  const rawImage = image || normalized?.image;
  const cardImage = isPlaceholderImage(rawImage) ? ONEVISHWAM_VERIFIED_IMAGE : (rawImage || ONEVISHWAM_VERIFIED_IMAGE);
  const cardAlt = alt || title || normalized?.title || '';
  const cardOverline = overline !== undefined ? overline : normalized?.overline;
  const cardTitle = title || normalized?.title || '';
  const cardPrice = price !== undefined ? price : normalized?.price;
  const cardPriceSuffix = priceSuffix || normalized?.priceSuffix || '';
  const cardPriceType = priceType || normalized?.priceType;
  const cardLocation = location !== undefined ? location : normalized?.location;
  const cardPincode = pincode !== undefined ? pincode : normalized?.pincode;
  const cardTags = tags || normalized?.tags || EMPTY_ARRAY;
  const cardBadges = badges || normalized?.badges || EMPTY_ARRAY;

  const handleCardClick = (e) => {
    if (!cardLink || cardLink === '#') return;
    // Prevent navigation if sold out or inactive
    if (isSoldOut || isInactive) {
      if (e && e.preventDefault) e.preventDefault();
      return;
    }
    if (!isLoggedIn) {
      if (e && e.preventDefault) e.preventDefault();
      sessionStorage.setItem('vishwam_auth_redirect', cardLink);
      openAuthModal('login');
      return;
    }
    navigateTo(cardLink);
  };

  const handleKeyDown = (e) => {
    if ((isSoldOut || isInactive) && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && cardLink && cardLink !== '#') {
      handleCardClick(e);
    }
  };

  const borderClass = getThemeBorderClass(theme, cardLink, cardOverline, sector || config?.sector);

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={`group bg-white rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full relative ${borderClass} ${
        isSoldOut
          ? 'cursor-not-allowed select-none'
          : isInactive
          ? 'opacity-50 cursor-not-allowed'
          : 'shadow-xs hover:shadow-xl transform hover:-translate-y-1 cursor-pointer'
      }`}
      role={isSoldOut || isInactive ? 'button' : undefined}
      tabIndex={isSoldOut || isInactive ? 0 : undefined}
      aria-disabled={isSoldOut || isInactive}
      aria-label={isSoldOut ? `${cardTitle} - Sold Out` : isInactive ? `${cardTitle} - Inactive` : undefined}
    >
      {/* 4:3 Aspect Ratio Image Stage */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 shrink-0">
        {cardImage && !imgError ? (
          <img
            src={cardImage}
            alt={cardAlt}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out ${
              isSoldOut ? 'filter grayscale contrast-100' : 'group-hover:scale-105'
            }`}
            style={isSoldOut ? { filter: 'grayscale(100%)' } : {}}
          />
        ) : (
          <img
            src={FALLBACK_IMG}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover object-center ${
              isSoldOut ? 'filter grayscale contrast-100' : ''
            }`}
            style={isSoldOut ? { filter: 'grayscale(100%)' } : {}}
          />
        )}

        {/* Diagonal Red Ribbon for Sold Out */}
        {isSoldOut && <SoldOutRibbon />}

        {/* Badges Overlay */}
        {cardBadges.length > 0 && !isSoldOut && !isInactive && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
            {cardBadges.map((b, i) => (
              <span
                key={i}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-xs ${b.className}`}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}

        {/* Inactive Overlay */}
        {isInactive && !isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-bold text-sm shadow-lg bg-amber-600">
              <i className="fa-solid fa-pause-circle text-[14px]" />
              INACTIVE
            </span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Overline */}
        {cardOverline && !isSoldOut && !isInactive && (
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 truncate">
            {cardOverline}
          </p>
        )}

        {/* Title — Fixed height line clamp */}
        <div className="min-h-[2.5rem] flex items-start">
          {cardTitle && (
            <h3 className={`font-bold text-brand-charcoal text-sm leading-snug line-clamp-2 ${
              isSoldOut ? 'text-gray-500' : 'group-hover:text-brand-blue transition-colors'
            }`}>
              {cardTitle}
            </h3>
          )}
        </div>

        {/* Price Row */}
        {(isSoldOut || isInactive) && (
          <div className="min-h-[1.5rem] my-1">
            {isSoldOut ? (
              <p className="text-sm font-bold text-red-600">Sold Out</p>
            ) : (
              <p className="text-sm font-bold text-amber-600">Inactive</p>
            )}
          </div>
        )}

        {/* Location Row */}
        {cardLocation && !isSoldOut && !isInactive && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
            <i className="fa-solid fa-location-dot text-brand-blue text-[11px] shrink-0" />
            <span className="truncate font-medium">
              {cardLocation}
              {cardPincode && !/\b\d{6}\b/.test(cardLocation) && !String(cardLocation).includes(cardPincode) ? ` · ${cardPincode}` : ''}
            </span>
          </div>
        )}

        {/* Tags Row */}
        {cardTags.length > 0 && !isSoldOut && !isInactive && (
          <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-gray-600 overflow-hidden max-h-[3rem]">
            {cardTags.map((t, i) => (
              t && (
                <span key={i} className="bg-gray-100/80 rounded-md px-2 py-0.5 font-medium max-w-full inline-flex items-center truncate">
                  <span className="truncate">{t}</span>
                </span>
              )
            ))}
          </div>
        )}

        {/* Sector-specific action children slot */}
        {children && <div className="mt-2 overflow-hidden">{children}</div>}

        {/* Details button pinned to bottom */}
        {showButton !== false && !isSoldOut && !isInactive && (
          <div className="mt-auto pt-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(
                  new CustomEvent('onevishwam:open_enquiry_modal', {
                    detail: { title: cardTitle || title || 'Product Enquiry' },
                  })
                );
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-extrabold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-[0.98]"
            >
              <i className="fa-solid fa-handshake-angle text-xs text-slate-950" />
              <span>Are You Interested?</span>
            </button>
          </div>
        )}

        {/* Sold Out / Inactive status text at bottom */}
        {(isSoldOut || isInactive) && (
          <div className="mt-auto pt-3 text-center">
            <p className={`text-xs font-medium ${isSoldOut ? 'text-red-600' : 'text-amber-600'}`}>
              {isSoldOut ? 'This item is no longer available' : 'This item is currently inactive'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default ListingCard;
