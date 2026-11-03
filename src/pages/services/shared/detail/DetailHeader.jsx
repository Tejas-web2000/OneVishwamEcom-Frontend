import React from 'react';
import { withRupeeSymbol } from '../../../../utils/priceUtils';

/**
 * Universal Detail Page Header
 * Renders overline, title, subtitle, localized pricing breakdown, and status badges.
 */
export default function DetailHeader({
  overline,
  title,
  subtitle,
  price,
  originalPrice,
  discount,
  priceSuffix = '',
  badges = [],
  tags = [],
  textColor = 'text-brand-charcoal',
  accentColor = 'text-brand-blue',
  badgeClass = '',
}) {
  return (
    <div className="space-y-4">
      {/* Overline & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {overline && (
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {overline}
          </p>
        )}
        {Array.isArray(badges) && badges.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {badges.map((b, idx) => (
              <span
                key={idx}
                className={`rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
                  b.cls || 'bg-blue-100 text-blue-700'
                } ${badgeClass}`}
              >
                {b.icon && <i className={`${b.icon} mr-1`} />}
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Title */}
      <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight ${textColor}`}>
        {title}
      </h1>

      {/* Subtitle / Spec line */}
      {subtitle && (
        <p className="text-sm font-medium text-gray-500">
          {subtitle}
        </p>
      )}



      {/* Tag Chips */}
      {Array.isArray(tags) && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
