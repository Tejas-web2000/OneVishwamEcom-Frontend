import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import logoIcon from '../assets/Logo_icon.png';

/**
 * REPEAT_INTERVAL_MS:
 * Time in milliseconds to wait before re-triggering the toast after closing (5 minutes).
 */
const TOAST_DELAY_AFTER_MODAL_MS = 5 * 60 * 1000; // 5 minutes after promo modal is closed
const REPEAT_INTERVAL_MS = 5 * 60 * 1000;

export default function PromoToast() {
  const [visible, setVisible] = useState(false);
  const retriggerTimerRef = useRef(null);
  const navigate = useNavigate();

  // Schedule toast appearance after 5 minutes of modal closing
  const scheduleToast = useCallback((delayMs) => {
    if (retriggerTimerRef.current) {
      clearTimeout(retriggerTimerRef.current);
    }
    retriggerTimerRef.current = setTimeout(() => {
      setVisible(true);
    }, delayMs);
  }, []);

  // Handle dismiss with recurring re-trigger timer (5 mins)
  const handleDismiss = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem('onevishwam_toast_dismissed_at', Date.now().toString());

    if (retriggerTimerRef.current) {
      clearTimeout(retriggerTimerRef.current);
    }

    retriggerTimerRef.current = setTimeout(() => {
      setVisible(true);
    }, REPEAT_INTERVAL_MS);
  }, []);

  useEffect(() => {
    // 1. Check if modal was already closed in this session
    const modalClosedAt = sessionStorage.getItem('onevishwam_modal_closed_at');
    const toastDismissedAt = sessionStorage.getItem('onevishwam_toast_dismissed_at');

    if (toastDismissedAt) {
      const elapsedSinceDismiss = Date.now() - Number(toastDismissedAt);
      if (elapsedSinceDismiss < REPEAT_INTERVAL_MS) {
        scheduleToast(REPEAT_INTERVAL_MS - elapsedSinceDismiss);
      } else {
        setVisible(true);
      }
    } else if (modalClosedAt) {
      const elapsedSinceModal = Date.now() - Number(modalClosedAt);
      if (elapsedSinceModal >= TOAST_DELAY_AFTER_MODAL_MS) {
        setVisible(true);
      } else {
        scheduleToast(TOAST_DELAY_AFTER_MODAL_MS - elapsedSinceModal);
      }
    }

    // 2. Listen for modal closure event -> hide toast completely
    const handleModalClosed = () => {
      setVisible(false);
      sessionStorage.setItem('onevishwam_toast_dismissed_at', Date.now().toString());
      if (retriggerTimerRef.current) {
        clearTimeout(retriggerTimerRef.current);
      }
    };

    window.addEventListener('onevishwam:promomodal_closed', handleModalClosed);

    return () => {
      window.removeEventListener('onevishwam:promomodal_closed', handleModalClosed);
      if (retriggerTimerRef.current) {
        clearTimeout(retriggerTimerRef.current);
      }
    };
  }, [scheduleToast]);

  // Open Promo Modal when toast or CTA is clicked
  const handleToastClick = (e) => {
    if (e.target.closest('button[aria-label="Dismiss offer notification"]')) {
      handleDismiss();
      return;
    }
    setVisible(false);
    window.dispatchEvent(new CustomEvent('onevishwam:open_promomodal'));
  };

  return (
    <aside
      aria-live="polite"
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[999] w-[calc(100vw-2rem)] sm:w-[380px] max-w-sm transition-all duration-500 ease-out transform ${
        visible
          ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
          : 'translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      {/* Toast Card (Clicking opens Promo Modal) */}
      <div
        onClick={handleToastClick}
        className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md text-slate-900 border border-slate-200 shadow-xl p-4 sm:p-4.5 cursor-pointer group/toast"
      >
        {/* Subtle Ambient Corner Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100/90 text-slate-500 hover:text-slate-900 hover:bg-slate-200/90 transition-all border border-slate-200 shadow-2xs cursor-pointer"
          aria-label="Dismiss offer notification"
        >
          <i className="fa-solid fa-xmark text-xs" />
        </button>

        {/* Card Content Row */}
        <div className="flex items-start gap-3.5 pr-5">
          {/* Logo Icon */}
          <img
            src={logoIcon}
            alt="Onevishwam"
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 mt-0.5 drop-shadow-xs group-hover/toast:scale-105 transition-transform"
          />

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                Special Offer
              </span>
            </div>

            <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug group-hover/toast:text-blue-600 transition-colors">
              PAY 1 EMI,{' '}
              <span className="text-blue-600 underline decoration-blue-300 decoration-2 underline-offset-2">
                BUY PROPERTY!
              </span>
            </h3>

            <p className="mt-0.5 text-xs text-slate-600 font-medium leading-tight">
              Convert your rent into property ownership.
            </p>

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleToastClick}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-1.5 text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>View Offer Details</span>
                <i className="fa-solid fa-arrow-right text-[10px]" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss();
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2 py-1 transition-colors cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
