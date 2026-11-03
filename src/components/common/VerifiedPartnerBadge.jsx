import React from 'react';
import oneVishwamLogo from '../../assets/logo.png';

/**
 * VerifiedPartnerBadge
 * Official co-branding trust pill:
 * [ Partner / Vendor Name  ✕  onevishwam (logo)  VERIFIED ]
 */
export default function VerifiedPartnerBadge({ partnerName = 'One Vishwam', className = '' }) {
  const displayName = String(partnerName || 'One Vishwam').trim();

  return (
    <div
      className={`inline-flex items-center gap-2 sm:gap-2.5 rounded-full border border-gray-200/90 bg-white px-3.5 py-1.5 shadow-2xs hover:shadow-xs transition-shadow ${className}`}
      title={`${displayName} in partnership with OneVishwam (Verified)`}
    >
      <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap">
        {displayName}
      </span>
      <span className="text-xs text-gray-300 font-light select-none">✕</span>
      <img
        src={oneVishwamLogo}
        alt="OneVishwam"
        className="h-3.5 sm:h-4 w-auto object-contain shrink-0"
      />
      <span className="rounded-md bg-amber-50 border border-amber-200/80 text-amber-700 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 whitespace-nowrap shrink-0">
        VERIFIED
      </span>
    </div>
  );
}
