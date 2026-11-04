import { cities, defaultCity, defaultArea } from '../constants/locations';

const BIGDATACLOUD_CLIENT_API = 'https://api.bigdatacloud.net/data/reverse-geocode-client';
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/reverse';

// Greater Bengaluru Metropolitan Area Bounding Box
const BENGALURU_BBOX = {
  minLat: 12.65,
  maxLat: 13.35,
  minLng: 77.25,
  maxLng: 77.95,
};

function isWithinBengaluru(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  return (
    lat >= BENGALURU_BBOX.minLat &&
    lat <= BENGALURU_BBOX.maxLat &&
    lng >= BENGALURU_BBOX.minLng &&
    lng <= BENGALURU_BBOX.maxLng
  );
}

/**
 * Attempts to get browser GPS coordinates.
 * Uses standard accuracy and a reasonable timeout to prevent hanging on desktop browsers.
 */
function getBrowserCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation not supported by browser'));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err),
      {
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 300000,
      }
    );
  });
}

/**
 * Reverse geocodes using BigDataCloud's free browser-friendly client API.
 * Supports passing coordinates, or omitting them for IP-based geolocation fallback.
 */
async function fetchReverseGeocode(lat, lng) {
  try {
    const url = (typeof lat === 'number' && typeof lng === 'number')
      ? `${BIGDATACLOUD_CLIENT_API}?latitude=${lat.toFixed(6)}&longitude=${lng.toFixed(6)}&localityLanguage=en`
      : `${BIGDATACLOUD_CLIENT_API}?localityLanguage=en`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      source: 'bigdatacloud',
      lat: data.latitude || lat,
      lng: data.longitude || lng,
      city: data.city || '',
      locality: data.locality || '',
      state: data.principalSubdivision || '',
      details: data.localityInfo?.administrative || [],
    };
  } catch {
    // If BigDataCloud fails and we have coordinates, fallback to OSM Nominatim
    if (typeof lat === 'number' && typeof lng === 'number') {
      try {
        const params = new URLSearchParams({
          lat: lat.toFixed(6),
          lon: lng.toFixed(6),
          format: 'json',
          addressdetails: 1,
        });
        const res = await fetch(`${NOMINATIM_API}?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const addr = data.address || {};
        return {
          source: 'nominatim',
          lat,
          lng,
          city: addr.city || addr.town || addr.county || '',
          locality: addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.road || '',
          state: addr.state || '',
          addr,
        };
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Checks if the geocoded address or coordinates match Bengaluru / Bangalore.
 */
function isBengaluruLocation(geoData) {
  if (!geoData) return false;

  // Check coordinates bounding box
  if (isWithinBengaluru(geoData.lat, geoData.lng)) {
    return true;
  }

  // Check text indicators
  const textBag = [
    geoData.city,
    geoData.locality,
    geoData.state,
    ...(geoData.details ? geoData.details.map((d) => d.name) : []),
    ...(geoData.addr ? Object.values(geoData.addr) : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const blrKeywords = ['bengaluru', 'bangalore', 'blr', 'karnataka'];
  return blrKeywords.some((kw) => textBag.includes(kw));
}

/**
 * Finds the closest matched area or extracts clean locality name.
 */
function resolveArea(geoData) {
  const blrAreas = cities.bengaluru?.areas || [];
  const candidates = [
    geoData.locality,
    geoData.city,
    ...(geoData.details ? geoData.details.map((d) => d.name) : []),
    ...(geoData.addr ? [geoData.addr.suburb, geoData.addr.neighbourhood, geoData.addr.quarter, geoData.addr.road] : []),
  ]
    .filter(Boolean)
    .map((s) => String(s).trim());

  // 1. Try finding a known Bengaluru area match
  for (const candidate of candidates) {
    const candLower = candidate.toLowerCase();
    for (const known of blrAreas) {
      const knownLower = known.toLowerCase();
      if (candLower.includes(knownLower) || knownLower.includes(candLower)) {
        return known;
      }
    }
  }

  // 2. Use detected clean suburb / locality if available and not simply the city name
  for (const candidate of candidates) {
    const candLower = candidate.toLowerCase();
    if (
      candidate.length >= 3 &&
      !candLower.includes('bengaluru') &&
      !candLower.includes('bangalore') &&
      !candLower.includes('karnataka') &&
      !candLower.includes('india') &&
      !candLower.includes('corporation') &&
      !candLower.includes('district')
    ) {
      return candidate;
    }
  }

  // 3. Fallback to default area
  return defaultArea || blrAreas[0] || 'Koramangala';
}

/**
 * Main location detection function.
 * Tries GPS first, then falls back seamlessly to IP geolocation.
 */
export async function detectCurrentLocation() {
  let geoData = null;

  // 1. Try browser GPS
  try {
    const coords = await getBrowserCoordinates();
    if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
      geoData = await fetchReverseGeocode(coords.latitude, coords.longitude);
    }
  } catch (gpsError) {
    console.warn('[detectLocation] Browser GPS unavailable or denied, falling back to IP geolocation:', gpsError.message);
  }

  // 2. Fallback to IP geolocation if GPS wasn't available or didn't yield geodata
  if (!geoData) {
    geoData = await fetchReverseGeocode();
  }

  if (!geoData) {
    throw new Error('Unable to retrieve location coordinates');
  }

  const isBlr = isBengaluruLocation(geoData);
  const matchedArea = resolveArea(geoData);

  return {
    cityId: defaultCity, // Platform is Bengaluru focused
    area: matchedArea,
    lat: geoData.lat,
    lng: geoData.lng,
    isBengaluru: isBlr,
  };
}
