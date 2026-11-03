import API from '../services/api';

let lastTrackedKey = '';
let lastTrackedTime = 0;

export function resolveSectorFromPath(pathname = '') {
  const p = pathname.toLowerCase();
  if (p.includes('/services/property') || p.includes('/properties')) return 'properties';
  if (p.includes('/services/automobile') || p.includes('/vehicles')) return 'vehicles';
  if (p.includes('/services/electronics')) return 'electronics';
  if (p.includes('/services/jewellery')) return 'jewellery';
  if (p.includes('/services/garments')) return 'garments';
  if (p.includes('/services/grocery')) return 'groceries';
  if (p.includes('/services/bedding')) return 'bedding';
  if (p.includes('/services/finance')) return 'finance';
  return '';
}

/**
 * Gets user identifying info from localStorage or generates a session identifier for anonymous users.
 */
function getUserIdentification() {
  let userEmail = '';
  let userId = '';
  let sessionId = '';

  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      userEmail = u.email || '';
      userId = u._id || u.id || u.uid || '';
    }
  } catch {}

  // Generate session identifier for anonymous tracking
  try {
    const storedSession = sessionStorage.getItem('session_id');
    if (storedSession) {
      sessionId = storedSession;
    } else {
      sessionId = `${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
  } catch {}

  return { userEmail, userId, sessionId };
}

/**
 * Tracks a user's page visit or listing view to record their sector interests and browsing history.
 * Works for both authenticated users and anonymous session visitors.
 */
export async function trackUserActivity({
  category = '',
  listingId = '',
  title = '',
  price = '',
  location = '',
  image = '',
  path = '',
} = {}) {
  try {
    const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '');
    const resolvedCategory = category || resolveSectorFromPath(currentPath) || 'general';

    // Deduplication key: ignore duplicate calls for the same item/path within 10 seconds
    const key = `${resolvedCategory}_${listingId || currentPath}`;
    const now = Date.now();
    if (key === lastTrackedKey && now - lastTrackedTime < 10000) {
      return;
    }
    lastTrackedKey = key;
    lastTrackedTime = now;

    const { userEmail, userId, sessionId } = getUserIdentification();

    const payload = {
      category: resolvedCategory,
      listingId: listingId || undefined,
      title: title || undefined,
      price: price || undefined,
      location: location || undefined,
      image: image || undefined,
      path: currentPath,
      userEmail: userEmail || undefined,
      userId: userId || undefined,
      sessionIdentifier: sessionId || undefined,
    };

    await API.post('/users/activity', payload);
  } catch (err) {
    // Silent fail so user experience is never interrupted
  }
}

export default trackUserActivity;
