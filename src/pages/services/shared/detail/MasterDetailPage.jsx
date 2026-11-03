import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../../store/authSlice';
import { Breadcrumbs } from '../../../../components/ui';
import AuthRequiredView from '../../../../components/auth/AuthRequiredView';
import { LoadingSpinner, ErrorState } from '../LoadingError';
import DetailGallery from './DetailGallery';
import DetailHeader from './DetailHeader';
import RelatedListings from './RelatedListings';
import { normalizeListing } from '../cards/normalizeListing';

const STATUS_KEYS = new Set(['loading', 'error', 'retry']);

const AVAILABILITY_KEYS = new Set(['available', 'sold_out', 'inactive']);

function isSoldOut(item) {
  if (!item) return false;
  return item.availabilityStatus === 'sold_out' || item.isSoldOut === true;
}

function isInactive(item) {
  if (!item) return false;
  return item.availabilityStatus === 'inactive' || item.isInactive === true;
}

/**
 * Extract the actual data array from a list-hook result, regardless of the
 * sector key produced by `useProperties`/`createResourceHooks` (e.g. { properties },
 * { vehicles }, { groceries }, { items }, etc.).
 */
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
 * Extract the actual detail object from a detail-hook result, regardless of
 * the sector key (e.g. { property }, { vehicle }, { garment }, { item }, etc.).
 */
function extractDetailPayload(result) {
  if (!result || typeof result !== 'object') return null;
  if (result.item != null && typeof result.item === 'object') return result.item;
  for (const key of Object.keys(result)) {
    if (key === 'item' || STATUS_KEYS.has(key)) continue;
    const value = result[key];
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      return value;
    }
  }
  return null;
}

/**
 * Universal Master Detail Page Engine
 * Powers detail views across all OneVishwam sectors.
 */
export default function MasterDetailPage({
  sector = 'property',
  config = {},
  hooks = {},
  authTitle = 'Login to View Details',
  authMessage = 'Please log in to view complete details, specifications, and contact info.',
  backUrl = '/our-services',
  backLabel = 'Back to Listings',
  notFoundMessage = 'Item not found',
  customHero,
  specsSlot,
  sidebarSlot,
  floatingBarSlot,
  modalsSlot,
  renderSimilarCard,
  children,
  retryHook,
}) {
  const { pathname } = useLocation();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const pathParts = pathname.split('/').filter(Boolean);
  const itemId = pathParts.length > 1 ? pathParts[1] : null;

  const listResult = hooks.useItems ? hooks.useItems() : {};
  const listItems = extractListPayload(listResult);
  const listLoading = !!listResult.loading;
  const listRetry = listResult.retry;

  const detailResult = hooks.useItemById ? hooks.useItemById(itemId) : {};
  const directItem = extractDetailPayload(detailResult);
  const directLoading = !!detailResult.loading;
  const directError = detailResult.error || null;
  const directRetry = detailResult.retry;

  const similarResult = hooks.useSimilarItems ? hooks.useSimilarItems(itemId) : {};
  const relatedItems = Array.isArray(similarResult.similar) ? similarResult.similar : [];

  // Resolve item (direct API response or fallback from list)
  const foundFromList = (listItems || []).find(
    (it) => String(it._id) === String(itemId) || String(it.id) === String(itemId)
  ) || null;

  const rawItem = (directItem?.item || directItem) || (foundFromList?.item || foundFromList);

  // Check availability status
  const itemIsSoldOut = isSoldOut(rawItem);
  const itemIsInactive = isInactive(rawItem);

  // Loading is true when we have no item AND any loader is still working
  const isLoading = !rawItem && (listLoading || directLoading);

  // Only declare "not found" once both loaders are done AND we have no item
  const bothFinished = !listLoading && !directLoading;
  const notFound = bothFinished && !rawItem;
  const error = notFound ? (directError || notFoundMessage) : null;
  const handleRetry = directRetry || listRetry || retryHook;

  // Auth Protection Gate
  if (!isLoggedIn) {
    return (
      <AuthRequiredView
        title={authTitle}
        message={authMessage}
        backUrl={backUrl}
      />
    );
  }

  // Loading View
  if (isLoading) {
    return <LoadingSpinner text="Loading details..." className="py-32" />;
  }

  // Error / 404 View — single coherent message + optional retry + back link
  if (notFound) {
    const isApiMessage = !!directError && directError !== notFoundMessage;
    return (
      <div className="py-20 sm:py-32 px-4">
        <ErrorState
          error={notFoundMessage}
          title={notFoundMessage}
          subtitle={
            isApiMessage
              ? `${notFoundMessage}. Please try again in a moment.`
              : 'This listing may have been removed or is no longer available.'
          }
          onRetry={handleRetry}
        />
        <div className="mt-6 text-center">
          {backUrl && (
            <Link
              to={backUrl}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-brand-blue hover:text-brand-blue transition-all shadow-2xs"
            >
              <i className="fa-solid fa-arrow-left text-xs" />
              {backLabel}
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Sold Out / Inactive View — item exists but is not available
  if (itemIsSoldOut || itemIsInactive) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 sm:pb-32 relative">
        {/* Back Navigation Bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <Link
              to={backUrl}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-blue transition-colors"
            >
              <i className="fa-solid fa-arrow-left" /> {backLabel}
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${itemIsSoldOut ? 'bg-red-100' : 'bg-amber-100'}`}>
              <i className={`fa-solid ${itemIsSoldOut ? 'fa-circle-xmark' : 'fa-pause-circle'} text-4xl ${itemIsSoldOut ? 'text-red-600' : 'text-amber-600'}`} aria-hidden="true" />
            </div>
            <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight ${itemIsSoldOut ? 'text-red-600' : 'text-amber-600'}`}>
              {itemIsSoldOut ? 'Sold Out' : 'Inactive'}
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {itemIsSoldOut
                ? 'This item is currently unavailable. It has been marked as sold out by the administrator.'
                : 'This item is currently inactive and not available for purchase or enquiry.'}
            </p>
            <div className="mt-8">
              {backUrl && (
                <Link
                  to={backUrl}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:border-brand-blue hover:text-brand-blue transition-all shadow-2xs"
                >
                  <i className="fa-solid fa-arrow-left text-xs" />
                  {backLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normalized data for standard header & gallery
  const normalized = normalizeListing(rawItem, sector);
  const images = Array.isArray(rawItem.images) && rawItem.images.length > 0
    ? rawItem.images
    : normalized.image
      ? [normalized.image]
      : [];
  const itemVideo =
    rawItem?.video ||
    rawItem?.videoUrl ||
    (Array.isArray(rawItem?.videos) && rawItem.videos.find((v) => typeof v === 'string' && v.trim())) ||
    null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-32 relative">
      {/* Back Navigation & Breadcrumbs Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <Breadcrumbs
              categoryName={config.categoryName || backLabel.replace(/^Back to\s+/i, '') || 'Listings'}
              categoryLink={backUrl || undefined}
              itemTitle={normalized.title || 'Listing Details'}
            />
          </div>
        </div>
      </div>

      {/* Hero Section: Custom or Standard 2-Column */}
      {customHero ? (
        customHero({ item: rawItem, normalized, images, video: itemVideo })
      ) : (
        <div className="bg-white border-b border-gray-100 py-6 sm:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-12 items-start">
              {/* Media Gallery */}
              <div className="lg:col-span-7">
                <DetailGallery images={images} video={itemVideo} title={normalized.title} />
              </div>

              {/* Core Information Header & Primary Actions */}
              <div className="lg:col-span-5 space-y-6">
                <DetailHeader
                  overline={normalized.overline}
                  title={normalized.title}
                  subtitle={normalized.location}
                  price={normalized.price}
                  priceSuffix={normalized.priceSuffix}
                  originalPrice={rawItem.originalPrice}
                  discount={rawItem.discount}
                  badges={normalized.badges}
                  tags={normalized.tags}
                />

                {/* Primary Action / Sidebar Slot (e.g. Purchase card, Booking form) */}
                {sidebarSlot && sidebarSlot({ item: rawItem, normalized })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Details Body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* When a custom hero already places the sidebar content in its right
            column, the body is rendered full-width below (no splitting). When
            no custom hero is used, the body falls back to 7/5 main/side split
            so the existing master/standard hero style still works. */}
        {sidebarSlot && !customHero ? (
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7 space-y-8">
              {specsSlot && specsSlot({ item: rawItem, normalized })}
              {children}
            </div>
            <div className="lg:col-span-5 space-y-6">
              {sidebarSlot({ item: rawItem, normalized })}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {specsSlot && specsSlot({ item: rawItem, normalized })}
            {children}
          </div>
        )}
      </div>

      {/* Related Listings Carousel / Grid */}
      <RelatedListings
        items={relatedItems}
        sector={sector}
        renderCard={renderSimilarCard}
      />

      {/* Sticky Mobile Floating Action Bar */}
      {floatingBarSlot && floatingBarSlot({ item: rawItem, normalized })}

      {/* Modals Slot */}
      {modalsSlot && modalsSlot({ item: rawItem, normalized })}
    </div>
  );
}
