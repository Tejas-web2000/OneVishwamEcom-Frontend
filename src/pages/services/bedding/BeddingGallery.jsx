import React from 'react';
import { UniversalCategoryGallery } from '../../../components/common/templates';
import { useBedding } from './beddingHooks';

const FILTER_GROUPS = [
  {
    id: 'subcategory',
    title: 'Collection & Mattress Type',
    field: (item) => item.subcategory || item.category,
    options: [
      'Peps Affordable Luxury',
      'The Restonic American Comfort',
      'Peps Elite Comfort',
      'Italiano Luxury Collection',
      'Peps Orthopaedic Mattress',
      'Peps Hypoallergenic Mattress',
      'Pillows & Rest Cushions',
      'Blankets & Comforters',
      'Mattress Protectors & Sheets',
    ],
    defaultOpen: true,
  },
  {
    id: 'brand',
    title: 'Brand',
    field: 'brand',
    options: ['Peps', 'Peps Italiano', 'Restonic by Peps'],
    defaultOpen: true,
  },
  {
    id: 'condition',
    title: 'Condition & Warranty',
    field: 'condition',
    options: ['new', 'Brand New Sealed', 'Direct Factory Warranty'],
    defaultOpen: false,
  },
];

const RANGE_FILTERS = [
  {
    id: 'price',
    title: 'Budget (₹)',
    field: 'numericPrice',
    min: 0,
    max: 200000,
    step: 2000,
    maxLabel: '₹ 2 L+',
    unitLabel: '₹',
    defaultOpen: true,
  },
];

export default function BeddingGallery({ items = null }) {
  return (
    <UniversalCategoryGallery
      categoryTitle="Explore Verified Bedding & Sleep Comfort"
      categorySubtitle="Browse certified orthopedic memory foam mattresses, luxury pocketed spring collections, and sleep accessories with direct factory warranties."
      breadcrumb="Bedding & Comfort"
      searchPlaceholder="Search mattresses by collection, brand, model, or locality (e.g. Bonnell Comfort, Restonic, Indiranagar)..."
      useItems={items ? null : useBedding}
      items={items}
      mapping={{
        id: (item) => item._id || item.id,
        title: (item) => item.title || item.name || `${item.brand || ''} ${item.model || ''}`.trim(),
        image: (item) => (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : (item.image || '')),
        price: (item) => item.price,
        priceSuffix: (item) => item.priceSuffix || 'Incl. GST',
        location: (item) => item.location || item.area || item.city || 'Bengaluru',
        pincode: (item) => item.pincode,
        overline: (item) => item.subcategory || item.category || 'Bedding & Sleep Comfort',
        badges: (item) => (item.statusBadges?.length > 0 ? item.statusBadges : [
          item.warranty ? { label: item.warranty, className: 'bg-emerald-600 text-white' } : null,
        ].filter(Boolean)),
        pills: (item) => (item.cardPills?.length > 0 ? item.cardPills : [item.brand, item.model, item.condition].filter(Boolean)),
        highlightBanner: (item) => item.highlightBanner,
        detailUrl: (item) => `/bedding/${item._id || item.id}`,
      }}
      filterGroups={FILTER_GROUPS}
      rangeFilters={RANGE_FILTERS}
    />
  );
}
