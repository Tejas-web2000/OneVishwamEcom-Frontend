/**
 * OneVishwam Verified Product Fallback Image & Helpers
 * ───────────────────────────────────────────────────
 * Canonical branded placeholder used whenever a listing has no photos
 * or has legacy SVG placeholder data.
 */

export const ONEVISHWAM_VERIFIED_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
    <rect width="600" height="400" fill="#f8fafc"/>
    <rect x="1" y="1" width="598" height="398" stroke="#e2e8f0" stroke-width="2"/>
    <g transform="translate(260, 120)" opacity="0.45">
      <rect x="10" y="10" width="60" height="45" rx="6" stroke="#003366" stroke-width="3" fill="none"/>
      <path d="M25 55 v10 h30 v-10" stroke="#003366" stroke-width="3" stroke-linecap="round"/>
      <line x1="15" y1="65" x2="65" y2="65" stroke="#003366" stroke-width="3" stroke-linecap="round"/>
      <path d="M30 32 l7 7 l14 -14" stroke="#003366" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="300" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#003366" text-anchor="middle" letter-spacing="0.75">ONEVISHWAM VERIFIED PRODUCT</text>
    <text x="300" y="258" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle" letter-spacing="0.5">Official Authorized Listing</text>
  </svg>`
);

/**
 * Checks if an image URL is missing, invalid, or is a legacy dummy placeholder.
 */
export function isPlaceholderImage(url) {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('data:image/svg+xml')) return true;
  if (trimmed.startsWith('data:image/')) return true;
  if (/placeholder|fallback|dummy-image/i.test(trimmed)) return true;
  // If it is the legacy grey house placeholder
  if (
    trimmed.includes('%239ca3af') ||
    trimmed.includes('#9ca3af') ||
    trimmed.includes('M300%20260') ||
    trimmed.includes('M300 260') ||
    trimmed.includes('M160%20130') ||
    trimmed.includes('M160 130')
  ) {
    return true;
  }
  return false;
}

/**
 * Resolves an image URL safely, returning ONEVISHWAM_VERIFIED_IMAGE if missing or placeholder.
 */
export function resolveValidImage(url) {
  return isPlaceholderImage(url) ? ONEVISHWAM_VERIFIED_IMAGE : url;
}

export default ONEVISHWAM_VERIFIED_IMAGE;
