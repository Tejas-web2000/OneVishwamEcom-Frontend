import { useEffect } from 'react';
import { useAuth } from '../../store/authSlice';
import { navigateTo } from '../../config/navigation';

export default function AuthRequiredView({
  title = "Login Required",
  message = "Please log in or create an account to view full specifications, pricing, gallery photos, and seller details.",
  backUrl = null,
}) {
  const { openAuthModal } = useAuth();

  useEffect(() => {
    sessionStorage.setItem('vishwam_auth_redirect', window.location.pathname + window.location.search);
    openAuthModal('login');
  }, [openAuthModal]);

  const handleLoginClick = () => {
    sessionStorage.setItem('vishwam_auth_redirect', window.location.pathname + window.location.search);
    openAuthModal('login');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-2xl border border-gray-100 shadow-xl animate-fade-in">
        <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-5 text-2xl shadow-inner">
          <i className="fa-solid fa-lock" />
        </div>
        <h2 className="text-2xl font-bold text-brand-charcoal mb-2">{title}</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {message}
        </p>
        <button
          onClick={handleLoginClick}
          className="w-full py-3 px-6 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-navy transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-arrow-right-to-bracket" />
          <span>Login / Sign In to Continue</span>
        </button>
        {backUrl && (
          <div className="mt-4">
            <button
              onClick={() => navigateTo(backUrl)}
              className="text-sm font-semibold text-gray-400 hover:text-brand-blue transition-colors"
            >
              &larr; Back to listings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
