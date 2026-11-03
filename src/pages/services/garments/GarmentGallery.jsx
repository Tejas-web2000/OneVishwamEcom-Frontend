import React from 'react';
import { UniversalCategoryGallery } from '../../../components/common/templates';
import { useGarments } from './garmentHooks';
import {
  GARMENT_TABS,
  BRAND_TYPE_OPTIONS,
  SIZE_OPTIONS,
  FABRIC_OPTIONS,
} from './garmentConfig';

const FILTER_GROUPS = [
  { id: 'category', title: 'Category', options: GARMENT_TABS.filter((t) => t !== 'All') },
  { id: 'brandType', title: 'Brand Type', options: BRAND_TYPE_OPTIONS },
  { id: 'sizes', title: 'Sizes', options: SIZE_OPTIONS },
  { id: 'fabrics', title: 'Fabrics', options: FABRIC_OPTIONS },
];

const RANGE_FILTERS = [
  { id: 'budget', title: 'Budget Range (₹)', min: 0, max: 25000, step: 250, unitLabel: '₹' },
];

export default function GarmentGallery() {
  return (
    <UniversalCategoryGallery
      categoryTitle="Garments, Fashion & Apparel"
      categorySubtitle="Trending ethnic, western, everyday casuals and premium designer wear for all ages."
      breadcrumb="Garments & Fashion"
      useItems={useGarments}
      searchPlaceholder="Search garments (e.g. Silk Saree, Cotton Kurta, Formal Shirt)..."
      mapping={{
        id: (g) => g._id || g.id,
        title: (g) => g.title || g.name,
        image: (g) => (Array.isArray(g.images) ? g.images[0] : g.image),
        price: (g) => g.price,
        priceSuffix: (g) => g.priceSuffix || 'Inclusive of taxes',
        location: (g) => g.location || g.store?.city || 'Bengaluru',
        pincode: (g) => g.pincode || g.store?.pincode,
        overline: (g) => g.brand || g.fabric || g.category || 'Apparel',
        badges: (g) => [
          g.trending && { label: 'Trending', className: 'bg-rose-500 text-white font-bold' },
          g.fabric && { label: g.fabric, className: 'bg-emerald-600 text-white font-bold' },
        ].filter(Boolean),
        pills: (g) => [
          g.gender,
          g.size || (Array.isArray(g.sizes) ? g.sizes.slice(0, 2).join(', ') : null),
          g.fabric,
        ].filter(Boolean),
        detailUrl: (g) => `/garment/${g._id || g.id}`,
      }}
      filterGroups={FILTER_GROUPS}
      rangeFilters={RANGE_FILTERS}
    />
  );
}
