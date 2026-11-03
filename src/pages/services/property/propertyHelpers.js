import { getNumericPrice } from '../../../utils/formatters';
import { ONEVISHWAM_VERIFIED_IMAGE, isPlaceholderImage } from '../../../constants/fallbackImage';

export { getNumericPrice };

/**
 * Parses area strings into numeric square feet with multi-unit support.
 * Handles:
 * - "8000 Sq.ft" / "8000 sqft" -> 8000
 * - "1200 - 2400 Sq.ft" -> 1200 (min area)
 * - "2 Acres" -> 87,120 sq.ft (43,560 sq.ft / acre)
 * - "5 Guntas" -> 5,445 sq.ft (1,089 sq.ft / gunta)
 * - "200 Sq.Yds" -> 1,800 sq.ft (9 sq.ft / sq.yd)
 * - "10 Cents" -> 4,356 sq.ft (435.6 sq.ft / cent)
 */
export function getNumericArea(area) {
  if (!area) return 0;
  const str = String(area).trim();
  const lower = str.toLowerCase();

  const m = str.match(/([\d,.]+)/);
  if (!m) return 0;
  const num = parseFloat(m[1].replace(/,/g, ''));
  if (isNaN(num) || num <= 0) return 0;

  if (lower.includes('acre')) return Math.round(num * 43560);
  if (lower.includes('gunta')) return Math.round(num * 1089);
  if (lower.includes('cent')) return Math.round(num * 435.6);
  if (lower.includes('ground')) return Math.round(num * 2400);
  if (lower.includes('sq.yd') || lower.includes('sq yd') || lower.includes('sqyd') || lower.includes('yard')) {
    return Math.round(num * 9);
  }

  return num;
}

/**
 * Extracts { min, max } area range in sq.ft from an area string or property object.
 */
export function parseAreaRange(areaOrProperty) {
  if (!areaOrProperty) return { min: 0, max: 0 };

  let str = '';
  if (typeof areaOrProperty === 'object') {
    str = String(
      areaOrProperty.area ||
      areaOrProperty.dimensions ||
      ''
    ).trim();
  } else {
    str = String(areaOrProperty).trim();
  }

  if (!str) return { min: 0, max: 0 };

  // Guard against non-area descriptors (e.g., "40 Units", "Sites 01–55", "262 Plots", "Residential")
  const hasAreaKeyword = /(?:sq\.?\s*ft|sqft|sq\s*yd|sqyd|acre|acres|gunta|guntas|cent|ground|\bft\b|x|\*|×)/i.test(str);
  if (!hasAreaKeyword) {
    return { min: 0, max: 0 };
  }

  // 1. Prioritize explicit Sq.Ft range (e.g. "1588-1668 Sq.ft", "1,200 - 2,400 Sq.ft")
  const sqftRangeMatch = str.match(/([\d,.]+)\s*(?:-|–|to)\s*([\d,.]+)\s*(?:sq\.?\s*ft|sqft)/i);
  if (sqftRangeMatch) {
    const minVal = parseFloat(sqftRangeMatch[1].replace(/,/g, ''));
    const maxVal = parseFloat(sqftRangeMatch[2].replace(/,/g, ''));
    if (!isNaN(minVal) && !isNaN(maxVal) && minVal > 0 && maxVal > 0) {
      return {
        min: Math.round(Math.min(minVal, maxVal)),
        max: Math.round(Math.max(minVal, maxVal)),
      };
    }
  }

  // 2. Explicit Sq.Ft single value (e.g. "8,024 Sq.ft", "1,450 Sq.ft · 9 Units")
  const sqftSingleMatch = str.match(/([\d,.]+)\s*(?:sq\.?\s*ft|sqft)/i);
  if (sqftSingleMatch) {
    const val = parseFloat(sqftSingleMatch[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 0) {
      return { min: Math.round(val), max: Math.round(val) };
    }
  }

  // 3. Dimension patterns like "30x40", "30*40", "30×40", "40 X 60"
  const dimMatches = [...str.matchAll(/(\d+)\s*(?:x|\*|×|X)\s*(\d+)/g)];
  if (dimMatches.length > 0) {
    const dimAreas = dimMatches.map((m) => parseInt(m[1], 10) * parseInt(m[2], 10));
    const minDim = Math.min(...dimAreas);
    const maxDim = Math.max(...dimAreas);
    return { min: minDim, max: maxDim };
  }

  // 4. Other units: Acres, Guntas, Cents, Grounds, Sq.Yards
  const acreMatch = str.match(/([\d,.]+)\s*(?:acre|acres)/i);
  if (acreMatch) {
    const val = parseFloat(acreMatch[1].replace(/,/g, '')) * 43560;
    if (!isNaN(val) && val > 0) {
      return { min: Math.round(val), max: Math.round(val) };
    }
  }

  const guntaMatch = str.match(/([\d,.]+)\s*(?:gunta|guntas)/i);
  if (guntaMatch) {
    const val = parseFloat(guntaMatch[1].replace(/,/g, '')) * 1089;
    if (!isNaN(val) && val > 0) {
      return { min: Math.round(val), max: Math.round(val) };
    }
  }

  const single = getNumericArea(str);
  return { min: single, max: single };
}

/**
 * Checks whether a property price is quoted on a per square foot basis.
 * E.g., "₹ 2,500/Sq.ft", "₹ 2500 / sqft", or priceSuffix containing "/ Sq.ft".
 *
 * @param {Object|string} property
 * @returns {boolean}
 */
export function isPerSqftPrice(property) {
  if (!property) return false;
  const rawPriceStr = String(
    (typeof property === 'object' ? (property.rawPrice || property.price || property.cost || property.amount) : property) || ''
  ).trim();
  const suffix = typeof property === 'object' ? String(property.rawPriceSuffix || property.priceSuffix || '') : '';
  const combined = `${rawPriceStr} ${suffix}`.toLowerCase();

  return (
    /(?:\/|\bper\s*)(?:sq|sft|sqft|sq\.ft|square\s*feet|square\s*foot|feet|ft)/i.test(combined) ||
    /rs\s*per/i.test(combined) ||
    /\/\s*sq/i.test(combined) ||
    /sq\.?\s*f?t/i.test(combined)
  );
}

/**
 * Returns the customer-facing display price and price suffix for a property.
 * If price is in sq/ft, it leaves it as is. Otherwise, returns "This is negotiable".
 *
 * @param {Object|string} property
 * @returns {{ price: string, priceSuffix: string }}
 */
export function formatPropertyDisplayPrice(property) {
  if (!property) return { price: 'This is negotiable', priceSuffix: '' };

  if (isPerSqftPrice(property)) {
    const rawPrice = typeof property === 'object'
      ? (property.rawPrice || property.price || property.cost || property.amount || '')
      : String(property);
    const suffix = typeof property === 'object'
      ? (property.rawPriceSuffix || property.priceSuffix || '')
      : '';
    return { price: rawPrice, priceSuffix: suffix };
  }

  return { price: 'This is negotiable', priceSuffix: '' };
}

/**
 * Parses price range and computes total property valuation.
 * If price is per sqft (e.g. "₹ 2500/Sq.ft" with 8000 sqft area = ₹ 2.00 Cr / 20,000,000),
 * accurately multiplies rate * area to calculate true total worth.
 */
export function parsePriceRange(property) {
  if (!property) return { min: 0, max: 0 };

  // If property already has explicit / precomputed total amount:
  if (typeof property === 'object') {
    if (property.rawPrice && !isNaN(Number(property.rawPrice)) && Number(property.rawPrice) > 0) {
      const val = Number(property.rawPrice);
      return { min: val, max: val };
    }
    if (property.numericPrice && !isNaN(Number(property.numericPrice)) && Number(property.numericPrice) > 10000) {
      const val = Number(property.numericPrice);
      return { min: val, max: val };
    }
    if (property.calculatedTotalAmount && !isNaN(Number(property.calculatedTotalAmount))) {
      const val = Number(property.calculatedTotalAmount);
      return { min: val, max: val };
    }
    if (property.totalAmount && !isNaN(getNumericPrice(String(property.totalAmount)))) {
      const tot = getNumericPrice(String(property.totalAmount));
      if (tot > 10000) return { min: tot, max: tot };
    }
    if (property.totalPrice && !isNaN(getNumericPrice(String(property.totalPrice)))) {
      const tot = getNumericPrice(String(property.totalPrice));
      if (tot > 10000) return { min: tot, max: tot };
    }
  }

  const rawPriceStr = String(
    (typeof property === 'object' ? (property.price || property.cost || property.amount) : property) || ''
  ).trim();

  if (!rawPriceStr || rawPriceStr.toLowerCase() === 'on request') {
    return { min: 0, max: 0 };
  }

  const areaRange = parseAreaRange(property);
  const isPerSqft = /(?:\/|\bper\s*)(?:sq|sft|sqft|sq\.ft|square\s*feet|square\s*foot|feet|ft)/i.test(rawPriceStr) ||
                    /rs\s*per/i.test(rawPriceStr) ||
                    /\/\s*sq/i.test(rawPriceStr);

  // Check for price range e.g. "₹ 1.80 Cr – 2.50 Cr" or "₹ 78 Lakhs – 1.22 Cr"
  const priceRangeMatch = rawPriceStr.match(/₹?\s*([\d,.]+)\s*(cr|crore|l|lakh|lakhs|k)?\s*(?:-|–|to)\s*₹?\s*([\d,.]+)\s*(cr|crore|l|lakh|lakhs|k)?/i);

  if (priceRangeMatch) {
    const num1 = parseFloat(priceRangeMatch[1].replace(/,/g, ''));
    const unit1 = (priceRangeMatch[2] || priceRangeMatch[4] || '').toLowerCase();
    const num2 = parseFloat(priceRangeMatch[3].replace(/,/g, ''));
    const unit2 = (priceRangeMatch[4] || priceRangeMatch[2] || '').toLowerCase();

    const mult1 = unit1.startsWith('cr') ? 10000000 : (unit1.startsWith('l') ? 100000 : (unit1.startsWith('k') ? 1000 : 1));
    const mult2 = unit2.startsWith('cr') ? 10000000 : (unit2.startsWith('l') ? 100000 : (unit2.startsWith('k') ? 1000 : 1));

    let p1 = num1 * mult1;
    let p2 = num2 * mult2;

    if (isPerSqft || (p1 < 100000 && areaRange.min > 0)) {
      p1 = p1 * (areaRange.min || 1);
      p2 = p2 * (areaRange.max || areaRange.min || 1);
    }

    return {
      min: Math.round(Math.min(p1, p2)),
      max: Math.round(Math.max(p1, p2)),
    };
  }

  // Single price point
  const baseNumPrice = getNumericPrice(rawPriceStr);

  // If per sqft OR if price is a unit rate (< 100,000 INR) and area is available
  if (isPerSqft || (baseNumPrice > 0 && baseNumPrice < 100000 && areaRange.min > 0)) {
    const rateMatch = rawPriceStr.match(/([\d,.]+)/);
    const rate = rateMatch ? parseFloat(rateMatch[1].replace(/,/g, '')) : baseNumPrice;
    if (rate > 0 && areaRange.min > 0) {
      return {
        min: Math.round(rate * areaRange.min),
        max: Math.round(rate * (areaRange.max || areaRange.min)),
      };
    }
  }

  return { min: baseNumPrice, max: baseNumPrice };
}

/**
 * Returns single representative total valuation in INR for sorting & filters.
 */
export function getTotalPropertyPrice(property) {
  if (!property) return 0;
  if (typeof property === 'object' && property.calculatedTotalAmount) {
    return Number(property.calculatedTotalAmount);
  }
  const { min } = parsePriceRange(property);
  return min;
}

/**
 * True if property's total valuation range overlaps the user's budget filter.
 */
export function matchesBudgetRange(property, budgetMin, budgetMax) {
  if (!budgetMin && !budgetMax) return true;
  const { min: pMin, max: pMax } = parsePriceRange(property);
  if (pMin === 0 && pMax === 0) return true; // Keep "On Request" or unpriced properties accessible

  const bMin = budgetMin ? +budgetMin : 0;
  const bMax = budgetMax ? +budgetMax : Infinity;

  // Overlap condition: property max >= budget min && property min <= budget max
  return (pMax || pMin) >= bMin && pMin <= bMax;
}

/**
 * True if property's size in sq.ft overlaps the user's size filter.
 */
export function matchesSizeRange(property, sizeMin, sizeMax) {
  if (!sizeMin && !sizeMax) return true;
  const { min: aMin, max: aMax } = parseAreaRange(property);
  if (aMin === 0 && aMax === 0) return true;

  const sMin = sizeMin ? +sizeMin : 0;
  const sMax = sizeMax ? +sizeMax : Infinity;

  return (aMax || aMin) >= sMin && (aMin || aMax) <= sMax;
}

/**
 * Calculates the minimum and maximum property size (in sq.ft)
 * across a list of properties.
 *
 * @param {Array} properties
 * @returns {{ min: number, max: number }}
 */
export function getPropertiesSizeBounds(properties = []) {
  if (!Array.isArray(properties) || properties.length === 0) {
    return { min: 600, max: 15000 };
  }

  let min = Infinity;
  let max = -Infinity;

  properties.forEach((p) => {
    if (!p) return;
    const { min: pMin, max: pMax } = parseAreaRange(p);
    const low = pMin || pMax;
    const high = pMax || pMin;

    // Minimum size must be >= 100 sq.ft to avoid stray site/unit numbers
    if (low >= 100 && low < min) {
      min = low;
    }
    // Track residential/commercial unit upper bounds, capping wholesale development land parcels
    if (high >= 100 && high <= 20000 && high > max) {
      max = high;
    }
  });

  if (min === Infinity) min = 600;
  if (max === -Infinity || max < min) max = 15000;

  const cleanMin = Math.max(100, Math.floor(min / 50) * 50);
  const cleanMax = Math.max(cleanMin + 500, Math.ceil(max / 500) * 500);

  return { min: cleanMin, max: cleanMax };
}

/**
 * Dynamically calculates size preset ranges derived from the available properties list from DB.
 * The lowest preset starts with the least size as min, and presets cover standard real estate brackets up to the upper bound.
 *
 * @param {Array} properties - Available property listings from DB
 * @param {{ min: number, max: number }} [sizeBounds] - Min and max size bounds
 * @returns {Array<{ label: string, min: number, max: number }>}
 */
export function getDynamicSizePresets(properties = [], sizeBounds) {
  const bounds = sizeBounds || getPropertiesSizeBounds(properties);
  const minSize = Math.max(100, bounds?.min || 600);
  const maxSize = Math.max(minSize + 500, bounds?.max || 15000);

  // Standard clean real-estate brackets based on actual Bangalore listings
  const presets = [
    { label: `${minSize.toLocaleString('en-IN')} – 1,200 sq.ft`, min: minSize, max: 1200 },
    { label: '1,200 – 2,400 sq.ft', min: 1200, max: 2400 },
    { label: '2,400 – 5,000 sq.ft', min: 2400, max: 5000 },
    { label: `5,000 – ${maxSize.toLocaleString('en-IN')} sq.ft`, min: 5000, max: maxSize },
  ].filter((p) => p.min < p.max && p.min <= maxSize);

  return presets;
}

export function getPropertyType(property) {
  if (!property) return 'Flats';

  const type = String(
    property.propertyType ||
    property.subcategory ||
    property.category ||
    ''
  ).toLowerCase().trim();

  const sub = String(property.subtitle || '').toLowerCase();
  const title = String(property.title || '').toLowerCase();
  const bhk = String(property.bhk || '').toLowerCase();
  const fullText = `${type} ${sub} ${title} ${bhk}`;

  if (
    type.includes('commercial') ||
    type.includes('industrial') ||
    type.includes('showroom') ||
    type.includes('office') ||
    type.includes('shop') ||
    fullText.includes('commercial') ||
    fullText.includes('industrial') ||
    fullText.includes('showroom') ||
    fullText.includes('office space') ||
    fullText.includes('shop')
  ) {
    return 'Commercial';
  }

  if (
    type.includes('plot') ||
    type.includes('site') ||
    type.includes('land') ||
    fullText.includes('plot') ||
    fullText.includes('site') ||
    fullText.includes('land') ||
    fullText.includes('layout') ||
    fullText.includes('enclave')
  ) {
    return 'Plots';
  }

  if (
    type.includes('villa') ||
    type.includes('farmhouse') ||
    fullText.includes('villa') ||
    fullText.includes('farmhouse')
  ) {
    return 'Villas';
  }

  if (
    type.includes('house') ||
    fullText.includes('house') ||
    fullText.includes('independent house')
  ) {
    return 'Houses';
  }

  return 'Flats';
}

export function getPropertyTypeLabel(property) {
  if (!property) return 'Plot';
  const sub = String(property.propertyType || property.subcategory || property.category || '').toLowerCase();
  if (sub.includes('plot') || sub.includes('site') || sub.includes('layout') || sub.includes('plat')) return 'Plot';
  if (sub.includes('land') && !sub.includes('agri')) return 'Land';
  if (sub.includes('flat') || sub.includes('apartment') || sub.includes('villa')) return 'Flat';
  if (sub.includes('independent') || sub.includes('house')) return 'Independent House';
  return property.propertyType || 'Plot';
}

export function isPlotOrLand(property) {
  if (!property) return false;
  const sub = String(
    property.propertyType ||
    property.subcategory ||
    property.category ||
    property.buildingType ||
    property.subtitle ||
    property.title ||
    ''
  ).toLowerCase();
  const bhk = String(property.bhk || '').toLowerCase();
  return (
    sub.includes('plot') ||
    sub.includes('site') ||
    sub.includes('land') ||
    sub.includes('farm plot') ||
    bhk.includes('plot') ||
    bhk.includes('site') ||
    bhk.includes('guntas')
  );
}

export function getPropertyStatusPill(property) {
  if (!property) return null;
  const canonical = getCanonicalPossession(property);

  if (canonical === 'ready_for_registration') {
    return { label: 'Ready for Registration', cls: 'bg-emerald-100 text-emerald-700' };
  }
  if (canonical === 'ready_for_occupy') {
    return { label: 'Ready to Occupy', cls: 'bg-emerald-100 text-emerald-700' };
  }
  if (canonical === 'under_construction') {
    return { label: 'Under Construction', cls: 'bg-amber-100 text-amber-700' };
  }

  const raw = String(
    property.possession ||
    property.possessionStatus ||
    property.details?.possessionStatus ||
    property.details?.possession ||
    ''
  ).trim();
  return {
    label: raw || (isPlotOrLand(property) ? 'Ready for Registration' : 'Ready to Occupy'),
    cls: 'bg-emerald-100 text-emerald-700',
  };
}

export function getBedrooms(bhk, property) {
  if (property && isPlotOrLand(property)) return '';
  const bhkStr = String(bhk || '').trim();
  if (
    !bhkStr ||
    bhkStr === 'N/A' ||
    bhkStr.toLowerCase().includes('plot') ||
    bhkStr.toLowerCase().includes('site') ||
    bhkStr.toLowerCase().includes('land')
  ) {
    return '';
  }
  const match = bhkStr.match(/(\d+(\.\d+)?)\s*BHK/i);
  if (match) return `${match[1]} BHK`;
  const num = parseFloat(bhkStr);
  return !isNaN(num) ? `${num} BHK` : bhkStr;
}

export function getBuildingType(property) {
  if (!property) return 'Residential';

  const type = String(
    property.propertyType ||
    property.subcategory ||
    property.buildingType ||
    property.category ||
    ''
  ).toLowerCase().trim();

  const sub = String(property.subtitle || '').toLowerCase();
  const title = String(property.title || property.name || '').toLowerCase();
  const bhk = String(property.bhk || '').toLowerCase();
  const area = String(property.area || '').toLowerCase();
  const fullText = `${type} ${sub} ${title} ${bhk} ${area}`;

  if (
    type.includes('commercial') ||
    type.includes('industrial') ||
    type.includes('showroom') ||
    type.includes('office') ||
    type.includes('shop') ||
    fullText.includes('commercial') ||
    fullText.includes('industrial') ||
    fullText.includes('showroom') ||
    fullText.includes('office space') ||
    fullText.includes('shop')
  ) {
    return 'Commercial';
  }

  return 'Residential';
}

export function isCornerProperty(property) {
  if (!property) return false;
  if (property.cornerPlot) {
    return true;
  }

  if (Array.isArray(property.amenities)) {
    const hasCornerAmenity = property.amenities.some((a) => {
      const lower = String(a).toLowerCase();
      return lower.includes('corner plot') || lower.includes('corner site') || lower === 'corner';
    });
    if (hasCornerAmenity) return true;
  }

  const fullText = `${property.title || ''} ${property.subtitle || ''} ${property.description || ''} ${property.propertyType || property.subcategory || ''}`.toLowerCase();
  return (
    fullText.includes('corner plot') ||
    fullText.includes('corner site') ||
    fullText.includes('corner lot') ||
    fullText.includes('corner property')
  );
}

export function getDetailTags(property) {
  if (!property) return [];
  const tags = [];
  const isPlot = isPlotOrLand(property);
  const bhkStr = String(property.bhk || '').trim();
  const bhkLower = bhkStr.toLowerCase();

  const isBhkValid =
    property.bhk &&
    property.bhk !== 'N/A' &&
    !bhkLower.includes('office') &&
    !bhkLower.includes('shop') &&
    !bhkLower.includes('plot') &&
    !bhkLower.includes('site') &&
    !bhkLower.includes('land') &&
    !isPlot;

  if (isBhkValid) {
    tags.push(property.bhk);
  } else if (isPlot && property.bhk && !bhkLower.includes('plot') && !bhkLower.includes('site') && !bhkLower.includes('land')) {
    tags.push(property.bhk);
  }

  if (property.area) {
    const rawArea = String(property.area).trim();
    const parts = rawArea.split(/\s*[\u00b7\u2022\u2219\u2027\u25cf\u25cb\u2043\u2218•·|]\s*/).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      const sqftParts = parts.filter((p) => /sq\.?ft|sqft/i.test(p));
      const unitParts = parts.filter((p) => /\b\d+\s*units?\b/i.test(p));
      const acreParts = parts.filter((p) => /acres?|guntas?/i.test(p));
      const otherParts = parts.filter(
        (p) => !sqftParts.includes(p) && !unitParts.includes(p) && !acreParts.includes(p)
      );

      const ordered = [
        ...sqftParts,
        ...acreParts,
        ...unitParts,
        ...otherParts,
      ];
      tags.push(...ordered);
    } else {
      tags.push(rawArea);
    }
  }

  const rawUnits = property.totalUnits || property.details?.totalUnits || '';
  if (rawUnits && !tags.some((t) => /\bunits?\b/i.test(t))) {
    tags.push(`${String(rawUnits).replace(/units?/i, '').trim()} Units`);
  }
  const facingVal = property.facing;
  if (facingVal && facingVal !== 'N/A' && facingVal !== 'NA') {
    tags.push(`Door Facing: ${facingVal}`);
  }
  if (isCornerProperty(property)) {
    tags.push(isPlot ? 'Corner Site' : 'Corner Plot');
  }
  if (property.furnishing && property.furnishing !== 'NA' && property.furnishing !== 'N/A' && !isPlot) {
    tags.push(property.furnishing);
  }
  if (property.floor && !isPlot) tags.push(property.floor);
  if (property.parking && property.parking !== 'N/A' && !isPlot) tags.push(property.parking);
  return tags.slice(0, 4);
}

export function getCardType(property) {
  if (!property) return 'Flat';

  const type = getPropertyType(property);
  const sub = String(property.propertyType || property.subcategory || property.category || property.title || '').toLowerCase();
  const subtitle = String(property.subtitle || '').toLowerCase();

  if (sub.includes('agricultural') || sub.includes('raw land') || subtitle.includes('agricultural')) {
    return 'Lands';
  }
  if (type === 'Plots' || sub.includes('plot') || sub.includes('site') || sub.includes('land')) {
    return 'Sites';
  }
  if (type === 'Villas' || sub.includes('villa') || sub.includes('farmhouse')) {
    return 'Villa';
  }
  if (type === 'Houses' || sub.includes('house') || sub.includes('independent house')) {
    return 'Independent House';
  }
  return 'Flat';
}

export function getStatusBadge(property) {
  const statusPill = getPropertyStatusPill(property);
  if (statusPill)                     return { label: statusPill.label, cls: statusPill.cls };
  if (property.loanApproved)          return { label: 'Pre-Approved Loan', cls: 'bg-emerald-100 text-emerald-700' };
  if (property.status === 'closed')   return { label: 'Closed',            cls: 'bg-red-100 text-red-700' };
  if (property.shortlisted)           return { label: 'Shortlisted',       cls: 'bg-amber-100 text-amber-700' };
  return null;
}

export function getCanonicalPossession(property) {
  if (!property) return '';

  const val = String(
    property.possession ||
    property.possessionStatus ||
    property.details?.possessionStatus ||
    property.details?.possession ||
    ''
  ).toLowerCase().trim();

  // 1. Honor explicit possession status first
  if (val.includes('construction')) {
    return 'under_construction';
  }
  if (val.includes('registration') || val.includes('register')) {
    return 'ready_for_registration';
  }
  if (val.includes('occupy') || val.includes('move')) {
    return 'ready_for_occupy';
  }
  if (val.includes('vacant')) {
    return isPlotOrLand(property) ? 'ready_for_registration' : 'ready_for_occupy';
  }

  // 2. Fallback only if no explicit status was specified
  if (isPlotOrLand(property)) {
    return 'ready_for_registration';
  }
  return 'ready_for_occupy';
}

export function getCanonicalFurnishing(property) {
  if (!property) return 'unfurnished';

  if (isPlotOrLand(property)) {
    return 'unfurnished';
  }

  if (property.furnishing) {
    const f = String(property.furnishing).toLowerCase().replace(/[-\s]/g, '');
    if (f.includes('semi')) return 'semi_furnished';
    if (f.includes('un')) return 'unfurnished';
    if (f.includes('furnish')) return 'furnished';
  }

  const text = (
    String(property.title || '') + ' ' +
    String(property.subtitle || '') + ' ' +
    String(property.description || '') + ' ' +
    String(property.details || '')
  ).toLowerCase();

  if (text.includes('fully furnished') || text.includes('fully-furnished')) {
    return 'furnished';
  }
  if (text.includes('semi furnished') || text.includes('semi-furnished') || text.includes('semifurnished') || text.includes('modular kitchen')) {
    return 'semi_furnished';
  }
  if (text.includes('unfurnished') || text.includes('bare shell')) {
    return 'unfurnished';
  }

  return 'semi_furnished';
}

export function getListedWithinDays(property) {
  return property.recentlyAdded ? 0 : 30;
}

/**
 * True when a property has at least one real (non-placeholder) image.
 * Used to show properties-with-images first across listings.
 */
export function hasPropertyImages(property) {
  if (!property) return false;
  const p = property.raw || property;
  if (Array.isArray(p.images) && p.images.some((src) => src && !isPlaceholderImage(src) && src !== ONEVISHWAM_VERIFIED_IMAGE)) {
    return true;
  }
  if (Array.isArray(property.images) && property.images.some((src) => src && !isPlaceholderImage(src) && src !== ONEVISHWAM_VERIFIED_IMAGE)) {
    return true;
  }
  const candidate = p.coverImage || p.image || p.imageUrl || property.image || property.coverImage;
  if (candidate && typeof candidate === 'string' && !isPlaceholderImage(candidate) && candidate !== ONEVISHWAM_VERIFIED_IMAGE) {
    return true;
  }
  return false;
}

/**
 * Best available cover image: prefers a real property/building image,
 * falls back to the official ONEVISHWAM_VERIFIED_IMAGE when no real image exists.
 */
export function getPropertyCoverImage(property) {
  if (!property) return ONEVISHWAM_VERIFIED_IMAGE;
  if (Array.isArray(property.images)) {
    const realImg = property.images.find((src) => src && !isPlaceholderImage(src));
    if (realImg) return realImg;
  }
  if (property.image && !isPlaceholderImage(property.image)) {
    return property.image;
  }
  return ONEVISHWAM_VERIFIED_IMAGE;
}

export const PRIORITY_TITLES = [];

/**
 * Computes a priority score for a property:
 * 3 = Direct In-House OneVishwam Project (vendorName is OneVishwam or origin === 'in_house_project')
 * 0 = Standard partner listing
 */
export function getPriorityScore(property) {
  if (!property) return 0;
  const p = property.raw || property;

  const vendor = String(p.vendorName || p.vendor || '').trim().toLowerCase().replace(/\s+/g, '');

  // Dynamic priority: if vendorName is OneVishwam, prioritize at top (Score = 3)
  if (vendor.includes('onevishwam')) return 3;

  // If vendorName belongs to an external partner, do not mark as in-house project
  const isExternalVendor = vendor.length > 0 && !vendor.includes('onevishwam');
  if (!isExternalVendor) {
    if (p.priority && Number(p.priority) > 0) return 3;
    if (p.isPriority === true) return 3;
    if (
      p.origin === 'in_house_project' ||
      p.origin === 'in_house' ||
      p.details?.origin === 'in_house_project' ||
      p.details?.origin === 'in_house'
    ) return 3;
    if (p.isInHouse === true || p.inHouse === true || p.is_inhouse === true) return 3;
    if (p.postedBy === 'In-House' || p.postedBy === 'OneVishwam' || p.postedBy === 'One Vishwam') return 3;
  }

  return 0;
}

/**
 * Returns true if property is associated with Onevishwam or listed in-house.
 */
export function isOneVishwamProperty(property) {
  return getPriorityScore(property) >= 2;
}

/**
 * Priority sort helper:
 * 1. Highest priority score (in-house projects and OneVishwam vendor/partner listings at the top)
 * 2. User sortBy option (price-low, price-high) or default (images first + newest date/id)
 */
export function sortPropertiesWithPriority(list = [], sortBy = 'latest') {
  return [...list].sort((a, b) => {
    const aScore = getPriorityScore(a);
    const bScore = getPriorityScore(b);

    if (aScore !== bScore) {
      return bScore - aScore; // Priority in-house listings always at the top
    }

    // Properties that have real images are shown priority
    const aImg = hasPropertyImages(a) ? 1 : 0;
    const bImg = hasPropertyImages(b) ? 1 : 0;
    if (aImg !== bImg) return bImg - aImg;

    if (sortBy === 'price-low') {
      return getTotalPropertyPrice(a) - getTotalPropertyPrice(b);
    }
    if (sortBy === 'price-high') {
      return getTotalPropertyPrice(b) - getTotalPropertyPrice(a);
    }

    const bDate = new Date(b.createdAt || 0).getTime() || (typeof b.id === 'number' ? b.id : 0);
    const aDate = new Date(a.createdAt || 0).getTime() || (typeof a.id === 'number' ? a.id : 0);
    return bDate - aDate;
  });
}

/**
 * Official 8 BBMP Administrative Zones in Bangalore
 */
export const BBMP_ZONE_NAMES = [
  'Byatarayanapura',
  'Dasarahalli',
  'West',
  'East',
  'Mahadevapura',
  'South',
  'Bommanahalli',
  'RR Nagara',
];

/**
 * Classifies a property or locality string into the 8 official Bangalore BBMP zones:
 * 'Byatarayanapura', 'Dasarahalli', 'West', 'East', 'Mahadevapura', 'South', 'Bommanahalli', 'RR Nagara'
 */
export function getBangaloreZone(item) {
  if (!item) return 'South';
  const resolvedLoc = resolvePropertyLocality(item);
  const str = String(
    (item.locality || '') + ' ' +
    resolvedLoc + ' ' +
    (item.location || '') + ' ' +
    (item.address || '') + ' ' +
    (item.title || '')
  ).toLowerCase();

  // 1. Dasarahalli (North-West)
  if (
    str.includes('dasarahalli') || str.includes('peenya') || str.includes('jalahalli') ||
    str.includes('tumkur') || str.includes('bagalagunte') || str.includes('chikkabanavara') ||
    str.includes('nelamangala') || str.includes('yeshwanthpur') || str.includes('mathikere') ||
    str.includes('goraguntepalya') || str.includes('dhabaspet') || str.includes('dobbaspet')
  ) {
    return 'Dasarahalli';
  }

  // 2. Byatarayanapura (North)
  if (
    str.includes('byatarayanapura') || str.includes('yelahanka') || str.includes('hebbal') ||
    str.includes('sahakar') || str.includes('amruthahalli') || str.includes('jakkur') ||
    str.includes('thanisandra') || str.includes('manyata') || str.includes('nagawara') ||
    str.includes('hegde nagar') || str.includes('hennur') || str.includes('kothanur') ||
    str.includes('horamavu') || str.includes('devanahalli') || str.includes('airport') ||
    str.includes('chikkajala') || str.includes('siddlaghata') || str.includes('kaiwara') ||
    str.includes('chikkaballapura') || str.includes('kogilu') || str.includes('bagalur') ||
    str.includes('north east properties') || str.includes('swasthik')
  ) {
    return 'Byatarayanapura';
  }

  // 3. RR Nagara (South-West)
  if (
    str.includes('rajarajeshwari') || str.includes('rr nagar') || str.includes('ideal homes') ||
    str.includes('kengeri') || str.includes('mysore road') || str.includes('chikkanahalli') ||
    str.includes('kumbalgodu') || str.includes('bidadi') || str.includes('ramnagar') ||
    str.includes('nagarbhavi') || str.includes('ullal') || str.includes('mallathahalli') ||
    str.includes('jnana bharathi') || str.includes('nada prabhu') || str.includes('kempegowda layout') ||
    str.includes('ags layout') || str.includes('nandakumar') || str.includes('vasundhanra') ||
    str.includes('rr bhoo') || str.includes('rr mathrushree')
  ) {
    return 'RR Nagara';
  }

  // 4. Mahadevapura (East IT Corridor)
  if (
    str.includes('mahadevapura') || str.includes('whitefield') || str.includes('itpl') ||
    str.includes('k.r. pura') || str.includes('kr puram') || str.includes('ramamurthy') ||
    str.includes('tc palya') || str.includes('battarahalli') || str.includes('seegehalli') ||
    str.includes('budigere') || str.includes('hoskote') || str.includes('hosakote') ||
    str.includes('hoodi') || str.includes('kadugodi') || str.includes('hope farm') ||
    str.includes('chikkathirupathi') || str.includes('brookefield') || str.includes('kundalahalli') ||
    str.includes('marathahalli') || str.includes('panathur') || str.includes('varthur') ||
    str.includes('gunjur') || str.includes('balagere') || str.includes('sarjapur') ||
    str.includes('dommasandra') || str.includes('kasavanahalli') || str.includes('mullur') ||
    str.includes('kodathi') || str.includes('carmelaram') || str.includes('nexon') ||
    str.includes('ramky') || str.includes('aquapolis') || str.includes('purvankar') ||
    str.includes('nambiar') || str.includes('urban forest')
  ) {
    return 'Mahadevapura';
  }

  // 5. East Zone (Central-East)
  if (
    str.includes('east') || str.includes('shivajinagar') || str.includes('commercial street') ||
    str.includes('cantonment') || str.includes('cubbon') || str.includes('vasanth nagar') ||
    str.includes('cunningham') || str.includes('gandhi nagar') || str.includes('majestic') ||
    str.includes('seshadripuram') || str.includes('chickpet') || str.includes('mg road') ||
    str.includes('brigade') || str.includes('richmond') || str.includes('residency') ||
    str.includes('indiranagar') || str.includes('ulsoor') || str.includes('halasuru') ||
    str.includes('domlur') || str.includes('cv raman') || str.includes('koramangala') ||
    str.includes('ejipura')
  ) {
    return 'East';
  }

  // 6. West Zone
  if (
    str.includes('west') || str.includes('malleshwaram') || str.includes('sadashivanagar') ||
    str.includes('sankey') || str.includes('mahalakshmi') || str.includes('nandini layout') ||
    str.includes('kurubarahalli') || str.includes('rajaji nagar') || str.includes('rajajinagar') ||
    str.includes('govindraj') || str.includes('magadi') || str.includes('vijay nagar') ||
    str.includes('vijayanagar') || str.includes('rpc layout') || str.includes('attiguppe') ||
    str.includes('chandra layout') || str.includes('hampi nagar') || str.includes('chamrajpet') ||
    str.includes('shankarpuram') || str.includes('basavanagudi') || str.includes('gandhi bazaar') ||
    str.includes('hanumanth nagar')
  ) {
    return 'West';
  }

  // 7. Bommanahalli (South-East)
  if (
    str.includes('bommanahalli') || str.includes('hongasandra') || str.includes('garvebhavipalya') ||
    str.includes('madiwala') || str.includes('hsr') || str.includes('haralur') ||
    str.includes('bellandur') || str.includes('begur') || str.includes('kudlu') ||
    str.includes('singasandra') || str.includes('hosa road') || str.includes('electronic city') ||
    str.includes('e-city') || str.includes('neotown') || str.includes('bommasandra') ||
    str.includes('chandapura') || str.includes('bannerghatta') || str.includes('gottigere') ||
    str.includes('hulimavu') || str.includes('arekere') || str.includes('jigani') ||
    str.includes('anekal') || str.includes('vedant') || str.includes('bren') ||
    str.includes('whispering waves')
  ) {
    return 'Bommanahalli';
  }

  // 8. South Zone
  if (
    str.includes('south') || str.includes('jayanagar') || str.includes('tilak nagar') ||
    str.includes('byrasandra') || str.includes('jp nagar') || str.includes('sarakki') ||
    str.includes('puttenahalli') || str.includes('b.t.m') || str.includes('btm') ||
    str.includes('mico layout') || str.includes('banashankari') || str.includes('isro layout') ||
    str.includes('kumaraswamy') || str.includes('bikashipura') || str.includes('padmanaba') ||
    str.includes('padmanabhanagar') || str.includes('kanakapura') || str.includes('thalaghattapura') ||
    str.includes('konanakunte') || str.includes('harohalli') || str.includes('sathanur') ||
    str.includes('kaggalipura') || str.includes('tataguni') || str.includes('oraiyan') ||
    str.includes('royal kadhambas')
  ) {
    return 'South';
  }

  // Deterministic fallback based on title / id
  const idNum = Number(item.id) || 1;
  const fallbacks = ['South', 'Bommanahalli', 'RR Nagara', 'Dasarahalli', 'Byatarayanapura', 'Mahadevapura', 'West', 'East'];
  return fallbacks[idNum % fallbacks.length];
}

/**
 * Resolves a property's authentic locality.
 * Falls back to extracting well-known Bangalore neighborhoods from title/project/vendor
 * if the listing has an empty locality or generic city address.
 */
export function resolvePropertyLocality(property) {
  if (!property) return '';
  const direct = (property.locality || property.details?.locality || property.details?.area || '').trim();
  if (direct && direct.toLowerCase() !== 'bangalore' && direct.toLowerCase() !== 'bengaluru') {
    return direct;
  }

  const title = String(property.title || property.name || property.details?.propertyName || '').toLowerCase();
  const sub = String(property.subtitle || property.vendorName || '').toLowerCase();
  const desc = String(property.description || '').toLowerCase();
  const combined = `${title} ${sub} ${desc}`;

  if (combined.includes('nelamangala') || combined.includes('bmrda')) return 'Nelamangala';
  if (combined.includes('kempegowda layout') || combined.includes('nada prabhu') || combined.includes('bda')) return 'Nada Prabhu Kempegowda Layout';
  if (combined.includes('kanakapura') || combined.includes('annanta') || combined.includes('avaana') || combined.includes('oraiyan') || combined.includes('harmony')) return 'Kanakapura Road';
  if (combined.includes('begur') || combined.includes('bbmp enclave') || combined.includes('sp prime') || combined.includes('sp grand') || combined.includes('bbmp residential plot')) return 'Begur';
  if (combined.includes('electronic city') || combined.includes('e-city') || combined.includes('showroom') || combined.includes('commercial space') || combined.includes('commercial plot')) return 'Electronic City';
  if (combined.includes('sarjapur') || combined.includes('sylvan woods')) return 'Sarjapur Road';
  if (combined.includes('whitefield') || combined.includes('fortuna') || combined.includes('vinra')) return 'Whitefield';
  if (combined.includes('devanahalli') || combined.includes('airport') || combined.includes('artemis') || combined.includes('navakruthi')) return 'Devanahalli';
  if (combined.includes('yelahanka') || combined.includes('employee association')) return 'Yelahanka';
  if (combined.includes('thanisandra') || combined.includes('skysisira') || combined.includes('manyata')) return 'Thanisandra';
  if (combined.includes('kengeri') || combined.includes('rr mathrushree') || combined.includes('samyak') || combined.includes('kns sampada')) return 'Kengeri';
  if (combined.includes('bidadi') || combined.includes('vaibhav garden') || combined.includes('rr bhoo')) return 'Bidadi';
  if (combined.includes('dobbaspet') || combined.includes('dhabaspet') || combined.includes('kiadb') || combined.includes('dtcp') || combined.includes('sp industrial')) return 'Dobbaspet';
  if (combined.includes('gottigere') || combined.includes('vedanth') || combined.includes('suraksha') || combined.includes('bannerghatta')) return 'Gottigere';
  if (combined.includes('jigani') || combined.includes('the clan') || combined.includes('anekal')) return 'Jigani';
  if (combined.includes('doddaballapur') || combined.includes('slice of heaven')) return 'Doddaballapur Road';
  if (combined.includes('mysore road') || combined.includes('panchamuki') || combined.includes('golden city') || combined.includes('nirvana')) return 'Mysore Road';
  if (combined.includes('varthur') || combined.includes('aquapolis')) return 'Varthur';
  if (combined.includes('hoskote') || combined.includes('nexon')) return 'Hoskote';
  if (combined.includes('dommasandra') || combined.includes('nambiar')) return 'Dommasandra';
  if (combined.includes('chikkathirupathi') || combined.includes('alora')) return 'Chikkathirupathi';
  if (combined.includes('kaiwara') || combined.includes('chikkaballapura')) return 'Chikkaballapura';

  return '';
}

/**
 * Formats a comprehensive, human-readable address for a property.
 * Fetches and unifies locality, landmark, address, city, state, and pincode
 * rather than displaying a generic bare city string.
 */
export function formatPropertyAddress(property) {
  if (!property) return '';

  const address = (
    property.address ||
    property.location ||
    property.details?.address ||
    property.details?.location ||
    ''
  ).trim();

  const locality = resolvePropertyLocality(property);
  const landmark = (property.landmark || property.details?.landmark || '').trim();
  const rawCity = (property.city || property.details?.city || '').trim();
  // Detect numeric-only city values (e.g. pincode "123453" entered in city field) and treat as Bangalore
  const isNumericCity = /^\d+$/.test(rawCity);
  const city = rawCity && !isNumericCity
    ? (rawCity.toLowerCase() === 'bengaluru' ? 'Bangalore' : rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLowerCase())
    : 'Bangalore';
  const pincode = (property.pincode || property.details?.pincode || '').trim();
  const state = (property.state || property.details?.state || '').trim();

  const cleanAddr = address.toLowerCase();
  const isAddressJustCity = !address || cleanAddr === 'bangalore' || cleanAddr === 'bengaluru' || cleanAddr === city.toLowerCase() || isNumericCity;

  const parts = [];

  if (locality) {
    parts.push(locality);
  }

  if (address && !isAddressJustCity) {
    if (!locality || !address.toLowerCase().includes(locality.toLowerCase())) {
      parts.push(address);
    } else {
      parts[0] = address;
    }
  } else {
    if (landmark) parts.push(`Near ${landmark}`);
    parts.push(city);
  }

  if (parts.length === 1 && !parts[0].toLowerCase().includes('bangalore') && !parts[0].toLowerCase().includes('bengaluru')) {
    parts.push(city);
  }

  // If pincode is present and address does NOT already contain a pincode, append it
  const addressAlreadyHasPincode = hasPincode(address) || parts.some((p) => hasPincode(p));
  if (!addressAlreadyHasPincode && pincode && !parts.some((p) => String(p).includes(pincode))) {
    parts.push(pincode);
  }

  const result = parts.filter(Boolean).join(', ');
  if (result) return result;

  return state ? `${city}, ${state}` : city;
}

/**
 * Detects if a string or property address already contains a 6-digit postal pincode.
 */
export function hasPincode(target) {
  if (!target) return false;
  if (typeof target === 'string') {
    return /\b\d{6}\b/.test(target);
  }
  const addr = String(target.address || target.location || target.formattedAddress || target.details?.address || '');
  const pin = String(target.pincode || target.details?.pincode || '');
  return /\b\d{6}\b/.test(addr) || (Boolean(pin) && addr.includes(pin));
}

