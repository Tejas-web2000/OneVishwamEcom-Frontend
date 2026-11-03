import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useVehicleById, useSimilarVehicles } from './automobileHooks';
import MasterDetailPage from '../../../components/common/templates/MasterDetailPage';
import { mapVehicleToEntityItem } from '../../../components/common/templates/adapters';

function isAutoVariant(name = '') {
  const upper = name.toUpperCase();
  return upper.includes('AGS') || upper.includes(' 6AT') || upper.includes(' AT') || upper.includes('AUTOMATIC');
}

function isCngVariant(name = '') {
  return name.toUpperCase().includes('CNG');
}

export default function VehicleDetails() {
  const { pathname } = useLocation();
  const params = useParams();
  const pathParts = pathname.split('/').filter(Boolean);
  const vehicleId = params.id || (pathParts.length > 1 ? pathParts[1] : null);

  const { vehicle, loading, error } = useVehicleById(vehicleId);
  const { similar } = useSimilarVehicles(vehicleId);

  const mappedVehicle = useMemo(() => {
    if (!vehicle) return null;
    return mapVehicleToEntityItem(vehicle);
  }, [vehicle]);

  const mappedSimilar = useMemo(() => {
    if (!similar || !Array.isArray(similar)) return [];
    return similar.map(mapVehicleToEntityItem).filter(Boolean);
  }, [similar]);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [filterType, setFilterType] = useState('ALL');

  // Reset selected variant whenever vehicle changes
  useEffect(() => {
    setSelectedVariantIndex(0);
    setFilterType('ALL');
  }, [vehicleId]);

  const variants = vehicle?.variants || mappedVehicle?.variants || [];
  const currentVariant = variants[selectedVariantIndex] || variants[0] || null;

  // Filtered variant list for comparison table
  const filteredVariants = useMemo(() => {
    if (!variants.length) return [];
    if (filterType === 'PETROL') return variants.filter((v) => !isCngVariant(v.variant));
    if (filterType === 'CNG') return variants.filter((v) => isCngVariant(v.variant));
    if (filterType === 'MANUAL') return variants.filter((v) => !isAutoVariant(v.variant));
    if (filterType === 'AUTOMATIC') return variants.filter((v) => isAutoVariant(v.variant));
    return variants;
  }, [variants, filterType]);

  const counts = useMemo(() => {
    return {
      all: variants.length,
      petrol: variants.filter((v) => !isCngVariant(v.variant)).length,
      cng: variants.filter((v) => isCngVariant(v.variant)).length,
      manual: variants.filter((v) => !isAutoVariant(v.variant)).length,
      automatic: variants.filter((v) => isAutoVariant(v.variant)).length,
    };
  }, [variants]);

  // Dynamically update vehicle display based on chosen variant
  const displayedVehicle = useMemo(() => {
    if (!mappedVehicle) return null;
    if (!currentVariant) return mappedVehicle;

    const isAuto = isAutoVariant(currentVariant.variant);
    const isCNG = isCngVariant(currentVariant.variant);
    const transmissionText = isAuto
      ? currentVariant.variant.toUpperCase().includes('6AT')
        ? 'Automatic (6AT)'
        : 'Automatic (AGS)'
      : '5-Speed Manual';
    const fuelText = isCNG ? 'Factory S-CNG' : 'Petrol';

    return {
      ...mappedVehicle,
      subtitle: `${currentVariant.variant} · ${transmissionText} · ${fuelText} · Kalyani Motors Bangalore`,
      fuelType: fuelText,
      transmission: transmissionText,
      statusBadges: [
        { label: 'Brand New', variant: 'green' },
        { label: transmissionText, variant: 'blue' },
        { label: fuelText, variant: 'amber' },
        { label: 'Kalyani Motors', variant: 'blue' },
      ],
      cardPills: [transmissionText, fuelText],
      keyAttributes: [
        { label: 'Selected Variant', value: currentVariant.variant },
        { label: 'Transmission', value: transmissionText },
        { label: 'Fuel System', value: isCNG ? 'Bi-Fuel S-CNG & Petrol' : 'Petrol' },
        { label: 'Dealership', value: 'Kalyani Motors, Bangalore' },
      ],
      overviewHighlights: [
        { label: 'Selected Variant', value: currentVariant.variant, icon: 'fa-car-side', color: 'text-blue-600 bg-blue-50' },
        { label: 'Powertrain & Gearbox', value: `${fuelText} · ${transmissionText}`, icon: 'fa-gear', color: 'text-cyan-600 bg-cyan-50' },
        { label: 'Standard Safety', value: '6 Airbags Standard Across All Variants', icon: 'fa-shield-halved', color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Authorized Dealership', value: 'Kalyani Motors Pvt Ltd, Bangalore', icon: 'fa-building', color: 'text-teal-600 bg-teal-50' },
      ],
    };
  }, [mappedVehicle, currentVariant]);

  // Header Dropdown Component
  const headerVariantDropdown = variants.length > 0 && (
    <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5 w-full">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="variant-select-header" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <i className="fa-solid fa-car-side text-brand-blue" />
          <span>Select Variant ({variants.length} Trims Available):</span>
        </label>
      </div>

      <div className="relative">
        <select
          id="variant-select-header"
          value={selectedVariantIndex}
          onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
          className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-bold text-brand-charcoal focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all cursor-pointer shadow-2xs"
        >
          {variants.map((v, idx) => (
            <option key={idx} value={idx}>
              {v.variant}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500">
          <i className="fa-solid fa-chevron-down text-xs" />
        </div>
      </div>

      {currentVariant && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
            <i className="fa-solid fa-gear text-brand-blue text-[10px]" />
            {isAutoVariant(currentVariant.variant) ? 'Automatic (AGS / AT)' : '5-Speed Manual'}
          </span>
          <span className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
            <i className="fa-solid fa-gas-pump text-emerald-600 text-[10px]" />
            {isCngVariant(currentVariant.variant) ? 'Factory S-CNG' : 'Petrol'}
          </span>
        </div>
      )}
    </div>
  );

  // Dedicated Variant Dashboard & Specs Table
  const variantDashboard = variants.length > 0 && currentVariant && (
    <section className="rounded-3xl bg-white border border-gray-200/70 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center text-base">
            <i className="fa-solid fa-car" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-brand-charcoal">
              Variant Lineup & Specifications
            </h2>
            <p className="text-xs text-gray-500">
              Official Kalyani Motors Bangalore Schedule
            </p>
          </div>
        </div>

        {/* Dropdown Selector in Module */}
        <div className="relative min-w-[260px] sm:w-auto">
          <select
            value={selectedVariantIndex}
            onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
            className="w-full appearance-none rounded-xl border border-gray-300 bg-gray-50/80 px-3.5 py-2 pr-9 text-xs font-bold text-brand-charcoal hover:bg-white focus:bg-white focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all cursor-pointer shadow-2xs"
          >
            {variants.map((v, idx) => (
              <option key={idx} value={idx}>
                {v.variant}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <i className="fa-solid fa-chevron-down text-[10px]" />
          </div>
        </div>
      </div>

      {/* Selected Variant Highlight Card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-blue">
            Selected Variant
          </span>
          <h3 className="text-base sm:text-lg font-black text-brand-charcoal mt-0.5">
            {currentVariant.variant}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="rounded-full bg-blue-100/70 text-blue-800 text-xs font-bold px-3 py-1">
              {isAutoVariant(currentVariant.variant) ? 'Automatic (AGS / AT)' : '5-Speed Manual'}
            </span>
            <span className="rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-bold px-3 py-1">
              {isCngVariant(currentVariant.variant) ? 'Factory S-CNG' : 'Petrol Engine'}
            </span>
            <span className="rounded-full bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1">
              6 Airbags Standard
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent('onevishwam:open_enquiry_modal', {
                detail: { title: `${vehicle?.title || 'Vehicle'} - ${currentVariant.variant}` },
              })
            );
          }}
          className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 px-5 py-2.5 text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <i className="fa-solid fa-handshake-angle text-xs" />
          <span>Are You Interested?</span>
        </button>
      </div>

      {/* Variant Filter Tabs & Table */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-brand-charcoal flex items-center gap-2">
            <i className="fa-solid fa-list-check text-brand-blue" />
            All {variants.length} Variants for {mappedVehicle.title}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterType('ALL')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-brand-blue text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({counts.all})
            </button>
            {counts.petrol > 0 && (
              <button
                onClick={() => setFilterType('PETROL')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  filterType === 'PETROL'
                    ? 'bg-brand-blue text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Petrol ({counts.petrol})
              </button>
            )}
            {counts.cng > 0 && (
              <button
                onClick={() => setFilterType('CNG')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  filterType === 'CNG'
                    ? 'bg-brand-blue text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                S-CNG ({counts.cng})
              </button>
            )}
            {counts.manual > 0 && (
              <button
                onClick={() => setFilterType('MANUAL')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  filterType === 'MANUAL'
                    ? 'bg-brand-blue text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Manual ({counts.manual})
              </button>
            )}
            {counts.automatic > 0 && (
              <button
                onClick={() => setFilterType('AUTOMATIC')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  filterType === 'AUTOMATIC'
                    ? 'bg-brand-blue text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Automatic ({counts.automatic})
              </button>
            )}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/90 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Variant Name</th>
                <th className="py-3 px-3">Fuel</th>
                <th className="py-3 px-3">Transmission</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredVariants.map((item) => {
                const originalIndex = variants.findIndex((v) => v.variant === item.variant);
                const isSelected = originalIndex === selectedVariantIndex;

                return (
                  <tr
                    key={item.variant}
                    onClick={() => setSelectedVariantIndex(originalIndex)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 font-bold text-brand-blue'
                        : 'hover:bg-gray-50/80 text-brand-charcoal'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold">
                      <div className="flex items-center gap-2">
                        {isSelected && <i className="fa-solid fa-circle-check text-brand-blue text-xs" />}
                        <span>{item.variant}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isCngVariant(item.variant) ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {isCngVariant(item.variant) ? 'S-CNG' : 'Petrol'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-gray-600">
                        {isAutoVariant(item.variant) ? 'Automatic' : 'Manual'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isSelected ? (
                        <span className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[10px] font-extrabold inline-flex items-center gap-1 shadow-2xs">
                          <i className="fa-solid fa-check text-[9px]" /> Selected
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-brand-blue hover:text-brand-blue px-2.5 py-1 text-[10px] font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          Select
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  return (
    <MasterDetailPage
      item={displayedVehicle}
      categoryName="Automobiles"
      categoryLink="/categories/automobile"
      similarItems={mappedSimilar}
      itemLinkPrefix="/vehicle/"
      loading={loading}
      error={error}
      bentoTitle="Vehicle Key Specifications & Verified Details"
      featuresTitle="Factory Installed Equipment & Features"
      headerExtra={headerVariantDropdown}
    >
      {variantDashboard}
    </MasterDetailPage>
  );
}