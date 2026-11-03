import { Link } from 'react-router-dom';
import PageHero from '../../components/PageHero';

const CORE_PILLARS = [
  {
    icon: 'fa-solid fa-landmark',
    title: 'Co-Operative Finance',
    desc: 'We collaborate directly with reputed Co-operative societies for transparent, low-interest micro-finance, ensuring loans on properties and commodities remain easily accessible and affordable.',
  },
  {
    icon: 'fa-solid fa-chart-line',
    title: 'Value-Driven Investments',
    desc: 'We assist individuals and families in cautiously investing their capital into high-growth, appreciating commodities and prime properties that generate lasting wealth over the years.',
  },
  {
    icon: 'fa-solid fa-users',
    title: 'Customer-First Approach',
    desc: 'By eliminating unauthorized intermediary parties and hidden brokerage fees, we protect consumer savings and provide a straightforward, honest transaction experience.',
  },
  {
    icon: 'fa-solid fa-industry',
    title: 'Direct From Manufacturer',
    desc: 'We procure directly from original equipment manufacturers and prime developers, delivering premium products at prices substantially lower than conventional open marketplaces.',
  },
];

const ROADMAP_STEPS = [
  {
    step: '01',
    title: 'Property Ecosystem',
    desc: 'Establishing an integrated digital portal to discover, inspect, and purchase prime residential plots, luxury villas, and commercial properties with full legal verification.',
    icon: 'fa-solid fa-house-chimney',
  },
  {
    step: '02',
    title: 'Bengaluru Multi-Sector Grid',
    desc: 'Building a robust, connected distribution network across Bengaluru for high-value essentials spanning Properties, Automobiles, Jewellery & Gold, and Electronics.',
    icon: 'fa-solid fa-city',
  },
  {
    step: '03',
    title: 'Vendor & Capital Relations',
    desc: 'Nurturing enduring relationships with verified manufacturers and developers for continuous inventory, backed by seamless, timely co-operative financial funding.',
    icon: 'fa-solid fa-handshake-angle',
  },
  {
    step: '04',
    title: 'Statewide Expansion',
    desc: 'Expanding our cooperative marketplace footprint across Karnataka while creating grassroots employment opportunities and socio-economic empowerment.',
    icon: 'fa-solid fa-map-location-dot',
  },
];

function AboutPage() {
  return (
    <div className="bg-white">
      {/* ── 1. Hero ── */}
      <PageHero
        eyebrow="About OneVishwam"
        title={<>OneVishwam: A <span className="text-yellow-400">FinVerse</span> for Everyday Life</>}
        subtitle="One Stop Solution for finance and products to build your life. Lower prices, direct from manufacturers, backed by co-operative finance."
        ctas={[
          { label: 'Enquiry', href: '/enquiry/', primary: true, icon: 'fa-solid fa-envelope' },
          { label: 'Explore Services', href: '/property', primary: false, icon: 'fa-solid fa-compass' },
        ]}
      />

      {/* ── 2. Message from the CEO ── */}
      <section className="py-10 sm:py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-brand-blue/15 bg-gradient-to-br from-brand-gray/80 to-white p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              
              <div className="lg:w-1/3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue mb-3">
                  <i className="fa-solid fa-quote-left text-xs" />
                  <span>Leadership Message</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal leading-tight">
                  Building a Complete Ecosystem for Capital & Commodity
                </h2>
                <p className="mt-2 text-xs font-semibold text-brand-blue uppercase tracking-wider">
                  Message from the CEO
                </p>
              </div>

              <div className="lg:w-2/3 space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed text-justify">
                <p>
                  OneVishwam is a <strong>FinVerse</strong> (finance + ecosystem for all digital needs) that addresses capital investments in useful, daily commodities required in day-to-day life. We offer a <strong>One Stop Solution</strong> for all those who are in need of a complete ecosystem to build their life, by providing them both finance and products to invest in.
                </p>
                <p>
                  We offer products at a price lower than any other market, directly from the manufacturer. By connecting verified supply with cooperative finance, we eliminate unnecessary middlemen markups and empower individuals with genuine, lasting ownership.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── 3. What Makes Us Unique (4 Pillars) ── */}
      <section className="py-10 sm:py-12 bg-brand-gray/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-blue">
              What Makes Us Unique
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
              Finance, Value, and Transparency Combined
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
              Our unique institutional structure pairs cooperative credit societies with primary manufacturers to protect your money.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CORE_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white rounded-2xl border border-brand-blue/15 p-5 sm:p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue text-lg mb-4 shrink-0">
                  <i className={pillar.icon} />
                </div>
                <h3 className="font-bold text-brand-charcoal text-base mb-2">{pillar.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed text-justify flex-1">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Core Platforms: Buy & Sell ── */}
      <section className="py-10 sm:py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-blue">
              Our Core Platforms
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
              OneVishwam Buy · OneVishwam Sell
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Buy Platform */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#d9ebfa] via-[#e8f2fb] to-[#cfe4f6] text-slate-900 p-6 sm:p-8 shadow-sm border border-sky-200/90 overflow-hidden flex flex-col justify-between">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-sky-300/35 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-white text-brand-blue flex items-center justify-center shadow-xs border border-sky-300/70">
                    <i className="fa-solid fa-hand-holding-dollar text-xl" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-brand-blue font-black">Capital &amp; Commodity Sourcing</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">OneVishwam Buy</h3>
                  </div>
                </div>
                <p className="text-slate-600 font-semibold text-xs sm:text-sm leading-relaxed text-justify">
                  Facilitates provision of money as a commodity, helping vendors, manufacturers and other parties sell their commodities at a better price, establishing strong long-term relationships for continuous supply and infrastructure projects.
                </p>
              </div>
            </div>

            {/* Sell Platform */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#d9ebfa] via-[#e8f2fb] to-[#cfe4f6] text-slate-900 p-6 sm:p-8 shadow-sm border border-sky-200/90 overflow-hidden flex flex-col justify-between">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-sky-300/35 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-white text-brand-blue flex items-center justify-center shadow-xs border border-sky-300/70">
                    <i className="fa-solid fa-tag text-xl" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-brand-blue font-black">Customer Marketplace</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">OneVishwam Sell</h3>
                  </div>
                </div>
                <p className="text-slate-600 font-semibold text-xs sm:text-sm leading-relaxed text-justify">
                  Facilitates selling products on a digital platform, helping customers buy commodities of their choice with integrated financial support like home loans, vehicle loans, and easy monthly EMI schemes — making big-budget assets simple and achievable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. 5-Year Strategic Vision Roadmap ── */}
      <section className="py-10 sm:py-12 bg-brand-gray/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-blue">
              Strategic Roadmap
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
              Where We See Ourselves
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
              Our 5-year trajectory to establish Karnataka's premier capital-commodity network.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROADMAP_STEPS.map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl border border-brand-blue/15 p-5 hover:shadow-lg transition-all flex flex-col relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue text-sm">
                    <i className={item.icon} />
                  </div>
                  <span className="font-mono text-xs font-extrabold text-brand-blue/60 bg-brand-blue/5 px-2 py-0.5 rounded-md">
                    Phase {item.step}
                  </span>
                </div>
                <h3 className="font-bold text-brand-charcoal text-sm sm:text-base mb-1.5">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed text-justify flex-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Bottom Action Card ── */}
      <section className="py-10 sm:py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative rounded-3xl bg-gradient-to-b from-[#d9ebfa] via-[#e8f2fb] to-[#cfe4f6] p-6 sm:p-10 text-slate-900 shadow-sm border border-sky-200/90 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
            {/* Ambient Lighting matching footer theme */}
            <div className="absolute -top-16 -right-16 w-80 h-80 bg-gradient-to-br from-sky-300/40 via-blue-200/25 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-gradient-to-tr from-sky-300/40 via-blue-200/25 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-xl text-center md:text-left">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Ready to find your next opportunity?
              </h3>
              <p className="mt-2 text-slate-600 font-semibold text-xs sm:text-sm leading-relaxed text-justify md:text-left">
                Browse our verified properties or get in touch with our team for assistance with property investments and cooperative finance.
              </p>
            </div>
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                to="/property"
                className="inline-flex items-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-brand-navy transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              >
                <i className="fa-solid fa-house-chimney" /> Explore Properties
              </Link>
              <Link
                to="/enquiry/"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-slate-300/90 hover:border-slate-400 hover:bg-slate-50 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
              >
                <i className="fa-solid fa-envelope" /> Enquiry
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;