import React from 'react';
import { UniversalDetailPage } from '../../../components/common/templates';
import { useJewelleryById, useSimilarJewellery } from './jewelleryHooks';

export default function JewelleryDetails() {
  return (
    <UniversalDetailPage
      categoryTitle="Jewellery & Precious Metals"
      backUrl="/categories/jewellery"
      useItemById={useJewelleryById}
      useSimilarItems={useSimilarJewellery}
      mapping={{
        id: (j) => j._id || j.id,
        title: (j) => j.title || j.name,
        subtitle: (j) => `${j.metalType || 'Gold'} · ${j.purity || 'Hallmarked'} · ${j.category || 'Jewellery'}`,
        price: (j) => j.price,
        priceSuffix: (j) => j.priceSuffix || 'Inclusive of all taxes & making charges',
        location: (j) => j.location || j.store?.address || j.store?.city || 'Bengaluru',
        pincode: (j) => j.pincode || j.store?.pincode,
        mapUrl: (j) => j.mapUrl || j.store?.mapUrl,
        images: (j) => (Array.isArray(j.images) && j.images.length > 0 ? j.images : (j.image ? [j.image] : [])),
        description: (j) => j.description || 'Exquisitely crafted precious jewellery certified by accredited gemological agencies.',
        badges: (j) => [
          j.certAgency && { label: j.certAgency, className: 'bg-amber-600 text-white font-bold' },
          j.hallmarked && { label: 'BIS Hallmarked', className: 'bg-emerald-600 text-white font-bold' },
        ].filter(Boolean),
        highlights: (j) => [
          { label: 'Precious Metal', value: j.metalType || 'Gold', icon: 'fa-coins', desc: 'Material Type' },
          { label: 'Purity', value: j.purity || '22K (916)', icon: 'fa-certificate', desc: 'Standard Certification' },
          { label: 'Gross Weight', value: j.weightGrams ? `${j.weightGrams}g` : 'Standard', icon: 'fa-scale-balanced', desc: 'Net Weight' },
          { label: 'Certification', value: j.certAgency || 'BIS Certified', icon: 'fa-award', desc: 'Official Assay' },
        ],
        specs: (j) => [
          {
            title: 'Metal & Gemstone Specifications',
            items: [
              { label: 'Item Name', value: j.title || j.name },
              { label: 'Metal Type', value: j.metalType },
              { label: 'Purity Standard', value: j.purity },
              { label: 'Gross Weight', value: j.weightGrams ? `${j.weightGrams} grams` : null },
              { label: 'Certification Agency', value: j.certAgency },
              { label: 'Store / Jeweller', value: j.store?.name },
              { label: 'Jeweller Location', value: j.store?.address || j.store?.city },
            ].filter((s) => Boolean(s.value)),
          },
        ],
        features: (j) => j.features || [
          '100% BIS Hallmarked & Certified Purity',
          'Lifetime Buyback & Exchange Guarantee',
          'Insured Courier & Safe Store Pick-Up',
        ],
      }}
    />
  );
}