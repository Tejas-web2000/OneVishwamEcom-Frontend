import { useMemo } from 'react';
import {
  getPropertyType, getCardType, getNumericPrice, getNumericArea,
  getBedrooms, getBuildingType, getListedWithinDays, isPlotOrLand,
  getCanonicalPossession, getCanonicalFurnishing,
  matchesBudgetRange, matchesSizeRange, getTotalPropertyPrice, parsePriceRange,
  getPriorityScore, getBangaloreZone, hasPropertyImages,
} from './propertyHelpers';

/**
 * Builds card-type stats (projects / keys / sites) for each property type.
 */
export function useCardTypeStats(properties, PROPERTY_CARD_TYPES) {
  return useMemo(() => {
    const stats = {};
    PROPERTY_CARD_TYPES.forEach((ct) => {
      const items = ct.id === 'All'
        ? properties
        : properties.filter((p) => getCardType(p) === ct.id);
      stats[ct.id] = {
        count:    items.length,
        projects: items.reduce((sum, p) => sum + (p.projectCount || 1), 0),
        keys:     items.reduce((sum, p) => sum + (p.totalUnits || 1), 0),
        sites:    items.reduce((sum, p) => sum + (p.availableUnits || p.units || 1), 0),
      };
    });
    return stats;
  }, [properties, PROPERTY_CARD_TYPES]);
}

function formatBudgetChip(val) {
  const num = Number(val);
  if (!num || isNaN(num) || num <= 0) return '₹0';
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    const l = num / 100000;
    return `₹${l % 1 === 0 ? l : l.toFixed(1)} L`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Builds the list of active filter chips from the current filters state.
 */
export function useActiveChips(filters) {
  return useMemo(() => {
    const chips = [];
    if (filters.budgetMin || filters.budgetMax) {
      const label = [
        filters.budgetMin && `Min ${formatBudgetChip(filters.budgetMin)}`,
        filters.budgetMax && `Max ${formatBudgetChip(filters.budgetMax)}`,
      ].filter(Boolean).join(' – ');
      chips.push({ key: 'budget', label: `Budget: ${label}` });
    }
    if (filters.sizeMin || filters.sizeMax) {
      const label = [
        filters.sizeMin && `Min ${Number(filters.sizeMin).toLocaleString('en-IN')} sq.ft`,
        filters.sizeMax && `Max ${Number(filters.sizeMax).toLocaleString('en-IN')} sq.ft`,
      ].filter(Boolean).join(' – ');
      chips.push({ key: 'size', label: `Size: ${label}` });
    }
    filters.buildingType.forEach((t)     => chips.push({ key: `bt-${t}`,    label: t }));
    filters.propertyType.forEach((t)     => chips.push({ key: `pt-${t}`,    label: t }));
    filters.bedrooms.forEach((b)         => chips.push({ key: `bed-${b}`,   label: b }));
    filters.localities.forEach((l)       => chips.push({ key: `loc-${l}`,   label: l }));
    filters.furnishing.forEach((f)       => chips.push({ key: `furn-${f}`,  label: f }));
    filters.postedBy.forEach((p)         => chips.push({ key: `pb-${p}`,    label: p }));
    filters.possessionStatus.forEach((p) => chips.push({ key: `poss-${p}`,  label: p }));
    filters.amenities.forEach((a)        => chips.push({ key: `amen-${a}`,  label: a }));
    filters.facing.forEach((f)           => chips.push({ key: `face-${f}`,  label: f }));
    filters.propertyAge.forEach((a)      => chips.push({ key: `age-${a}`,   label: a }));
    filters.availability.forEach((a)     => chips.push({ key: `avail-${a}`, label: a }));
    if (filters.gatedCommunity) chips.push({ key: 'gated', label: 'Gated Community' });
    if (filters.loanApprovedOnly) chips.push({ key: 'loan', label: 'Pre‑approved loan only' });
    return chips;
  }, [filters]);
}

/**
 * Returns the filtered + sorted property list.
 */


/**
 * Returns the filtered + sorted property list.
 * Highly optimized using fail-fast short-circuiting and pre-normalized Sets.
 */
export function useFilteredProperties(arg1, arg2) {
  const isFirstArray = Array.isArray(arg1);
  const properties = isFirstArray ? (arg1 || []) : (arg1?.properties || []);
  const options = isFirstArray ? (arg2 || {}) : (arg1 || {});

  const {
    selectedCardType = 'All',
    searchTerm = '',
    requirementText = '',
    sortBy = 'latest',
    filters = {},
    selectedCity = '',
    locationInput = '',
    pincodeInput = '',
    familyLocationsOnly = false,
    preApprovedMode = false,
    selectedZone = '',
  } = options;

  return useMemo(() => {
    if (!Array.isArray(properties) || properties.length === 0) return [];

    // Pre-normalize filter criteria outside the loop once (O(1) lookups)
    const qSearch = (searchTerm || '').toLowerCase().trim();
    const qReq = (requirementText || '').toLowerCase().trim();
    const sCity = String(selectedCity || '').toLowerCase().trim();
    const isBangalore = sCity === 'bengaluru' || sCity === 'bangalore';
    const locFilter = String(locationInput || '').toLowerCase().trim();
    const pinFilter = String(pincodeInput || '').trim();
    const zoneFilter = String(selectedZone || '').toLowerCase().trim();
    const hasZoneFilter = Boolean(zoneFilter && zoneFilter !== 'all');

    const buildingTypeSet = new Set((filters.buildingType || []).map((bt) => String(bt).toLowerCase().trim()));
    const propertyTypeSet = new Set((filters.propertyType || []).map((ft) => String(ft).toLowerCase().trim()));
    const bedroomsSet = new Set(filters.bedrooms || []);
    const amenitiesSet = new Set(filters.amenities || []);
    const facingSet = new Set(filters.facing || []);
    const propertyAgeSet = new Set(filters.propertyAge || []);
    const postedBySet = new Set(filters.postedBy || []);
    const localitiesList = (filters.localities || []).map((l) => String(l).toLowerCase().trim());

    return properties
      .filter((p) => {
        if (!p) return false;

        // 1. Primitive early exits (O(1) fail-fast)
        if (selectedCardType !== 'All' && getCardType(p) !== selectedCardType) return false;
        if (familyLocationsOnly && getBuildingType(p) !== 'Residential') return false;
        if (preApprovedMode && p.loanApproved !== true) return false;
        if (filters.loanApprovedOnly && p.loanApproved !== true) return false;
        if (filters.gatedCommunity && p.gatedCommunity !== true && p.gated !== true) return false;

        // 2. Pincode & Location check
        if (pinFilter && !String(p.pincode || '').startsWith(pinFilter)) return false;

        if (locFilter) {
          const matchLocation =
            (p.zone && String(p.zone).toLowerCase().includes(locFilter)) ||
            (p.location && String(p.location).toLowerCase().includes(locFilter)) ||
            (p.area && String(p.area).toLowerCase().includes(locFilter));
          if (!matchLocation) return false;
        }

        // 3. Zone filter
        if (hasZoneFilter) {
          const pZone = getBangaloreZone(p).toLowerCase();
          const matchZone = pZone === zoneFilter || (p.zone && String(p.zone).toLowerCase() === zoneFilter);
          if (!matchZone) return false;
        }

        // 4. Budget & Size range
        if (!matchesBudgetRange(p, filters.budgetMin, filters.budgetMax)) return false;
        if (!matchesSizeRange(p, filters.sizeMin, filters.sizeMax)) return false;

        // 5. Search Text matching
        const titleStr = String(p.title || p.name || '').toLowerCase();
        const locStr = String(p.location || p.locality || p.city || '').toLowerCase();
        const subStr = String(p.subtitle || p.propertyType || '').toLowerCase();

        if (qSearch) {
          const vendorStr = String(p.vendorName || p.channelPartnerName || '').toLowerCase();
          const addrStr = String(p.address || '').toLowerCase();
          const matchSearch =
            titleStr.includes(qSearch) ||
            locStr.includes(qSearch) ||
            subStr.includes(qSearch) ||
            vendorStr.includes(qSearch) ||
            addrStr.includes(qSearch);
          if (!matchSearch) return false;
        }

        if (qReq) {
          const descStr = String(p.description || '').toLowerCase();
          const matchReq =
            titleStr.includes(qReq) ||
            locStr.includes(qReq) ||
            subStr.includes(qReq) ||
            descStr.includes(qReq);
          if (!matchReq) return false;
        }

        // 6. City match
        if (sCity) {
          const pCity = String(p.city || '').toLowerCase().trim();
          const isNumericCity = /^\d+$/.test(pCity);
          const isBangaloreProperty =
            pCity === 'bengaluru' ||
            pCity === 'bangalore' ||
            isNumericCity ||
            !pCity ||
            String(p.state || '').toLowerCase().includes('karnataka') ||
            String(p.details?.possessionStatus || '').toLowerCase().includes('bengaluru') ||
            String(p.details?.parkingAvailability || '').toLowerCase().includes('white') ||
            String(p.address || '').toLowerCase().includes('bangalore') ||
            String(p.address || '').toLowerCase().includes('bengaluru');

          const matchCity =
            !pCity ||
            isNumericCity ||
            pCity === sCity ||
            (isBangalore && isBangaloreProperty) ||
            Boolean(qSearch);
          if (!matchCity) return false;
        }

        // 7. Faceted Set checks (only evaluated if filter is active)
        if (buildingTypeSet.size > 0) {
          const bType = String(getBuildingType(p)).toLowerCase().trim();
          if (!buildingTypeSet.has(bType)) return false;
        }

        if (propertyTypeSet.size > 0) {
          const rawProp = String(p.propertyType || p.subcategory || '').toLowerCase().trim();
          const type = String(getPropertyType(p)).toLowerCase().trim();
          const bType = String(getBuildingType(p)).toLowerCase().trim();
          let matchPropType = propertyTypeSet.has(rawProp) || propertyTypeSet.has(type) || propertyTypeSet.has(bType);
          if (!matchPropType) {
            propertyTypeSet.forEach((selected) => {
              const sel = selected.toLowerCase();
              if (sel.includes('residential') && (rawProp.includes('residential') || bType === 'residential')) matchPropType = true;
              else if ((sel.includes('flat') || sel.includes('villa')) && (rawProp.includes('flat') || rawProp.includes('villa') || type.includes('flat') || type.includes('villa') || rawProp.includes('apartment'))) matchPropType = true;
              else if ((sel.includes('house') || sel.includes('independent')) && (rawProp.includes('house') || rawProp.includes('independent'))) matchPropType = true;
              else if (sel === 'plot' && (rawProp.includes('plot') || rawProp.includes('layout') || rawProp.includes('plat') || type.includes('plot') || type.includes('site'))) matchPropType = true;
              else if (sel === 'land' && (rawProp === 'land' || (rawProp.includes('land') && !rawProp.includes('agri')))) matchPropType = true;
              else if (sel.includes('agri') && (rawProp.includes('agri') || rawProp.includes('farm') || rawProp.includes('plantation'))) matchPropType = true;
              else if (sel.includes('commercial') && (rawProp.includes('commercial') || bType === 'commercial' || type.includes('commercial') || type.includes('office') || type.includes('shop') || type.includes('showroom'))) matchPropType = true;
              else if (sel.includes('industrial') && (rawProp.includes('industrial') || type.includes('industrial') || rawProp.includes('warehouse') || rawProp.includes('factory'))) matchPropType = true;
              else if (rawProp.includes(sel) || type.includes(sel)) matchPropType = true;
            });
          }
          if (!matchPropType) return false;
        }

        if (bedroomsSet.size > 0) {
          const bBed = getBedrooms(p.bhk, p);
          if (!bedroomsSet.has(bBed)) return false;
        }

        if (postedBySet.size > 0 && (!p.postedBy || !postedBySet.has(p.postedBy))) return false;
        if (facingSet.size > 0 && (!p.facing || !facingSet.has(p.facing))) return false;
        if (propertyAgeSet.size > 0 && (!p.propertyAge || !propertyAgeSet.has(p.propertyAge))) return false;

        if (amenitiesSet.size > 0) {
          const pAmenities = Array.isArray(p.amenities) ? p.amenities : [];
          for (const a of amenitiesSet) {
            if (!pAmenities.includes(a)) return false;
          }
        }

        if (localitiesList.length > 0) {
          const pLoc = String(p.location || '').toLowerCase();
          const pZone = String(p.zone || '').toLowerCase();
          const pTitle = titleStr;
          const pSub = subStr;
          const pAddr = String(p.address || '').toLowerCase();
          const pArea = String(p.area || '').toLowerCase();

          const hasLocalityMatch = localitiesList.some((l) =>
            pLoc.includes(l) ||
            pZone.includes(l) ||
            pTitle.includes(l) ||
            pSub.includes(l) ||
            pAddr.includes(l) ||
            pArea.includes(l)
          );
          if (!hasLocalityMatch) return false;
        }

        if (filters.furnishing && filters.furnishing.length > 0) {
          const pFurnishing = getCanonicalFurnishing(p);
          const matchFurnishing = filters.furnishing.some((f) => {
            const fNorm = String(f).toLowerCase().replace(/[-\s]/g, '');
            let target = 'unfurnished';
            if (fNorm.includes('semi')) target = 'semi_furnished';
            else if (fNorm.includes('un')) target = 'unfurnished';
            else if (fNorm.includes('furnish')) target = 'furnished';
            return pFurnishing === target;
          });
          if (!matchFurnishing) return false;
        }

        if (filters.possessionStatus && filters.possessionStatus.length > 0) {
          const pPossession = getCanonicalPossession(p);
          const matchPossession = filters.possessionStatus.some((status) => {
            const statusNorm = String(status).toLowerCase().trim();
            let target = '';
            if (statusNorm.includes('registration') || statusNorm.includes('register')) target = 'ready_for_registration';
            else if (statusNorm.includes('occupy') || statusNorm.includes('move')) target = 'ready_for_occupy';
            else if (statusNorm.includes('construction')) target = 'under_construction';
            return pPossession === target;
          });
          if (!matchPossession) return false;
        }

        if (filters.availability && filters.availability.length > 0) {
          const pAvailNorm = String(p.availability || '').toLowerCase().trim();
          const matchAvail = filters.availability.some((a) => {
            const aNorm = String(a).toLowerCase().trim();
            return pAvailNorm === aNorm || pAvailNorm.includes(aNorm) || aNorm.includes(pAvailNorm);
          });
          if (!matchAvail) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aScore = getPriorityScore(a);
        const bScore = getPriorityScore(b);
        if (aScore !== bScore) return bScore - aScore;

        const aImg = hasPropertyImages(a) ? 1 : 0;
        const bImg = hasPropertyImages(b) ? 1 : 0;
        if (aImg !== bImg) return bImg - aImg;
        if (sortBy === 'price-high') return getTotalPropertyPrice(b) - getTotalPropertyPrice(a);
        return (new Date(b.createdAt || 0).getTime() || 0) - (new Date(a.createdAt || 0).getTime() || 0);
      });
  }, [
    properties, selectedCardType, searchTerm, requirementText, sortBy, filters,
    selectedCity, locationInput, pincodeInput, familyLocationsOnly, preApprovedMode,
    selectedZone,
  ]);
}
