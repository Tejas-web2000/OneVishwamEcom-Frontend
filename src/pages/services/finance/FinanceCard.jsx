import { useState, memo } from 'react';
import { navigateTo } from '../../../config/navigation';
import { useAuth } from '../../../store/authSlice';
import { formatFinanceAmount } from './financeConstants';

const FALLBACK_LOGO = 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="none"><rect width="80" height="80" rx="12" fill="#e5e7eb"/><path fill="#9ca3af" d="M28 48h24v-2l-8-8-16 16v-6zm-4 6h32V30l-8-8-24 24v8z"/></svg>`
);

export default memo(function FinanceCard({ service }) {
  const [logoError, setLogoError] = useState(false);
  const { isLoggedIn, openAuthModal } = useAuth();

  const handleCardClick = (e) => {
    const targetUrl = `/finance-service/${service._id || service.id}`;
    if (!isLoggedIn) {
      if (e && e.preventDefault) e.preventDefault();
      sessionStorage.setItem('vishwam_auth_redirect', targetUrl);
      openAuthModal('login');
      return;
    }
    navigateTo(targetUrl);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-brand-blue/20 hover:border-brand-blue/50 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col shadow-2xs"
    >
      {/* Banner area */}
      <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-navy/10 to-brand-blue/10 relative">
        {service.banner && (
          <img src={service.banner} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Logo overlay */}
        <div className="absolute bottom-3 left-3 w-12 h-12 rounded-xl border-2 border-white overflow-hidden bg-white shadow-md">
          <img
            src={logoError || !service.logo ? FALLBACK_LOGO : service.logo}
            alt={service.companyName}
            onError={() => setLogoError(true)}
            className="h-full w-full object-contain"
          />
        </div>
        {/* Badge */}
        <span className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-brand-blue shadow-sm">
          {service.category}
        </span>
        {service.featured && (
          <span className="absolute top-3 left-3 rounded-full bg-yellow-400 px-2.5 py-0.5 text-[10px] font-bold text-brand-navy shadow-sm">
            <i className="fa-solid fa-star mr-0.5" />Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-brand-charcoal leading-snug line-clamp-2">
              {service.serviceName}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{service.companyName}</p>
          </div>
        </div>

        {/* Interest rate & amount */}
        {service.interestRate !== 'N/A' && service.interestRate !== 'Varies' && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-brand-blue/5 border border-brand-blue/10 px-3 py-2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Rate</p>
              <p className="text-sm font-bold text-brand-blue">{service.interestRate}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Starting</p>
              <p className="text-sm font-bold text-emerald-700">{formatFinanceAmount(service.minAmount)}</p>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <i className="fa-solid fa-location-dot text-brand-blue text-[10px]" />
          <span className="truncate">{service.location}</span>
        </div>

        {/* Tags */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
            {service.providerType}
          </span>
          <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
            {service.serviceMode}
          </span>
          {service.availability === 'Available Now' && (
            <span className="rounded-lg bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
              Available Now
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto pt-3 flex items-center gap-2">
          <a href={`tel:${service.contactPhone}`} onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded-lg border border-brand-blue py-2 text-center text-[11px] font-semibold text-brand-blue hover:bg-brand-blue hover:text-white transition-colors">
            <i className="fa-solid fa-phone mr-1" />Contact
          </a>
          <div className="flex-1 rounded-lg bg-brand-blue py-2 text-center text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors">
            View Details
          </div>
        </div>
      </div>
    </div>
  );
});
