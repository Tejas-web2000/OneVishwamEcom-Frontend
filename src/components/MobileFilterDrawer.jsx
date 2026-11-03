import { useEffect } from 'react';

/**
 * MobileFilterDrawer
 * The full-screen overlay + left slide-in drawer with sticky header and
 * sticky "Show N results" footer button — duplicated identically across all
 * five gallery pages. Now lives in one place.
 *
 * Props:
 *   open          – boolean, controls visibility
 *   onClose       – called when overlay or close button is clicked
 *   resultCount   – number to display in the footer CTA
 *   resultLabel   – noun used in the footer CTA, e.g. 'Properties', 'Items', 'Vehicles'
 *   children      – filter sidebar JSX
 */
export default function MobileFilterDrawer({ open, onClose, resultCount, resultLabel = 'Results', children }) {
  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute left-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto overscroll-contain">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <span className="font-bold text-brand-charcoal">Filters</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i className="fa-solid fa-xmark text-gray-500" />
          </button>
        </div>

        {/* Filter content */}
        <div className="px-5 py-4">{children}</div>

        {/* Footer CTA with iOS safe area padding */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xs">
          <button
            onClick={onClose}
            className="w-full bg-brand-blue text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Show {resultCount} {resultLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
