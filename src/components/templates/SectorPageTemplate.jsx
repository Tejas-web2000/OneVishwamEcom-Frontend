import React from 'react';

/**
 * SectorPageTemplate
 * ─────────────────
 * Master layout wrapper for every sector gallery/listing page (Properties,
 * Automobiles, Grocery, Garments, Jewellery, Finance…).
 *
 * Guarantees uniform:
 *  • Background gradient
 *  • Top/bottom spacing (accounts for sticky navbar)
 *  • Container width, horizontal padding
 *
 * Usage:
 *   <SectorPageTemplate>
 *     <SectorPageHeader ... />
 *     <SectorTabs ... />
 *     <GallerySearchBar ... />
 *     ...
 *   </SectorPageTemplate>
 */
export function SectorPageTemplate({ children, className = '' }) {
  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-gray-50 via-slate-50/50 to-gray-50 pb-24 pt-16 lg:pt-14 relative ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

export default SectorPageTemplate;

