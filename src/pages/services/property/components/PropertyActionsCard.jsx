import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { contactInfo } from '../../../../constants/footerContent';

export default function PropertyActionsCard({
  property,
  onEnquire,
  onShare,
  isSticky = false,
}) {
  const [saved, setSaved] = useState(false);
  if (!property) return null;

  const whatsappUrl = `https://wa.me/${contactInfo.whatsapp}?text=${encodeURIComponent(
    `Hi, I would like to enquire about ${property.title || 'this property'}.`
  )}`;

  const propertyId = property.id || property._id || '21';

  if (isSticky) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-brand-charcoal">Interested?</h3>
          <p className="text-xs text-gray-500 mt-1">Take the next step towards your dream property.</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onEnquire}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-blue text-white px-4 py-3 text-sm font-bold hover:bg-brand-navy transition-colors shadow-xs"
          >
            <i className="fa-solid fa-paper-plane text-xs" /> Enquire Now
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-3 text-sm font-bold hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <i className="fa-brands fa-whatsapp text-base" /> WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-1">
      {/* Property ID */}
      <p className="text-xs font-medium text-gray-400">
        # ID: {propertyId}
      </p>

      {/* Save & Share */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setSaved(!saved)}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors shadow-2xs ${
            saved
              ? 'border-rose-200 bg-rose-50 text-rose-600'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <i className={`${saved ? 'fa-solid' : 'fa-regular'} fa-heart ${saved ? 'text-rose-600' : 'text-gray-400'}`} />
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <i className="fa-solid fa-share-nodes text-gray-400" />
            <span>Share</span>
          </button>
        )}
      </div>

      {/* Action Buttons: Enquire Now, WhatsApp, Contact Us */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <button
          type="button"
          onClick={onEnquire}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-blue text-white px-4 py-3 text-xs sm:text-sm font-bold hover:bg-brand-navy transition-colors shadow-xs"
        >
          <i className="fa-solid fa-paper-plane text-xs" /> Enquire Now
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-3 text-xs sm:text-sm font-bold hover:bg-emerald-700 transition-colors shadow-xs"
        >
          <i className="fa-brands fa-whatsapp text-base" /> WhatsApp
        </a>
        <Link
          to="/contact-us/"
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-white px-4 py-3 text-xs sm:text-sm font-bold hover:bg-amber-600 transition-colors shadow-xs text-center"
        >
          <i className="fa-solid fa-headset text-xs" /> Contact Us
        </Link>
      </div>
    </div>
  );
}
