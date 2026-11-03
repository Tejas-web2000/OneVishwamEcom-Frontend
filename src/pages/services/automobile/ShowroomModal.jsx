import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import Swal from 'sweetalert2';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, isEmailJSConfigured } from '../../../config/emailjs';
import { withRupeeSymbol } from '../../../utils/priceUtils';

function ShowroomModal({ vehicle, onOpenLoan, onClose }) {
  const [step, setStep] = useState(1);
  const [loanForm, setLoanForm] = useState({ name: '', phone: '', message: '' });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleLoanChange = (e) => {
    const { name, value } = e.target;
    setLoanForm((p) => ({ ...p, [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value }));
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    if (!loanForm.name.trim() || !loanForm.phone.trim()) {
      Swal.fire({ title: 'Required', text: 'Please fill in name and phone.', icon: 'warning', confirmButtonColor: '#1a4b8c' });
      return;
    }
    setIsSending(true);
    const templateParams = {
      title: `Loan Request for ${vehicle.brand} ${vehicle.model}`,
      from_name: loanForm.name,
      from_phone: loanForm.phone,
      from_email: 'no-reply@vishwam.com',
      service: 'Vehicle Loan',
      message: loanForm.message || `Interested in ${vehicle.brand} ${vehicle.model} (${withRupeeSymbol(vehicle.price)}). Showroom: ${vehicle.showroom.name}.`,
      from_additional_phone: 'N/A',
      from_additional_phone_2: 'N/A',
      voice_message: '',
    };
    try {
      if (!isEmailJSConfigured()) {
        Swal.fire({ title: 'Configuration Error', text: 'Email service is not configured.', icon: 'error', confirmButtonColor: '#1a4b8c' });
        setIsSending(false); return;
      }
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      Swal.fire({ title: 'Submitted!', text: 'Our team will contact you shortly.', icon: 'success', confirmButtonColor: '#1a4b8c' });
      onClose();
    } catch {
      Swal.fire({ title: 'Oops!', text: 'Something went wrong. Please try again.', icon: 'error', confirmButtonColor: '#1a4b8c' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button onClick={() => setStep(1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <i className="fa-solid fa-arrow-left text-gray-500 text-sm" />
              </button>
            )}
            <h2 className="text-lg font-bold text-brand-charcoal">
              {step === 1 ? `${vehicle.brand} ${vehicle.model}` : 'Loan Request'}
            </h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <i className="fa-solid fa-xmark text-gray-500" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 px-6 pt-4">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 1 ? 'bg-brand-blue text-white' : 'bg-brand-blue/10 text-brand-blue'
          }`}>1</span>
          <div className="flex-1 h-px bg-gray-200" />
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 2 ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-400'
          }`}>2</span>
        </div>

        {step === 1 ? (
          /* ── Step 1: Showroom Details ── */
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {vehicle.loanApproved && (
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3">
                <i className="fa-solid fa-circle-check text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Pre-Approved Loan Available</span>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Showroom</label>
              <p className="text-sm font-semibold text-brand-charcoal">{vehicle.showroom.name}</p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Address</label>
              <p className="text-sm text-gray-600">{vehicle.showroom.address}{vehicle.pincode && !/\b\d{6}\b/.test(vehicle.showroom.address || '') && !String(vehicle.showroom.address || '').includes(vehicle.pincode) ? ` — ${vehicle.pincode}` : ''}</p>
            </div>

            <div className="space-y-3">
              <a href={vehicle.showroom.mapsLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-full">
                <i className="fa-solid fa-map-location-dot text-brand-blue" />
                View on Google Maps
              </a>

              <a href={`tel:${vehicle.showroom.phone}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors w-full">
                <i className="fa-solid fa-phone" />
                Call Showroom — {vehicle.showroom.phone}
              </a>

              <button onClick={() => setStep(2)}
                className="flex items-center justify-center gap-2 rounded-xl border border-brand-blue px-4 py-2.5 text-sm font-semibold text-brand-blue hover:bg-brand-blue hover:text-white transition-colors w-full">
                <i className="fa-solid fa-file-invoice" />
                Request Loan
              </button>
            </div>
          </div>
        ) : (
          /* ── Step 2: Loan Request Form ── */
          <form onSubmit={handleLoanSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="rounded-xl bg-blue-50 px-4 py-3">
              <p className="text-sm font-semibold text-blue-800">{vehicle.brand} {vehicle.model}</p>
              <p className="text-xs text-blue-600">{vehicle.showroom.name}</p>
            </div>

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Your Name</span>
              <input name="name" value={loanForm.name} onChange={handleLoanChange} placeholder="Enter your name"
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-blue" />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Phone Number</span>
              <input type="tel" name="phone" value={loanForm.phone} onChange={handleLoanChange} placeholder="10-digit number" maxLength={10}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-blue" />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Message <span className="text-gray-400 font-normal">(optional)</span></span>
              <textarea name="message" value={loanForm.message} onChange={handleLoanChange} rows={3} placeholder="Any specific requirements..."
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-blue resize-none" />
            </label>

            <button type="submit" disabled={isSending}
              className="w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {isSending ? <><i className="fa-solid fa-spinner fa-spin" /> Sending...</> : 'Submit Loan Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ShowroomModal;
