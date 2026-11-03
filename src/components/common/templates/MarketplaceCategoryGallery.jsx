import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation as useRouterLocation } from 'react-router-dom';
import CategoryListingCard from './CategoryListingCard';
import { CollapsibleSection, CheckboxGroup, ActiveChip } from '../../ui';
import { useLocation } from '../../../store/locationSlice';
import { cities } from '../../../constants/locations';
import PageContainer from '../PageContainer';
import Breadcrumbs from '../Breadcrumbs';
import LottieFeedbackAnimation from '../LottieFeedbackAnimation';
import { isInHouseOrCeoListing, hasItemImage } from '../../../pages/services/shared/sortBy';
import { loadSessionState, saveSessionState } from '../../../pages/services/shared/sessionStore';

function formatCurrency(val, unit = 'L') {
  const num = Number(val);
  if (!num || isNaN(num) || num <= 0) return '₹ 0';
  if (num >= 10000000) {
    const cr = (num / 10000000).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
    return `₹ ${cr} Cr`;
  }
  if (num >= 100000) {
    const lakh = (num / 100000).toFixed(1).replace(/\.0$/, '');
    return `₹ ${lakh} L`;
  }
  return `₹ ${num.toLocaleString('en-IN')}`;
}

export function DualRangeSlider({
  min = 0,
  max = 50000000,
  step = 100000,
  minVal = '',
  maxVal = '',
  onChange,
  formatLabel = formatCurrency,
  maxLabel = 'Max',
  unitLabel = '₹',
}) {
  const currentMin = minVal !== '' && !isNaN(minVal) ? Number(minVal) : min;
  const currentMax = maxVal !== '' && !isNaN(maxVal) ? Number(maxVal) : max;

  const minPercent = Math.max(0, Math.min(100, ((currentMin - min) / (max - min)) * 100));
  const maxPercent = Math.max(0, Math.min(100, ((currentMax - min) / (max - min)) * 100));

  return (
    <div className="my-2.5 px-1">
      <div className="flex items-center justify-between text-xs font-bold text-brand-blue mb-2">
        <span className="bg-brand-blue/10 px-2 py-0.5 rounded-md">{formatLabel(currentMin)}</span>
        <span className="text-gray-400 font-normal text-[10px]">to</span>
        <span className="bg-brand-blue/10 px-2 py-0.5 rounded-md">
          {currentMax >= max ? maxLabel : formatLabel(currentMax)}
        </span>
      </div>

      <div className="relative w-full h-5 flex items-center">
        <div className="h-2 w-full rounded-full bg-gray-200 relative">
          <div
            className="absolute h-2 rounded-full bg-brand-blue"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentMin}
          onChange={(e) => {
            const val = Math.min(Number(e.target.value), currentMax - step);
            onChange(val <= min ? '' : String(val), maxVal);
          }}
          className="pointer-events-none absolute left-0 w-full h-2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-blue [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentMax}
          onChange={(e) => {
            const val = Math.max(Number(e.target.value), currentMin + step);
            onChange(minVal, val >= max ? '' : String(val));
          }}
          className="pointer-events-none absolute left-0 w-full h-2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-blue [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      <div className="flex gap-2 mt-3">
        <input
          type="number"
          placeholder={`Min (${unitLabel})`}
          value={minVal}
          onChange={(e) => onChange(e.target.value, maxVal)}
          className="w-1/2 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-brand-blue"
        />
        <input
          type="number"
          placeholder={`Max (${unitLabel})`}
          value={maxVal}
          onChange={(e) => onChange(minVal, e.target.value)}
          className="w-1/2 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-brand-blue"
        />
      </div>
    </div>
  );
}

/**
 * MarketplaceCategoryGallery:
 * Master reusable template modeled directly on the Property Gallery 4-column Homez design:
 * 1. Top Navigation & Action Header (Breadcrumb, Available Count badge, Post Requirement, Quick Match)
 * 2. Stretched Modern Unified Search Bar with Location (City & Area) Selectors
 * 3. Homez Horizontal Filter Dropdown Bar (Quick Category/Status dropdowns + More Filters drawer trigger)
 * 4. Results Bar with View Switcher (4-Column Grid vs List) & Sort Dropdown
 * 5. Active Filters Chips row with "Reset All"
 * 6. Responsive 4-Column Grid (sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4) using CategoryListingCard
 * 7. Modern Numeric Pagination Controls
 * 8. Comprehensive "More Filters" Slide-Over Drawer
 */
export default function MarketplaceCategoryGallery({
  categoryTitle = 'Verified Inventory',
  categorySubtitle = 'Explore our verified inventory with complete documentation and direct customer support.',
  breadcrumbCategory = 'Marketplace',
  items = [],
  filterGroups = [],
  rangeFilters = [],
  activeFilters = {},
  onFilterChange,
  activeChips = [],
  onRemoveChip,
  onResetFilters,
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Search inventory by title, brand, locality, or keyword...',
  postRequirementLink = null,
  onQuickMatch,
  quickMatchLabel = 'Quick Match',
  customSidebar,
  customCardRenderer,
  perPage = 12,
  hidePrice = false,
  topExtra = null,
  customSorter = null,
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const routerLocation = useRouterLocation();
  const { selectedCity, selectCity } = useLocation();

  // Session storage key unique to this gallery route path
  const sessionKey = useMemo(() => `gallery_page_${routerLocation.pathname}`, [routerLocation.pathname]);

  // Read initial page from URL query param first, then session storage, default 1
  const getInitialPage = () => {
    const urlPage = parseInt(searchParams.get('page'), 10);
    if (!isNaN(urlPage) && urlPage > 0) return urlPage;
    const saved = loadSessionState(sessionKey, { page: 1 })?.page;
    if (typeof saved === 'number' && saved > 0) return saved;
    return 1;
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [locationInput, setLocationInput] = useState('');
  const dropdownBarRef = useRef(null);

  // Sync page state when URL searchParams change (e.g. browser back/forward buttons)
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page'), 10);
    if (!isNaN(urlPage) && urlPage > 0) {
      if (urlPage !== currentPage) {
        setCurrentPage(urlPage);
        saveSessionState(sessionKey, { page: urlPage });
      }
    } else {
      // If URL has no page param, check if session storage preserved a page > 1
      const saved = loadSessionState(sessionKey, { page: 1 })?.page;
      if (typeof saved === 'number' && saved > 1 && currentPage === 1) {
        setCurrentPage(saved);
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set('page', String(saved));
          return next;
        }, { replace: true });
      }
    }
  }, [searchParams, sessionKey]);

  // Navigate to specified page, persisting to URL and session storage
  const goToPage = (n) => {
    const target = Math.max(1, n);
    setCurrentPage(target);
    saveSessionState(sessionKey, { page: target });
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (target > 1) {
        next.set('page', String(target));
      } else {
        next.delete('page');
      }
      return next;
    }, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper when filters/search/sort change: resets pagination to page 1
  const resetToFirstPage = () => {
    setCurrentPage(1);
    saveSessionState(sessionKey, { page: 1 });
    if (searchParams.has('page')) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('page');
        return next;
      }, { replace: true });
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownBarRef.current && !dropdownBarRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter sections open/close state inside drawer
  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    filterGroups.forEach((g) => { initial[g.id] = g.defaultOpen !== false; });
    rangeFilters.forEach((r) => { initial[r.id] = r.defaultOpen !== false; });
    return initial;
  });

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Sort items according to active sort option with in-house priority preserved
  const sortedItems = useMemo(() => {
    let list = [...items];

    if (typeof customSorter === 'function') {
      return customSorter(list, sortBy);
    }

    list.sort((a, b) => {
      // 1. In-house / CEO listings ALWAYS come first at the top
      const aPri = isInHouseOrCeoListing(a) ? 1 : 0;
      const bPri = isInHouseOrCeoListing(b) ? 1 : 0;
      if (aPri !== bPri) return bPri - aPri;

      // 2. Products that have real images are shown priority
      const aImg = hasItemImage(a) ? 1 : 0;
      const bImg = hasItemImage(b) ? 1 : 0;
      if (aImg !== bImg) return bImg - aImg;

      // 2. Secondary sort within each priority tier
      if (sortBy === 'price-low') {
        const pA = Number(a.rawPrice || a.price || a.raw?.numericPrice || 0);
        const pB = Number(b.rawPrice || b.price || b.raw?.numericPrice || 0);
        return pA - pB;
      }
      if (sortBy === 'price-high') {
        const pA = Number(a.rawPrice || a.price || a.raw?.numericPrice || 0);
        const pB = Number(b.rawPrice || b.price || b.raw?.numericPrice || 0);
        return pB - pA;
      }
      if (sortBy === 'name-asc') {
        return String(a.title || a.name || '').localeCompare(String(b.title || b.name || ''));
      }

      // Default: newest first
      const tA = new Date(a.createdAt || a.raw?.createdAt || 0).getTime() || (typeof a.id === 'number' ? a.id : 0);
      const tB = new Date(b.createdAt || b.raw?.createdAt || 0).getTime() || (typeof b.id === 'number' ? b.id : 0);
      return tB - tA;
    });

    return list;
  }, [items, sortBy, customSorter]);

  // Pagination calculation (12 per page = 3 full rows of 4 columns)
  const totalPages = Math.ceil(sortedItems.length / perPage) || 1;
  const pageItems = useMemo(() => {
    const effectivePage = (sortedItems.length > 0 && currentPage > totalPages) ? totalPages : currentPage;
    const start = (effectivePage - 1) * perPage;
    return sortedItems.slice(start, start + perPage);
  }, [sortedItems, currentPage, totalPages, perPage]);

  // Clamp safely if loaded items has fewer pages than the restored page
  useEffect(() => {
    if (sortedItems.length > 0 && totalPages > 0 && currentPage > totalPages) {
      goToPage(totalPages);
    }
  }, [sortedItems.length, totalPages]);

  // Quick dropdown toggler
  const toggleDropdown = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  // Drawer sidebar content
  const renderSidebarContent = () => (
    <div className="space-y-4 text-xs">
      {/* Range Filters */}
      {rangeFilters.map((range) => (
        <CollapsibleSection
          key={range.id}
          id={range.id}
          label={range.title}
          open={openSections[range.id]}
          onToggle={toggleSection}
        >
          <DualRangeSlider
            min={range.min || 0}
            max={range.max || 50000000}
            step={range.step || 100000}
            minVal={activeFilters[`${range.id}Min`] || ''}
            maxVal={activeFilters[`${range.id}Max`] || ''}
            onChange={(minV, maxV) => {
              resetToFirstPage();
              if (onFilterChange) {
                onFilterChange(`${range.id}Min`, minV);
                onFilterChange(`${range.id}Max`, maxV);
              }
            }}
            formatLabel={range.formatLabel || formatCurrency}
            maxLabel={range.maxLabel || 'Max'}
            unitLabel={range.unitLabel || '₹'}
          />
        </CollapsibleSection>
      ))}

      {/* Checkbox Group Filters */}
      {filterGroups.map((group) => {
        const selected = activeFilters[group.id] || [];
        return (
          <CollapsibleSection
            key={group.id}
            id={group.id}
            label={group.title}
            open={openSections[group.id]}
            onToggle={toggleSection}
          >
            <CheckboxGroup
              options={group.options || []}
              selected={selected}
              onChange={(newSelected) => {
                resetToFirstPage();
                if (onFilterChange) {
                  onFilterChange(group.id, newSelected);
                }
              }}
              search={group.search}
            />
          </CollapsibleSection>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 relative">
      {/* ── Top Navigation & Title Bar ── */}
      <div className="bg-white border-b border-gray-200/80 shadow-2xs">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Breadcrumbs categoryName={breadcrumbCategory} />
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight">
                {categoryTitle}
              </h1>
              {categorySubtitle && (
                <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-2xl">
                  {categorySubtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-gray-200 px-3.5 py-2 rounded-xl shadow-2xs">
                <i className="fa-solid fa-layer-group text-brand-blue" />
                <span className="text-brand-blue">{sortedItems.length}</span> Listing{sortedItems.length !== 1 ? 's' : ''} Available
              </span>

              {postRequirementLink && (
                <Link
                  to={postRequirementLink}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <i className="fa-solid fa-circle-plus text-brand-blue" />
                  <span className="hidden sm:inline">Post Requirement</span>
                </Link>
              )}

              {onQuickMatch && (
                <button
                  type="button"
                  onClick={onQuickMatch}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 px-4 py-2 text-xs font-extrabold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <i className="fa-solid fa-bolt text-slate-900" />
                  <span>{quickMatchLabel}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-6">
        {/* ── Search & Location Input Bar ── */}
        <div className="flex flex-col md:flex-row items-stretch gap-3 mb-4">
          <div className="relative flex-1 flex items-center w-full bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-brand-blue/50 focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-brand-blue/10 transition-all">
            <i className="fa-solid fa-magnifying-glass absolute left-4 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                resetToFirstPage();
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent pl-11 pr-24 py-3.5 text-sm font-medium text-slate-800 placeholder:text-gray-400 outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  resetToFirstPage();
                  if (onSearchChange) onSearchChange('');
                }}
                className="absolute right-12 text-gray-400 hover:text-gray-600 p-1 text-xs transition-colors"
                title="Clear search"
              >
                <i className="fa-solid fa-circle-xmark text-sm" />
              </button>
            )}
            <div className="absolute right-3 hidden sm:flex items-center">
              <span className="text-[11px] font-bold text-white bg-brand-blue px-3 py-1.5 rounded-xl shadow-xs">
                Search
              </span>
            </div>
          </div>

          {/* Top Location Filter Selectors (City & Area) */}
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-xs hover:border-brand-blue/40 transition-all shrink-0">
            <i className="fa-solid fa-location-dot text-brand-blue text-sm shrink-0" />
            <select
              value={selectedCity || ''}
              onChange={(e) => {
                selectCity(e.target.value);
                setLocationInput('');
                resetToFirstPage();
              }}
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none cursor-pointer pr-1"
            >
              <option value="">All Cities</option>
              {Object.entries(cities).map(([id, c]) => (
                <option key={id} value={id}>
                  {c.label}
                </option>
              ))}
            </select>
            {selectedCity && cities[selectedCity]?.areas?.length > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <select
                  value={locationInput}
                  onChange={(e) => {
                    setLocationInput(e.target.value);
                    resetToFirstPage();
                  }}
                  className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none cursor-pointer max-w-[130px] truncate"
                >
                  <option value="">All Areas</option>
                  {cities[selectedCity].areas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        {/* ── Optional Top Extra (e.g. Map toggle, custom banners, zone views) ── */}
        {topExtra && <div className="mb-4">{topExtra}</div>}

        {/* ── Homez Horizontal Filter Dropdown Bar ── */}
        <div
          ref={dropdownBarRef}
          className="relative bg-white rounded-2xl border border-gray-200 p-3 sm:p-3.5 shadow-xs mb-4 z-20"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left: Quick Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {filterGroups.slice(0, 3).map((group) => {
                const selected = activeFilters[group.id] || [];
                const isActive = selected.length > 0;
                const isOpen = openDropdown === group.id;

                const label = isActive
                  ? `${group.title} (${selected.length})`
                  : group.title;

                return (
                  <div key={group.id} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown(group.id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                        isOpen || isActive
                          ? 'border-brand-blue bg-blue-50/70 text-brand-blue font-bold shadow-2xs'
                          : 'border-gray-200 bg-white text-slate-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span>{label}</span>
                      <i
                        className={`fa-solid fa-chevron-down text-[10px] transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="absolute left-0 top-full mt-2 w-64 max-h-80 overflow-y-auto rounded-2xl bg-white border border-gray-200 p-3 shadow-xl z-30 animate-fade-in scrollbar-hide">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                          {group.title}
                        </p>
                        <div className="space-y-1">
                          {(group.options || []).map((opt) => {
                            const optVal = typeof opt === 'string' ? opt : opt.value;
                            const optLabel = typeof opt === 'string' ? opt : opt.label;
                            const isChecked = selected.includes(optVal);

                            return (
                              <label
                                key={optVal}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const next = isChecked
                                      ? selected.filter((x) => x !== optVal)
                                      : [...selected, optVal];
                                    resetToFirstPage();
                                    if (onFilterChange) onFilterChange(group.id, next);
                                  }}
                                  className="rounded text-brand-blue focus:ring-brand-blue"
                                />
                                <span className="truncate">{optLabel}</span>
                              </label>
                            );
                          })}
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              resetToFirstPage();
                              if (onFilterChange) onFilterChange(group.id, []);
                            }}
                            className="text-[11px] font-bold text-rose-500 hover:underline"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenDropdown(null)}
                            className="rounded-lg bg-brand-blue px-3 py-1 text-xs font-bold text-white hover:bg-brand-navy"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* More Filters Trigger (Opens Homez Filter Drawer) */}
              <button
                type="button"
                onClick={() => setShowMoreFilters(true)}
                className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold bg-white border border-gray-200 text-slate-800 hover:border-brand-blue hover:text-brand-blue transition-all shadow-2xs cursor-pointer"
              >
                <i className="fa-solid fa-sliders text-brand-blue text-xs" />
                <span>More Filters</span>
                {activeChips.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-brand-blue text-white text-[10px] flex items-center justify-center font-bold">
                    {activeChips.length}
                  </span>
                )}
              </button>
            </div>

            {/* Right: Results Count, Sort by & Grid/List View Switcher */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-gray-400 font-medium hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    resetToFirstPage();
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-brand-blue cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <option value="latest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>

              {/* Grid / List View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                <button
                  type="button"
                  title="Grid View (4 columns)"
                  onClick={() => setViewMode('grid')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-brand-blue shadow-xs font-bold'
                      : 'text-gray-500 hover:text-slate-800'
                  }`}
                >
                  <i className="fa-solid fa-table-cells-large" />
                </button>
                <button
                  type="button"
                  title="List View"
                  onClick={() => setViewMode('list')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-brand-blue shadow-xs font-bold'
                      : 'text-gray-500 hover:text-slate-800'
                  }`}
                >
                  <i className="fa-solid fa-list" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Active Filters Bar ── */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4 pb-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Active:</span>
            {activeChips.map((chip, idx) => (
              <ActiveChip
                key={idx}
                label={chip.label}
                onRemove={() => {
                  resetToFirstPage();
                  if (onRemoveChip) onRemoveChip(chip);
                }}
              />
            ))}
            {onResetFilters && (
              <button
                type="button"
                onClick={() => {
                  resetToFirstPage();
                  onResetFilters();
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 ml-2 cursor-pointer"
              >
                <i className="fa-solid fa-rotate-left" /> Reset All
              </button>
            )}
          </div>
        )}

        {/* ── Main Content: Full-Width 4-Column Grid ── */}
        {pageItems.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 auto-rows-fr'
                : 'flex flex-col gap-5'
            }
          >
            {pageItems.map((item) => (
              <div key={item.id || item._id} className="h-full">
                {customCardRenderer ? (
                  customCardRenderer(item)
                ) : (
                  <CategoryListingCard item={item} hidePrice={hidePrice} overline={item.overline} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white border border-gray-200/80 p-8 sm:p-12 text-center shadow-xs animate-fade-in my-6">
            <div className="mb-3">
              <LottieFeedbackAnimation
                type="empty"
                size="md"
                loop={false}
                fallbackIcon="fa-solid fa-magnifying-glass"
              />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              No matching listings found
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-5">
              We couldn't find any listings matching your search or filters. Try adjusting your criteria or reset filters.
            </p>
            {onResetFilters && (
              <button
                type="button"
                onClick={() => {
                  resetToFirstPage();
                  onResetFilters();
                  if (onSearchChange) onSearchChange('');
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-blue hover:bg-brand-navy text-white px-5 py-2.5 text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <i className="fa-solid fa-rotate-left" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        )}

        {/* ── Modern Pagination Controls ── */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
            >
              <i className="fa-solid fa-chevron-left text-[10px]" /> Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              // Only show pages around current page
              if (
                p === 1 ||
                p === totalPages ||
                (p >= currentPage - 1 && p <= currentPage + 1)
              ) {
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goToPage(p)}
                    className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
                      currentPage === p
                        ? 'bg-brand-blue text-white shadow-xs'
                        : 'border border-gray-200 bg-white text-slate-700 hover:bg-gray-50 shadow-2xs'
                    }`}
                  >
                    {p}
                  </button>
                );
              }
              if (p === currentPage - 2 || p === currentPage + 2) {
                return (
                  <span key={p} className="text-gray-400 px-1 text-xs">
                    …
                  </span>
                );
              }
              return null;
            })}

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
            >
              Next <i className="fa-solid fa-chevron-right text-[10px]" />
            </button>
          </div>
        )}
      </div>

      {/* ── Slide-Over "More Filters" Drawer Modal ── */}
      {showMoreFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMoreFilters(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-sliders text-brand-blue" />
                  <h3 className="text-base font-bold text-brand-charcoal">All Filters</h3>
                  {activeChips.length > 0 && (
                    <span className="rounded-full bg-brand-blue/10 text-brand-blue px-2 py-0.5 text-xs font-bold">
                      {activeChips.length} Active
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowMoreFilters(false)}
                  className="rounded-xl p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <i className="fa-solid fa-xmark text-lg" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {customSidebar || renderSidebarContent()}
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3 bg-gray-50">
                {onResetFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      onResetFilters();
                      resetToFirstPage();
                    }}
                    className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowMoreFilters(false)}
                  className="rounded-xl bg-brand-blue px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy shadow-xs transition-colors ml-auto cursor-pointer"
                >
                  Show Results ({sortedItems.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
