import React, { useState } from 'react';

const PHONE = '+91 85469 96622';
const PHONE_RAW = '918546996622';
const EMAIL = 'ceo@onevishwam.com';
const WHATSAPP_URL = `https://wa.me/${PHONE_RAW}?text=Hello%20OneVishwam%20Team%2C%20I%27m%20interested%20in%20your%20services%20and%20would%20like%20to%20know%20more.`;

/**
 * ContactDetailsModal
 * Reusable company contact modal used across all sector gallery pages.
 * Shows phone (with copy), email, and a WhatsApp CTA.
 */
export default function ContactDetailsModal({ open, onClose, sectorName = 'OneVishwam' }) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  function handleCopy() {
    navigator.clipboard.writeText(PHONE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Contact Details">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#0f2347] px-6 pt-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-location-dot text-white text-lg" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Contact &amp; Visit Details</h2>
              <p className="text-blue-200 text-xs font-medium mt-0.5">{sectorName}</p>
            </div>
          </div>
          <p className="mt-4 text-blue-100/90 text-sm leading-relaxed">
            Visit our office or get in touch with our OneVishwam team for pricing, product visits, and assistance.
          </p>
        </div>

        {/* Body */}
        <div className="bg-white px-6 py-5 space-y-3">
          {/* Phone */}
          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-phone text-brand-blue text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">{PHONE}</p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#1a3a6b] text-white hover:bg-[#0f2347]'
              }`}
            >
              <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} text-[11px]`} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-envelope text-emerald-600 text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
              <a
                href={`mailto:${EMAIL}`}
                className="text-sm font-bold text-gray-900 hover:text-brand-blue transition-colors mt-0.5 block"
              >
                {EMAIL}
              </a>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-4 text-sm transition-all shadow-lg hover:shadow-[#25D366]/30 hover:scale-[1.02] active:scale-100 mt-1"
          >
            <i className="fa-brands fa-whatsapp text-xl" />
            Chat on WhatsApp
          </a>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-gray-200 bg-white text-gray-500 font-semibold py-3 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </div>
  );
}
