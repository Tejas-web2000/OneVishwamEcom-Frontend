import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import useLoanProducts from './useLoanProducts';
import { resolveLoan } from './loanUtils';
import { useAuth } from '../../../store/authSlice';
import AuthRequiredView from '../../../components/auth/AuthRequiredView';
import MasterDetailPage from '../../../components/common/templates/MasterDetailPage';
import { mapLoanToEntityItem } from '../../../components/common/templates/adapters';

export default function LoanDetails() {
  const { isLoggedIn, openAuthModal } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      sessionStorage.setItem('vishwam_auth_redirect', window.location.pathname + window.location.search);
      openAuthModal('login');
    }
  }, [isLoggedIn, openAuthModal]);

  if (!isLoggedIn) {
    return (
      <AuthRequiredView
        title="Login to View Loan Details"
        message="Please log in or create an account to view loan rates, calculators, eligibility criteria, and application assistance."
        backUrl="/our-services/finance-lending"
      />
    );
  }

  const pathParts = pathname.split('/').filter(Boolean);
  const loanId = pathParts.length > 1 ? pathParts[1] : null;
  const { loans, loading, error } = useLoanProducts();

  const { selected: loan, related: relatedLoans } = useMemo(
    () => resolveLoan(loans, loanId),
    [loans, loanId]
  );

  const mappedLoan = useMemo(() => {
    if (!loan) return null;
    return mapLoanToEntityItem(loan);
  }, [loan]);

  const mappedSimilar = useMemo(() => {
    if (!relatedLoans || !Array.isArray(relatedLoans)) return [];
    return relatedLoans.map(mapLoanToEntityItem).filter(Boolean);
  }, [relatedLoans]);

  // EMI Calculator State
  const isHome = loan?.type === 'home';
  const maxAmount = isHome ? 20000000 : 5000000;
  const maxTenure = isHome ? 30 : 7;
  const [emiAmount, setEmiAmount] = useState(5000000);
  const [emiRate, setEmiRate] = useState(8.5);
  const [emiTenure, setEmiTenure] = useState(20);

  const emiResult = useMemo(() => {
    const P = emiAmount;
    const r = emiRate / 12 / 100;
    const n = emiTenure * 12;
    if (r === 0 || n === 0) return { emi: 0, totalInterest: 0, totalPayment: 0 };
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;
    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
    };
  }, [emiAmount, emiRate, emiTenure]);

  return (
    <MasterDetailPage
      item={mappedLoan}
      loading={loading}
      error={error}
      categoryName="Finance & Loans"
      categoryLink="/our-services/finance-lending"
      similarItems={mappedSimilar}
      itemLinkPrefix="/finance/"
    >
      {loan && (
        <div className="space-y-8 mt-4">
          {/* ── Interactive EMI Calculator ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                <i className="fa-solid fa-calculator text-brand-blue text-base" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-brand-charcoal">Interactive EMI Calculator</h2>
                <p className="text-xs text-gray-500">Customize loan amount, tenure, and estimate monthly outflow</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Loan Amount</label>
                <input
                  type="range"
                  min="500000"
                  max={maxAmount}
                  step="100000"
                  value={emiAmount}
                  onChange={(e) => setEmiAmount(+e.target.value)}
                  className="w-full accent-brand-blue cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹5 L</span>
                  <span className="font-bold text-brand-blue">₹{(emiAmount / 100000).toFixed(1)} Lakhs</span>
                  <span>₹{maxAmount / 100000} L</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Interest Rate (%)</label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="0.1"
                  value={emiRate}
                  onChange={(e) => setEmiRate(+e.target.value)}
                  className="w-full accent-brand-blue cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5%</span>
                  <span className="font-bold text-brand-blue">{emiRate}% p.a.</span>
                  <span>20%</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Tenure (Years)</label>
                <input
                  type="range"
                  min="1"
                  max={maxTenure}
                  step="1"
                  value={emiTenure}
                  onChange={(e) => setEmiTenure(+e.target.value)}
                  className="w-full accent-brand-blue cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 yr</span>
                  <span className="font-bold text-brand-blue">{emiTenure} Years</span>
                  <span>{maxTenure} yrs</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl bg-gradient-to-br from-brand-blue/5 to-brand-navy/5 p-4 border border-brand-blue/10">
              <div className="text-center p-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Estimated Monthly EMI</p>
                <p className="text-2xl font-bold text-brand-blue mt-0.5">₹{emiResult.emi.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-center p-2 border-t sm:border-t-0 sm:border-l border-gray-200/60">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Total Interest Payable</p>
                <p className="text-2xl font-bold text-amber-600 mt-0.5">₹{emiResult.totalInterest.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-center p-2 border-t sm:border-t-0 sm:border-l border-gray-200/60">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Total Amount Payable</p>
                <p className="text-2xl font-bold text-emerald-600 mt-0.5">₹{emiResult.totalPayment.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* ── Steps to Apply ── */}
          {loan.steps && loan.steps.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <i className="fa-solid fa-list-ol text-amber-600 text-base" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brand-charcoal">How to Apply</h2>
                  <p className="text-xs text-gray-500">Simple 5-step digital lending workflow</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {loan.steps.map((step, i) => (
                  <div key={i} className="flex gap-3.5 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white shadow-xs">
                      {i + 1}
                    </span>
                    <p className="text-xs font-semibold text-gray-700 leading-snug">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Eligibility & Criteria ── */}
          {loan.eligibility && loan.eligibility.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <i className="fa-solid fa-user-check text-purple-600 text-base" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brand-charcoal">Applicant Eligibility</h2>
                  <p className="text-xs text-gray-500">Standard criteria verified by partner institutions</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {loan.eligibility.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5">
                    <i className="fa-solid fa-circle-check text-emerald-600 text-sm shrink-0" />
                    <span className="text-xs font-medium text-gray-700">{e}</span>
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
