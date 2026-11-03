import React, { useState, useMemo, useCallback } from 'react';
import PropertyGalleryModal from './PropertyGalleryModal';

/**
 * Interactive Floor Maps & Layout Plans Card
 */
export default function PropertyFloorMapsCard({ item }) {
  const [activeFpIndex, setActiveFpIndex] = useState(0);
  const [fpGalleryOpen, setFpGalleryOpen] = useState(false);
  const [fpGalleryIndex, setFpGalleryIndex] = useState(0);

  const floorPlanImages = useMemo(() => {
    if (!item) return [];
    const fp = item.floorPlanImages || item.floorPlans || item.floorPlanMap;
    if (Array.isArray(fp)) return fp.filter(Boolean);
    if (typeof fp === 'string' && fp) return [fp];
    return [];
  }, [item]);

  const pdfUrl = item?.pdfUrl || item?.floorPlanPdf || item?.pdf || null;
  const hasFloorPlans = floorPlanImages.length > 0 || Boolean(pdfUrl);

  const goFpPrev = useCallback(() => {
    if (!floorPlanImages.length) return;
    setFpGalleryIndex((i) => (i === 0 ? floorPlanImages.length - 1 : i - 1));
  }, [floorPlanImages.length]);

  const goFpNext = useCallback(() => {
    if (!floorPlanImages.length) return;
    setFpGalleryIndex((i) => (i === floorPlanImages.length - 1 ? 0 : i + 1));
  }, [floorPlanImages.length]);

  if (!hasFloorPlans) return null;

  return (
    <>
      {fpGalleryOpen && (
        <PropertyGalleryModal
          images={floorPlanImages}
          index={fpGalleryIndex}
          onClose={() => setFpGalleryOpen(false)}
          onPrev={goFpPrev}
          onNext={goFpNext}
        />
      )}

      <div className="rounded-2xl bg-white border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <i className="fa-solid fa-map-location-dot text-brand-blue text-base" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-charcoal">Unit Floor Maps &amp; Layout Plans</h2>
              <p className="text-xs text-gray-500">Floor plans, unit layouts &amp; dimensions</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {floorPlanImages.length > 0 && (
              <button
                type="button"
                onClick={() => { setFpGalleryIndex(activeFpIndex); setFpGalleryOpen(true); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <i className="fa-solid fa-expand text-[10px]" /> Fullscreen Layout
              </button>
            )}
            {pdfUrl && (
              <>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <i className="fa-solid fa-up-right-from-square text-[10px]" /> Fullscreen PDF
                </a>
                <a
                  href={pdfUrl}
                  download
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <i className="fa-solid fa-download text-[10px]" /> Download PDF
                </a>
              </>
            )}
          </div>
        </div>

        {/* ── Floor Plan Photo Viewer (when floor plan images exist) ── */}
        {floorPlanImages.length > 0 && (
          <div className="space-y-3">
            <div
              className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-900 flex items-center justify-center min-h-[320px] sm:min-h-[460px] group cursor-pointer"
              onClick={() => { setFpGalleryIndex(activeFpIndex); setFpGalleryOpen(true); }}
            >
              <img
                src={floorPlanImages[activeFpIndex] || floorPlanImages[0]}
                alt={`${item.title} Floor Plan ${activeFpIndex + 1}`}
                className="max-h-[480px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3.5 text-white flex justify-between items-center">
                <span className="text-xs font-semibold bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  <i className="fa-solid fa-layer-group text-blue-400 mr-1.5" />
                  Floor Plan {activeFpIndex + 1} of {floorPlanImages.length}
                </span>
                <span className="text-xs text-gray-300 group-hover:text-white flex items-center gap-1 font-medium">
                  <i className="fa-solid fa-expand text-xs text-blue-400" /> Click for Full Screen
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {floorPlanImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {floorPlanImages.map((fp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveFpIndex(idx)}
                    className={`relative flex-shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      activeFpIndex === idx
                        ? 'border-brand-blue ring-2 ring-blue-400/30'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={fp}
                      alt={`Floor Plan thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[9px] font-bold px-1 rounded">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Floor Plan PDF Iframe (when PDF exists) ── */}
        {pdfUrl && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100 mt-4">
            <iframe
              src={pdfUrl}
              className="w-full h-[450px] sm:h-[550px] border-0"
              title={`${item.title} Floor Maps PDF`}
            />
          </div>
        )}
      </div>
    </>
  );
}

