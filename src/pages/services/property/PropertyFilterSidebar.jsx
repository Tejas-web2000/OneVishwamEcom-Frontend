import { useState, useMemo } from 'react';
import { CollapsibleSection, CheckboxGroup } from '../../../components/ui';
import {
  BEDROOM_OPTIONS, FURNISHING_OPTIONS,
  POSTED_BY_OPTIONS, POSSESSION_OPTIONS, AMENITIES_LIST, FACING_OPTIONS,
  AGE_OPTIONS, AVAILABILITY_OPTIONS, PROPERTY_TYPE_OPTIONS,
} from './propertyConstants';
import { getDynamicSizePresets } from './propertyHelpers';

function formatSizeLabel(val) {
  const num = Number(val);
  if (!num || isNaN(num) || num <= 0) return '0 sq.ft';
  return `${num.toLocaleString('en-IN')} sq.ft`;
}


function DualRangeSlider({
  min = 0,
  max = 10000,
  step = 50,
  minVal,
  maxVal,
  onChange,
  formatLabel = formatSizeLabel,
  maxLabel,
}) {
  const currentMin = minVal !== '' && !isNaN(minVal) ? Number(minVal) : min;
  const currentMax = maxVal !== '' && !isNaN(maxVal) ? Number(maxVal) : max;

  const rangeSpan = Math.max(1, max - min);
  const minPercent = Math.max(0, Math.min(100, ((currentMin - min) / rangeSpan) * 100));
  const maxPercent = Math.max(0, Math.min(100, ((currentMax - min) / rangeSpan) * 100));

  return (
    <div className="my-2.5 px-1">
      <div className="flex items-center justify-between text-xs font-bold text-brand-blue mb-2">
        <span className="bg-brand-blue/10 px-2 py-0.5 rounded-md">{formatLabel(currentMin)}</span>
        <span className="text-gray-400 font-normal text-[10px]">to</span>
        <span className="bg-brand-blue/10 px-2 py-0.5 rounded-md">
          {currentMax >= max && maxLabel ? maxLabel : formatLabel(currentMax)}
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
          className="pointer-events-none absolute left-0 w-full h-2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-blue [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-blue [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
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
          className="pointer-events-none absolute left-0 w-full h-2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-blue [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-blue [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
    </div>
  );
}

/**
 * Reusable filter sidebar — used by both desktop aside and mobile drawer.
 */
export default function PropertyFilterSidebar({
  filters,
  updateFilter,
  openSections,
  toggleSection,
  activeChips = [],
  resetFilters,
  cityAreas = [],
  noCityMessage,
  sizeBounds = { min: 600, max: 10000 },
  sizePresets = [],
}) {
  const [localitySearch, setLocalitySearch] = useState('');
  const sizeStep = Math.max(10, (sizeBounds.max - sizeBounds.min) > 5000 ? 100 : 50);

  const effectiveSizePresets = useMemo(() => {
    if (Array.isArray(sizePresets) && sizePresets.length > 0) return sizePresets;
    return getDynamicSizePresets([], sizeBounds);
  }, [sizePresets, sizeBounds]);

  // Filtered localities based on search input
  const filteredLocalities = useMemo(() => {
    if (!localitySearch.trim()) return cityAreas;
    const q = localitySearch.toLowerCase().trim();
    return cityAreas.filter((a) => a.toLowerCase().includes(q));
  }, [cityAreas, localitySearch]);


  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-sliders text-brand-blue text-xs" />
          <span className="text-sm font-bold text-brand-charcoal">Filter Properties</span>
          {activeChips.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-bold flex items-center justify-center">
              {activeChips.length}
            </span>
          )}
        </div>
        {activeChips.length > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-rose-500 hover:text-rose-700 font-bold hover:underline cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>


      {/* ── 2. Property Size (sq.ft) Section ── */}
      <CollapsibleSection
        id="size"
        label="Property Size (sq.ft)"
        open={openSections.size}
        onToggle={toggleSection}
      >
        {/* Quick Size Preset Pills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {effectiveSizePresets.map((s) => {
            const isMatch =
              String(filters.sizeMin) === String(s.min) &&
              String(filters.sizeMax) === String(s.max);
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  if (isMatch) {
                    updateFilter('sizeMin', '');
                    updateFilter('sizeMax', '');
                  } else {
                    updateFilter('sizeMin', String(s.min));
                    updateFilter('sizeMax', String(s.max));
                  }
                }}
                className={`text-[11px] px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                  isMatch
                    ? 'border-brand-blue bg-brand-blue text-white font-bold shadow-2xs'
                    : 'border-gray-200 text-gray-600 bg-white hover:border-brand-blue/40 hover:bg-gray-50'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Dual Range Size Slider */}
        <DualRangeSlider
          min={sizeBounds.min}
          max={sizeBounds.max}
          step={sizeStep}
          minVal={filters.sizeMin}
          maxVal={filters.sizeMax}
          formatLabel={formatSizeLabel}
          maxLabel={`${formatSizeLabel(sizeBounds.max)}+`}
          onChange={(minVal, maxVal) => {
            updateFilter('sizeMin', minVal);
            updateFilter('sizeMax', maxVal);
          }}
        />

        <div className="flex gap-2 mt-3">
          <div className="w-full">
            <label className="text-[10px] font-semibold text-gray-400 block mb-0.5">Min Area</label>
            <input
              type="number"
              placeholder={`Min (${formatSizeLabel(sizeBounds.min)})`}
              value={filters.sizeMin || ''}
              onChange={(e) => updateFilter('sizeMin', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-brand-blue bg-white"
            />
            {filters.sizeMin > 0 && (
              <span className="text-[10px] text-brand-blue font-semibold block mt-0.5 pl-1 truncate">
                {formatSizeLabel(filters.sizeMin)}
              </span>
            )}
          </div>

          <div className="w-full">
            <label className="text-[10px] font-semibold text-gray-400 block mb-0.5">Max Area</label>
            <input
              type="number"
              placeholder={`Max (${formatSizeLabel(sizeBounds.max)})`}
              value={filters.sizeMax || ''}
              onChange={(e) => updateFilter('sizeMax', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-brand-blue bg-white"
            />
            {filters.sizeMax > 0 && (
              <span className="text-[10px] text-brand-blue font-semibold block mt-0.5 pl-1 truncate">
                {formatSizeLabel(filters.sizeMax)}
              </span>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* ── 3. Bedrooms (BHK) Section ── */}
      <CollapsibleSection
        id="bedrooms"
        label="Bedrooms (BHK)"
        open={openSections.bedrooms}
        onToggle={toggleSection}
      >
        <div className="flex flex-wrap gap-1.5">
          {BEDROOM_OPTIONS.map((b) => {
            const active = filters.bedrooms.includes(b);
            return (
              <button
                key={b}
                type="button"
                onClick={() => {
                  const next = active
                    ? filters.bedrooms.filter((x) => x !== b)
                    : [...filters.bedrooms, b];
                  updateFilter('bedrooms', next);
                }}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  active
                    ? 'border-brand-blue bg-brand-blue text-white font-bold shadow-2xs'
                    : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* ── 4. Localities / Zones Section with Inline Search ── */}
      <CollapsibleSection
        id="localities"
        label="Localities / Zones"
        open={openSections.localities}
        onToggle={toggleSection}
      >
        {cityAreas.length === 0 ? (
          <p className="text-xs text-gray-400 italic">{noCityMessage || 'No areas available for current selection.'}</p>
        ) : (
          <div className="space-y-2">
            {/* Search within localities */}
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]" />
              <input
                type="text"
                value={localitySearch}
                onChange={(e) => setLocalitySearch(e.target.value)}
                placeholder="Search area (e.g. Whitefield)..."
                className="w-full pl-7 pr-7 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-blue outline-none transition-all placeholder:text-gray-400"
              />
              {localitySearch && (
                <button
                  type="button"
                  onClick={() => setLocalitySearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  <i className="fa-solid fa-xmark text-[10px]" />
                </button>
              )}
            </div>

            {/* Checkbox list with scroll container */}
            <div className="max-h-52 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
              {filteredLocalities.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic py-2 text-center">No area matches &quot;{localitySearch}&quot;</p>
              ) : (
                <CheckboxGroup
                  options={filteredLocalities}
                  selected={filters.localities}
                  onChange={(v) => updateFilter('localities', v)}
                />
              )}
            </div>
            {filters.localities.length > 0 && (
              <p className="text-[10px] font-semibold text-brand-blue pt-1">
                {filters.localities.length} area(s) selected
              </p>
            )}
          </div>
        )}
      </CollapsibleSection>

      {/* ── 5. Property Type ── */}
      <CollapsibleSection
        id="propertyType"
        label="Property Type"
        open={openSections.propertyType}
        onToggle={toggleSection}
      >
        <CheckboxGroup
          options={PROPERTY_TYPE_OPTIONS}
          selected={filters.propertyType}
          onChange={(v) => updateFilter('propertyType', v)}
        />
      </CollapsibleSection>

      {/* ── 7. Furnishing ── */}
      <CollapsibleSection
        id="furnishing"
        label="Furnishing"
        open={openSections.furnishing}
        onToggle={toggleSection}
      >
        <CheckboxGroup
          options={FURNISHING_OPTIONS}
          selected={filters.furnishing}
          onChange={(v) => updateFilter('furnishing', v)}
        />
      </CollapsibleSection>

      {/* ── 8. Possession Status ── */}
      <CollapsibleSection
        id="possessionStatus"
        label="Possession Status"
        open={openSections.possessionStatus}
        onToggle={toggleSection}
      >
        <CheckboxGroup
          options={POSSESSION_OPTIONS}
          selected={filters.possessionStatus}
          onChange={(v) => updateFilter('possessionStatus', v)}
        />
      </CollapsibleSection>

      {/* ── 9. Gated Community & Loan Toggles ── */}
      <CollapsibleSection
        id="gatedCommunity"
        label="Community & Loan"
        open={openSections.gatedCommunity}
        onToggle={toggleSection}
      >
        <div className="space-y-2.5">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(filters.gatedCommunity)}
              onChange={(e) => updateFilter('gatedCommunity', e.target.checked)}
              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <span className="font-medium">Gated Community Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(filters.loanApprovedOnly)}
              onChange={(e) => updateFilter('loanApprovedOnly', e.target.checked)}
              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <span className="font-medium">Pre-Approved Loan Available</span>
          </label>
        </div>
      </CollapsibleSection>

      {/* ── 10. Posted By ── */}
      <CollapsibleSection
        id="postedBy"
        label="Posted By"
        open={openSections.postedBy}
        onToggle={toggleSection}
      >
        <CheckboxGroup
          options={POSTED_BY_OPTIONS}
          selected={filters.postedBy}
          onChange={(v) => updateFilter('postedBy', v)}
        />
      </CollapsibleSection>

      {/* ── 11. Facing ── */}
      <CollapsibleSection
        id="facing"
        label="Facing"
        open={openSections.facing}
        onToggle={toggleSection}
      >
        <CheckboxGroup
          options={FACING_OPTIONS}
          selected={filters.facing}
          onChange={(v) => updateFilter('facing', v)}
        />
      </CollapsibleSection>

      {/* ── 12. Amenities ── */}
      <CollapsibleSection
        id="amenities"
        label="Amenities"
        open={openSections.amenities}
        onToggle={toggleSection}
      >
        <div className="max-h-48 overflow-y-auto pr-1 scrollbar-thin">
          <CheckboxGroup
            options={AMENITIES_LIST}
            selected={filters.amenities}
            onChange={(v) => updateFilter('amenities', v)}
          />
        </div>
      </CollapsibleSection>

      {/* ── 13. Property Age ── */}
      <CollapsibleSection
        id="propertyAge"
        label="Property Age"
        open={openSections.propertyAge}
        onToggle={toggleSection}
      >
        <CheckboxGroup
          options={AGE_OPTIONS}
          selected={filters.propertyAge}
          onChange={(v) => updateFilter('propertyAge', v)}
        />
      </CollapsibleSection>

      {/* ── 14. Availability ── */}
      <CollapsibleSection
        id="availability"
        label="Availability"
        open={openSections.availability}
        onToggle={toggleSection}
      >
        <CheckboxGroup
          options={AVAILABILITY_OPTIONS}
          selected={filters.availability}
          onChange={(v) => updateFilter('availability', v)}
        />
      </CollapsibleSection>
    </div>
  );
}
