import React from 'react';
import { UniversalCategoryGallery } from '../../../components/common/templates';
import { useJewellery } from './jewelleryHooks';
import {
  JEWELLERY_CATEGORIES,
  METAL_OPTIONS,
  PURITY_OPTIONS,
  OCCASION_OPTIONS,
} from './jewelleryConfig';

const FILTER_GROUPS = [
  { id: 'category', title: 'Category', options: JEWELLERY_CATEGORIES.filter((c) => c.id !== 'All').map((c) => c.id) },
  { id: 'metalType', title: 'Precious Metal', options: METAL_OPTIONS },
  { id: 'purity', title: 'Gold / Silver Purity', options: PURITY_OPTIONS },
  { id: 'occasion', title: 'Occasion', options: OCCASION_OPTIONS },
];

const RANGE_FILTERS = [
  { id: 'budget', title: 'Price Range (₹)', min: 0, max: 500000, step: 2500, unitLabel: '₹' },
];

export default function JewelleryGallery() {
  return (
    <UniversalCategoryGallery
      categoryTitle="Jewellery & Precious Metals Marketplace"
      categorySubtitle="Hallmarked gold, certified diamonds, fine silver and custom bridal collections from certified jewellers."
      breadcrumb="Jewellery & Gold"
      useItems={useJewellery}
      searchPlaceholder="Search gold rings, diamond necklaces, silver coins, bangles..."
      mapping={{
        id: (j) => j._id || j.id,
        title: (j) => j.title || j.name,
        image: (j) => (Array.isArray(j.images) ? j.images[0] : j.image),
        price: (j) => j.price,
        priceSuffix: (j) => j.priceSuffix || 'Incl. GST',
        location: (j) => j.location || j.store?.city || 'Bengaluru',
        pincode: (j) => j.pincode || j.store?.pincode,
        overline: (j) => `${j.metalType || 'Gold'} · ${j.purity || 'Hallmarked'}`,
        badges: (j) => [
          j.certAgency && { label: j.certAgency, className: 'bg-amber-600 text-white font-bold' },
          j.hallmarked && { label: 'BIS Hallmarked', className: 'bg-emerald-600 text-white font-bold' },
        ].filter(Boolean),
        pills: (j) => [j.metalType, j.purity, j.weightGrams ? `${j.weightGrams}g` : null].filter(Boolean),
        detailUrl: (j) => `/jewellery/${j._id || j.id}`,
      }}
      filterGroups={FILTER_GROUPS}
      rangeFilters={RANGE_FILTERS}
    />
  );
}