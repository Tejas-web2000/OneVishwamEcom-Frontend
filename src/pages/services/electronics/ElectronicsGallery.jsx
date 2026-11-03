import React from 'react';
import { UniversalCategoryGallery } from '../../../components/common/templates';
import { useElectronics } from './electronicsHooks';

const FILTER_GROUPS = [
  {
    id: 'subcategory',
    title: 'Category & Device Type',
    field: 'subcategory',
    options: [
      'Television & Home Audio',
      'Air Conditioners & Cooling',
      'Home & Kitchen Appliances',
      'Home Appliances',
      'Smartphones & Tablets',
      'Laptops & Computers',
    ],
    defaultOpen: true,
  },
  {
    id: 'brand',
    title: 'Brand',
    field: 'brand',
    options: ['Sony', 'LG', 'Samsung', 'Apple', 'Godrej', 'Haier', 'Lloyd', 'Whirlpool', 'Xiaomi', 'IFB'],
    defaultOpen: true,
  },
  {
    id: 'condition',
    title: 'Condition & Warranty',
    field: 'condition',
    options: ['Brand New Sealed', 'Certified Refurbished', 'Used - Like New'],
    defaultOpen: false,
  },
];

const RANGE_FILTERS = [
  {
    id: 'price',
    title: 'Budget (₹)',
    field: 'numericPrice',
    min: 0,
    max: 300000,
    step: 5000,
    maxLabel: '₹ 3 L+',
    unitLabel: '₹',
    defaultOpen: true,
  },
];

export default function ElectronicsGallery({ items = null }) {
  return (
    <UniversalCategoryGallery
      categoryTitle="Explore Verified Consumer Electronics & Appliances"
      categorySubtitle="Browse certified OLED televisions, premium laptops, flagship smartphones, and smart home appliances with official brand warranties."
      breadcrumb="Consumer Electronics"
      searchPlaceholder="Search electronics by brand, model, category, or locality (e.g. Sony OLED, MacBook M3, Indiranagar)..."
      useItems={items ? null : useElectronics}
      items={items}
      mapping={{
        id: (item) => item._id || item.id,
        title: (item) => item.title || item.name || `${item.brand || ''} ${item.model || ''}`.trim(),
        image: (item) => (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : (item.image || '')),
        price: (item) => item.price,
        priceSuffix: (item) => item.priceSuffix || 'Incl. GST',
        location: (item) => item.location || item.area || item.city || 'Bengaluru',
        pincode: (item) => item.pincode,
        overline: (item) => item.subcategory || item.category || 'Consumer Electronics',
        badges: (item) => (item.statusBadges?.length > 0 ? item.statusBadges : [
          item.warranty ? { label: item.warranty, className: 'bg-emerald-600 text-white' } : null,
        ].filter(Boolean)),
        pills: (item) => (item.cardPills?.length > 0 ? item.cardPills : [item.brand, item.model, item.condition].filter(Boolean)),
        highlightBanner: (item) => item.highlightBanner,
        detailUrl: (item) => `/electronics/${item._id || item.id}`,
      }}
      filterGroups={FILTER_GROUPS}
      rangeFilters={RANGE_FILTERS}
    />
  );
}
