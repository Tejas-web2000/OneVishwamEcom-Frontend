import { Link } from 'react-router-dom';

const DEFAULT_BG = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80';

/**
 * PageHero
 * Compact interior page hero with background architectural imagery, soft ambient glow lights,
 * and balanced slate filter overlays matching the Home Hero banner.
 *
 * Uses a sleek, reduced interior page height scale:
 *   Mobile  (<640px)   → 280px
 *   Tablet  (640-768px) → 320px
 *   Tablet+ (768-1024px)→ 360px
 *   Desktop (≥1024px)  → 400px
 *
 * Props:
 *   eyebrow   – string or { icon?: string, label: string }
 *   title     – string or JSX (supports <span className="text-yellow-400">...</span>)
 *   subtitle  – string paragraph description
 *   image     – optional background image URL
 *   ctas      – array of { label, href, primary?: boolean, icon?: string, external?: boolean }
 *   children  – optional JSX rendered below or alongside
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  image = DEFAULT_BG,
  ctas = [],
  children,
  className = '',
}) {
  const eyebrowLabel = typeof eyebrow === 'object' ? eyebrow?.label : eyebrow;
  const eyebrowIcon = typeof eyebrow === 'object' ? eyebrow?.icon : 'fa-solid fa-circle-info';

  return (
    <section className={`relative w-full h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] overflow-hidden bg-gradient-to-b from-[#9eb3c9] via-[#b0c4d9] to-[#94abc2] text-slate-900 flex items-center ${className}`}>
      {/* ── Ambient Soft Glow Lights (Balanced Slate & Muted Cool Tones matching Home Hero) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[380px] bg-gradient-to-tr from-slate-500/20 via-sky-500/15 to-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-10 w-96 h-96 bg-slate-500/20 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-10 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl" />
      </div>

      {/* Background Image Layer */}
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none opacity-40"
          loading="eager"
        />
      )}

      {/* Balanced Slate Overlay with reduced brightness and crisp depth (matching Home Hero) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#8fa5bc]/85 via-[#a1b7cd]/75 to-[#859cb3]/85 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#859cb3] via-[#859cb3]/60 to-transparent pointer-events-none" />

      {/* Seamless Soft Gradient Melting Hero Slate into Section Below */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-slate-200/50 via-slate-200/15 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 w-full">
        <div className="max-w-3xl">
          {/* Eyebrow Badge */}
          {eyebrowLabel && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/85 px-3 py-1 text-xs font-semibold text-slate-100 backdrop-blur-md border border-slate-700/90 shadow-md mb-2 sm:mb-2.5">
              {eyebrowIcon && <i className={`${eyebrowIcon} text-xs text-sky-400`} />}
              <span>{eyebrowLabel}</span>
            </div>
          )}

          {/* Title — capped at 2 lines */}
          {title && (
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black tracking-tight leading-tight text-slate-950 drop-shadow-xs line-clamp-2 [&_.text-yellow-400]:text-brand-blue [&_.text-amber-400]:text-brand-blue">
              {title}
            </h1>
          )}

          {/* Subtitle — capped at 2 lines */}
          {subtitle && (
            <p className="mt-2 text-xs sm:text-sm lg:text-[15px] text-slate-800 font-bold leading-relaxed max-w-2xl line-clamp-2 drop-shadow-2xs">
              {subtitle}
            </p>
          )}

          {/* CTAs */}
          {ctas.length > 0 && (
            <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-3">
              {ctas.map((cta) => {
                const btnClass = cta.primary
                  ? 'inline-flex items-center gap-2 bg-[#134e8f] hover:bg-[#0d3c70] text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer'
                  : 'inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm border-2 border-slate-300 hover:border-slate-400 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer';

                if (cta.external) {
                  return (
                    <a
                      key={cta.label}
                      href={cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={btnClass}
                    >
                      {cta.icon && <i className={cta.icon} />}
                      {cta.label}
                    </a>
                  );
                }

                return (
                  <Link key={cta.label} to={cta.href} className={btnClass}>
                    {cta.icon && <i className={cta.icon} />}
                    {cta.label}
                  </Link>
                );
              })}
            </div>
          )}

          {children}
        </div>
      </div>
    </section>
  );
}
