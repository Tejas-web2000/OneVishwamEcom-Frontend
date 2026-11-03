import { footerBrandName, footerSummary, footerQuickLinks, footerServiceLinks, footerSocialLinks, footerLocations } from '../constants/footerContent';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import HitCounterBanner from './HitCounterBanner';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <HitCounterBanner />
      <footer className="bg-gradient-to-b from-[#d9ebfa] via-[#e8f2fb] to-[#cfe4f6] text-slate-800 border-t-2 border-sky-300/80 shadow-inner">
        <div className="h-1.5 bg-gradient-to-r from-brand-blue via-amber-400 to-sky-400" />
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:pt-12 sm:pb-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            {/* Brand Info */}
            <div className="space-y-4">
              <img src={logo} alt={footerBrandName} className="h-10 w-auto object-contain" />
              <p className="text-xs sm:text-sm leading-6 text-slate-600 font-semibold">{footerSummary}</p>
              <div className="flex gap-2.5 pt-1">
                {footerSocialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="h-9 w-9 rounded-xl border border-sky-300/80 bg-white/90 text-slate-700 hover:border-brand-blue hover:text-brand-blue hover:bg-white shadow-2xs transition-all flex items-center justify-center text-xs font-bold"
                  >
                    <i className={s.icon} />
                  </a>
                ))}
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider mb-4 text-slate-900">Company</h4>
              <ul className="space-y-3">
                {footerQuickLinks.map((l, idx) => (
                  <li key={l.href || `${l.label}-${idx}`}>
                    <Link to={l.href} className="text-xs sm:text-sm text-slate-700 hover:text-brand-blue font-bold transition-colors leading-relaxed block">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Links */}
            <div>
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider mb-4 text-slate-900">Services</h4>
              <ul className="space-y-3">
                {footerServiceLinks.map((l, idx) => (
                  <li key={l.href || `${l.label}-${idx}`}>
                    <Link to={l.href} className="text-xs sm:text-sm text-slate-700 hover:text-brand-blue font-bold transition-colors leading-relaxed block">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider mb-4 text-slate-900">Contact Info</h4>
              <ul className="space-y-3.5">
                {footerLocations.slice(0, 3).map((loc, idx) => (
                  <li key={`${loc.label}-${loc.value || idx}`} className="text-xs sm:text-sm leading-relaxed text-slate-700">
                    <span className="text-slate-950 font-black">{loc.label}:</span>{' '}
                    <span className="text-slate-700 font-bold">{loc.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-5 sm:mt-10 sm:pt-6 border-t border-sky-300/70 text-center">
            <p className="text-[11px] sm:text-xs text-slate-600 max-w-4xl mx-auto leading-relaxed mb-2.5 font-medium">
              <span className="font-extrabold text-slate-800">Disclaimer:</span> Website materials are provided for general information and are subject to change without notice, with renders and plans serving as artistic concepts rather than official sales offers. Sharing contact information constitutes agreement for the team to contact users by call or text, superseding the DND registry.
            </p>
            <p className="text-xs text-slate-500 font-bold">
              &copy; {year} {footerBrandName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
