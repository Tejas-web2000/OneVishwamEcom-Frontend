import React, { useMemo } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import MasterDetailPage from './MasterDetailPage';
import PageContainer from '../PageContainer';

/**
 * UniversalDetailPage
 * 
 * Declarative category detail page engine.
 * Eliminates all boilerplate for:
 * - Route param extraction
 * - Data fetching hooks & loading/404 states
 * - Image gallery carousel & lightbox
 * - Header price, badges, and Google Maps location button
 * - Bento Highlights cards grid
 * - Description & Specifications breakdown accordions
 * - Features / Amenities grid
 * - Sticky bottom action bar with Call / WhatsApp / Inquire / Share
 * - Footer intersection observer auto-hide
 * - Pre-filled lead inquiry modal
 * 
 * Any category detail page can be created with a single declarative configuration file.
 */
export default function UniversalDetailPage({
  categoryTitle = 'Product Details',
  backUrl = -1,

  // Hook-based data loading
  useItemById = null,
  useSimilarItems = null,

  // Direct item injection
  item: directItem = null,
  similarItems: directSimilar = null,
  loading: directLoading = false,
  error: directError = null,

  // Declarative Field Mapping:
  mapping = {},

  // Optional extensions
  headerExtra = null,
  renderCustomSection = null,
}) {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract ID from params or route path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const resolvedId = params.id || params.slug || (pathParts.length > 0 ? pathParts[pathParts.length - 1] : null);

  // Hook invocations
  let hookItem = null;
  let hookLoading = false;
  let hookError = null;

  if (typeof useItemById === 'function') {
    const res = useItemById(resolvedId);
    if (res) {
      hookItem =
        res.item ||
        res.electronic ||
        res.bedding ||
        res.vehicle ||
        res.property ||
        res.garment ||
        res.grocery ||
        res.jewellery ||
        (res.data && typeof res.data === 'object' && !Array.isArray(res.data) ? res.data : null) ||
        res;
      hookLoading = Boolean(res.loading);
      hookError = res.error || null;
    }
  }

  let hookSimilar = [];
  if (typeof useSimilarItems === 'function') {
    const simRes = useSimilarItems(resolvedId);
    if (simRes) {
      hookSimilar = simRes.similar || simRes.items || (Array.isArray(simRes) ? simRes : []);
    }
  }

  const rawItem = directItem || hookItem || null;
  const isLoading = directLoading || hookLoading;
  const rawSimilar = directSimilar || hookSimilar || [];

  // Transform raw item into unified EntityItem contract
  const mappedItem = useMemo(() => {
    if (!rawItem) return null;

    const id = mapping.id ? mapping.id(rawItem) : (rawItem._id || rawItem.id || resolvedId);
    const title = mapping.title ? mapping.title(rawItem) : (rawItem.title || rawItem.name || 'Featured Listing');
    const subtitle = mapping.subtitle ? mapping.subtitle(rawItem) : (rawItem.subtitle || '');
    const price = mapping.price ? mapping.price(rawItem) : (rawItem.price || 'Price on Request');
    const priceSubtext = mapping.priceSubtext ? mapping.priceSubtext(rawItem) : (rawItem.priceSubtext || rawItem.priceSuffix || '');
    const description = mapping.description ? mapping.description(rawItem) : (rawItem.description || 'Verified listing on OneVishwam platform.');

    // Images
    let images = [];
    if (typeof mapping.images === 'function') {
      images = mapping.images(rawItem);
    } else if (rawItem.images && Array.isArray(rawItem.images)) {
      images = rawItem.images;
    } else if (rawItem.image) {
      images = [rawItem.image];
    } else if (rawItem.coverImage) {
      images = [rawItem.coverImage];
    }

    // Location
    const loc = mapping.location ? mapping.location(rawItem) : (rawItem.location || rawItem.address || rawItem.city || 'Bangalore');
    const mapUrl = mapping.mapUrl ? mapping.mapUrl(rawItem) : (rawItem.mapUrl || rawItem.details?.mapUrl || '');

    // Badges
    const statusBadges = mapping.badges ? mapping.badges(rawItem) : (rawItem.statusBadges || rawItem.badges || []);

    // Bento Overview Highlights
    const overviewHighlights = mapping.highlights ? mapping.highlights(rawItem) : (rawItem.overviewHighlights || rawItem.highlights || []);

    // Specification Breakdown
    const specs = mapping.specs ? mapping.specs(rawItem) : (rawItem.specs || []);

    // Features / Amenities
    const features = mapping.features ? mapping.features(rawItem) : (rawItem.features || rawItem.amenities || []);

    // Floor plans / Unit plans
    const floorPlanImages = mapping.floorPlanImages ? mapping.floorPlanImages(rawItem) : (rawItem.floorPlanImages || []);
    const pdfUrl = mapping.pdfUrl ? mapping.pdfUrl(rawItem) : (rawItem.pdfUrl || null);

    // Seller / Enterprise Contact
    const seller = mapping.seller ? mapping.seller(rawItem) : (rawItem.seller || {
      name: rawItem.vendorName || rawItem.channelPartnerName || rawItem.showroom?.name || 'OneVishwam Partner',
      phone: rawItem.contact || rawItem.showroom?.phone || '8546996622',
      whatsapp: rawItem.whatsapp || rawItem.contact || '8546996622',
      email: rawItem.email || rawItem.showroom?.email || 'ceo@onevishwam.com',
      verified: true,
    });

    return {
      id,
      title,
      subtitle,
      price,
      priceSubtext,
      priceSuffix: priceSubtext,
      description,
      images: images.filter(Boolean),
      location: loc,
      address: loc,
      mapUrl,
      statusBadges: statusBadges.filter(Boolean),
      overviewHighlights: overviewHighlights.filter(Boolean),
      specs: specs.filter(Boolean),
      features: features.filter(Boolean),
      floorPlanImages: Array.isArray(floorPlanImages) ? floorPlanImages.filter(Boolean) : [],
      pdfUrl,
      seller,
      raw: rawItem,
    };
  }, [rawItem, mapping, resolvedId]);

  // Transform similar items
  const mappedSimilarItems = useMemo(() => {
    if (!Array.isArray(rawSimilar) || rawSimilar.length === 0) return [];
    return rawSimilar.map((item) => {
      if (!item) return null;
      const id = mapping.id ? mapping.id(item) : (item._id || item.id);
      const title = mapping.title ? mapping.title(item) : (item.title || item.name);
      const price = mapping.price ? mapping.price(item) : item.price;
      const image = mapping.images ? (mapping.images(item)?.[0] || item.images?.[0]) : (item.images?.[0] || item.image);
      const location = mapping.location ? mapping.location(item) : (item.location || item.city);
      const pills = mapping.highlights ? mapping.highlights(item)?.slice(0, 3)?.map(h => h.value) : (item.cardPills || []);

      return {
        id,
        title,
        price,
        image,
        images: [image].filter(Boolean),
        location,
        cardPills: pills,
        raw: item,
      };
    }).filter(Boolean);
  }, [rawSimilar, mapping]);

  // Loading Skeleton State
  if (isLoading && !mappedItem) {
    return (
      <PageContainer className="min-h-screen bg-[#f8fafc] py-8">
        <div className="max-w-7xl mx-auto px-4 animate-pulse space-y-6">
          <div className="h-6 w-48 bg-gray-200 rounded-md" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-[380px] bg-gray-200 rounded-2xl w-full" />
              <div className="h-10 bg-gray-200 rounded-xl w-3/4" />
              <div className="h-28 bg-gray-200 rounded-xl w-full" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="h-64 bg-gray-200 rounded-2xl w-full" />
              <div className="h-48 bg-gray-200 rounded-2xl w-full" />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Not Found State
  if (!mappedItem) {
    return (
      <PageContainer className="min-h-screen bg-[#f8fafc] flex items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fa-solid fa-layer-group" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Item Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            The listing you are looking for does not exist or may have been removed.
          </p>
          <button
            type="button"
            onClick={() => {
              if (window.history.state?.idx > 0 || window.history.length > 1) {
                navigate(-1);
              } else {
                navigate(backUrl && backUrl !== -1 ? backUrl : '/categories');
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold shadow-md hover:bg-blue-700 transition-all cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            <span>Back to Inventory</span>
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <MasterDetailPage
      item={mappedItem}
      similarItems={mappedSimilarItems}
      categoryName={categoryTitle}
      categoryLink={backUrl && backUrl !== -1 ? backUrl : undefined}
      headerExtra={headerExtra}
      customSection={renderCustomSection ? renderCustomSection(mappedItem) : null}
    />
  );
}
