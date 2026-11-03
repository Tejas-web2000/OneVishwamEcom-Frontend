import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { SectorPageTemplate } from '../../../../components/templates/SectorPageTemplate';
import { SectorPageHeader, Breadcrumbs } from '../../../../components/ui';
import CategoryPillStrip from '../CategoryPillStrip';
import ResultsBar from '../ResultsBar';
import { applySort } from '../sortBy';
import ListingGrid from './ListingGrid';
import Fab from '../Fab';
import Pagination from '../Pagination';
import MobileFilterDrawer from '../../../../components/MobileFilterDrawer';
import { LoadingSpinner, ErrorState } from '../LoadingError';
import { loadSessionState, saveSessionState } from '../sessionStore';

const STATUS_KEYS = new Set(['loading', 'error', 'retry']);

function extractListPayload(result) {
  if (!result || typeof result !== 'object') return [];
  if (Array.isArray(result.items)) return result.items;
  for (const key of Object.keys(result)) {
    if (key === 'items' || STATUS_KEYS.has(key)) continue;
    if (Array.isArray(result[key])) return result[key];
  }
  return [];
}

/**
 * Universal Master Listing Page Engine
 * ─────────────────────────────────────
 * Powers listing and search gallery views across all OneVishwam sectors.
 *
 * Layout is provided by SectorPageTemplate (consistent spacing/container).
 * Header is SectorPageHeader — no Back button (navigation via navbar).
 *
 * Props
 * ─────
 * sector          – 'property' | 'automobile' | 'grocery' | 'garment' | 'jewellery' …
 * config          – { eyebrow, title, categories, emptyState }
 * hooks           – { useItems: () => { items, loading, error } }
 * customHeader    – ({ total, items }) => ReactNode — replaces default header
 * topBarSlot      – ({ searchTerm, setSearchTerm, … }) => ReactNode
 * sidebarComponent – Component for desktop sidebar + mobile drawer
 * cardActionsSlot  – Render prop for per-card action buttons
 * renderCard       – Custom card renderer
 * modalsSlot       – () => ReactNode — portal for modal overlays
 * itemsPerPage     – default 12
 */
export default function MasterListingPage({
  sector = 'property',
  config = {},
  hooks = {},
  customHeader,
  topBarSlot,
  sidebarComponent: SidebarComponent,
  cardActionsSlot,
  renderCard,
  modalsSlot,
  itemsPerPage = 12,
}) {
  const {
    eyebrow = 'OneVishwam · Marketplace',
    title = 'Find Listings',
    categories = [],
    emptyState = {},
  } = config;

  // Data fetching
  const listResult = hooks.useItems ? hooks.useItems() : {};
  const items = extractListPayload(listResult);
  const loading = !!listResult.loading;
  const error = listResult.error || null;

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const sessionKey = useMemo(() => `master_list_page_${pathname}`, [pathname]);

  const getInitialPage = () => {
    const fromUrl = parseInt(searchParams.get('page'), 10);
    if (!isNaN(fromUrl) && fromUrl > 0) return fromUrl;
    const fromSession = loadSessionState(sessionKey, { page: 1 })?.page;
    if (typeof fromSession === 'number' && fromSession > 0) return fromSession;
    return 1;
  };

  // Local UI State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(getInitialPage);

  const handlePageChange = (n) => {
    const target = Math.max(1, n);
    setPage(target);
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

  useEffect(() => {
    const fromUrl = parseInt(searchParams.get('page'), 10);
    if (!isNaN(fromUrl) && fromUrl > 0 && fromUrl !== page) {
      setPage(fromUrl);
      saveSessionState(sessionKey, { page: fromUrl });
    }
  }, [searchParams, sessionKey]);

  // Filter items by category & search term
  const filteredItems = useMemo(() => {
    let list = Array.isArray(items) ? items : [];

    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter((item) => {
        const cat = (item.category || item.cardType || item.type || '').toLowerCase();
        return cat.includes(selectedCategory.toLowerCase());
      });
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((item) => {
        const name = (item.name || item.title || `${item.brand || ''} ${item.model || ''}`).toLowerCase();
        const loc = (item.location || item.city || item.address || '').toLowerCase();
        return name.includes(q) || loc.includes(q);
      });
    }

    return applySort(list, sortBy);
  }, [items, selectedCategory, searchTerm, sortBy]);

  // Paginated slice
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, page, itemsPerPage]);

  return (
    <SectorPageTemplate>
      {/* ── Top Navigation & Breadcrumbs ── */}
      <div className="pt-2 pb-1 mb-3">
        <Breadcrumbs categoryName={title} />
      </div>

      {/* Page Header */}
      {customHeader ? (
        customHeader({ total: filteredItems.length, items })
      ) : (
        <SectorPageHeader
          eyebrow={eyebrow}
          title={title}
          count={filteredItems.length}
          countLabel="listing"
        />
      )}

      {/* Category Pill Strip (SectorTabs via CategoryPillStrip) */}
      {Array.isArray(categories) && categories.length > 0 && (
        <CategoryPillStrip
          types={categories}
          selected={selectedCategory}
          onSelect={(cat) => {
            setPage(1);
            setSelectedCategory(cat);
          }}
        />
      )}

      {/* Top Search / Filter Bar Slot */}
      {topBarSlot ? (
        topBarSlot({ searchTerm, setSearchTerm, sortBy, setSortBy, setMobileFilterOpen })
      ) : (
        <ResultsBar
          count={filteredItems.length}
          searchValue={searchTerm}
          onSearchChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
          sortValue={sortBy}
          onSortChange={(e) => setSortBy(e.target.value)}
          onMobileFilter={SidebarComponent ? () => setMobileFilterOpen(true) : undefined}
        />
      )}

      {/* Loading / Error States */}
      {loading && <LoadingSpinner text="Loading listings..." className="py-24" />}
      {error && <ErrorState error={error} className="py-24" />}

      {/* Main Content Layout */}
      {!loading && !error && (
        <div className="mt-6 grid gap-8 lg:grid-cols-12 items-start">
          {/* Desktop Filter Sidebar */}
          {SidebarComponent && (
            <aside className="hidden lg:block lg:col-span-3 rounded-2xl bg-white border border-gray-200/80 p-5 shadow-xs hover:shadow-sm transition-shadow sticky top-20">
              <SidebarComponent />
            </aside>
          )}

          {/* Listings Grid */}
          <main className={SidebarComponent ? 'lg:col-span-9' : 'lg:col-span-12'}>
            <ListingGrid
              items={paginatedItems}
              sector={sector}
              renderCard={renderCard}
              renderActions={cardActionsSlot}
              emptyIcon={emptyState.icon}
              emptyTitle={emptyState.title}
              emptySubtitle={emptyState.subtitle}
              onResetFilters={() => {
                setSelectedCategory('All');
                setSearchTerm('');
                setPage(1);
              }}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </main>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      {SidebarComponent && (
        <MobileFilterDrawer
          open={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          resultCount={filteredItems.length}
        >
          <SidebarComponent />
        </MobileFilterDrawer>
      )}

      {/* Floating Action Button for Mobile */}
      {SidebarComponent && (
        <Fab onClick={() => setMobileFilterOpen(true)} />
      )}

      {/* Modals Slot */}
      {modalsSlot && modalsSlot()}
    </SectorPageTemplate>
  );
}
