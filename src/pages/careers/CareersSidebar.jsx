const PERKS = [
  {
    icon: 'fa-solid fa-chart-line',
    title: 'Rapid Career Acceleration',
    description: 'Work in an agile environment with true ownership, meritocratic recognition, and fast-track learning.',
  },
  {
    icon: 'fa-solid fa-people-roof',
    title: 'People-First Culture',
    description: 'A collaborative, transparent workspace where every voice matters and teamwork drives success.',
  },
  {
    icon: 'fa-solid fa-hand-holding-dollar',
    title: 'Real Economic Impact',
    description: 'Build solutions bridging cooperative finance and direct-to-consumer marketplace for thousands across Karnataka.',
  },
];

function CareersSidebar() {
  return (
    <aside className="space-y-6">
      {/* Why OneVishwam Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue mb-3">
          <i className="fa-solid fa-star text-xs" />
          <span>Why OneVishwam</span>
        </span>
        <h3 className="text-xl font-bold text-brand-charcoal">
          Empowering Growth & Purpose
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-gray-500 leading-relaxed">
          We bring together talent across tech, properties, finance, and operations to build Karnataka's leading cooperative platform.
        </p>

        <div className="mt-6 space-y-4">
          {PERKS.map((perk) => (
            <div key={perk.title} className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0 text-sm mt-0.5">
                <i className={perk.icon} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-brand-charcoal">{perk.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{perk.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Contact / Recruitment Info */}
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-slate-50 to-brand-gray/40 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-400/20 text-yellow-600 flex items-center justify-center shrink-0 text-sm font-bold">
            <i className="fa-solid fa-envelope-open-text" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Direct Inquiries</span>
            <h4 className="text-base font-bold text-brand-charcoal">Have Questions?</h4>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          For executive roles or direct inquiries, you can reach out directly to our talent acquisition team:
        </p>

        <div className="mt-4">
          <a
            href="mailto:onevishwamecom@gmail.com"
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200/70 hover:border-brand-blue/30 hover:shadow-xs transition-all text-brand-charcoal"
          >
            <i className="fa-solid fa-envelope text-brand-blue text-sm" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-semibold text-gray-400">Email us</p>
              <p className="text-xs sm:text-sm font-semibold text-brand-blue truncate">onevishwamecom@gmail.com</p>
            </div>
          </a>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-500">
          <i className="fa-solid fa-clock text-gray-400" />
          <span>Average review time: 2 - 3 business days</span>
        </div>
      </div>
    </aside>
  );
}

export default CareersSidebar;

