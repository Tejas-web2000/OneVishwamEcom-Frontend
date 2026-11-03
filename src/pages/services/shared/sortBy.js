import { parseIndianPrice as getNumericPrice } from '../../../utils/priceUtils';
import { isPlaceholderImage, ONEVISHWAM_VERIFIED_IMAGE } from '../../../constants/fallbackImage';

export const SORT_LATEST = 'latest';
export const SORT_PRICE_LOW = 'price-low';
export const SORT_PRICE_HIGH = 'price-high';

export const DEFAULT_SORT_OPTIONS = [
  { value: SORT_LATEST, label: 'Latest' },
  { value: SORT_PRICE_LOW, label: 'Price: Low to High' },
  { value: SORT_PRICE_HIGH, label: 'Price: High to Low' },
];

/**
 * Checks whether an item/product has at least one real (non-placeholder) image.
 */
export function hasItemImage(item) {
  if (!item) return false;
  const target = item.raw || item;

  if (Array.isArray(target.images) && target.images.some((img) => img && !isPlaceholderImage(img) && img !== ONEVISHWAM_VERIFIED_IMAGE)) {
    return true;
  }
  if (Array.isArray(item.images) && item.images.some((img) => img && !isPlaceholderImage(img) && img !== ONEVISHWAM_VERIFIED_IMAGE)) {
    return true;
  }

  const candidate = target.coverImage || target.image || target.imageUrl || item.image || item.coverImage;
  if (candidate && typeof candidate === 'string' && !isPlaceholderImage(candidate) && candidate !== ONEVISHWAM_VERIFIED_IMAGE) {
    return true;
  }

  return false;
}

/**
 * Returns true if an item is an in-house project or posted by ceo@onevishwam.com
 */
export function isInHouseOrCeoListing(item) {
  if (!item) return false;
  const target = item.raw || item;

  const vendor = String(target.vendorName || target.vendor || '').trim().toLowerCase().replace(/\s+/g, '');
  if (vendor.includes('onevishwam')) return true;

  const email = String(target.contributor?.email || target.email || target.postedByEmail || '').trim().toLowerCase();
  if (email.includes('ceo@onevishwam.com') || email.includes('onevishwam')) return true;

  const isExternalVendor = vendor.length > 0 && !vendor.includes('onevishwam');
  if (!isExternalVendor) {
    if (target.priority && Number(target.priority) > 0) return true;
    if (target.isPriority === true) return true;
    if (
      target.origin === 'in_house_project' ||
      target.origin === 'in_house' ||
      target.details?.origin === 'in_house_project' ||
      target.details?.origin === 'in_house'
    ) return true;
    if (target.isInHouse === true || target.inHouse === true || target.is_inhouse === true) return true;
    if (
      target.postedBy === 'In-House' ||
      target.postedBy === 'OneVishwam' ||
      target.postedBy === 'One Vishwam'
    ) return true;
  }

  return false;
}

/**
 * Compare two items by numeric price.
 */
export function compareByPrice(a, b, ascending = true, getPrice = getNumericPrice) {
  const pA = typeof getPrice === 'function' ? getPrice(a?.price ?? a?.pricePerUnit ?? a?.finalPrice ?? a) : 0;
  const pB = typeof getPrice === 'function' ? getPrice(b?.price ?? b?.pricePerUnit ?? b?.finalPrice ?? b) : 0;
  return ascending ? pA - pB : pB - pA;
}

/**
 * Compare two items by creation timestamp or fallback ID.
 */
export function compareByDate(a, b, desc = true) {
  const tA = new Date(a?.createdAt || 0).getTime() || (typeof a?.id === 'number' ? a.id : 0);
  const tB = new Date(b?.createdAt || 0).getTime() || (typeof b?.id === 'number' ? b.id : 0);
  return desc ? tB - tA : tA - tB;
}

/**
 * Sorts an array using standard sort criteria with priority in-house listings at the top.
 */
export function applySort(items = [], sortBy = SORT_LATEST, getPrice = getNumericPrice) {
  if (!Array.isArray(items)) return [];
  const copy = [...items];

  return copy.sort((a, b) => {
    const aPri = isInHouseOrCeoListing(a) ? 1 : 0;
    const bPri = isInHouseOrCeoListing(b) ? 1 : 0;
    if (aPri !== bPri) return bPri - aPri; // In-house / ceo@onevishwam.com always at top

    // Products that have real images are shown priority
    const aImg = hasItemImage(a) ? 1 : 0;
    const bImg = hasItemImage(b) ? 1 : 0;
    if (aImg !== bImg) return bImg - aImg;

    if (sortBy === SORT_PRICE_LOW) {
      return compareByPrice(a, b, true, getPrice);
    }
    if (sortBy === SORT_PRICE_HIGH) {
      return compareByPrice(a, b, false, getPrice);
    }
    return compareByDate(a, b, true);
  });
}
