import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ServiceDetails from './ServiceDetails';
import { serviceItems, serviceIconMap } from '../../constants/servicesContent';
import PageHero from '../../components/PageHero';
import API from '../../services/api';

const ACTIVE_SERVICE_IDS = ['properties', 'automobile', 'consumer-electronics', 'bedding-comfort'];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Products' },
  { id: 'properties', label: 'Properties' },
  { id: 'automobile', label: 'Automobiles' },
  { id: 'consumer-electronics', label: 'Electronics' },
  { id: 'bedding-comfort', label: 'Comfort' },
  { id: 'finance-lending', label: 'Finance' },
];

const CATEGORY_BADGES = {
  properties: 'bg-blue-50 text-blue-700 border border-blue-200',
  automobile: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  vehicles: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'consumer-electronics': 'bg-purple-50 text-purple-700 border border-purple-200',
  'bedding-comfort': 'bg-amber-50 text-amber-700 border border-amber-200',
  'finance-lending': 'bg-sky-50 text-sky-700 border border-sky-200',
};

function ServicesPage() {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const serviceId = pathParts.length > 1 ? pathParts[1] : null;

  const searchParams = new URLSearchParams(location.search);
  const q = (searchParams.get('q') || '').trim();

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCatTab, setSelectedCatTab] = useState('all');

  useEffect(() => {
    if (!q) {
      setSearchResults([]);
      return;
    }

    let isMounted = true;
    setSearchLoading(true);

    API.get('/search', { params: { q, category: 'all', limit: 50 } })
      .then((res) => {
        if (!isMounted) return;
        const items = res.data?.data?.items || res.data?.items || [];
        setSearchResults(items);
      })
      .catch((err) => {
        console.error('Failed to load search results:', err);
        if (isMounted) setSearchResults([]);
      })
      .finally(() => {
        if (isMounted) setSearchLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [q]);

  const filteredResults = useMemo(() => {
    if (selectedCatTab === 'all') return searchResults;
    return searchResults.filter((item) => {
      if (selectedCatTab === 'automobile' || selectedCatTab === 'vehicles') return item.category === 'vehicles' || item.category === 'automobile';
      if (selectedCatTab === 'jewellery') return item.category === 'jewellery' || item.category === 'jewellery-gold';
      if (selectedCatTab === 'properties') return item.category === 'properties';
      if (selectedCatTab === 'consumer-electronics') return item.category === 'consumer-electronics' || item.category === 'electronics';
      if (selectedCatTab === 'bedding-comfort' || selectedCatTab === 'comfort') return item.category === 'bedding-comfort' || item.category === 'bedding';
      if (selectedCatTab === 'finance-lending') return item.category === 'finance-lending' || item.category === 'finance';
      return item.category === selectedCatTab;
    });
  }, [searchResults, selectedCatTab]);

  if (serviceId) {
    const service = serviceItems.find((item) => item.id === serviceId);
    return <ServiceDetails service={service} />;
  }

  const sortedServices = [...serviceItems].sort((a, b) => {
    const aIndex = ACTIVE_SERVICE_IDS.indexOf(a.id);
    const bIndex = ACTIVE_SERVICE_IDS.indexOf(b.id);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  return (
    <div>
      <PageHero
        eyebrow={q ? 'Unified Search Results' : 'Our Services'}
        title={q ? `Results for "${q}"` : 'A Comprehensive Multi Business Ecosystem'}
        subtitle={
          q
            ? `Found ${searchResults.length} verified listings across all OneVishwam marketplace verticals.`
            : 'Explore our diverse divisions in one unified portal. From finance and properties to consumer marketplaces and HR solutions — everything you need under a single ecosystem.'
        }
      />

      {/* ── Search Results Section (Shown when search query is active) ── */}
      {q && (
        <section className="py-10 bg-slate-50 border-b border-slate-200/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4 mb-6 border-b border-slate-200">
              {CATEGORY_TABS.map((tab) => {
                const count =
                  tab.id === 'all'
                    ? searchResults.length
                    : searchResults.filter((i) => {
                        if (tab.id === 'automobile' || tab.id === 'vehicles') return i.category === 'vehicles' || i.category === 'automobile';
                        if (tab.id === 'jewellery') return i.category === 'jewellery' || i.category === 'jewellery-gold';
                        if (tab.id === 'consumer-electronics') return i.category === 'consumer-electronics' || i.category === 'electronics';
                        if (tab.id === 'bedding-comfort') return i.category === 'bedding-comfort' || i.category === 'bedding';
                        if (tab.id === 'finance-lending') return i.category === 'finance-lending' || i.category === 'finance';
                        return i.category === tab.id;
                      }).length;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCatTab(tab.id)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedCatTab === tab.id
                        ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>

            {searchLoading ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <i className="fa-solid fa-spinner animate-spin text-3xl text-amber-500" />
                <p className="text-sm font-semibold">Searching across all marketplace verticals...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredResults.map((item) => (
                  <Link
                    key={`${item.category}-${item.id}`}
                    to={item.link}
                    className="group bg-white rounded-2xl border border-slate-200/80 hover:border-amber-400 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                  >
                    {/* Thumbnail Image */}
                    <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <i className="fa-solid fa-box text-3xl" />
                        </div>
                      )}
                      <span
                        className={`absolute top-2.5 left-2.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs ${
                          CATEGORY_BADGES[item.category] || 'bg-slate-900 text-white'
                        }`}
                      >
                        {item.categoryLabel || item.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-blue transition-colors line-clamp-1 leading-snug">
                          {item.title}
                        </h3>
                        {item.subtitle && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                            {item.subtitle}
                          </p>
                        )}
                        {item.location && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1.5 truncate">
                            <i className="fa-solid fa-location-dot text-[10px] text-slate-400" />
                            <span className="truncate">{item.location}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Verified Listing
                        </span>
                        <span className="text-xs font-bold text-brand-blue group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          <span>View Details</span>
                          <i className="fa-solid fa-arrow-right text-[10px]" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-white rounded-2xl border border-slate-200/80 p-8 space-y-3">
                <i className="fa-solid fa-magnifying-glass text-3xl text-slate-300" />
                <h3 className="text-base font-bold text-slate-800">
                  No matching items found for &ldquo;{q}&rdquo;
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  We could not find any products matching your search in the selected category. Try searching with different keywords or browse our categories below.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Marketplace Divisions Overview Grid ── */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {q ? 'Explore All Verticals' : 'All Marketplace Divisions'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select a vertical below to browse complete inventories, filter by price, and post custom requirements.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedServices.map((item) => {
              const isActive = ACTIVE_SERVICE_IDS.includes(item.id);

              if (!isActive) {
                return (
                  <Link
                    key={item.id}
                    to={`/coming-soon?sector=${item.id}`}
                    className="group bg-white rounded-xl border border-amber-200/60 p-6 cursor-pointer hover:shadow-lg hover:border-amber-400 transition-all block relative"
                  >
                    <div className="aspect-[16/10] overflow-hidden rounded-lg bg-gray-100 mb-4 relative">
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" loading="lazy" />
                      <span className="absolute top-2 right-2 text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shadow-xs">
                        Coming Soon
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                        <i className={serviceIconMap[item.id] || 'fa-solid fa-circle'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-brand-charcoal text-sm leading-snug group-hover:text-brand-blue transition-colors truncate">
                          {item.title}
                        </h2>
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.description}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:text-brand-blue transition-colors">
                          Coming Soon <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.id === 'jewellery-gold' ? '/categories/jewellery' : `/categories/${item.id}`}
                  className="group bg-white rounded-xl border border-gray-100 p-6 cursor-pointer hover:shadow-lg hover:border-brand-blue/20 transition-all block"
                >
                  <div className="aspect-[16/10] overflow-hidden rounded-lg bg-gray-100 mb-4">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-brand-blue/5 flex items-center justify-center text-brand-blue shrink-0 mt-0.5">
                      <i className={serviceIconMap[item.id] || 'fa-solid fa-circle'} />
                    </div>
                    <div>
                      <h2 className="font-semibold text-brand-charcoal text-sm leading-snug group-hover:text-brand-blue transition-colors">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.description}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue">
                        View Details <i className="fa-solid fa-arrow-right text-[10px]" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ServicesPage;
