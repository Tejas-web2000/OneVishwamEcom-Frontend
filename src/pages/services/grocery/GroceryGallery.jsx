import React from 'react';
import { UniversalCategoryGallery } from '../../../components/common/templates';
import { useGroceries } from './groceryHooks';
import { GROCERY_CATEGORIES, DELIVERY_TYPE_OPTIONS } from './groceryConfig';

const FILTER_GROUPS = [
  { id: 'category', title: 'Category', options: GROCERY_CATEGORIES.filter((c) => c.id !== 'All').map((c) => c.id) },
  { id: 'delivery', title: 'Delivery Type', options: DELIVERY_TYPE_OPTIONS },
];

const RANGE_FILTERS = [
  { id: 'budget', title: 'Price Range (₹)', min: 0, max: 2000, step: 25, unitLabel: '₹' },
];

export default function GroceryGallery() {
  return (
    <UniversalCategoryGallery
      categoryTitle="Groceries & Daily Essentials"
      categorySubtitle="Fresh farm produce, staples, dairy & organic goods delivered to your doorstep."
      breadcrumb="Groceries & Daily Needs"
      useItems={useGroceries}
      searchPlaceholder="Search fresh groceries, staples, vegetables, or dairy..."
      mapping={{
        id: (g) => g._id || g.id,
        title: (g) => g.title || g.name,
        image: (g) => (Array.isArray(g.images) ? g.images[0] : g.image),
        price: (g) => g.price || (g.pricePerUnit ? `₹${g.pricePerUnit}` : null),
        priceSuffix: (g) => g.unit || (g.pricePerUnit ? 'per unit' : ''),
        location: (g) => g.location?.area || g.area || g.store?.city || 'Bengaluru',
        pincode: (g) => g.pincode,
        overline: (g) => g.category || 'Grocery & Essentials',
        badges: (g) => [
          g.organic && { label: 'Organic', className: 'bg-emerald-600 text-white font-bold' },
          g.inStock !== false && { label: 'In Stock', className: 'bg-blue-600 text-white font-bold' },
        ].filter(Boolean),
        pills: (g) => [g.unit, g.origin || 'Locally Sourced', g.shelfLife].filter(Boolean),
        detailUrl: (g) => `/grocery/${g._id || g.id}`,
      }}
      filterGroups={FILTER_GROUPS}
      rangeFilters={RANGE_FILTERS}
    />
  );
}
