import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MasterDetailPage from '../../../components/common/templates/MasterDetailPage';
import PageContainer from '../../../components/common/PageContainer';
import { useBeddingById, useSimilarBedding } from './beddingHooks';

export default function BeddingDetails({ item: directItem = null, similarItems: directSimilar = [] }) {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id || directItem?._id || directItem?.id;

  const { item: fetchedItem, loading, error } = useBeddingById(directItem ? null : id);
  const { similar: fetchedSimilar } = useSimilarBedding(directItem ? null : id);

  const rawItem = directItem || fetchedItem;
  const similarItems = (directSimilar && directSimilar.length > 0) ? directSimilar : (fetchedSimilar || []);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  // Reset selected variant whenever item changes
  useEffect(() => {
    setSelectedVariantIndex(0);
  }, [rawItem?._id || rawItem?.id]);

  const variants = rawItem?.variants || [];
  const currentVariant = variants[selectedVariantIndex] || variants[0] || null;

  // Dynamically update product data based on selected variant
  const displayedItem = useMemo(() => {
    if (!rawItem) return null;

    const baseImages = Array.isArray(rawItem.images) && rawItem.images.length > 0 ? rawItem.images : (rawItem.image ? [rawItem.image] : []);

    if (!currentVariant || variants.length <= 1) {
      return {
        ...rawItem,
        id: rawItem._id || rawItem.id,
        images: baseImages,
        category: rawItem.subcategory || rawItem.category || 'Bedding & Comfort',
      };
    }

    // Enhanced keyAttributes reflecting chosen variant
    const keyAttributes = [
      ...(rawItem.keyAttributes || []).filter(
        (a) => a.label !== 'Selected Size' && a.label !== 'Selected Size / Variant' && a.label !== 'Dimensions'
      ),
      {
        label: 'Selected Size / Variant',
        value: currentVariant.name,
      },
    ];

    if (currentVariant.dimension) {
      keyAttributes.push({
        label: 'Dimensions',
        value: currentVariant.dimension,
      });
    }

    if (currentVariant.thickness) {
      keyAttributes.push({
        label: 'Thickness / Loft',
        value: currentVariant.thickness,
      });
    }

    // Dynamic overview highlights
    const overviewHighlights = [
      {
        label: 'Selected Size',
        value: currentVariant.name,
        icon: 'fa-bed',
        color: 'text-blue-600 bg-blue-50',
      },
      {
        label: 'Special Offer Price',
        value: currentVariant.price,
        icon: 'fa-tag',
        color: 'text-emerald-600 bg-emerald-50',
      },
      ...(rawItem.overviewHighlights || []).slice(0, 2),
    ];

    return {
      ...rawItem,
      id: rawItem._id || rawItem.id,
      images: baseImages,
      price: currentVariant.price,
      priceSuffix: `(MRP ${currentVariant.mrp} · ${currentVariant.discount || '15% Off'})`,
      priceNote: `Selected Size: ${currentVariant.name} · Direct Manufacturer Warranty · Free Delivery`,
      keyAttributes,
      overviewHighlights,
      category: rawItem.subcategory || rawItem.category || 'Bedding & Comfort',
    };
  }, [rawItem, currentVariant, variants.length]);

  // Loading Skeleton State
  if (loading && !rawItem) {
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
  if (!displayedItem) {
    return (
      <PageContainer className="min-h-screen bg-[#f8fafc] flex items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fa-solid fa-bed" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Mattress Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            The bedding item you are looking for does not exist or may have been removed.
          </p>
          <button
            type="button"
            onClick={() => {
              if (window.history.state?.idx > 0 || window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/categories/bedding-comfort');
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold shadow-md hover:bg-blue-700 transition-all cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            <span>Back to Bedding Collection</span>
          </button>
        </div>
      </PageContainer>
    );
  }

  // Header Dropdown for instant variant switching
  const headerVariantDropdown = variants.length > 1 && (
    <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5 max-w-2xl">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="variant-select-bedding"
          className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
        >
          <i className="fa-solid fa-bed text-brand-blue" />
          <span>Select Size / Variant ({variants.length} Sizes Available):</span>
        </label>
        {currentVariant && (
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/70 border border-emerald-300/80 px-2.5 py-0.5 rounded-full">
            Verified Offer
          </span>
        )}
      </div>

      <div className="relative">
        <select
          id="variant-select-bedding"
          value={selectedVariantIndex}
          onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
          className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-bold text-brand-charcoal focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all cursor-pointer shadow-2xs"
        >
          {variants.map((v, idx) => (
            <option key={idx} value={idx}>
              {v.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500">
          <i className="fa-solid fa-chevron-down text-xs" />
        </div>
      </div>
    </div>
  );

  // Variant Matrix & Size Comparison Table
  const variantDashboard = variants.length > 1 && (
    <section className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
            Available Dimensions & Sizes
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-brand-charcoal mt-1">
            Choose Your Mattress Size
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Includes free doorstep delivery, dedicated support, and official brand warranty.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] font-semibold text-gray-400 block uppercase">
            Active Size: {currentVariant.name}
          </span>
          <span className="text-sm font-extrabold text-brand-blue block mt-1">
            Price on Request
          </span>
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md inline-block mt-1">
            {currentVariant.discount || 'Special Offer'}
          </span>
        </div>
      </div>

      {/* Responsive Size Comparison Table */}
      <div className="space-y-3 pt-2">
        <h4 className="text-sm font-bold text-brand-charcoal flex items-center gap-2">
          <i className="fa-solid fa-list-check text-brand-blue" />
          Compare All {variants.length} Sizes for {displayedItem.title}
        </h4>

        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/90 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Size Option</th>
                <th className="py-3 px-3">Dimensions</th>
                <th className="py-3 px-3">Thickness / Fit</th>
                <th className="py-3 px-3 text-gray-500">Warranty</th>
                <th className="py-3 px-4 text-emerald-700">Availability</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {variants.map((v, idx) => {
                const isSelected = idx === selectedVariantIndex;

                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 font-bold text-brand-blue'
                        : 'hover:bg-gray-50/80 text-brand-charcoal'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <i className="fa-solid fa-circle-check text-brand-blue text-xs" />
                        )}
                        <span>{v.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-gray-600">{v.dimension || '—'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-gray-600">{v.thickness || '—'}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{v.warranty || 'Brand Warranty'}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">In Stock</td>
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
      item={displayedItem}
      categoryName="Comfort"
      categoryLink="/categories/bedding-comfort"
      similarItems={similarItems}
      itemLinkPrefix="/bedding/"
      bentoTitle="Product Key Specifications & Mattress Dimensions"
      featuresTitle="Certified Standards & Comfort Features"
      headerExtra={headerVariantDropdown}
    >
      {variantDashboard}
    </MasterDetailPage>
  );
}
