import { useEffect, lazy, Suspense } from 'react';
import PageSkeleton from '../../components/ui/PageSkeleton';
import PageHero from '../../components/PageHero';

const PropertyGallery = lazy(() => import('./property/PropertyGallery'));
const JewelleryGallery = lazy(() => import('./jewellery/JewelleryGallery'));
const AutomobileGallery = lazy(() => import('./automobile/AutomobileGallery'));
const ElectronicsGallery = lazy(() => import('./electronics/ElectronicsGallery'));
const BeddingGallery = lazy(() => import('./bedding/BeddingGallery'));
const GroceryGallery = lazy(() => import('./grocery/GroceryGallery'));
const GarmentGallery = lazy(() => import('./garments/GarmentGallery'));
const FinanceLoanGallery = lazy(() => import('./finance/FinanceLoanGallery'));

const galleryFallback = <PageSkeleton />;

function ServiceDetails({ service }) {
  useEffect(() => { window.scrollTo(0, 0); }, [service?.id]);

  if (!service) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-400">Service not found</h1>
      </div>
    );
  }

  if (service.id === 'properties') return <Suspense fallback={galleryFallback}><PropertyGallery /></Suspense>;
  if (service.id === 'automobile') return <Suspense fallback={galleryFallback}><AutomobileGallery /></Suspense>;
  if (service.id === 'consumer-electronics') return <Suspense fallback={galleryFallback}><ElectronicsGallery /></Suspense>;
  if (service.id === 'bedding-comfort') return <Suspense fallback={galleryFallback}><BeddingGallery /></Suspense>;
  if (service.id === 'jewellery-gold' || service.id === 'jewellery') return <Suspense fallback={galleryFallback}><JewelleryGallery /></Suspense>;
  if (service.id === 'consumer-marketplace') return <Suspense fallback={galleryFallback}><GroceryGallery /></Suspense>;
  if (service.id === 'garments-fashion-lifestyle') return <Suspense fallback={galleryFallback}><GarmentGallery /></Suspense>;
  if (service.id === 'finance-lending') return <Suspense fallback={galleryFallback}><FinanceLoanGallery /></Suspense>;

  return (
    <div>
      <PageHero
        eyebrow="Service Details"
        title={service.title}
        subtitle={service.description}
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 xl:grid-cols-3">
            <div className="xl:col-span-2 space-y-12">
              {service.details?.overviewText && (
                <div className="border-l-4 border-brand-blue pl-6">
                  <p className="text-lg leading-relaxed text-gray-700">{service.details.overviewText}</p>
                </div>
              )}
              {service.details?.sections?.map((section, idx) => (
                <div key={idx}>
                  <h2 className="text-xl font-bold text-brand-charcoal mb-4">{section.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    {section.items.map((item, i) => (
                      <span key={i} className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              {service.details?.specialFeatures?.length > 0 && (
                <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue mb-4">Special Features</h3>
                  <ul className="space-y-3">
                    {service.details.specialFeatures.map((f, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-700">
                        <i className="fa-solid fa-circle-check text-brand-blue mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="relative rounded-2xl bg-gradient-to-b from-[#d9ebfa] via-[#e8f2fb] to-[#cfe4f6] text-slate-900 p-6 border border-sky-200/90 shadow-sm overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-300/40 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-lg font-black text-slate-950">Ready to get started?</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 font-semibold">Contact our team to discuss your requirements.</p>
                  <a
                    href="/contact-us/"
                    className="mt-4 inline-flex w-full items-center justify-center bg-brand-blue text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-navy transition-all shadow-md hover:scale-[1.02] active:scale-95"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ServiceDetails;
