import React from 'react';
import { UniversalDetailPage } from '../../../components/common/templates';
import { useGarmentById, useSimilarGarments } from './garmentHooks';

export default function GarmentDetails() {
  return (
    <UniversalDetailPage
      categoryTitle="Garments & Fashion"
      backUrl="/our-services/garments-fashion-lifestyle"
      useItemById={useGarmentById}
      useSimilarItems={useSimilarGarments}
      mapping={{
        id: (g) => g._id || g.id,
        title: (g) => g.title || g.name,
        subtitle: (g) => `${g.fabric || 'Cotton'} · ${g.category || 'Apparel'}`,
        price: (g) => g.price,
        priceSuffix: (g) => g.priceSuffix || 'Inclusive of all taxes',
        location: (g) => g.location || g.store?.address || g.store?.city || 'Bengaluru',
        pincode: (g) => g.pincode || g.store?.pincode,
        mapUrl: (g) => g.mapUrl || g.store?.mapUrl,
        images: (g) => (Array.isArray(g.images) && g.images.length > 0 ? g.images : (g.image ? [g.image] : [])),
        description: (g) => g.description || 'Verified authentic garment crafted with premium stitching and materials.',
        badges: (g) => [
          g.trending && { label: 'Trending Style', className: 'bg-rose-500 text-white font-bold' },
          g.fabric && { label: g.fabric, className: 'bg-emerald-600 text-white font-bold' },
        ].filter(Boolean),
        highlights: (g) => [
          { label: 'Fabric', value: g.fabric || 'Cotton', icon: 'fa-shirt', desc: 'Material Quality' },
          { label: 'Sizes', value: Array.isArray(g.sizes) ? g.sizes.join(', ') : (g.size || 'M, L, XL'), icon: 'fa-ruler', desc: 'Available Fit' },
          { label: 'Category', value: g.category || 'Fashion', icon: 'fa-tag', desc: 'Style Classification' },
          { label: 'Store', value: g.store?.name || 'Verified Partner', icon: 'fa-store', desc: 'Certified Merchant' },
        ],
        specs: (g) => [
          {
            title: 'Garment & Fabric Specifications',
            items: [
              { label: 'Title', value: g.title || g.name },
              { label: 'Fabric', value: g.fabric },
              { label: 'Available Sizes', value: Array.isArray(g.sizes) ? g.sizes.join(', ') : g.size },
              { label: 'Occasion', value: g.occasion },
              { label: 'Store / Seller', value: g.store?.name },
              { label: 'Store Location', value: g.store?.address || g.store?.city },
            ].filter((s) => Boolean(s.value)),
          },
        ],
        features: (g) => g.features || [
          'Authentic Certified Fabric',
          'Easy Exchange Policy',
          'Quality Checked by OneVishwam',
        ],
      }}
    />
  );
}
