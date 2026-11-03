import { footerLocations } from '../../constants/footerContent';

function ContactSidebar() {
  return (
    <aside className="space-y-6 lg:pl-6">
      <div className="rounded-xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Direct Contact</p>
        <h2 className="mt-3 text-xl font-bold text-brand-charcoal">Prefer to skip the form?</h2>
        <div className="mt-6 space-y-4">
          <a href="tel:+919364862542"
            className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 hover:border-brand-blue/20 hover:bg-brand-blue/5 transition-all"
          >
            <div className="h-10 w-10 rounded-lg bg-brand-blue flex items-center justify-center text-white">
              <i className="fa-solid fa-phone" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Call Us</p>
              <p className="font-semibold text-brand-charcoal">+91 93648 62542</p>
            </div>
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Our Offices</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {footerLocations.map((loc) => (
            <div key={`${loc.label}-${loc.value}`}
              className={`rounded-xl border px-4 py-4 ${
                loc.primary ? 'border-brand-blue bg-brand-blue text-white' : 'border-gray-100 bg-gray-50 text-brand-charcoal'
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{loc.label}</p>
              <p className="mt-1 text-sm font-medium">{loc.value}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default ContactSidebar;
