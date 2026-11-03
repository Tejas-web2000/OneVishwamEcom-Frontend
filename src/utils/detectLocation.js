import { cities } from '../constants/locations';

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse';

export async function detectCurrentLocation() {
  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    });
  });

  const { latitude, longitude } = pos.coords;

  const params = new URLSearchParams({
    lat: latitude.toFixed(6),
    lon: longitude.toFixed(6),
    format: 'json',
    addressdetails: 1,
  });

  const res = await fetch(`${NOMINATIM}?${params}`, {
    headers: { 'User-Agent': 'VishwamServices/1.0' },
  });
  const data = await res.json();
  const addr = data.address || {};

  const detectedCityId = findCity(addr);
  if (!detectedCityId) return null;

  const city = cities[detectedCityId];
  const area = findArea(addr, city);
  if (!area) return null;

  return { cityId: detectedCityId, area, lat: latitude, lng: longitude };
}

function findCity(addr) {
  const checks = [
    addr.city,
    addr.town,
    addr.county,
    addr.state_district,
    addr.state,
  ].filter(Boolean).map((s) => s.toLowerCase().replace(/\s+/g, ''));

  for (const [id, city] of Object.entries(cities)) {
    const label = city.label.toLowerCase().replace(/\s+/g, '');
    if (checks.some((c) => c.includes(label) || label.includes(c))) return id;
  }
  return null;
}

function findArea(addr, city) {
  const allParts = [
    addr.suburb,
    addr.neighbourhood,
    addr.locality,
    addr.village,
    addr.town,
    addr.city_district,
    addr.road,
    addr.hamlet,
    addr.residential,
    addr.quarter,
  ].filter(Boolean).map((s) => s.toLowerCase().trim());

  for (const area of city.areas) {
    const aLow = area.toLowerCase().trim();
    if (allParts.some((p) => p.includes(aLow) || aLow.includes(p))) return area;
  }

  return null;
}
