import { useState, useMemo } from 'react';
import { navigateTo } from '../../../config/navigation';
import { cities } from '../../../constants/locations';
import { ActiveChip } from '../../../components/ui';
import FinanceCard from './FinanceCard';
import FinanceFilterSidebar from './FinanceFilterSidebar';
import { FINANCE_TABS, INITIAL_FILTERS, INITIAL_SECTIONS } from './financeConstants';
import { useTabStats, useActiveChips, useFilteredServices, useFinanceServices } from './financeHooks';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import CategoryPillStrip from '../../../components/common/CategoryPillStrip';
import EmptyStateCard from '../../../components/common/EmptyStateCard';

function FinanceGallery() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filters, setFilters] = useState({ ...INITIAL_FILTERS });
  const [openSections, setOpenSections] = useState({ ...INITIAL_SECTIONS });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { services, loading, error } = useFinanceServices();

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const toggleSection = (id) => setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  const resetFilters = () => setFilters({ ...INITIAL_FILTERS });

  const tabStats = useTabStats(services, activeTab);
  const activeChips = useActiveChips(filters);
  const filteredServices = useFilteredServices({ services, activeTab, searchTerm, sortBy, filters });

  const removeChip = (chip) => {
    if (chip.key.startsWith('lt-')) {
      updateFilter('loanTypes', filters.loanTypes.filter((x) => x !== chip.label));
    } else if (chip.key === 'amount') {
      if (chip.label.startsWith('Min')) updateFilter('amountMin', '');
      else updateFilter('amountMax', '');
    } else if (chip.key === 'interest') {
      if (chip.label.startsWith('Min')) updateFilter('interestMin', '');
      else updateFilter('interestMax', '');
    } else if (chip.key === 'tenure') {
      updateFilter('tenure', '');
    } else if (chip.key.startsWith('pt-')) {
      updateFilter('providerTypes', filters.providerTypes.filter((x) => x !== chip.label));
    } else if (chip.key.startsWith('sm-')) {
      updateFilter('serviceModes', filters.serviceModes.filter((x) => x !== chip.label));
    } else if (chip.key === 'city') {
      updateFilter('city', '');
    } else if (chip.key.startsWith('loc-')) {
      updateFilter('localities', filters.localities.filter((x) => x !== chip.label));
    } else if (chip.key === 'pincode') {
      updateFilter('pincode', '');
    } else if (chip.key.startsWith('pb-')) {
      updateFilter('postedBy', filters.postedBy.filter((x) => x !== chip.label));
    } else if (chip.key.startsWith('av-')) {
      updateFilter('availability', filters.availability.filter((x) => x !== chip.label));
    }
  };

  const cityAreas = filters.city ? (cities[filters.city]?.areas || []) : [];
  const noCityMessage = !filters.city;

  const financeTabItems = useMemo(() => FINANCE_TABS.map((tab) => ({
    id: tab.id,
    icon: tab.icon,
    label: tab.label,
    count: tab.id === 'All' ? services.length : (tabStats[tab.id] || 0),
  })), [services.length, tabStats]);

  return (
    <PageContainer>
      {/* ── Page Header ── */}
      <PageHeader
        eyebrow="OneVishwam · Finance"
        title="Finance & Loans"
        subtitle="Find trusted financial services, loans, insurance, and investment options near you."
      />

      {/* ── Category Tabs ── */}
      <CategoryPillStrip
        items={financeTabItems}
        selected={activeTab}
        onSelect={setActiveTab}
      />

      {/* ── Search & Sort Bar ── */}
      <div className="mt-5 flex items-center gap-3">
        <div className="flex-1 relative">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search services, providers, categories..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-blue transition-colors" />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="hidden sm:block rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue">
          <option value="latest">Latest</option>
          <option value="interest-low">Interest: Low to High</option>
          <option value="interest-high">Interest: High to Low</option>
        </select>
        <button onClick={() => setShowMobileFilters(true)}
          className="lg:hidden flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 hover:border-brand-blue/40 hover:text-brand-blue transition-colors">
          <i className="fa-solid fa-sliders" /> Filters
          {activeChips.length > 0 && (
            <span className="bg-brand-blue text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeChips.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Active Chips ── */}
      {activeChips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {activeChips.map((chip) => (
            <ActiveChip key={chip.key} label={chip.label} onRemove={() => removeChip(chip)} />
          ))}
          <button onClick={resetFilters} className="text-xs font-semibold text-gray-500 hover:text-brand-blue ml-1">
            Clear All
          </button>
        </div>
      )}

      {/* ── Results Summary ── */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-brand-charcoal">{filteredServices.length}</span> service{filteredServices.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* ── Main Content: Sidebar + Grid ── */}
      <div className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block">
          <FinanceFilterSidebar
            filters={filters} updateFilter={updateFilter}
            openSections={openSections} toggleSection={toggleSection}
            activeChips={activeChips} resetFilters={resetFilters}
            cityAreas={cityAreas} noCityMessage={noCityMessage}
          />
        </div>

        {/* Service Cards Grid */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/50 py-20 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-blue border-t-transparent mb-4" />
              <p className="text-sm font-semibold text-gray-500">Loading finance services...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50/50 py-20 text-center">
              <i className="fa-solid fa-triangle-exclamation text-4xl text-red-300 mb-4" />
              <p className="text-lg font-semibold text-gray-600">Something went wrong</p>
              <p className="text-sm text-gray-400 mt-1 max-w-md">{error}</p>
              <button onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                Try Again
              </button>
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredServices.map((service) => (
                <FinanceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <EmptyStateCard
              icon="fa-building-columns"
              title="No services found"
              subtitle="Try adjusting your filters or search terms."
              onReset={resetFilters}
            />
          )}
        </div>
      </div>

      {/* ── Mobile CTA ── */}
      <div className="mt-8 text-center sm:hidden">
        <button onClick={() => navigateTo('/add-finance-service')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-blue px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
          <i className="fa-solid fa-plus" /> Post a Financial Service
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      <FinanceFilterSidebar
        mobile open={showMobileFilters} onClose={() => setShowMobileFilters(false)}
        filters={filters} updateFilter={updateFilter}
        openSections={openSections} toggleSection={toggleSection}
        activeChips={activeChips} resetFilters={resetFilters}
        cityAreas={cityAreas} noCityMessage={noCityMessage}
        resultCount={filteredServices.length} resultLabel="Services"
      />
    </PageContainer>
  );
}

export default FinanceGallery;
