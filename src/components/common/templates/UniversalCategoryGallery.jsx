import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MarketplaceCategoryGallery from './MarketplaceCategoryGallery';
import CategoryListingCard from './CategoryListingCard';
import { parseIndianPrice } from '../../../utils/priceUtils';
import SearchIndex from '../../../utils/searchIndex';
import { matchesSearch } from '../../../utils/searchUtils';

/**
 * UniversalCategoryGallery
 * 
 * Declarative category gallery engine.
 * Eliminates all boilerplate for search, multi-select checkbox filters, dual range sliders,
 * active filter chips, pagination, sorting, empty states, and card rendering.
 * 
 * Any category gallery page can be created with a single declarative configuration file.
 */
export default function UniversalCategoryGallery({
  // Metadata & Navigation
  categoryTitle = 'Verified Inventory',
  categorySubtitle = 'Explore our verified inventory with complete documentation and loan assistance.',
  breadcrumb = 'Marketplace',
  postRequirementLink = null,
  onQuickMatch = null,
  quickMatchLabel = 'Quick Match',
  searchPlaceholder = 'Search inventory by title, brand, locality, or keyword...',

  // Data Source (either pass hook or raw array)
  useItems = null,
  items: directItems = null,
  loading: directLoading = false,
  error: directError = null,

  // Declarative Field Mapping for cards
  mapping = {},

  // Declarative Checkbox Filter Groups: [{ id, title, options, field, search }]
  filterGroups = [],

  // Declarative Range Sliders: [{ id, title, min, max, step, field, maxLabel, unitLabel }]
  rangeFilters = [],

  // Search Fields
  searchFields = ['title', 'name', 'brand', 'model', 'location', 'city', 'locality', 'address', 'category', 'subcategory'],

  // Per page count (12 = 3 full rows of 4 columns)
  perPage = 12,
  hidePrice = false,

  // Optional extensions
  customModals = null,
  customSidebar = null,
  customCardRenderer = null,
  topExtra = null,
  customSorter = null,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Resolve Data Hook if provided
  let fetchedItems = null;
  let fetchedLoading = false;
  let fetchedError = null;

  if (typeof useItems === 'function') {
    const hookResult = useItems();
    if (Array.isArray(hookResult)) {
      fetchedItems = hookResult;
    } else if (hookResult && typeof hookResult === 'object') {
      fetchedItems =
        hookResult.items ||
        hookResult.electronics ||
        hookResult.beddings ||
        hookResult.bedding ||
        hookResult.vehicles ||
        hookResult.properties ||
        hookResult.garments ||
        hookResult.groceries ||
        hookResult.jewellery ||
        hookResult.data ||
        Object.values(hookResult).find((v) => Array.isArray(v)) ||
        [];
      fetchedLoading = Boolean(hookResult.loading);
      fetchedError = hookResult.error || null;
    }
  }

  const rawItems = directItems !== null ? directItems : (fetchedItems || []);
  const isLoading = directLoading || fetchedLoading;
  const hasError = directError || fetchedError;

  // Helper to extract initial filters from searchParams
  const getInitialFilters = () => {
    const initial = {};
    rangeFilters.forEach((r) => {
      initial[`${r.id}Min`] = searchParams.get(`${r.id}Min`) || '';
      initial[`${r.id}Max`] = searchParams.get(`${r.id}Max`) || '';
    });
    filterGroups.forEach((g) => {
      initial[g.id] = [];
      const paramVal =
        searchParams.get(g.id) ||
        searchParams.get(g.id.toLowerCase()) ||
        (g.id === 'subcategory' ? (searchParams.get('type') || searchParams.get('category') || searchParams.get('subcat')) : null);

      if (paramVal) {
        const requestedVals = paramVal.split(',').map((s) => s.trim().toLowerCase());
        const matched = (g.options || []).filter((opt) => {
          const optLower = String(opt).toLowerCase();
          return requestedVals.some((v) => optLower === v || optLower.includes(v) || v.includes(optLower));
        });
        if (matched.length > 0) {
          initial[g.id] = matched;
        }
      }
    });
    return initial;
  };

  // 2. Filter & Search State
  const [searchTerm, setSearchTerm] = useState(() => (searchParams.get('q') || searchParams.get('search') || '').trim());
  const [activeFilters, setActiveFilters] = useState(getInitialFilters);

  // Sync from URL search parameters if searchParams change dynamically
  useEffect(() => {
    const q = (searchParams.get('q') || searchParams.get('search') || '').trim();
    setSearchTerm(q);

    let changed = false;
    const nextFilters = { ...activeFilters };

    filterGroups.forEach((g) => {
      const paramVal =
        searchParams.get(g.id) ||
        searchParams.get(g.id.toLowerCase()) ||
        (g.id === 'subcategory' ? (searchParams.get('type') || searchParams.get('category') || searchParams.get('subcat')) : null);

      if (paramVal) {
        const requestedVals = paramVal.split(',').map((s) => s.trim().toLowerCase());
        const matched = (g.options || []).filter((opt) => {
          const optLower = String(opt).toLowerCase();
          return requestedVals.some((v) => optLower === v || optLower.includes(v) || v.includes(optLower));
        });
        if (matched.length > 0) {
          nextFilters[g.id] = matched;
          changed = true;
        }
      }
    });

    if (changed) {
      setActiveFilters(nextFilters);
    }
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    if (!val && (searchParams.has('id') || searchParams.has('productId') || searchParams.has('q') || searchParams.has('search'))) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('id');
        next.delete('productId');
        next.delete('q');
        next.delete('search');
        return next;
      });
    }
  };

  const handleResetFilters = () => {
    const reset = {};
    rangeFilters.forEach((r) => {
      reset[`${r.id}Min`] = '';
      reset[`${r.id}Max`] = '';
    });
    filterGroups.forEach((g) => {
      reset[g.id] = [];
    });
    setActiveFilters(reset);
    setSearchTerm('');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('id');
      next.delete('productId');
      next.delete('q');
      next.delete('search');
      next.delete('page');
      return next;
    });
  };

  // 3. Dynamic Active Chips
  const activeChips = useMemo(() => {
    const chips = [];

    rangeFilters.forEach((r) => {
      const minV = activeFilters[`${r.id}Min`];
      const maxV = activeFilters[`${r.id}Max`];
      if (minV) {
        const num = Number(minV);
        const label = num >= 100000 ? `Min ₹${(num / 100000).toFixed(1)}L` : `Min ₹${num}`;
        chips.push({ key: `${r.id}Min`, label });
      }
      if (maxV) {
        const num = Number(maxV);
        const label = num >= 100000 ? `Max ₹${(num / 100000).toFixed(1)}L` : `Max ₹${num}`;
        chips.push({ key: `${r.id}Max`, label });
      }
    });

    filterGroups.forEach((g) => {
      const selected = activeFilters[g.id] || [];
      selected.forEach((val) => {
        chips.push({ key: g.id, label: val, value: val });
      });
    });

    return chips;
  }, [activeFilters, rangeFilters, filterGroups]);

  const handleRemoveChip = (chip) => {
    if (chip.key.endsWith('Min') || chip.key.endsWith('Max')) {
      handleFilterChange(chip.key, '');
    } else {
      const currentList = activeFilters[chip.key] || [];
      handleFilterChange(
        chip.key,
        currentList.filter((x) => x !== chip.value)
      );
    }
  };

  // 4. Transform raw items into unified card items
  const transformedItems = useMemo(() => {
    if (!Array.isArray(rawItems)) return [];

    return rawItems.map((raw) => {
      const id = mapping.id ? mapping.id(raw) : (raw._id || raw.id || '');
      const title = mapping.title ? mapping.title(raw) : (raw.title || raw.name || '');
      const image = mapping.image ? mapping.image(raw) : (raw.images?.[0] || raw.image || raw.coverImage || '');
      const price = mapping.price ? mapping.price(raw) : (raw.price || 'Price on Request');
      const priceSuffix = mapping.priceSuffix ? mapping.priceSuffix(raw) : (raw.priceSuffix || '');
      const location = mapping.location ? mapping.location(raw) : (raw.location || raw.city || raw.showroom?.city || raw.address || '');
      const pincode = mapping.pincode ? mapping.pincode(raw) : (raw.pincode || raw.showroom?.pincode || '');
      const overline = mapping.overline ? mapping.overline(raw) : (raw.brand || raw.category || raw.subcategory || raw.propertyType || '');
      const badges = mapping.badges ? mapping.badges(raw) : (raw.badges || raw.statusBadges || []);
      const pills = mapping.pills ? mapping.pills(raw) : (raw.cardPills || raw.keyAttributes || []);
      const highlightBanner = mapping.highlightBanner ? mapping.highlightBanner(raw) : raw.highlightBanner;
      const link = mapping.detailUrl ? mapping.detailUrl(raw) : (mapping.link ? mapping.link(raw) : raw.link);

      return {
        id,
        title,
        image,
        images: Array.isArray(raw.images) ? raw.images : (image ? [image] : []),
        price,
        priceSuffix,
        location,
        pincode,
        overline,
        badges,
        statusBadges: badges,
        cardPills: pills,
        keyAttributes: pills,
        highlightBanner,
        link,
        raw,
      };
    });
  }, [rawItems, mapping]);

  // 5. Build High-Performance Search Index (O(N) built once when catalog loads)
  const searchIndex = useMemo(() => {
    const searchableItems = transformedItems.map((t) => {
      const flat = { ...t.raw, id: t.id, title: t.title, location: t.location };
      if (Array.isArray(t.cardPills)) {
        flat.pills = t.cardPills.map((p) => String(p.value || p)).join(' ');
      }
      return flat;
    });
    return new SearchIndex(searchableItems, [...searchFields, 'title', 'location', 'pills']);
  }, [transformedItems, searchFields]);

  // 6. Intelligent Filtering Logic with O(K) Search & O(1) Set Lookups
  const filteredItems = useMemo(() => {
    const q = searchTerm.trim();
    const targetId = (searchParams.get('id') || searchParams.get('productId') || '').trim();

    // Fast O(K) inverted index lookup
    const matchedSearchIds = q
      ? new Set(searchIndex.search(q).map((item) => String(item.id || item._id)))
      : null;

    // Pre-normalize checkbox filter group sets outside the loop (O(1) lookups)
    const activeGroupSets = [];
    for (const group of filterGroups) {
      const selected = activeFilters[group.id] || [];
      if (selected.length > 0) {
        activeGroupSets.push({
          group,
          selectedSet: new Set(selected.map((opt) => String(opt).toLowerCase())),
        });
      }
    }

    // Active range filter checks
    const activeRanges = [];
    for (const range of rangeFilters) {
      const minVal = activeFilters[`${range.id}Min`];
      const maxVal = activeFilters[`${range.id}Max`];
      if (minVal || maxVal) {
        activeRanges.push({
          range,
          minNum: minVal ? Number(minVal) : null,
          maxNum: maxVal ? Number(maxVal) : null,
        });
      }
    }

    return transformedItems.filter(({ id, raw, title, location }) => {
      // A. Direct ID match from search dropdown navigation
      if (targetId && (String(id) === targetId || String(raw._id) === targetId || String(raw.id) === targetId)) {
        return true;
      }

      // B. O(1) Search Match Check with fallback token matching
      if (matchedSearchIds !== null && !matchedSearchIds.has(String(id))) {
        const matches = matchesSearch(
          q,
          title,
          raw.title,
          raw.name,
          raw.brand,
          raw.model,
          location,
          raw.location,
          raw.area,
          raw.city,
          raw.locality,
          raw.subcategory
        );
        if (!matches) return false;
      }

      // C. Range Filters
      for (const { range, minNum, maxNum } of activeRanges) {
        let itemNumericVal = 0;
        if (typeof range.field === 'function') {
          itemNumericVal = range.field(raw);
        } else {
          const rawVal = raw[range.field || range.id] || raw.price;
          itemNumericVal = parseIndianPrice(rawVal);
        }

        if (minNum !== null && itemNumericVal < minNum) return false;
        if (maxNum !== null && itemNumericVal > maxNum) return false;
      }

      // D. O(1) Set Checkbox Group Filters
      for (const { group, selectedSet } of activeGroupSets) {
        let itemValue;
        if (typeof group.field === 'function') {
          itemValue = group.field(raw);
        } else {
          itemValue = raw[group.field || group.id];
        }

        if (Array.isArray(itemValue)) {
          const hasMatch = itemValue.some((v) => selectedSet.has(String(v).toLowerCase()));
          if (!hasMatch) return false;
        } else if (itemValue !== undefined && itemValue !== null) {
          if (!selectedSet.has(String(itemValue).toLowerCase())) return false;
        } else {
          return false;
        }
      }

      return true;
    });
  }, [transformedItems, searchTerm, searchIndex, activeFilters, rangeFilters, filterGroups, searchParams]);

  return (
    <>
      <MarketplaceCategoryGallery
        categoryTitle={categoryTitle}
        categorySubtitle={categorySubtitle}
        breadcrumbCategory={breadcrumb}
        items={filteredItems}
        filterGroups={filterGroups}
        rangeFilters={rangeFilters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        activeChips={activeChips}
        onRemoveChip={handleRemoveChip}
        onResetFilters={handleResetFilters}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder={searchPlaceholder}
        postRequirementLink={postRequirementLink}
        onQuickMatch={onQuickMatch}
        quickMatchLabel={quickMatchLabel}
        perPage={perPage}
        hidePrice={hidePrice}
        customSidebar={customSidebar}
        customCardRenderer={customCardRenderer}
        topExtra={topExtra}
        customSorter={customSorter}
      />
      {customModals}
    </>
  );
}
