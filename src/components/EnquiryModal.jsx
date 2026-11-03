import { useEffect, useState, useCallback } from 'react';
import { getPropertyContactInfo } from '../constants/footerContent';

function EnquiryModal({ open, isOpen, onClose, propertyTitle, propertyId }) {
  const [localOpen, setLocalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [copied, setCopied] = useState(false);

  const isModalOpen = open ?? isOpen ?? localOpen;
  const activeTitle = propertyTitle || eventTitle;
  const activeContact = getPropertyContactInfo(activeTitle);

  const handleCloseModal = useCallback(() => {
    setLocalOpen(false);
    if (onClose) onClose();
  }, [onClose]);

  // Listen for global custom event to trigger modal anywhere
  useEffect(() => {
    const handleGlobalOpen = (e) => {
      setEventTitle(e?.detail?.title || '');
      setLocalOpen(true);
    };
    window.addEventListener('onevishwam:open_enquiry_modal', handleGlobalOpen);
    return () => window.removeEventListener('onevishwam:open_enquiry_modal', handleGlobalOpen);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e) => { if (e.key === 'Escape') handleCloseModal(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isModalOpen, handleCloseModal]);

  useEffect(() => {
    if (!isModalOpen) setCopied(false);
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  // Resolve fields — handle both old phoneDisplay and any legacy phone field
  const phone = activeContact.phoneDisplay || activeContact.phone || '+91 85469 96622';
  const whatsapp = activeContact.whatsapp || '918546996622';
  const email = activeContact.email || 'ceo@onevishwam.com';
  const brandName = activeContact.brandName || 'OneVishwam';

  const copyPhone = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={handleCloseModal}>
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-b from-[#d9ebfa] via-[#e8f2fb] to-[#cfe4f6] px-6 py-5 text-slate-900 border-b border-sky-200/80 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-300/40 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-brand-blue" /> Contact &amp; Visit Details
              </h2>
              {activeTitle && (
                <p className="mt-1 text-xs text-slate-600 font-semibold line-clamp-2">{activeTitle}</p>
              )}
            </div>
            <button
              onClick={handleCloseModal}
              className="w-8 h-8 rounded-full bg-white/80 text-slate-700 flex items-center justify-center hover:bg-white transition-colors shrink-0 cursor-pointer shadow-2xs border border-sky-200/70"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-gray-600">
            Visit our office or get in touch with our {brandName} team for pricing, product visits, and assistance.
          </p>

          {/* Phone */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-phone text-brand-blue text-sm" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-base font-bold text-brand-charcoal mt-0.5">{phone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={copyPhone}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  copied ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-blue text-white hover:bg-brand-navy'
                }`}
              >
                <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-envelope text-emerald-600 text-sm" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                <a
                  href={`mailto:${email}`}
                  className="text-sm font-bold text-brand-charcoal hover:text-brand-blue transition-colors mt-0.5 block"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${whatsapp}${
              activeTitle
                ? `?text=${encodeURIComponent(`Hi, I would like to enquire about ${activeTitle}.`)}`
                : '?text=Hello%20OneVishwam%20Team%2C%20I%27m%20interested%20in%20your%20services.'
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#25D366] text-white px-4 py-3.5 text-sm font-bold hover:bg-[#1ebe5d] transition-colors shadow-xs"
          >
            <i className="fa-brands fa-whatsapp text-lg" /> Chat on WhatsApp
          </a>

          {/* Close */}
          <button
            type="button"
            onClick={handleCloseModal}
            className="w-full rounded-xl border border-gray-200 text-gray-600 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnquiryModal;