import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LottieFeedbackAnimation from '../../components/common/LottieFeedbackAnimation';

export default function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '404 - Page Not Found | OneVishwam';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl mx-auto text-center animate-fade-in">
        {/* Lottie 404 Animation */}
        <div className="w-full max-w-md mx-auto mb-6 flex items-center justify-center">
          <LottieFeedbackAnimation
            type="notFound404"
            size="xl"
            fallbackIcon="fa-solid fa-triangle-exclamation"
            style={{ width: '100%', height: 'auto', maxHeight: '320px' }}
          />
        </div>

        {/* Status Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold uppercase tracking-wider mb-3">
          <i className="fa-solid fa-circle-exclamation text-[11px]" />
          Error 404 • Page Not Found
        </span>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight">
          Lost in the Marketplace?
        </h1>

        <p className="mt-3 text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          The page or product you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>

        {/* Navigation Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all shadow-xs cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            Go Back
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-md shadow-brand-blue/20 hover:bg-brand-navy hover:shadow-lg transition-all"
          >
            <i className="fa-solid fa-house text-xs" />
            Return Home
          </Link>

          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all shadow-xs"
          >
            <i className="fa-solid fa-table-cells text-xs" />
            Browse Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
