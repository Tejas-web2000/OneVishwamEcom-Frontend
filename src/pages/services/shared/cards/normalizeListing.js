/**
 * Universal Listing Data Adapter
 * Normalizes heterogeneous sector models from the backend into a standard
 * frontend contract for MasterListingCard and gallery grids.
 */

import { ONEVISHWAM_VERIFIED_IMAGE, isPlaceholderImage } from '../../../../constants/fallbackImage';

export function normalizeListing(rawItem, sector = '') {
  if (!rawItem) return null;

  const id = rawItem._id || rawItem.id;
  const s = String(sector).toLowerCase();

  // Resolve link based on sector
  let link = '#';
  if (id) {
    if (s.includes('property') || s.includes('real-estate')) {
      link = `/property/${id}`;
    } else if (s.includes('vehicle') || s.includes('automobile')) {
      link = `/vehicle/${id}`;
    } else if (s.includes('grocery') || s.includes('consumer') || s.includes('marketplace')) {
      link = `/grocery/${id}`;
    } else if (s.includes('garment') || s.includes('fashion') || s.includes('lifestyle')) {
      link = `/garment/${id}`;
    } else if (s.includes('jewellery') || s.includes('gold')) {
      link = `/jewellery/${id}`;
    } else if (s.includes('loan')) {
      link = `/finance/${id}`;
    } else if (s.includes('finance')) {
      link = `/finance-service/${id}`;
    } else {
      link = `/${s}/${id}`;
    }
  }

  // Resolve availability status
  const availabilityStatus = rawItem.availabilityStatus || 'available';
  const isSoldOut = availabilityStatus === 'sold_out';
  const isInactive = availabilityStatus === 'inactive';

  // Resolve image
  let image = '';
  if (Array.isArray(rawItem.images) && rawItem.images.length > 0) {
    image = rawItem.images.find(s => s && !isPlaceholderImage(s)) || '';
  } else if (rawItem.image && !isPlaceholderImage(rawItem.image)) {
    image = rawItem.image;
  } else if (rawItem.coverImage && !isPlaceholderImage(rawItem.coverImage)) {
    image = rawItem.coverImage;
  } else if (rawItem.banner && !isPlaceholderImage(rawItem.banner)) {
    image = rawItem.banner;
  } else if (rawItem.logo && !isPlaceholderImage(rawItem.logo)) {
    image = rawItem.logo;
  }
  if (!image || isPlaceholderImage(image)) {
    image = ONEVISHWAM_VERIFIED_IMAGE;
  }

  // Resolve title
  let title = rawItem.title || rawItem.name || '';
  if (!title && rawItem.brand && rawItem.model) {
    title = `${rawItem.brand} ${rawItem.model}`;
  } else if (!title && rawItem.companyName) {
    title = rawItem.companyName;
  }

  // Resolve overline
  let overline = '';
  if (s.includes('vehicle') || s.includes('automobile')) {
    overline = rawItem.brand || rawItem.category || '';
  } else if (s.includes('property') || s.includes('real-estate')) {
    const rawType = rawItem.subcategory || rawItem.propertyType || rawItem.category || '';
    if (/apartment/i.test(rawType)) {
      overline = 'Flat';
    } else if (/plot|site/i.test(rawType)) {
      overline = 'Site & Plot';
    } else {
      overline = rawType;
    }
  } else if (s.includes('garment') || s.includes('fashion')) {
    overline = rawItem.brand || rawItem.store?.name || '';
  } else if (s.includes('grocery') || s.includes('marketplace')) {
    overline = rawItem.vendorName || rawItem.brand || '';
  } else if (s.includes('jewellery') || s.includes('gold')) {
    overline = rawItem.store?.name || rawItem.category || '';
  } else if (s.includes('finance')) {
    overline = rawItem.category || rawItem.bankName || '';
  }

  // Resolve price and suffix
  const price = rawItem.finalPrice ?? rawItem.pricePerUnit ?? rawItem.price ?? rawItem.maxAmount ?? 0;
  let priceSuffix = rawItem.priceSuffix || '';
  if (!priceSuffix && rawItem.unit) {
    priceSuffix = `/${rawItem.unit}`;
  }

  // Resolve location & pincode
  let location = '';
  let pincode = '';
  if (typeof rawItem.location === 'string') {
    location = rawItem.location;
  } else if (rawItem.location && typeof rawItem.location === 'object') {
    location = rawItem.location.area || rawItem.location.city || '';
    pincode = rawItem.location.pincode || '';
  }
  if (!location) {
    location = rawItem.city || rawItem.store?.city || rawItem.zone || '';
  }
  if (!pincode) {
    pincode = rawItem.pincode || rawItem.store?.pincode || '';
  }

  // Resolve tag chips
  const tags = [];
  if (rawItem.bhk && rawItem.bhk !== 'N/A') tags.push(rawItem.bhk);
  if (rawItem.area && typeof rawItem.area === 'string') {
    const rawArea = rawItem.area.trim();
    if (rawArea.includes('·') || rawArea.includes('•')) {
      const parts = rawArea.split(/\s*[·•]\s*/).map((p) => p.trim()).filter(Boolean);
      tags.push(...parts);
    } else {
      tags.push(rawArea);
    }
  }
  if (rawItem.fuelType) tags.push(rawItem.fuelType);
  if (rawItem.year) tags.push(String(rawItem.year));
  if (rawItem.fabric) tags.push(rawItem.fabric);
  if (rawItem.gender && !tags.includes(rawItem.gender)) tags.push(rawItem.gender);
  if (rawItem.metalType) tags.push(`${rawItem.metalType}${rawItem.purity ? ` · ${rawItem.purity}` : ''}`);
  if (Array.isArray(rawItem.deliveryType) && rawItem.deliveryType[0]) tags.push(rawItem.deliveryType[0]);
  if (rawItem.interestRate) tags.push(`${rawItem.interestRate}% p.a.`);
  if (rawItem.maxTenureYears) tags.push(`Up to ${rawItem.maxTenureYears} yrs`);

  // Resolve badges
  const badges = [];
  if (s.includes('property') || s.includes('real-estate')) {
    const sub = String(
      rawItem.subcategory ||
      rawItem.propertyType ||
      rawItem.category ||
      rawItem.buildingType ||
      rawItem.subtitle ||
      rawItem.title ||
      ''
    ).toLowerCase();

    if (sub.includes('site') || sub.includes('plot') || sub.includes('land')) {
      badges.push({ label: 'Ready for Registration', className: 'bg-emerald-100 text-emerald-700 font-bold' });
    } else {
      badges.push({ label: 'Ready for Occupy', className: 'bg-emerald-100 text-emerald-700 font-bold' });
    }
  }
  if (rawItem.loanApproved) {
    badges.push({ label: 'Pre-Approved', className: 'bg-emerald-100 text-emerald-700' });
  }
  if (rawItem.condition === 'new') {
    badges.push({ label: 'New', className: 'bg-blue-100 text-blue-700' });
  }
  if (rawItem.organic) {
    badges.push({ label: 'Organic', className: 'bg-emerald-100 text-emerald-700' });
  }
  if (rawItem.freshToday) {
    badges.push({ label: 'Fresh Today', className: 'bg-blue-100 text-blue-700' });
  }
  if (rawItem.certified) {
    badges.push({ label: 'Certified', className: 'bg-emerald-100 text-emerald-700' });
  }
  if (rawItem.tryAtHome) {
    badges.push({ label: 'Try At Home', className: 'bg-purple-100 text-purple-700' });
  }
  if (rawItem.trending) {
    badges.push({ label: 'Trending', className: 'bg-rose-100 text-rose-700' });
  }
  if (rawItem.discount > 0) {
    badges.push({ label: `${rawItem.discount}% OFF`, className: 'bg-emerald-600 text-white' });
  }
  if (rawItem.featured) {
    badges.push({ label: 'Featured', className: 'bg-amber-400 text-slate-950 font-bold' });
  }

  // Resolve floor plans
  const floorPlanImages = Array.isArray(rawItem.floorPlanImages) ? rawItem.floorPlanImages.filter(Boolean)
    : Array.isArray(rawItem.floorPlans) ? rawItem.floorPlans.filter(Boolean)
    : Array.isArray(rawItem.floorPlanMap) ? rawItem.floorPlanMap.filter(Boolean)
    : typeof rawItem.floorPlanImages === 'string' && rawItem.floorPlanImages ? [rawItem.floorPlanImages]
    : typeof rawItem.floorPlans === 'string' && rawItem.floorPlans ? [rawItem.floorPlans]
    : [];

  const pdfUrl = rawItem.pdfUrl || rawItem.floorPlanPdf || rawItem.pdf || null;

  return {
    id,
    link,
    image,
    title,
    overline,
    price,
    priceSuffix,
    priceType: rawItem.priceType || 'fixed',
    location,
    pincode,
    tags: tags.filter(Boolean),
    badges,
    floorPlanImages,
    pdfUrl,
    availabilityStatus,
    isSoldOut,
    isInactive,
    raw: rawItem,
  };
}
