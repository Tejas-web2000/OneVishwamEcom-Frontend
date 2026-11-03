import React, { useState } from 'react';
import { navigateTo } from '../../../config/navigation';
import { useAuth } from '../../../store/authSlice';
import { formatINR, withRupeeSymbol } from '../../../utils/priceUtils';
import SoldOutRibbon from '../../../components/ui/SoldOutRibbon';
import {
  getPropertyTypeLabel,
  getDetailTags,
  getStatusBadge,
  getPropertyCoverImage,
  formatPropertyDisplayPrice,
  formatPropertyAddress,
} from './propertyHelpers';
import { ONEVISHWAM_VERIFIED_IMAGE, isPlaceholderImage } from '../../../constants/fallbackImage';

const EMPTY_ARRAY = [];

function PropertyCardImpl({ property }) {
  const [imgError, setImgError] = useState(false);
  const { isLoggedIn, openAuthModal } = useAuth();

  if (!property) return null;

  const availabilityStatus = property.availabilityStatus || 'available';
  const isSoldOut = availabilityStatus === 'sold_out' || property.isSoldOut === true;
  const isInactive = availabilityStatus === 'inactive' || property.isInactive === true;

  const id = property._id || property.id;
  const link = id ? `/property/${id}` : '#';
  const rawImage = getPropertyCoverImage(property);
  const image = isPlaceholderImage(rawImage) ? ONEVISHWAM_VERIFIED_IMAGE : rawImage;
  const title = property.title || property.name || 'Property';
  const typeLabel = getPropertyTypeLabel(property);
  const tags = (getDetailTags(property) || []).slice(0, 2);
  const badge = getStatusBadge(property);
  const display = formatPropertyDisplayPrice(property);

  const badges = [
    ...(property.recentlyAdded
      ? [{ label: 'New', className: 'bg-emerald-500 text-white' }]
      : []),
    ...(badge ? [{ label: badge.label, className: badge.cls }] : []),
  ];

  const handleCardClick = (e) => {
    if (isSoldOut || isInactive) {
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
      return;
    }
    if (!link || link === '#') return;
    if (!isLoggedIn) {
      if (e && e.preventDefault) e.preventDefault();
      sessionStorage.setItem('vishwam_auth_redirect', link);
      openAuthModal('login');
      return;
    }
    navigateTo(link);
  };

  const cardTags = [typeLabel, ...tags].filter(Boolean);

  return (
    <div
      onClick={handleCardClick}
      className={`group bg-white rounded-2xl border border-gray-200/80 overflow-hidden transition-all duration-300 flex flex-col h-full relative ${
        isSoldOut
          ? 'cursor-not-allowed select-none'
          : isInactive
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-brand-blue/40 shadow-xs hover:shadow-xl transform hover:-translate-y-1 cursor-pointer'
      }`}
    >
      {/* 4:3 Image Stage */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 shrink-0">
        {image && !imgError ? (
          <img
            src={image}
            alt={title}
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
            src={ONEVISHWAM_VERIFIED_IMAGE}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover object-center ${
              isSoldOut ? 'filter grayscale contrast-100' : ''
            }`}
            style={isSoldOut ? { filter: 'grayscale(100%)' } : {}}
          />
        )}

        {/* Diagonal Red Ribbon for Sold Out */}
        {isSoldOut && <SoldOutRibbon />}

        {badges.length > 0 && !isSoldOut && !isInactive && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
            {badges.map((b, i) => (
              <span
                key={i}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-2xs backdrop-blur-xs ${b.className}`}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <div className="min-h-[2.5rem] flex items-start">
          <h3 className={`font-bold text-sm leading-snug line-clamp-2 ${
            isSoldOut ? ' text-gray-400' : 'text-brand-charcoal group-hover:text-brand-blue transition-colors'
          }`}>
            {title}
          </h3>
        </div>

        {/* Status / Sold Out */}
        {(isSoldOut || isInactive) && (
          <div className="min-h-[1.5rem] my-1">
            {isSoldOut ? (
              <p className="text-sm font-bold text-red-600">Sold Out</p>
            ) : (
              <p className="text-sm font-bold text-amber-600">Inactive</p>
            )}
          </div>
        )}

        {/* Location */}
        {(property.location || property.city || property.address) && !isSoldOut && !isInactive && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
            <i className="fa-solid fa-location-dot text-brand-blue text-[11px] shrink-0" />
            <span className="truncate font-medium">
              {formatPropertyAddress(property)}
            </span>
          </div>
        )}

        {/* Tags */}
        {cardTags.length > 0 && !isSoldOut && !isInactive && (
          <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-gray-600 overflow-hidden max-h-[3rem]">
            {cardTags.map((t, i) => (
              <span
                key={i}
                className="bg-gray-100/80 rounded-md px-2 py-0.5 font-medium max-w-full inline-flex items-center truncate"
              >
                <span className="truncate">{t}</span>
              </span>
            ))}
          </div>
        )}

        {/* Agent / extras */}
        {(property.agent || property.extraRoom) && !isSoldOut && !isInactive && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500">
            {property.agent && (
              <span>
                <i className="fa-solid fa-user mr-1 text-gray-400" />
                {typeof property.agent === 'object'
                  ? (typeof property.agent.name === 'object'
                      ? property.agent.name?.name || property.agent.name?.email || ''
                      : property.agent.name || '')
                  : property.agent}
              </span>
            )}
            {property.extraRoom && (
              <span>
                <i className="fa-solid fa-star mr-1 text-gray-400" />
                {property.extraRoom}
              </span>
            )}
          </div>
        )}

        {/* Loan badge */}
        {property.loanApproved && !isSoldOut && !isInactive && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 w-fit">
            <i className="fa-solid fa-circle-check text-[10px] text-emerald-600" />
            <span className="text-[10px] font-semibold text-emerald-700">
              100% Pre‑Approved Loan
            </span>
          </div>
        )}

        {/* Action Button / Status */}
        {!isSoldOut && !isInactive ? (
          <div className="mt-auto pt-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(
                  new CustomEvent('onevishwam:open_enquiry_modal', {
                    detail: { title: title || 'Property Enquiry' },
                  })
                );
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-extrabold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-[0.98]"
            >
              <i className="fa-solid fa-handshake-angle text-xs text-slate-950" />
              <span>Are You Interested?</span>
            </button>
          </div>
        ) : (
          <div className="mt-auto pt-3 text-center">
            <p className={`text-xs font-medium ${isSoldOut ? 'text-red-600' : 'text-amber-600'}`}>
              {isSoldOut ? 'This item is no longer available' : 'This item is currently inactive'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const PropertyCard = React.memo(PropertyCardImpl);
export default PropertyCard;
