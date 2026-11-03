import React from 'react';
import LottieFeedbackAnimation from './LottieFeedbackAnimation';

/**
 * Reusable EmptyStateCard component for zero-result search or filter state views.
 *
 * @param {Object} props
 * @param {'searchEmpty' | 'emptyCatalog' | 'notFound404'} [props.animationType='searchEmpty'] - Lottie animation preset
 * @param {boolean} [props.showAnimation=true] - Whether to render Lottie animation
 * @param {string} [props.icon] - FontAwesome icon class fallback (e.g. "fa-magnifying-glass", "fa-gem")
 * @param {string} [props.title] - Empty state heading
 * @param {string} [props.subtitle] - Empty state description/hint
 * @param {() => void} [props.onReset] - Optional reset action callback
 * @param {string} [props.resetLabel] - Button text for reset action
 * @param {string} [props.className] - Optional container CSS class
 */
function EmptyStateCard({
  animationType = 'searchEmpty',
  showAnimation = true,
  icon = 'fa-magnifying-glass',
  title = 'No items found',
  subtitle = 'Try adjusting your filters or search terms.',
  onReset,
  resetLabel = 'Reset Filters',
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white/80 backdrop-blur-xs py-12 px-6 text-center shadow-xs transition-all animate-fade-in ${className}`}>
      {showAnimation ? (
        <div className="mb-3">
          <LottieFeedbackAnimation type={animationType} size="md" fallbackIcon={`fa-solid ${icon}`} />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
          <i className={`fa-solid ${icon} text-3xl`} />
        </div>
      )}

      <p className="text-lg font-bold text-brand-charcoal tracking-tight">{title}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1.5 max-w-sm leading-relaxed">{subtitle}</p>}
      
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy active:scale-95 transition-all shadow-sm shadow-brand-blue/20 cursor-pointer"
        >
          <i className="fa-solid fa-rotate-left text-[11px]" />
          {resetLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyStateCard;
