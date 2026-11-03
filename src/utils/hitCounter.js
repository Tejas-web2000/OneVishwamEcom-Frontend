/**
 * Hit Counter Utility:
 * Connects to live backend API (/api/visitors/hit, /api/visitors/count)
 * with graceful fallback, localStorage persistence, and session deduplication.
 */

import API from '../services/api';

const STORAGE_KEY = 'vishwam_hit_counter_v4';
const VISITOR_UUID_KEY = 'vishwam_visitor_uuid';
const SESSION_HIT_KEY = 'vishwam_session_hit_sent';

const DEFAULT_STATS = {
  totalVisitors: 0,
  totalHits: 0,
  visitsToday: 0,
  activeVisitors: 0,
};

/**
 * Returns or generates a persistent device/browser UUID.
 */
export function getOrCreateVisitorId() {
  try {
    let vid = localStorage.getItem(VISITOR_UUID_KEY);
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
      localStorage.setItem(VISITOR_UUID_KEY, vid);
    }
    return vid;
  } catch {
    return 'v_temp_' + Date.now();
  }
}

/**
 * Reads the latest cached visitor data from localStorage for instant zero-layout-shift render.
 */
export function getHitCounterData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          totalVisitors: parsed.totalVisitors || parsed.totalHits || DEFAULT_STATS.totalVisitors,
          totalHits: parsed.totalHits || DEFAULT_STATS.totalHits,
          visitsToday: parsed.visitsToday || DEFAULT_STATS.visitsToday,
          activeVisitors: parsed.activeVisitors || DEFAULT_STATS.activeVisitors,
        };
      }
    }
  } catch {
    /* ignore parse errors */
  }
  return DEFAULT_STATS;
}

/**
 * Persists visitor data to local cache.
 */
function cacheHitData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore storage quota errors */
  }
}

/**
 * Triggers a visit hit to the backend once per unique session, and returns fresh stats.
 */
export async function recordVisitorHit() {
  const visitorId = getOrCreateVisitorId();
  const sessionLogged = sessionStorage.getItem(SESSION_HIT_KEY);

  try {
    // Only hit the increment endpoint if not yet logged in this session
    if (!sessionLogged) {
      const resp = await API.post('/visitors/hit', { visitorId });
      const stats = resp?.data?.data || resp?.data || {};
      sessionStorage.setItem(SESSION_HIT_KEY, 'true');

      const data = {
        totalVisitors: stats.totalVisitors || stats.totalHits || DEFAULT_STATS.totalVisitors,
        totalHits: stats.totalHits || DEFAULT_STATS.totalHits,
        visitsToday: stats.visitsToday || DEFAULT_STATS.visitsToday,
        activeVisitors: stats.activeVisitors || DEFAULT_STATS.activeVisitors,
      };
      cacheHitData(data);
      return data;
    } else {
      // Session already counted, fetch current count without incrementing
      return await fetchVisitorCount();
    }
  } catch (err) {
    // Fallback: return cached or baseline data gracefully
    return getHitCounterData();
  }
}

let cachedVisitorStats = null;
let lastVisitorCountFetchTime = 0;
let inFlightVisitorPromise = null;
const VISITOR_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Fetches current visitor count without recording an increment.
 * Uses in-memory caching and in-flight promise deduplication to prevent spamming the backend.
 */
export async function fetchVisitorCount(force = false) {
  const now = Date.now();
  if (!force && cachedVisitorStats && now - lastVisitorCountFetchTime < VISITOR_CACHE_TTL_MS) {
    return cachedVisitorStats;
  }

  if (inFlightVisitorPromise) {
    try {
      return await inFlightVisitorPromise;
    } catch {
      return getHitCounterData();
    }
  }

  try {
    inFlightVisitorPromise = (async () => {
      const resp = await API.get('/visitors/count');
      const stats = resp?.data?.data || resp?.data || {};
      const data = {
        totalVisitors: stats.totalVisitors || stats.totalHits || DEFAULT_STATS.totalVisitors,
        totalHits: stats.totalHits || DEFAULT_STATS.totalHits,
        visitsToday: stats.visitsToday || DEFAULT_STATS.visitsToday,
        activeVisitors: stats.activeVisitors || DEFAULT_STATS.activeVisitors,
      };
      cacheHitData(data);
      cachedVisitorStats = data;
      lastVisitorCountFetchTime = Date.now();
      return data;
    })();

    return await inFlightVisitorPromise;
  } catch (err) {
    return getHitCounterData();
  } finally {
    inFlightVisitorPromise = null;
  }
}

/**
 * Disabled to prevent server pressure: returns local cached hit data without sending repeated network requests.
 */
export async function sendVisitorPing() {
  return getHitCounterData();
}

/**
 * Notifies the backend that the user is leaving/closing the page via navigator.sendBeacon.
 */
export function sendVisitorLeave() {
  const visitorId = getOrCreateVisitorId();
  const base = API.defaults.baseURL || 'https://asia-south1-onevishwam.cloudfunctions.net/api';
  const url = `${base}/visitors/leave`;
  const payload = JSON.stringify({ visitorId });

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    } catch {}
  }

  try {
    fetch(url, {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function incrementHitCounter() {
  // Synchronous initial read for backwards compatibility
  return getHitCounterData();
}
