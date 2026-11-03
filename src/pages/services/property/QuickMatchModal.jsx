import { useState, useMemo } from 'react';
import { navigateTo } from '../../../config/navigation';
import { useProperties } from '../../../hooks/useProperties';
import { cities } from '../../../constants/locations';
import { getTotalPropertyPrice, getNumericPrice, matchesBudgetRange } from './propertyHelpers';

function getCardType(property) {
  const s = property.subtitle.toLowerCase();
  const b = property.bhk.toLowerCase();
  if (s.includes('villa') || s.includes('farmhouse')) return 'Villa';
  if (b.includes('office') || b.includes('shop') || b.includes('commercial') ||
      s.includes('office') || s.includes('shop') || s.includes('commercial')) return 'Flat';
  if (s.includes('plot') || s.includes('site') || s.includes('land')) return 'Sites';
  if (s.includes('flat') || s.includes('apartment') || s.includes('penthouse') || b.includes('bhk')) return 'Flat';
  if (s.includes('house')) return 'Independent House';
  return 'Flat';
}

function getBedroomNumber(bhk) {
  const m = bhk?.match(/(\d+(\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function matchesBedroom(bhk, selected) {
  if (!selected) return true;
  if (selected === '4BHK+') return getBedroomNumber(bhk) >= 4;
  return getBedroomNumber(bhk) === getBedroomNumber(selected);
}

const CITY_OPTIONS = [{ id: 'bengaluru', label: 'Bangalore' }];
const PROPERTY_TYPES = [
  'Residential',
  'Flat',
  'Independent House',
  'Plot',
  'Land',
  'Agricultural',
  'Commercial',
  'Industrial',
];
const BEDROOM_OPTIONS = ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '4BHK+'];

/* ── Component ── */

function QuickMatchModal({ onClose }) {
  const { properties } = useProperties();
  const [step, setStep] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  /* All filter fields are optional */
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  const areas = city ? (cities[city]?.areas || []) : [];
  const hasAnyFilter = budgetMin || budgetMax || propertyType || city || location || bedrooms;
  const availableCount = properties.filter((p) => p.status !== 'closed').length;

  const handleFindMatch = () => setStep(2);

  const handleBrowseAll = () => {
    onClose();
    navigateTo('/property');
  };

  const handleClose = () => {
    if (step === 3) { onClose(); return; }
    if (step === 2) { setStep(3); return; }
    onClose();
  };

  /* ── Step 2: Compute filtered buckets ── */
  const buckets = useMemo(() => {
    const preApproved = [];
    const matched = [];
    const closed = [];

    properties.forEach((p) => {
      const price = getNumericPrice(p.price);
      const cardType = getCardType(p);

      const budgetMatch = matchesBudgetRange(
        p,
        budgetMin ? +budgetMin * 100000 : null,
        budgetMax ? +budgetMax * 100000 : null
      );
      const rawProp = String(p.propertyType || p.subcategory || '').toLowerCase();
      const cardTypeLower = String(cardType || '').toLowerCase();
      const typeMatch = !propertyType || (
        propertyType === 'Flat'
          ? (cardTypeLower.includes('flat') || cardTypeLower.includes('villa') || rawProp.includes('flat') || rawProp.includes('villa') || rawProp.includes('apartment'))
          : propertyType === 'Plot'
          ? (cardTypeLower.includes('site') || cardTypeLower.includes('plot') || rawProp.includes('plot') || rawProp.includes('layout') || rawProp.includes('plat'))
          : propertyType === 'Land'
          ? (rawProp.includes('land') && !rawProp.includes('agri'))
          : propertyType === 'Independent House'
          ? (rawProp.includes('house') || rawProp.includes('independent'))
          : propertyType === 'Agricultural'
          ? (rawProp.includes('agri') || rawProp.includes('farm'))
          : propertyType === 'Commercial'
          ? (rawProp.includes('commercial') || cardTypeLower.includes('commercial'))
          : propertyType === 'Industrial'
          ? (rawProp.includes('industrial') || cardTypeLower.includes('industrial'))
          : (rawProp.includes(propertyType.toLowerCase()) || cardTypeLower.includes(propertyType.toLowerCase()))
      );
      const cityMatch = !city || p.city === city;
      const locationMatch = !location || p.zone === location;
      const bedroomMatch = matchesBedroom(p.bhk, bedrooms);
      const allMatch = budgetMatch && typeMatch && cityMatch && locationMatch && bedroomMatch;

      if (p.status === 'closed') {
        if (allMatch) closed.push(p);
      } else if (p.loanApproved && allMatch) {
        preApproved.push(p);
      } else if (allMatch) {
        matched.push(p);
      }
    });

    return { preApproved, matched, closed };
  }, [properties, budgetMin, budgetMax, propertyType, city, location, bedrooms]);

  const totalResults = buckets.preApproved.length + buckets.matched.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-brand-charcoal">
            {step === 1 && 'Find Your Property'}
            {step === 2 && `${totalResults} Properties Found`}
            {step === 3 && "You're All Set!"}
          </h2>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <i className="fa-solid fa-xmark text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ═══ Step 1 — Browse first, optional filters ═══ */}
          {step === 1 && (
            <div className="space-y-4">

              {/* Primary CTA — browse without filling any form */}
              <div className="rounded-xl bg-brand-blue/5 border border-brand-blue/15 p-4">
                <p className="text-sm font-bold text-brand-charcoal mb-1">
                  <i className="fa-solid fa-building-user text-brand-blue mr-2" />
                  {availableCount} Properties Available
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Browse all listings now, or use the optional filters below to narrow your search.
                </p>
                <button
                  onClick={handleBrowseAll}
                  className="w-full rounded-xl bg-brand-blue py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-arrow-right" />
                  Browse All Properties
                </button>
              </div>

              {/* Optional filters toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-sliders text-brand-blue" />
                  {showFilters ? 'Hide Filters' : 'Refine with Filters'}
                  <span className="text-xs font-normal text-gray-400">(optional)</span>
                </span>
                <i className={`fa-solid fa-chevron-down text-xs transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Collapsible filter form */}
              {showFilters && (
                <div className="space-y-4 pt-1">
                  <p className="text-xs text-gray-400 text-center">
                    All fields below are optional — fill only what matters to you
                  </p>

                  {/* Budget */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-brand-charcoal">
                      Budget Range
                      <span className="text-xs font-normal text-gray-400 ml-1">(₹ in Lakhs, optional)</span>
                    </label>
                    <div className="flex gap-3">
                      <input type="number" placeholder="Min" value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-blue" />
                      <input type="number" placeholder="Max" value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-blue" />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-brand-charcoal">
                      Property Type
                      <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PROPERTY_TYPES.map((pt) => (
                        <label key={pt} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer transition-colors ${
                          propertyType === pt
                            ? 'border-brand-blue bg-brand-blue/5 text-brand-blue font-semibold'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                          <input type="radio" name="qmPropertyType" checked={propertyType === pt}
                            onChange={() => setPropertyType(propertyType === pt ? '' : pt)}
                            className="sr-only" />
                          {pt}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-brand-charcoal">
                      City
                      <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
                    </label>
                    <select value={city} onChange={(e) => { setCity(e.target.value); setLocation(''); }}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-blue bg-white">
                      <option value="">Any City</option>
                      {CITY_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location — only appears after city is chosen */}
                  {city && (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-brand-charcoal">
                        Area / Locality
                        <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
                      </label>
                      <select value={location} onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-blue bg-white">
                        <option value="">Any Area</option>
                        {areas.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Bedrooms */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-brand-charcoal">
                      Bedrooms
                      <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {BEDROOM_OPTIONS.map((b) => (
                        <button key={b} onClick={() => setBedrooms(bedrooms === b ? '' : b)}
                          className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                            bedrooms === b
                              ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {hasAnyFilter && (
                    <button
                      onClick={() => { setBudgetMin(''); setBudgetMax(''); setPropertyType(''); setCity(''); setLocation(''); setBedrooms(''); }}
                      className="text-xs text-red-500 font-semibold hover:underline"
                    >
                      Clear All Filters
                    </button>
                  )}

                  <button onClick={handleFindMatch}
                    className="w-full rounded-xl bg-brand-blue py-3 text-sm font-bold text-white hover:bg-brand-navy transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                    <i className="fa-solid fa-magnifying-glass" />
                    Find Matching Properties
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══ Step 2 — Results ═══ */}
          {step === 2 && (
            <div className="space-y-6">
              {totalResults === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <i className="fa-solid fa-building text-4xl mb-3" />
                  <p className="text-lg font-medium">No matching properties found.</p>
                  <p className="text-sm mt-1">Try adjusting your filters.</p>
                  <button onClick={() => setStep(1)} className="mt-4 text-sm text-brand-blue font-semibold hover:underline">
                    ← Adjust Filters
                  </button>
                </div>
              )}

              {/* Pre-Approved bucket */}
              {buckets.preApproved.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700 mb-3">
                    <i className="fa-solid fa-circle-check" />
                    Pre-Approved Loan ({buckets.preApproved.length})
                  </h3>
                  <div className="space-y-2">
                    {buckets.preApproved.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-brand-charcoal truncate">{p.title}</p>
                          <p className="text-xs text-gray-500 truncate">{p.location}</p>
                          <p className="text-xs font-semibold text-emerald-700 mt-0.5">Price on Request</p>
                        </div>
                        <button onClick={() => navigateTo(`/property/${p.id}`)}
                          className="ml-3 shrink-0 rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available bucket */}
              {buckets.matched.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-brand-charcoal mb-3">
                    <i className="fa-solid fa-house" />
                    Available Properties ({buckets.matched.length})
                  </h3>
                  <div className="space-y-2">
                    {buckets.matched.slice(0, 8).map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-brand-charcoal truncate">{p.title}</p>
                          <p className="text-xs text-gray-500 truncate">{p.location}</p>
                          <p className="text-xs font-semibold text-emerald-700 mt-0.5">Price on Request</p>
                        </div>
                        <button onClick={() => navigateTo(`/property/${p.id}`)}
                          className="ml-3 shrink-0 rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
                          View
                        </button>
                      </div>
                    ))}
                    {buckets.matched.length > 8 && (
                      <p className="text-xs text-center text-gray-400 pt-1">
                        +{buckets.matched.length - 8} more — browse all below
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  ← Adjust Filters
                </button>
                <button onClick={handleBrowseAll}
                  className="flex-1 rounded-xl bg-brand-blue py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                  Browse All
                </button>
              </div>
            </div>
          )}

          {/* ═══ Step 3 — Success CTA ═══ */}
          {step === 3 && (
            <div className="text-center py-6 space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <i className="fa-solid fa-check text-2xl text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-brand-charcoal">Properties Matched!</p>
                <p className="mt-1 text-sm text-gray-500">
                  {buckets.preApproved.length} pre-approved · {buckets.matched.length} available
                </p>
              </div>
              <div className="space-y-3">
                <button onClick={() => navigateTo('/contact-us/')}
                  className="w-full rounded-xl bg-brand-blue py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                  Contact Agent
                </button>
                <button onClick={handleBrowseAll}
                  className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Browse All Listings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuickMatchModal;
