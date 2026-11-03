import React from 'react';

/**
 * SectorPageHeader
 * ────────────────
 * Unified page header used at the top of every sector gallery page.
 * Intentionally has NO back button — navigation is handled by the
 * main navbar and browser history.
 *
 * Props
 * ─────
 * eyebrow    – Small all-caps label above the title (e.g. "OneVishwam · Properties")
 * title      – Page H1 (e.g. "Find Your Property")
 * count      – Optional live count of results (shows availability badge when provided)
 * countLabel – Singular noun for the badge (default "listing")
 * className  – Extra wrapper classes
 *
 * Example
 * ───────
 * <SectorPageHeader
 *   eyebrow="OneVishwam · Properties"
 *   title="Find Your Property"
 *   count={filteredProperties.length}
 *   countLabel="listing"
 * />
 */
export function SectorPageHeader({
  eyebrow,
  title,
  count,
  countLabel = 'listing',
  className = 'mb-5',
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 ${className}`}>
      {/* Left — eyebrow + title */}
      <div>
        {eyebrow && (
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-brand-blue mb-1 mt-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-charcoal sm:text-3xl">
          {title}
        </h1>
      </div>

      {/* Right — live availability badge */}
      {count !== undefined && count !== null && (
        <div className="flex items-center gap-2 pb-0.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-500 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>
              <strong className="text-brand-charcoal font-bold">{count}</strong>{' '}
              {countLabel}{count !== 1 ? 's' : ''} available
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

export default SectorPageHeader;

