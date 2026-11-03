import React, { useState } from 'react';
import { UniversalCategoryGallery } from '../../../components/common/templates';
import useLoanProducts from './useLoanProducts';
import LoanQuickMatchModal from './LoanQuickMatchModal';

const FILTER_GROUPS = [
  {
    id: 'type',
    title: 'Loan Category',
    field: (item) => item.type,
    options: ['home', 'vehicle', 'personal', 'business', 'education', 'gold'],
    defaultOpen: true,
  },
];

export default function FinanceLoanGallery() {
  const [quickMatchOpen, setQuickMatchOpen] = useState(false);

  return (
    <>
      <UniversalCategoryGallery
        categoryTitle="Explore Verified Loans & Financial Products"
        categorySubtitle="Pre-approved home loans, vehicle financing, and personal loans with competitive interest rates and zero hidden charges."
        breadcrumb="Finance & Loans"
        useItems={useLoanProducts}
        searchPlaceholder="Search loans by type or feature (e.g. Home Loan, Vehicle, Zero Collateral)..."
        filterGroups={FILTER_GROUPS}
        onQuickMatch={() => setQuickMatchOpen(true)}
        quickMatchLabel="Loan Eligibility"
        mapping={{
          id: (l) => l.id || l._id,
          title: (l) => l.title,
          image: (l) => l.image,
          price: (l) => (l.interestRate ? `From ${l.interestRate}` : 'Low Interest Rate'),
          priceSuffix: (l) => (l.maxAmount ? `· Up to ${l.maxAmount}` : ''),
          location: () => 'Bengaluru & Pan-India',
          overline: (l) => (l.type ? `${String(l.type).toUpperCase()} LOAN` : 'FINANCE'),
          badges: (l) => [
            { label: 'Pre-Approved', className: 'bg-emerald-600 text-white' },
            ...(l.interestRate ? [{ label: `${l.interestRate}`, className: 'bg-brand-blue text-white' }] : []),
          ],
          pills: (l) => [
            ...(l.tenure ? [l.tenure] : []),
            ...(l.processingFee ? [l.processingFee] : []),
            ...(l.features?.[0] ? [l.features[0]] : []),
          ],
          highlightBanner: () => '100% Pre-Approved Loan Available',
          link: (l) => `/finance/${l.id || l._id}`,
        }}
      />

      {quickMatchOpen && (
        <LoanQuickMatchModal isOpen={quickMatchOpen} onClose={() => setQuickMatchOpen(false)} />
      )}
    </>
  );
}
