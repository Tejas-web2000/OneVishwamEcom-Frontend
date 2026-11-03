import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cities, getCityLabel } from '../../constants/locations';
import { useLocation } from '../../store/locationSlice';
import { matchesSearch } from '../../utils/searchUtils';

const CATEGORY_TABS = [
  { id: 'all',                    label: 'All Categories', icon: 'fa-solid fa-shapes',         href: '/categories' },
  { id: 'properties',             label: 'Properties',   icon: 'fa-solid fa-house-chimney', href: '/categories/properties' },
  { id: 'automobile',             label: 'Automobiles',  icon: 'fa-solid fa-car',            href: '/categories/automobile' },
  { id: 'consumer-electronics',   label: 'Electronics',  icon: 'fa-solid fa-tv',             href: '/categories/consumer-electronics' },
  { id: 'bedding-comfort',        label: 'Comfort',      icon: 'fa-solid fa-bed',            href: '/categories/bedding-comfort' },
  { id: 'finance-lending',        label: 'Finance',      icon: 'fa-solid fa-building-columns', href: '/categories/finance-lending' },
];

const POPULAR_CHIPS = [
  'Gated Plots Bengaluru',
  'Commercial Spaces',
  'Maruti Brezza',
  'Orthopedic Mattress',
  '5 Star AC',
  'Home Loan',
];

const BADGE_CLS = {
  Properties:       'bg-blue-100 text-blue-800 border-blue-200',
  Automobiles:      'bg-emerald-100 text-emerald-800 border-emerald-200',
  Vehicles:         'bg-emerald-100 text-emerald-800 border-emerald-200',
  Electronics:      'bg-rose-100 text-rose-800 border-rose-200',
  Comfort:          'bg-purple-100 text-purple-800 border-purple-200',
  Bedding:          'bg-purple-100 text-purple-800 border-purple-200',
  'Finance & Loans': 'bg-amber-100 text-amber-900 border-amber-200',
};

export default function CategorySearchHero() {
  const [internalQuery, setInternalQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);

  const cityDropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { selectedCity, selectCity: setLocationCity } = useLocation();

  useEffect(() => {
    const handler = (e) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowResultsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInputChange = (e) => {
    setInternalQuery(e.target.value);
    setShowResultsDropdown(true);
  };

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowResultsDropdown(false);
    const q = internalQuery.trim();
    const routeMap = {
      properties: '/our-services/properties',
      automobile: '/our-services/automobile',
      'consumer-electronics': '/our-services/consumer-electronics',
      'bedding-comfort': '/our-services/bedding-comfort',
      'finance-lending': '/our-services/finance-lending',
    };
    const base = routeMap[activeCategory] || '/our-services/properties';
    navigate(`${base}${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  };

  const handleChipClick = (chipText) => {
    setInternalQuery(chipText);
    setShowResultsDropdown(true);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setInternalQuery('');
    setShowResultsDropdown(false);
    inputRef.current?.focus();
  };

  const isDropdownOpen = showResultsDropdown && internalQuery.trim().length >= 2;

  return (
    <section className="relative bg-gradient-to-b from-[#d9ebfa] via-[#e8f2fb] to-[#cfe4f6] py-12 sm:py-16 lg:py-20 border-t border-b border-sky-200/90 shadow-sm overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[380px] bg-gradient-to-tr from-sky-300/35 via-blue-200/25 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-96 h-96 bg-sky-300/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-sky-300/80 px-3.5 py-1 text-[11px] font-extrabold text-brand-blue shadow-2xs mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
            Universal Marketplace Search
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-950 leading-tight max-w-3xl mx-auto">
            Find Anything You Need{' '}
            <span className="text-brand-blue underline decoration-brand-blue/40 decoration-4 underline-offset-4">
              Near You
            </span>
          </h2>

          <p className="mt-2 text-sm sm:text-base text-slate-600 font-semibold max-w-2xl mx-auto leading-relaxed">
            Search verified properties, vehicles, electronics, bedding &amp; loans in{' '}
            <strong className="text-slate-900">{getCityLabel(selectedCity)}</strong> — instantly.
          </p>

          <div className="mt-8 space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/25 scale-[1.03]'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/70'
                    }`}
                  >
                    <i className={`${tab.icon} text-[10px] ${isActive ? 'text-slate-900' : 'text-amber-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div ref={searchContainerRef} className="relative">
              <form
                onSubmit={handleSearchSubmit}
                className={`bg-white flex flex-col sm:flex-row items-stretch gap-2 p-2 sm:p-2.5 rounded-2xl shadow-2xl transition-all ${
                  isDropdownOpen
                    ? 'ring-4 ring-amber-400/30 rounded-b-none border border-b-0 border-slate-200/80'
                    : 'border border-slate-200/60'
                }`}
              >
                <div className="relative flex-1 flex items-center min-w-0">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 text-slate-400 text-sm pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={internalQuery}
                    onChange={handleInputChange}
                    onFocus={() => setShowResultsDropdown(true)}
                    placeholder="Search properties, cars, ACs, mattresses, loans…"
                    className="w-full rounded-xl border-0 pl-11 pr-10 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                  />
                  {internalQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                      aria-label="Clear search"
                    >
                      <i className="fa-solid fa-xmark text-[10px]" />
                    </button>
                  )}
                </div>

                <div
                  className="relative shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-2"
                  ref={cityDropdownRef}
                >
                  <button
                    type="button"
                    onClick={() => setShowCityDropdown(!showCityDropdown)}
                    className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-xl px-3.5 py-3 text-xs font-extrabold text-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-location-dot text-brand-blue text-xs" />
                      <span>{getCityLabel(selectedCity)}</span>
                    </div>
                    <i
                      className={`fa-solid fa-chevron-down text-slate-400 text-[10px] transition-transform ${
                        showCityDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showCityDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl z-50 border border-slate-100 overflow-hidden py-1 text-left">
                      {Object.entries(cities).map(([id, city]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => { setLocationCity(id); setShowCityDropdown(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                            selectedCity === id
                              ? 'bg-blue-50 text-brand-blue'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{city.label}</span>
                          {selectedCity === id && <i className="fa-solid fa-check text-[10px] text-brand-blue" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 px-6 py-3 text-sm font-black shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                >
                  <i className="fa-solid fa-magnifying-glass text-xs" />
                  Search
                </button>
              </form>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <i className="fa-solid fa-fire text-amber-400 text-[10px]" /> Trending:
              </span>
              {POPULAR_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1 text-[11px] font-semibold border border-slate-700/60 transition-all cursor-pointer active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800/60 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-circle-check text-emerald-400" />
              100% Verified Sellers
            </span>
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-shield-halved text-amber-400" />
              Direct Showroom Pricing
            </span>
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-headset text-blue-400" />
              Instant Support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
