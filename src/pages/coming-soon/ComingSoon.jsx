import React from 'react';
import { useSearchParams } from 'react-router-dom';
import LottieComingSoon from '../../components/common/LottieComingSoon';
import { marketplaceCategories } from '../../constants/categoriesData';
import { serviceItems, serviceIconMap } from '../../constants/servicesContent';

export default function ComingSoon() {
  const [params] = useSearchParams();
  const sectorKey = params.get('sector') || '';

  const categoryMatch = marketplaceCategories.find((c) => c.id === sectorKey);
  const serviceMatch = serviceItems.find((s) => s.id === sectorKey);

  const title = categoryMatch?.label || serviceMatch?.title || 'Marketplace Sector';
  const description = serviceMatch?.description || categoryMatch?.shortDesc || 'We are building a verified marketplace for this sector with seamless financing, catalog browsing, and instant seller connections.';
  const icon = categoryMatch?.icon || serviceIconMap[sectorKey] || 'fa-solid fa-rocket';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-gray-200/80 shadow-xl shadow-slate-200/60 p-6 sm:p-10 text-center">
        <LottieComingSoon
          title={title}
          description={description}
          icon={icon}
        />
      </div>
    </div>
  );
}
