import React, { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFinanceServices, useFinanceServiceById, useSimilarFinanceServices } from './financeHooks';
import { useAuth } from '../../../store/authSlice';
import AuthRequiredView from '../../../components/auth/AuthRequiredView';
import MasterDetailPage from '../../../components/common/templates/MasterDetailPage';
import { mapFinanceServiceToEntityItem } from '../../../components/common/templates/adapters';

export default function FinanceDetails() {
  const { id: serviceId } = useParams();
  const { isLoggedIn, openAuthModal } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      sessionStorage.setItem('vishwam_auth_redirect', window.location.pathname + window.location.search);
      openAuthModal('login');
    }
  }, [isLoggedIn, openAuthModal]);

  const { services, loading: listLoading } = useFinanceServices();
  const { service: directService, loading: directLoading, error: directError } = useFinanceServiceById(serviceId);
  const { similar: relatedServices } = useSimilarFinanceServices(serviceId);

  const foundFromList = (services || []).find(
    (s) => String(s._id) === String(serviceId) || String(s.id) === String(serviceId) || s.serviceName === serviceId
  ) || null;
  const service = (directService?.item || directService) || (foundFromList?.item || foundFromList);
  const loading = !service && (listLoading || directLoading);
  const error = !service && !listLoading && !directLoading ? (directError || 'Service not found') : null;

  const mappedService = useMemo(() => {
    if (!service) return null;
    return mapFinanceServiceToEntityItem(service);
  }, [service]);

  const mappedSimilar = useMemo(() => {
    if (!relatedServices || !Array.isArray(relatedServices)) return [];
    return relatedServices.map(mapFinanceServiceToEntityItem).filter(Boolean);
  }, [relatedServices]);

  if (!isLoggedIn) {
    return (
      <AuthRequiredView
        title="Login to View Finance Details"
        message="Please log in or create an account to view interest rates, loan terms, eligibility criteria, and application assistance."
        backUrl="/our-services/finance-lending"
      />
    );
  }

  return (
    <MasterDetailPage
      item={mappedService}
      loading={loading}
      error={error}
      categoryName="Finance & Loans"
      categoryLink="/our-services/finance-lending"
      similarItems={mappedSimilar}
      itemLinkPrefix="/finance-service/"
    >
      {service && (
        <div className="space-y-8 mt-4">
          {/* Eligibility Section */}
          {Array.isArray(service.eligibility) && service.eligibility.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <i className="fa-solid fa-user-check text-purple-600 text-base" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brand-charcoal">Applicant Eligibility</h2>
                  <p className="text-xs text-gray-500">Criteria required for approval</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {service.eligibility.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5">
                    <i className="fa-solid fa-circle-check text-emerald-600 text-sm shrink-0" />
                    <span className="text-xs font-medium text-gray-700">{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Documents Section */}
          {Array.isArray(service.documentsRequired) && service.documentsRequired.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <i className="fa-solid fa-file-lines text-amber-600 text-base" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brand-charcoal">Documents Required</h2>
                  <p className="text-xs text-gray-500">Checklist for verification &amp; processing</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {service.documentsRequired.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3.5">
                    <i className="fa-solid fa-file text-amber-600 text-xs shrink-0" />
                    <span className="text-xs font-medium text-gray-700">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </MasterDetailPage>
  );
}
