import React from 'react';
import { Link } from 'react-router-dom';

export default function VehicleContactCard() {
  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#d9ebfa] via-[#e8f2fb] to-[#cfe4f6] text-slate-900 p-5 shadow-sm border border-sky-200/90 overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-300/40 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10">
        <h3 className="text-base font-black text-slate-950">Interested?</h3>
        <p className="mt-1 text-xs text-slate-600 font-semibold">Contact our team for a test drive or more details.</p>
        <Link
          to="/contact-us/"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-navy transition-all shadow-md hover:scale-[1.02] active:scale-95"
        >
          <i className="fa-solid fa-headset" /> Contact Agent
        </Link>
      </div>
    </div>
  );
}
