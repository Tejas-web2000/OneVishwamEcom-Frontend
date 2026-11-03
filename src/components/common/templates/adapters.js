/**
 * Adapters to transform Housing/Land properties and Automobiles/Vehicles
 * from their respective database / mock structures into the unified EntityItem contract.
 */

import { cleanProductName } from '../../../utils/searchUtils';
import { formatPropertyAddress, isOneVishwamProperty } from '../../../pages/services/property/propertyHelpers';
import { ONEVISHWAM_VERIFIED_IMAGE, isPlaceholderImage } from '../../../constants/fallbackImage';

function isPerSqft(priceStr = '', suffix = '') {
  const combined = `${priceStr} ${suffix}`.toLowerCase();
  return (
    /(?:\/|\bper\s*)(?:sq|sft|sqft|sq\.ft|square\s*feet|square\s*foot|feet|ft)/i.test(combined) ||
    /rs\s*per/i.test(combined) ||
    /\/\s*sq/i.test(combined) ||
    /sq\.?\s*f?t/i.test(combined)
  );
}

/**
 * Transforms a Property entity (from dummyProperties or backend Mongoose doc)
 * into a unified EntityItem.
 *
 * @param {Object} property
 * @returns {import('./types').EntityItem}
 */
export function mapPropertyToEntityItem(property) {
  if (!property) return null;

  const id = property.id || property._id || '';
  const title = cleanProductName(property.title || 'Featured Property');
  const rawPrice = property.price || property.rawPrice || '';
  const rawSuffix = property.priceSuffix || '';
  const inSqft = isPerSqft(rawPrice, rawSuffix);
  const price = inSqft ? rawPrice : 'This is negotiable';
  const priceSubtext = inSqft ? (rawSuffix || (property.negotiable ? 'Negotiable' : (property.priceRange?.isRange ? 'Onwards' : ''))) : '';
  const location = formatPropertyAddress(property) || property.location || property.city || property.address || '';
  const pincode = property.pincode || '';

  // Images resolution
  const rawImages = [];
  if (property.images && Array.isArray(property.images) && property.images.length > 0) {
    rawImages.push(...property.images);
  } else if (property.coverImage) {
    rawImages.push(property.coverImage);
  } else if (property.image) {
    rawImages.push(property.image);
  }
  const images = rawImages.filter((img) => img && !isPlaceholderImage(img));
  if (images.length === 0) {
    images.push(ONEVISHWAM_VERIFIED_IMAGE);
  }

  // Badges resolution
  const badges = [];
  const vendor = String(property.vendorName || property.vendor || '').trim().toLowerCase().replace(/\s+/g, '');
  const partner = String(property.channelPartnerName || property.channelPartner || property.partnerName || property.partner || '').trim().toLowerCase().replace(/\s+/g, '');
  if (vendor.includes('onevishwam') || partner.includes('onevishwam') || isOneVishwamProperty(property)) {
    badges.push({
      label: 'In-House Project',
      className: 'bg-indigo-600 text-white font-bold',
    });
  }
  if (property.status) {
    badges.push({
      label: property.status === 'approved' ? 'Verified' : property.status,
      className: 'bg-emerald-600 text-white',
    });
  }
  if (property.bankLoanDetails || property.loanApproved) {
    badges.push({ label: 'Loan Approved', className: 'bg-blue-600 text-white' });
  }
  if (property.featured) {
    badges.push({ label: 'Featured', className: 'bg-amber-500 text-white' });
  }

  const details = property.details || {};
  const isCorner = Boolean(property.cornerPlot);

  if (isCorner) {
    badges.push({ label: 'Corner Site', className: 'bg-purple-600 text-white font-bold' });
  }

  // Key Attributes (Dynamic Highlights)
  const keyAttributes = [];
  const pType = property.subcategory || property.propertyType || property.category;
  if (pType) {
    keyAttributes.push({ label: 'Type', value: String(pType) });
  }

  const bhk = property.bhk;
  if (bhk) {
    keyAttributes.push({ label: 'Configuration', value: String(bhk) });
  }

  const area = property.area || property.area_sqft || property.dimensions;
  if (area) {
    keyAttributes.push({ label: 'Area / Dimensions', value: String(area) });
  }

  const facing = property.facing;
  if (facing) {
    keyAttributes.push({ label: 'Door Facing', value: String(facing) });
  }

  if (isCorner) {
    keyAttributes.push({ label: 'Corner Site', value: 'Yes' });
  }

  // Specifications Breakdown mapped over groups
  const specs = [];

  // Group 1: Dimensions & Overview
  const dimItems = [];
  if (property.propertyType) dimItems.push({ key: 'Property Type', value: property.propertyType });
  if (details.dimensions || property.dimensions) dimItems.push({ key: 'Dimensions', value: String(details.dimensions || property.dimensions) });
  if (area) dimItems.push({ key: 'Total Extent / Area', value: String(area) });
  if (facing) dimItems.push({ key: 'Facing Direction', value: String(facing) });
  if (details.cornerPlot !== undefined) dimItems.push({ key: 'Corner Plot', value: details.cornerPlot ? 'Yes' : 'No' });
  if (details.floors) dimItems.push({ key: 'Total Floors', value: String(details.floors) });
  if (dimItems.length > 0) {
    specs.push({ groupName: 'Dimensions & Layout', items: dimItems });
  }

  // Group 2: Approvals & Legal Status
  const legalItems = [];
  const authority = details.approvalAuthority || property.approvalAuthority;
  if (authority) legalItems.push({ key: 'Approval Authority', value: String(authority) });
  if (property.khataType) legalItems.push({ key: 'Khata Type', value: String(property.khataType) });
  if (details.conversionStatus) legalItems.push({ key: 'Land Conversion', value: String(details.conversionStatus) });
  if (property.bankLoanDetails) legalItems.push({ key: 'Bank Loan Approval', value: String(property.bankLoanDetails) });
  if (legalItems.length > 0) {
    specs.push({ groupName: 'Approvals & Legal Documents', items: legalItems });
  }

  // Group 3: Infrastructure & Amenities
  const infraItems = [];
  if (details.roadFacingWidth || details.roadAccessWidth) {
    infraItems.push({ key: 'Road Width', value: String(details.roadFacingWidth || details.roadAccessWidth) });
  }
  if (details.waterAvailability) infraItems.push({ key: 'Water Supply', value: String(details.waterAvailability) });
  if (details.furnishingStatus) infraItems.push({ key: 'Furnishing State', value: String(details.furnishingStatus) });
  if (details.parkingAvailability) infraItems.push({ key: 'Parking', value: String(details.parkingAvailability) });
  if (infraItems.length > 0) {
    specs.push({ groupName: 'Infrastructure & Features', items: infraItems });
  }

  // Seller Information
  const seller = {
    name: property.vendorName || property.channelPartnerName || 'OneVishwam Partner',
    type: property.channelPartnerName ? 'Channel Partner' : 'Authorized Associate',
    phone: property.contact || '8546996622',
    whatsapp: property.whatsapp || property.contact || '8546996622',
    email: property.email || 'ceo@onevishwam.com',
    verified: true,
  };

  return {
    id,
    title,
    price,
    priceSubtext,
    location,
    pincode,
    images,
    badges,
    keyAttributes,
    description: property.description || 'Verified residential/commercial property listed under the OneVishwam network with complete legal and bank loan assistance.',
    specs,
    seller,
    raw: property,
  };
}

/**
 * Transforms an Automobile/Vehicle entity (from dummyAutomobiles or backend)
 * into a unified EntityItem.
 *
 * @param {Object} vehicle
 * @returns {import('./types').EntityItem}
 */
export function mapVehicleToEntityItem(vehicle) {
  if (!vehicle) return null;

  const id = vehicle.id || vehicle._id || '';
  const title = cleanProductName(
    vehicle.brand && vehicle.model
      ? `${vehicle.brand} ${vehicle.model}`
      : (vehicle.title || 'Vehicle Listing')
  );

  const price = vehicle.price || 'Price on Request';
  const priceSubtext = vehicle.condition === 'old' ? 'Pre-Owned' : 'Ex-Showroom';
  const location = vehicle.location || vehicle.showroom?.city || 'Bangalore';
  const pincode = vehicle.pincode || vehicle.showroom?.pincode || '';

  const rawImages = Array.isArray(vehicle.images) ? vehicle.images : (vehicle.image ? [vehicle.image] : []);
  const images = rawImages.filter((img) => img && !isPlaceholderImage(img));
  if (images.length === 0) {
    images.push(ONEVISHWAM_VERIFIED_IMAGE);
  }

  const badges = [];
  if (vehicle.loanApproved) {
    badges.push({ label: 'Loan Approved', className: 'bg-blue-600 text-white' });
  }
  if (vehicle.condition) {
    badges.push({
      label: vehicle.condition === 'new' ? 'Brand New' : 'Certified Pre-Owned',
      className: vehicle.condition === 'new' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white',
    });
  }
  if (vehicle.featured) {
    badges.push({ label: 'Featured', className: 'bg-amber-500 text-white' });
  }

  // Key Attributes
  const keyAttributes = [];
  if (vehicle.fuelType) keyAttributes.push({ label: 'Fuel', value: vehicle.fuelType });
  if (vehicle.year) keyAttributes.push({ label: 'Year', value: String(vehicle.year) });
  if (vehicle.kmDriven !== undefined) keyAttributes.push({ label: 'KM Driven', value: `${vehicle.kmDriven} km` });
  if (vehicle.category) keyAttributes.push({ label: 'Type', value: vehicle.category });

  // Specifications Breakdown
  const specs = [
    {
      groupName: 'Vehicle Specifications',
      items: [
        { key: 'Brand', value: vehicle.brand || 'N/A' },
        { key: 'Model', value: vehicle.model || 'N/A' },
        { key: 'Model Year', value: String(vehicle.year || 'N/A') },
        { key: 'Fuel Type', value: vehicle.fuelType || 'Petrol' },
        { key: 'Wheeler Type', value: vehicle.wheelerType || vehicle.category || '4-wheeler' },
        { key: 'Available Variants', value: String(vehicle.variants || 'Standard') },
      ],
    },
    {
      groupName: 'Condition & Usage',
      items: [
        { key: 'Condition', value: vehicle.condition === 'new' ? 'Brand New' : 'Pre-Owned' },
        { key: 'KM Driven', value: `${vehicle.kmDriven || 0} km` },
        { key: 'Loan Availability', value: vehicle.loanApproved ? 'Pre-Approved Loans Available' : 'Available on Application' },
      ],
    },
  ];

  if (vehicle.showroom) {
    specs.push({
      groupName: 'Authorized Showroom & Dealer',
      items: [
        { key: 'Dealer Name', value: vehicle.showroom.name || 'Authorized Dealer' },
        { key: 'Address', value: vehicle.showroom.address || location },
        { key: 'City', value: location },
      ],
    });
  }

  const seller = {
    name: vehicle.showroom?.name || `${vehicle.brand || 'Authorized'} Dealer`,
    type: 'Authorized Automobile Dealer',
    phone: vehicle.showroom?.phone || '8546996622',
    whatsapp: '8546996622',
    email: vehicle.showroom?.email || 'ceo@onevishwam.com',
    verified: true,
  };

  return {
    ...vehicle,
    id,
    title,
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    year: vehicle.year || '',
    fuelType: vehicle.fuelType || '',
    transmission: vehicle.transmission || '',
    wheelerType: vehicle.wheelerType || vehicle.category || '4-wheeler',
    category: vehicle.category || 'Automobiles',
    condition: vehicle.condition || 'new',
    kmDriven: vehicle.kmDriven !== undefined ? vehicle.kmDriven : 0,
    showroom: vehicle.showroom || null,
    variants: vehicle.variants || [],
    overviewHighlights: vehicle.overviewHighlights || keyAttributes,
    price,
    priceSubtext,
    location,
    pincode,
    images,
    badges,
    keyAttributes,
    description: vehicle.description || `Brand-new or verified pre-owned ${title} available with comprehensive loan approvals, doorstep test drive assistance, and full warranty support under the OneVishwam Automotive Network.`,
    specs,
    seller,
    raw: vehicle,
  };
}

/**
 * Transforms a Loan entity into a unified EntityItem.
 */
export function mapLoanToEntityItem(loan) {
  if (!loan) return null;

  const id = loan.id || loan._id || '';
  const title = cleanProductName(loan.title || 'Loan Product');
  const price = loan.interestRate ? `From ${loan.interestRate}` : 'Competitive Rates';
  const priceSubtext = loan.maxAmount ? `Up to ${loan.maxAmount}` : '';
  const location = 'Bengaluru & Pan-India';

  const rawImages = loan.image ? [loan.image] : [];
  const images = rawImages.filter((img) => img && !isPlaceholderImage(img));
  if (images.length === 0) {
    images.push(ONEVISHWAM_VERIFIED_IMAGE);
  }

  const badges = [
    { label: 'Pre-Approved', className: 'bg-emerald-600 text-white' },
    { label: loan.type ? `${String(loan.type).toUpperCase()} LOAN` : 'LOAN', className: 'bg-brand-blue text-white' },
  ];

  const keyAttributes = [
    { label: 'Interest Rate', value: loan.interestRate || 'Competitive' },
    { label: 'Max Loan Amount', value: loan.maxAmount || 'Up to ₹2 Cr' },
    { label: 'Tenure', value: loan.tenure || 'Up to 30 Years' },
    { label: 'Processing Fee', value: loan.processingFee || 'Minimal' },
  ];

  const specs = [
    {
      groupName: 'Loan Parameters & Terms',
      items: [
        { key: 'Product Type', value: loan.title || 'Loan' },
        { key: 'Interest Rate', value: loan.interestRate || 'Starting from 8.5% p.a.' },
        { key: 'Max Loan Amount', value: loan.maxAmount || '₹50 Lakhs - ₹2 Crores' },
        { key: 'Max Tenure', value: loan.tenure || 'Up to 30 Years' },
        { key: 'Processing Fee', value: loan.processingFee || '0.5% - 1%' },
      ],
    },
    {
      groupName: 'Application & Eligibility',
      items: [
        { key: 'Approval Time', value: 'Instant pre-approval online' },
        { key: 'Disbursal Timeline', value: 'Within 3 - 7 banking days' },
        { key: 'Required Documents', value: 'PAN, Aadhaar, Income Proof / ITR' },
      ],
    },
  ];

  const seller = {
    name: 'OneVishwam Banking & Finance Desk',
    type: 'Authorized Lending Partner',
    phone: '8546996622',
    whatsapp: '8546996622',
    email: 'finance@onevishwam.com',
    verified: true,
  };

  return {
    id,
    title,
    price,
    priceSubtext,
    location,
    pincode: '560001',
    images,
    badges,
    keyAttributes,
    description: loan.subtitle
      ? `${loan.subtitle}. Complete loan assistance, door-step documentation, and fast disbursal across verified banks and NBFC partners.`
      : 'Complete loan assistance, door-step documentation, and fast disbursal across verified banks and NBFC partners.',
    specs,
    seller,
    raw: loan,
  };
}

/**
 * Transforms a Finance Service entity into a unified EntityItem.
 */
export function mapFinanceServiceToEntityItem(service) {
  if (!service) return null;

  const id = service.id || service._id || '';
  const title = cleanProductName(service.serviceName || service.title || 'Financial Service');
  const price = service.interestRate && service.interestRate !== 'N/A'
    ? `${service.interestRate}`
    : (service.minAmount ? `From ₹${service.minAmount}` : 'Custom Quote');
  const priceSubtext = service.maxAmount ? `Up to ₹${service.maxAmount}` : '';
  const location = service.location || service.city || 'Bengaluru';

  const rawImages = service.banner
    ? [service.banner]
    : (service.logo ? [service.logo] : []);
  const images = rawImages.filter((img) => img && !isPlaceholderImage(img));
  if (images.length === 0) {
    images.push(ONEVISHWAM_VERIFIED_IMAGE);
  }

  const badges = [
    { label: service.category || 'Finance', className: 'bg-brand-blue text-white' },
    { label: service.providerType || 'Verified Partner', className: 'bg-emerald-600 text-white' },
  ];

  const keyAttributes = [
    { label: 'Category', value: service.category || 'Finance' },
    { label: 'Tenure', value: service.tenure || 'Flexible' },
    { label: 'Processing', value: service.processingTime || 'Fast Track' },
  ];

  const specs = [
    {
      groupName: 'Service Information',
      items: [
        { key: 'Provider', value: service.companyName || 'OneVishwam Partner' },
        { key: 'Category', value: service.category || 'Finance' },
        { key: 'Tenure', value: service.tenure || 'Flexible' },
        { key: 'Processing Time', value: service.processingTime || 'Fast' },
      ],
    },
  ];

  const seller = {
    name: service.companyName || 'OneVishwam Banking Desk',
    type: service.providerType || 'Financial Service Partner',
    phone: service.contactPhone || '8546996622',
    whatsapp: '8546996622',
    email: service.contactEmail || 'finance@onevishwam.com',
    verified: true,
  };

  return {
    id,
    title,
    price,
    priceSubtext,
    location,
    pincode: service.pincode || '',
    images,
    badges,
    keyAttributes,
    description: service.description || 'Verified banking and financial lending services listed under the OneVishwam network.',
    specs,
    seller,
    raw: service,
  };
}
