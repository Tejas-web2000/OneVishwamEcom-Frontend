import React, { useState } from 'react';
import { useVehicles } from './automobileHooks';
import { UniversalCategoryGallery } from '../../../components/common/templates';
import { mapVehicleToEntityItem } from '../../../components/common/templates/adapters';
import VehicleQuickMatchModal from './VehicleQuickMatchModal';
import ShowroomModal from './ShowroomModal';
import QuickLoanModal from '../finance/QuickLoanModal';

const FILTER_GROUPS = [
  {
    id: 'fuelTypes',
    title: 'Fuel Type',
    options: ['Petrol', 'Diesel', 'Electric', 'CNG'],
    field: (v) => v.fuelType,
  },
  {
    id: 'transmissions',
    title: 'Transmission',
    options: ['Automatic', 'Manual'],
    field: (v) => v.transmission,
  },
  {
    id: 'bodyTypes',
    title: 'Body Type & Category',
    options: ['SUV', 'Sedan', 'Hatchback', 'Cruiser / Bike', 'Commercial'],
    field: (v) => v.bodyType || v.category,
  },
  {
    id: 'conditions',
    title: 'Condition & Ownership',
    options: ['Brand New', 'Pre-Owned'],
    field: (v) => (v.condition === 'new' || v.condition === 'brand-new' ? 'Brand New' : 'Pre-Owned'),
  },
];

const RANGE_FILTERS = [
  {
    id: 'budget',
    title: 'Budget Range',
    min: 0,
    max: 6000000,
    step: 50000,
    maxLabel: '₹ 60 L+',
    unitLabel: '₹',
  },
];

/**
 * AutomobileGallery
 * Powered by UniversalCategoryGallery - purely declarative configuration.
 */
export default function AutomobileGallery() {
  const [quickMatchOpen, setQuickMatchOpen] = useState(false);
  const [showroomTarget, setShowroomTarget] = useState(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanModalPrefill, setLoanModalPrefill] = useState(null);

  return (
    <UniversalCategoryGallery
      categoryTitle="Explore Verified Automobiles & Vehicles"
      categorySubtitle="Discover brand-new cars, verified pre-owned vehicles, bikes, and commercial fleets with full inspection reports."
      breadcrumb="Automobiles & Vehicles"
      useItems={useVehicles}
      hidePrice={true}
      searchPlaceholder="Search vehicles by model, fuel, or transmission (e.g. Swift, Brezza, Ertiga CNG, Automatic)..."
      onQuickMatch={() => setQuickMatchOpen(true)}
      quickMatchLabel="Vehicle Match"
      mapping={{
        id: (v) => v._id || v.id,
        title: (v) => (v.brand && v.model ? `${v.brand} ${v.model}` : v.title),
        image: (v) => v.images?.[0] || v.image,
        price: (v) => v.price,
        priceSuffix: (v) => v.priceSuffix || (v.condition === 'new' ? 'Ex-Showroom' : 'Pre-Owned'),
        location: (v) => v.location || v.showroom?.city || 'Bangalore',
        pincode: (v) => v.pincode || v.showroom?.pincode,
        overline: (v) => (v.brand ? `${v.brand} · ${v.bodyType || v.category}` : v.category),
        badges: (v) => [
          v.loanApproved && { label: 'Loan Approved', className: 'bg-blue-600 text-white' },
          v.condition && {
            label: v.condition === 'new' ? 'Brand New' : 'Certified Pre-Owned',
            className: v.condition === 'new' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white',
          },
          v.featured && { label: 'Featured', className: 'bg-amber-500 text-white' },
        ].filter(Boolean),
        pills: (v) => [v.fuelType, v.transmission, v.year ? `${v.year}` : null].filter(Boolean),
        highlightBanner: (v) => (v.loanApproved ? '100% Pre-Approved Loan Available' : null),
        detailUrl: (v) => `/vehicle/${v._id || v.id}`,
      }}
      filterGroups={FILTER_GROUPS}
      rangeFilters={RANGE_FILTERS}
      customModals={
        <>
          {showroomTarget && (
            <ShowroomModal vehicle={showroomTarget} onClose={() => setShowroomTarget(null)} />
          )}
          {quickMatchOpen && (
            <VehicleQuickMatchModal isOpen={quickMatchOpen} onClose={() => setQuickMatchOpen(false)} />
          )}
          {showLoanModal && (
            <QuickLoanModal
              open={showLoanModal}
              onClose={() => {
                setShowLoanModal(false);
                setLoanModalPrefill(null);
              }}
              prefill={loanModalPrefill}
            />
          )}
        </>
      }
    />
  );
}
