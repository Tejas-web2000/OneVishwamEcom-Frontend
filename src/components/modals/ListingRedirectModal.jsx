import { useEffect } from 'react';

const LISTING_SITE_URL = import.meta.env.VITE_LISTING_SITE_URL || 'https://onevishwam-listings.web.app';

export default function ListingRedirectModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    window.open(LISTING_SITE_URL, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-blue via-brand-gold to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-sm" />
        </button>

        {/* Modal Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-amber-500/25 mb-4">
          <i className="fa-solid fa-boxes-stacked" />
        </div>

        {/* Heading */}
        <h3
          id="listing-modal-title"
          className="text-xl font-extrabold text-slate-900 tracking-tight"
        >
          Do you want to list an item?
        </h3>

        {/* Description */}
        <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
          You are being redirected to the <strong>OneVishwam Partner &amp; Listing Portal</strong> where you can add properties, automobiles, electronics, and comfort products.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            No, Go Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-blue to-indigo-600 hover:from-brand-navy hover:to-indigo-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
          >
            <span>Yes, Continue</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}

