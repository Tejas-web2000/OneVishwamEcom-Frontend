import React from 'react';
import LottieFeedbackAnimation from '../../../components/common/LottieFeedbackAnimation';

/**
 * Standard EmptyState component for galleries when no items match the filter/search criteria.
 *
 * @param {Object} props
 * @param {'emptyCatalog' | 'searchEmpty'} [props.animationType='emptyCatalog']
 * @param {boolean} [props.showAnimation=true]
 * @param {string} [props.icon] - FontAwesome icon fallback
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {() => void} [props.onReset]
 * @param {string} [props.resetLabel]
 * @param {React.ReactNode} [props.action]
 * @param {string} [props.className]
 */
export default function EmptyState({
  animationType = 'emptyCatalog',
  showAnimation = true,
  icon = 'fa-solid fa-box-open',
  title = 'No items found',
  subtitle = 'Try adjusting your filters or search term.',
  onReset,
  resetLabel = 'Reset All Filters',
  action,
  className = 'py-12 text-center text-gray-400 animate-fade-in',
}) {
  return (
    <div className={className}>
      {showAnimation ? (
        <div className="mb-2">
          <LottieFeedbackAnimation type={animationType} size="md" fallbackIcon={icon} />
        </div>
      ) : (
        <i className={`${icon} text-4xl mb-4 text-gray-300`} />
      )}

      <h3 className="text-lg font-bold text-brand-charcoal tracking-tight">{title}</h3>
      {subtitle && <p className="text-sm mt-1.5 mb-6 text-gray-500 max-w-sm mx-auto leading-relaxed">{subtitle}</p>}
      
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <i className="fa-solid fa-rotate-left" />
            {resetLabel}
          </button>
        )}
        {action}
      </div>
    </div>
  );
}
