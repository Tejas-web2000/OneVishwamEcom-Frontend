/**
 * Dynamic Location & Address Utilities
 * Pure API & Database-driven — zero hardcoded dummy addresses.
 * Extracts authentic localities, showrooms, and addresses directly from
 * backend API records and database listings.
 */

/**
 * Extracts and deduplicates authentic localities and addresses
 * directly from real backend database listing items.
 *
 * @param {Array} items Array of real items returned from API (e.g. /search)
 * @param {string} rawQuery User search query
 * @returns {Array} Distinct real locations ranked by relevance & occurrence
 */
export function extractLocationsFromApiItems(items = [], rawQuery = '') {
  if (!Array.isArray(items) || items.length === 0) return [];
  const q = String(rawQuery || '').trim().toLowerCase();

  const locationMap = new Map();

  for (const item of items) {
    if (!item) continue;
    const candidates = [];

    // 1. Explicit Locality from database record
    if (item.locality && typeof item.locality === 'string' && item.locality.trim()) {
      const loc = item.locality.trim();
      candidates.push({
        name: `${loc}, ${item.city || 'Bangalore'}`,
        locality: loc,
        city: item.city || 'bengaluru',
      });
    }

    // 2. Full Location string from database record (e.g. "Kalyani Motors, Nayandahalli, Bangalore", "Whitefield, Bangalore")
    if (item.location && typeof item.location === 'string' && item.location.trim()) {
      const locStr = item.location.trim();
      const isPureDimension = /^[\d,.\s+-]+(?:sq\.?ft|acres?|units?|bhk)/i.test(locStr);
      if (!isPureDimension) {
        const parts = locStr.split(',').map((s) => s.trim()).filter(Boolean);
        const primaryPart = parts[0] || locStr;
        candidates.push({
          name: locStr,
          locality: primaryPart,
          city: item.city || 'bengaluru',
        });
      } else {
        // If location has trailing city/area e.g. "11 Acres · 150 Units, bengaluru"
        const parts = locStr.split(',').map((s) => s.trim()).filter(Boolean);
        if (parts.length > 1) {
          const locName = parts[parts.length - 1];
          if (!/^[\d,.\s+-]+(?:sq\.?ft|acres?|units?|bhk)/i.test(locName)) {
            candidates.push({
              name: locName,
              locality: locName,
              city: item.city || 'bengaluru',
            });
          }
        }
      }
    }

    // 3. Extract named place from property title (e.g. "Residential Plot in Nadaprabhu Kempegowda Layout")
    if (item.title && typeof item.title === 'string') {
      const inMatch = item.title.match(/\bin\s+([A-Za-z0-9\s]+?)(?:\s*\([^)]*\)|$)/i);
      if (inMatch && inMatch[1].trim()) {
        const place = inMatch[1].trim();
        if (!/^\d|sq\.?ft|bhk/i.test(place)) {
          candidates.push({
            name: `${place}, Bangalore`,
            locality: place,
            city: item.city || 'bengaluru',
          });
        }
      }
      const parenMatch = item.title.match(/\(([^)]+)\)/);
      if (parenMatch && parenMatch[1].trim()) {
        const inside = parenMatch[1].trim();
        if (!/^\d|bhk|sq\.?ft|acres?|rs|roi/i.test(inside)) {
          candidates.push({
            name: `${inside}, Bangalore`,
            locality: inside,
            city: item.city || 'bengaluru',
          });
        }
      }
    }

    // Group & count occurrences
    for (const cand of candidates) {
      const key = cand.name.toLowerCase();
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          id: `loc-${locationMap.size + 1}`,
          name: cand.name,
          primary: cand.locality,
          locality: cand.locality,
          city: cand.city,
          count: 1,
        });
      } else {
        locationMap.get(key).count += 1;
      }
    }
  }

  const results = Array.from(locationMap.values());

  // Rank by query match and occurrences
  if (q) {
    results.sort((a, b) => {
      const aLower = a.name.toLowerCase();
      const bLower = b.name.toLowerCase();
      const aStarts = aLower.startsWith(q) || a.locality.toLowerCase().startsWith(q);
      const bStarts = bLower.startsWith(q) || b.locality.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return b.count - a.count;
    });
  } else {
    results.sort((a, b) => b.count - a.count);
  }

  return results.slice(0, 6);
}
