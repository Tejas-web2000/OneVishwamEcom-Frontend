import { Link } from 'react-router-dom';
import LottieFeedbackAnimation from '../../../components/common/LottieFeedbackAnimation';

function FinanceServiceSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50/50 py-12">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-100 p-8 sm:p-10 animate-fade-in">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <LottieFeedbackAnimation type="success" size="md" loop={false} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-charcoal tracking-tight mb-2">
            Service Posted!
          </h1>
          <p className="mt-2 text-sm text-gray-500 mb-8 leading-relaxed">
            Your financial service has been submitted successfully. It will be reviewed by our team and published shortly.
          </p>
          <div className="space-y-3">
            <Link
              to="/our-services/finance-lending"
              className="block w-full rounded-xl bg-brand-blue py-3 text-sm font-bold text-white shadow-md shadow-brand-blue/20 hover:bg-brand-navy hover:shadow-lg transition-all"
            >
              Browse Finance Services
            </Link>
            <Link
              to="/"
              className="block w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-xs"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinanceServiceSuccess;
