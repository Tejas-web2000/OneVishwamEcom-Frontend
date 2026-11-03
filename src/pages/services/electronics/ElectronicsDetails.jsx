import React from 'react';
import { UniversalDetailPage } from '../../../components/common/templates';
import { useElectronicById, useSimilarElectronics } from './electronicsHooks';

export default function ElectronicsDetails({ item = null, similarItems = [] }) {
  return (
    <UniversalDetailPage
      categoryTitle="Consumer Electronics"
      backUrl="/our-services/consumer-electronics"
      useItemById={item ? null : useElectronicById}
      useSimilarItems={item ? null : useSimilarElectronics}
      item={item}
      similarItems={similarItems}
      mapping={{
        id: (it) => it._id || it.id,
        title: (it) => it.title || it.name || `${it.brand || ''} ${it.model || ''}`.trim(),
        subtitle: (it) => it.subtitle || it.subcategory || it.category || 'Verified Consumer Device',
        price: (it) => it.price,
        priceSuffix: (it) => it.priceSuffix || 'Incl. GST',
        priceSubtext: (it) => it.priceNote || it.priceSuffix || 'Inclusive of all taxes',
        location: (it) => it.location || it.area || it.city || 'Bengaluru',
        pincode: (it) => it.pincode,
        images: (it) => (Array.isArray(it.images) && it.images.length > 0 ? it.images : (it.image ? [it.image] : [])),
        description: (it) => it.description || it.subtitle || 'Verified authentic electronics with brand warranty and invoice.',
        badges: (it) => (Array.isArray(it.statusBadges) && it.statusBadges.length > 0 ? it.statusBadges : [
          it.warranty ? { label: it.warranty, className: 'bg-emerald-600 text-white' } : null,
          it.condition ? { label: it.condition, className: 'bg-blue-600 text-white' } : null,
        ].filter(Boolean)),
        highlights: (it) => (Array.isArray(it.overviewHighlights) && it.overviewHighlights.length > 0)
          ? it.overviewHighlights
          : [
              { label: 'Brand', value: it.brand || 'Authentic', icon: 'fa-shield-check', desc: 'Manufacturer Verified' },
              { label: 'Model', value: it.model || 'Standard', icon: 'fa-microchip', desc: 'Hardware Specification' },
              { label: 'Condition', value: it.condition || 'Brand New', icon: 'fa-box-open', desc: 'Physical Inspection' },
              { label: 'Warranty', value: it.warranty || 'Brand Warranty', icon: 'fa-certificate', desc: 'Official Coverage' },
            ],
        specs: (it) => {
          if (Array.isArray(it.specifications) && it.specifications.length > 0) {
            return it.specifications;
          }
          return [
            {
              title: 'General Specifications',
              items: [
                { label: 'Product Name', value: it.title || it.name },
                { label: 'Brand / Make', value: it.brand },
                { label: 'Model Number', value: it.model },
                { label: 'Category', value: it.category || 'Consumer Electronics' },
                { label: 'Device Subcategory', value: it.subcategory },
                { label: 'Condition', value: it.condition },
                { label: 'Official Warranty', value: it.warranty },
                { label: 'Location', value: it.location || it.city },
              ].filter((s) => Boolean(s.value)),
            },
          ];
        },
        features: (it) => (Array.isArray(it.features) && it.features.length > 0)
          ? it.features
          : [
              'Official Brand Warranty & Invoice Included',
              'Free Safe Doorstep Delivery Across Bengaluru',
              'Standard EMI & Card Payment Assistance Available',
              'Quality & Authenticity Guaranteed by OneVishwam',
            ],
        seller: (it) => ({
          name: it.showroom?.name || it.vendorName || it.contributor?.name || 'Authorized Retailer',
          phone: it.showroom?.phone || it.contributor?.contact || it.contact || '8546996622',
          whatsapp: it.showroom?.phone || it.contributor?.contact || it.contact || '8546996622',
          email: it.showroom?.email || it.contributor?.email || 'ceo@onevishwam.com',
          verified: true,
        }),
      }}
    />
  );
}
