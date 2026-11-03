import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UniversalCategoryGallery } from '../../../components/common/templates';
import { useProperties } from '../../../hooks/useProperties';
import QuickMatchModal from './QuickMatchModal';
import BangalorePropertyPieMap from './components/BangalorePropertyPieMap';
import { cleanProductName } from '../../../utils/searchUtils';
import {
  BEDROOM_OPTIONS,
  FURNISHING_OPTIONS,
  POSTED_BY_OPTIONS,
  POSSESSION_OPTIONS,
  FACING_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
} from './propertyConstants';
import {
  getPropertyType,
  getPropertyTypeLabel,
  getDetailTags,
  getPropertyCoverImage,
  formatPropertyAddress,
  getNumericPrice,
  getNumericArea,
  getBedrooms,
  getCanonicalPossession,
  getCanonicalFurnishing,
  getBangaloreZone,
  getPriorityScore,
  hasPropertyImages,
} from './propertyHelpers';

const FILTER_GROUPS = [
  {
    id: 'propertyType',
    title: 'Property Type',
    options: PROPERTY_TYPE_OPTIONS,
    field: (p) => getPropertyType(p),
  },
  {
    id: 'bedrooms',
    title: 'Bedrooms (BHK)',
    options: BEDROOM_OPTIONS,
    field: (p) => getBedrooms(p?.bhk, p),
  },
  {
    id: 'zone',
    title: 'Bangalore Zone',
    options: ['East', 'West', 'South', 'Byatarayanapura', 'Mahadevapura', 'Bommanahalli', 'Rajarajeshwarinagar', 'Dasarahalli'],
    field: (p) => getBangaloreZone(p),
  },
  {
    id: 'possessionStatus',
    title: 'Possession Status',
    options: POSSESSION_OPTIONS,
    field: (p) => getCanonicalPossession(p),
  },
  {
    id: 'furnishing',
    title: 'Furnishing State',
    options: FURNISHING_OPTIONS,
    field: (p) => getCanonicalFurnishing(p),
  },
  {
    id: 'facing',
    title: 'Door Facing',
    options: FACING_OPTIONS,
    field: (p) => p.facing || p.details?.facing,
  },
  {
    id: 'postedBy',
    title: 'Posted By',
    options: POSTED_BY_OPTIONS,
    field: (p) => p.postedBy || (p.channelPartnerName ? 'Partner Agent' : 'Owner'),
  },
];

const RANGE_FILTERS = [
  {
    id: 'budget',
    title: 'Budget Range',
    field: (p) => getNumericPrice(p.price || p.numericPrice),
    min: 0,
    max: 50000000,
    step: 500000,
    maxLabel: '₹ 5 Cr+',
    unitLabel: '₹',
  },
  {
    id: 'size',
    title: 'Area / Extent (sq.ft)',
    field: (p) => getNumericArea(p.area || p.dimensions),
    min: 0,
    max: 10000,
    step: 100,
    maxLabel: '10,000+ sq.ft',
    unitLabel: 'sq.ft',
    formatLabel: (val) => `${Number(val || 0).toLocaleString('en-IN')} sq.ft`,
  },
];

/**
 * Custom sort comparator: Guarantees that in-house projects and priority listings
 * always appear at the very top of the gallery, followed by selected sortBy secondary criteria.
 */
function sortPropertiesWithInHousePriority(list = [], sortBy = 'latest') {
  return [...list].sort((a, b) => {
    const aTarget = a.raw || a;
    const bTarget = b.raw || b;
    const aScore = getPriorityScore(aTarget);
    const bScore = getPriorityScore(bTarget);

    if (aScore !== bScore) {
      return bScore - aScore; // In-house projects and OneVishwam priority listings always at top
    }

    // Properties that have real images are shown priority
    const aImg = hasPropertyImages(aTarget) || hasPropertyImages(a) ? 1 : 0;
    const bImg = hasPropertyImages(bTarget) || hasPropertyImages(b) ? 1 : 0;
    if (aImg !== bImg) return bImg - aImg;

    if (sortBy === 'price-low') {
      const pA = getNumericPrice(aTarget.price || aTarget.numericPrice || 0);
      const pB = getNumericPrice(bTarget.price || bTarget.numericPrice || 0);
      return pA - pB;
    }
    if (sortBy === 'price-high') {
      const pA = getNumericPrice(aTarget.price || aTarget.numericPrice || 0);
      const pB = getNumericPrice(bTarget.price || bTarget.numericPrice || 0);
      return pB - pA;
    }
    if (sortBy === 'name-asc') {
      return String(aTarget.title || aTarget.name || '').localeCompare(String(bTarget.title || bTarget.name || ''));
    }

    // Default latest: newest date or ID first
    const bDate = new Date(bTarget.createdAt || 0).getTime() || (typeof bTarget.id === 'number' ? bTarget.id : 0);
    const aDate = new Date(aTarget.createdAt || 0).getTime() || (typeof aTarget.id === 'number' ? aTarget.id : 0);
    return bDate - aDate;
  });
}

/**
 * PropertyGallery
 * Powered by UniversalCategoryGallery - purely declarative configuration.
 * Replaces ~1,340 lines of repetitive boilerplate with a modular, maintainable component.
 */
export default function PropertyGallery() {
  const [quickMatchOpen, setQuickMatchOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties } = useProperties();

  const selectedZone = searchParams.get('zone') || '';

  const handleSelectZone = (zone) => {
    const next = !zone || zone === 'All' || zone === selectedZone ? '' : zone;
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (next) p.set('zone', next);
      else p.delete('zone');
      return p;
    });
  };

  const topExtra = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowMap((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-2xs border cursor-pointer ${
            showMap || selectedZone
              ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
              : 'bg-white text-slate-700 border-gray-200 hover:border-brand-blue/40 hover:bg-gray-50'
          }`}
        >
          <i className="fa-solid fa-map-location-dot" />
          <span>{showMap ? 'Hide Bangalore Map' : 'Bangalore Property Map'}</span>
          {selectedZone && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] uppercase tracking-wider font-extrabold">
              {selectedZone}
            </span>
          )}
        </button>
      </div>

      {showMap && (
        <div className="animate-fade-in">
          <BangalorePropertyPieMap
            properties={properties || []}
            activeZone={selectedZone || 'All'}
            onSelectZone={handleSelectZone}
          />
        </div>
      )}
    </div>
  );

  return (
    <UniversalCategoryGallery
      categoryTitle="Explore Verified Properties"
      categorySubtitle="Discover curated apartments, independent villas, BDA plots, and commercial spaces across Bengaluru."
      breadcrumb="Properties"
      searchPlaceholder="Search properties by name, locality, BHK, builder, or landmark (e.g. Whitefield, 3 BHK, Sobha)..."
      searchFields={[
        'title',
        'name',
        'brand',
        'model',
        'location',
        'city',
        'locality',
        'address',
        'category',
        'subcategory',
        'propertyType',
        'bhk',
        'pincode',
        'landmark',
      ]}
      useItems={useProperties}
      hidePrice={true}
      postRequirementLink="/property/requirement"
      onQuickMatch={() => setQuickMatchOpen(true)}
      quickMatchLabel="Quick Match"
      topExtra={topExtra}
      customSorter={sortPropertiesWithInHousePriority}
      mapping={{
        id: (p) => p._id || p.id,
        title: (p) => cleanProductName(p.title || 'Featured Property'),
        image: (p) => getPropertyCoverImage(p),
        price: (p) => p.price,
        priceSuffix: (p) => p.priceSuffix || (p.negotiable ? 'Negotiable' : ''),
        location: (p) => formatPropertyAddress(p) || p.location || p.city || 'Bangalore',
        pincode: (p) => p.pincode || '',
        overline: (p) => getPropertyTypeLabel(p) || p.propertyType || p.subcategory || 'Residential',
        badges: (p) => [
          (
            getPriorityScore(p) >= 2 ||
            String(p.vendorName || p.vendor || '').toLowerCase().replace(/\s+/g, '').includes('onevishwam')
          ) && {
            label: 'In-House Project',
            className: 'bg-indigo-600 text-white font-bold',
          },
          p.status && {
            label: p.status === 'approved' ? 'Verified' : p.status,
            className: 'bg-emerald-600 text-white',
          },
          (p.bankLoanDetails || p.loanApproved) && {
            label: 'Loan Approved',
            className: 'bg-blue-600 text-white',
          },
          p.featured && {
            label: 'Featured',
            className: 'bg-amber-500 text-white',
          },
          Boolean(p.cornerPlot) && {
            label: 'Corner Site',
            className: 'bg-purple-600 text-white font-bold',
          },
        ].filter(Boolean),
        pills: (p) => [
          getPropertyTypeLabel(p) || p.propertyType || p.subcategory,
          ...getDetailTags(p),
        ].filter(Boolean),
        highlightBanner: (p) => (p.loanApproved || p.bankLoanDetails ? '100% Pre-Approved Bank Loan Available' : null),
        detailUrl: (p) => `/property/${p._id || p.id}`,
      }}
      filterGroups={FILTER_GROUPS}
      rangeFilters={RANGE_FILTERS}
      customModals={
        quickMatchOpen && (
          <QuickMatchModal
            isOpen={quickMatchOpen}
            onClose={() => setQuickMatchOpen(false)}
          />
        )
      }
    />
  );
}
