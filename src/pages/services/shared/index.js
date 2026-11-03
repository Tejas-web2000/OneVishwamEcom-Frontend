// Shared UI Primitives
export { default as CategoryPillStrip } from './CategoryPillStrip';
export { default as ResultsBar } from './ResultsBar';
export { GallerySearchBar } from './GallerySearchBar';
export { GalleryHeader } from './GalleryHeader';
export { default as PageHero } from './PageHero';

// Canonical Design-System Components (single source of truth)
export { SectorPageTemplate } from '../../../components/templates/SectorPageTemplate';
export { SectorTabs } from '../../../components/ui/SectorTabs';
export { SectorPageHeader } from '../../../components/ui/SectorPageHeader';
export { default as LoadingError, LoadingSpinner, ErrorState } from './LoadingError';
export { default as EmptyState } from './EmptyState';
export { default as Fab } from './Fab';
export { default as Pagination } from './Pagination';
export { default as QuickMatchModalShell } from './modals/QuickMatchModalShell';
export { default as ListingCard } from './cards/ListingCard';
export { normalizeListing } from './cards/normalizeListing';

// Master Listing & Detail Engines
export { default as MasterListingPage } from './listing/MasterListingPage';
export { default as ListingGrid } from './listing/ListingGrid';
export { default as MasterDetailPage } from './detail/MasterDetailPage';
export { default as DetailGallery } from './detail/DetailGallery';
export { default as DetailHeader } from './detail/DetailHeader';
export { default as RelatedListings } from './detail/RelatedListings';

// Shared Filters
export { default as FilterShell } from './filters/FilterShell';
export { FilterSection } from './filters/FilterSection';
export { PillGroup } from './filters/PillGroup';
export { BudgetRangeSlider } from './filters/BudgetRangeSlider';
export { default as BudgetChipGroup } from './filters/BudgetChipGroup';
export { default as TopFilterBar, FilterToggle } from './filters/TopFilterBar';

// Shared Hooks
export { useFilterState } from './hooks/useFilterState';
export { createResourceHooks } from './hooks/createResourceHooks';

// Utilities
export {
  SORT_LATEST,
  SORT_PRICE_LOW,
  SORT_PRICE_HIGH,
  DEFAULT_SORT_OPTIONS,
  compareByPrice,
  compareByDate,
  applySort,
  isInHouseOrCeoListing,
} from './sortBy';

export {
  getNumericPrice,
  parseIndianPrice,
  formatINR,
  formatDisplayPrice,
  withRupeeSymbol,
  getPriceTypeBadge,
} from './priceUtils';

export {
  loadSessionState,
  saveSessionState,
  clearSessionState,
} from './sessionStore';
