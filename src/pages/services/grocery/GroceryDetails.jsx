import React from 'react';
import { UniversalDetailPage } from '../../../components/common/templates';
import { useGroceryById, useSimilarGroceries } from './groceryHooks';

export default function GroceryDetails() {
  return (
    <UniversalDetailPage
      categoryTitle="Groceries & Daily Needs"
      backUrl="/our-services/consumer-marketplace"
      useItemById={useGroceryById}
      useSimilarItems={useSimilarGroceries}
      mapping={{
        id: (g) => g._id || g.id,
        title: (g) => g.title || g.name,
        subtitle: (g) => `${g.category || 'Daily Needs'} · ${g.origin || 'Fresh Farm Batch'}`,
        price: (g) => g.price || (g.pricePerUnit ? `₹${g.pricePerUnit}` : null),
        priceSuffix: (g) => g.unit || (g.pricePerUnit ? 'per unit' : ''),
        location: (g) => g.location?.area || g.store?.address || g.store?.city || 'Bengaluru',
        pincode: (g) => g.pincode || g.store?.pincode,
        mapUrl: (g) => g.mapUrl || g.store?.mapUrl,
        images: (g) => (Array.isArray(g.images) && g.images.length > 0 ? g.images : (g.image ? [g.image] : [])),
        description: (g) => g.description || 'Farm-fresh groceries and daily essentials verified for hygiene and purity.',
        badges: (g) => [
          g.organic && { label: '100% Organic', className: 'bg-emerald-600 text-white font-bold' },
          g.inStock !== false ? { label: 'Fresh Stock', className: 'bg-blue-600 text-white font-bold' } : null,
        ].filter(Boolean),
        highlights: (g) => [
          { label: 'Category', value: g.category || 'Groceries', icon: 'fa-basket-shopping', desc: 'Item Classification' },
          { label: 'Unit / Pack', value: g.unit || 'Standard Pack', icon: 'fa-scale-balanced', desc: 'Packaged Quantity' },
          { label: 'Source', value: g.origin || 'Locally Sourced', icon: 'fa-seedling', desc: 'Origin / Farm' },
          { label: 'Shelf Life', value: g.shelfLife || 'Fresh Daily', icon: 'fa-calendar-check', desc: 'Best Before' },
        ],
        specs: (g) => [
          {
            title: 'Product Information & Nutrition',
            items: [
              { label: 'Item Name', value: g.title || g.name },
              { label: 'Category', value: g.category },
              { label: 'Pack Unit', value: g.unit },
              { label: 'Origin', value: g.origin },
              { label: 'Shelf Life', value: g.shelfLife },
              { label: 'Storage Instructions', value: g.storage },
            ].filter((s) => Boolean(s.value)),
          },
        ],
        features: (g) => g.certifications || [
          'Certified Organic & Chemical Free',
          'Same-Day Delivery in Bangalore',
          'Direct from Verified Farmers & Suppliers',
        ],
      }}
    />
  );
}
