import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const PROMO_IMAGE_URL =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';

const INITIAL_DELAY_MS = 2500; // 2.5 seconds appearance on fresh visit

export default function PromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    sessionStorage.setItem('onevishwam_modal_shown', 'true');
    sessionStorage.setItem('onevishwam_modal_closed_at', Date.now().toString());
    window.dispatchEvent(
      new CustomEvent('onevishwam:promomodal_closed', { detail: { timestamp: Date.now() } })
    );
  }, []);

  // 1. Show once per browser session on initial visit
  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem('onevishwam_modal_shown');
    if (hasBeenShown) {
      return;
    }

    const timer = setTimeout(() => {
      handleOpen();
      sessionStorage.setItem('onevishwam_modal_shown', 'true');
    }, INITIAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [handleOpen]);

  // 2. Allow programmatic trigger via custom event
  useEffect(() => {
    const handleCustomOpen = () => handleOpen();
    window.addEventListener('onevishwam:open_promomodal', handleCustomOpen);
    return () => window.removeEventListener('onevishwam:open_promomodal', handleCustomOpen);
  }, [handleOpen]);

  // 3. Close on Escape key press & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-modal-title"
    >
      {/* Modal Card Container - Height-constrained & fully responsive */}
      <div
        className="relative w-full max-w-lg sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-[0_25px_70px_rgba(0,0,0,0.25)] border border-amber-300/80 transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 shrink-0" />

        {/* Ambient Warm Corner Glow Effects */}
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Compact Top Header with Architectural Banner */}
        <div className="relative h-20 sm:h-24 w-full shrink-0 overflow-hidden bg-slate-100">
          <img
            src={PROMO_IMAGE_URL}
            alt="Onevishwam Luxury Properties"
            className="w-full h-full object-cover object-center transform scale-105"
            loading="eager"
          />
          {/* Soft Gradients blending into the card body */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-white/60" />

          {/* Top-Left Brand Pill */}
          <div className="absolute top-2.5 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-900 border border-amber-300/80 shadow-xs">
            <img src={logo} alt="Onevishwam" className="h-3.5 sm:h-4 w-auto object-contain" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Special Offer</span>
          </div>

          {/* Top-Right Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-2.5 right-3 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 hover:text-slate-900 hover:bg-white border border-slate-200 backdrop-blur-md transition-all shadow-sm active:scale-95 cursor-pointer"
            aria-label="Close promotional modal"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>

        {/* Scrollable Content Area (Fits perfectly on laptop/mobile screens) */}
        <div className="px-4 sm:px-6 pt-1 pb-4 flex-1 overflow-y-auto scrollbar-hide relative z-10">
          {/* Main Title & Subtitle */}
          <div className="text-center">
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-700 mb-0.5 flex items-center justify-center gap-1">
              <i className="fa-solid fa-gem text-[9px] text-amber-500" />
              Pay EMI, Own Property
            </p>
            <h2
              id="promo-modal-title"
              className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight"
            >
              PAY EMI,{' '}
              <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-transparent">
                OWN PROPERTY!
              </span>
            </h2>
            <p className="mt-0.5 text-[11px] sm:text-xs font-semibold text-slate-600 max-w-sm mx-auto">
              Convert your monthly rent into real property ownership with Onevishwam.
            </p>
          </div>

          {/* 2-Column Comparison Sheet (Compact Side-by-Side) */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
            {/* LEFT — CURRENT RENT */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 sm:p-3 text-left flex flex-col justify-between shadow-2xs">
              <div>
                <span className="inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded">
                  CURRENT RENT
                </span>
                <p className="mt-1.5 text-xs sm:text-sm font-black text-rose-600 tracking-tight">
                  No Asset Building
                </p>
                <ul className="mt-1.5 space-y-1 text-[10px] sm:text-[11px] text-slate-600 font-medium">
                  <li className="flex items-start gap-1.5">
                    <i className="fa-solid fa-circle-xmark text-rose-400 mt-0.5 text-[10px] shrink-0" />
                    <span>Pure monthly expense</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <i className="fa-solid fa-circle-xmark text-rose-400 mt-0.5 text-[10px] shrink-0" />
                    <span>Zero title ownership</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <i className="fa-solid fa-circle-xmark text-rose-400 mt-0.5 text-[10px] shrink-0" />
                    <span>No returns or equity</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* RIGHT — ONEVISHWAM EMI */}
            <div className="rounded-xl bg-gradient-to-b from-amber-50/90 to-amber-100/70 border-2 border-amber-400 p-2.5 sm:p-3 text-left flex flex-col justify-between shadow-xs">
              <div>
                <span className="inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-200 px-2 py-0.5 rounded border border-amber-300">
                  ONEVISHWAM EMI
                </span>
                <p className="mt-1.5 text-xs sm:text-sm font-black text-amber-900 tracking-tight">
                  Own Your Asset
                </p>
                <ul className="mt-1.5 space-y-1 text-[10px] sm:text-[11px] text-slate-800 font-semibold">
                  <li className="flex items-start gap-1.5">
                    <i className="fa-solid fa-circle-check text-amber-600 mt-0.5 text-[10px] shrink-0" />
                    <span>100% Property title</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <i className="fa-solid fa-circle-check text-amber-600 mt-0.5 text-[10px] shrink-0" />
                    <span>Long-term asset growth</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-amber-950 font-bold">
                    <i className="fa-solid fa-circle-check text-amber-600 mt-0.5 text-[10px] shrink-0" />
                    <span>Pre-approved loan support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-700">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 shadow-2xs">
              <i className="fa-solid fa-circle-check text-[9px] text-emerald-600" /> Pre-Approved Loans
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 shadow-2xs">
              <i className="fa-solid fa-shield-halved text-[9px] text-blue-600" /> Clear Legal Titles
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 shadow-2xs">
              <i className="fa-solid fa-location-dot text-[9px] text-amber-600" /> Prime Bengaluru Plots
            </span>
          </div>

          {/* Action CTAs - Always in reach */}
          <div className="mt-3.5 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => {
                handleClose();
                navigate('/enquiry/');
              }}
              className="w-full inline-flex justify-center items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98] px-4 py-2.5 text-xs sm:text-sm font-black text-slate-950 shadow-md shadow-amber-500/30 transition-all cursor-pointer"
            >
              <span>Claim Offer Now</span>
              <i className="fa-solid fa-arrow-right text-[11px]" />
            </button>
            <button
              type="button"
              onClick={() => {
                handleClose();
                navigate('/property');
              }}
              className="w-full inline-flex justify-center items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800 active:scale-[0.98] px-4 py-2.5 text-xs sm:text-sm font-extrabold transition-all shadow-xs cursor-pointer"
            >
              <i className="fa-solid fa-building-columns text-[11px] text-slate-500" />
              <span>Explore Properties</span>
            </button>
          </div>

          {/* Micro Disclaimer */}
          <p className="mt-2 text-center text-[9px] sm:text-[10px] text-slate-400">
            *Limited period promotional scheme. Terms & conditions apply.
          </p>
        </div>
      </div>
    </div>
  );
}
