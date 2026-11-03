import React from 'react';
import { Link } from 'react-router-dom';
import LottieFeedbackAnimation from './LottieFeedbackAnimation';

export default function LottieComingSoon({
  title = 'Category Coming Soon',
  description = 'We are currently onboarding verified sellers, setting up catalog listings, and finalizing partnerships for this sector.',
  icon = 'fa-solid fa-rocket',
}) {
  return (
    <div className="w-full flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      {/* Lottie Animation Container */}
      <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-square sm:aspect-video flex items-center justify-center rounded-2xl overflow-hidden mb-4">
        <LottieFeedbackAnimation
          type="comingSoon"
          size="lg"
          fallbackIcon={icon}
          style={{ width: '100%', height: '100%', maxHeight: '280px' }}
        />
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-xs">
          <i className="fa-solid fa-clock text-[11px] animate-pulse" />
          Coming Soon • Under Active Development
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight flex items-center justify-center gap-2">
          {icon && <i className={`${icon} text-brand-blue text-xl sm:text-2xl`} />}
          <span>{title}</span>
        </h2>

        <p className="mt-3 text-xs sm:text-sm text-gray-500 leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-md shadow-brand-blue/20 hover:bg-brand-navy hover:shadow-lg transition-all"
          >
            <i className="fa-solid fa-table-cells text-xs" />
            Explore All Categories
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all shadow-xs"
          >
            <i className="fa-solid fa-house text-xs" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
