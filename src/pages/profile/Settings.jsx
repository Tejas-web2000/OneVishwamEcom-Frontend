import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../store/authSlice';

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 outline-none cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${checked ? 'bg-brand-blue' : 'bg-gray-200'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function ProfileSettings() {
  const { user, updateProfile, updateNotifications, forgotPassword, openAuthModal, loading, error, clearError } = useAuth();

  const [name, setName] = useState(user?.name || user?.fullName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || user?.mobile || user?.phone || '');
  const [role, setRole] = useState(user?.role || 'Buyer / Customer');
  const [city, setCity] = useState(user?.city || 'Bengaluru');
  const [profileErrors, setProfileErrors] = useState({});
  const [sendingReset, setSendingReset] = useState(false);

  // Synchronize form state when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || user.fullName || '');
      setPhone(user.mobile || user.phoneNumber || '');
      setRole(user.role || 'Buyer / Customer');
      setCity(user.city || 'Bengaluru');
    }
  }, [user]);

  function validateProfile() {
    const e = {};
    if (!name.trim()) e.name = 'Please enter your name';
    else if (name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\+?[\d\s-]{10,15}$/.test(phone)) e.phone = 'Please enter a valid phone number';
    return e;
  }

  function handleProfileField(field, value, setter) {
    setter(value);
    clearError();
    if (profileErrors[field]) {
      const next = { ...profileErrors };
      delete next[field];
      setProfileErrors(next);
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const v = validateProfile();
    setProfileErrors(v);
    if (Object.keys(v).length) return;

    try {
      await updateProfile({
        name,
        fullName: name,
        phoneNumber: phone,
        mobile: phone,
        role,
        city,
      }).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Your profile has been updated successfully.',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
    } catch (err) {
      const errMsg = typeof err === 'string' ? err : err?.response?.data?.message || err?.message || 'Failed to save changes';
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: errMsg,
        toast: true,
        position: 'top-end',
        timer: 3500,
        showConfirmButton: false,
      });
    }
  };

  const handlePasswordResetRequest = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      await forgotPassword(user.email).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Reset Link Sent!',
        text: `We emailed a password reset link to ${user.email}.`,
        confirmButtonColor: '#1a4b8c',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Link Failed',
        text: typeof err === 'string' ? err : 'Could not send reset email right now.',
        toast: true,
        position: 'top-end',
      });
    } finally {
      setSendingReset(false);
    }
  };

  // Unauthenticated Guest State
  if (!user) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 text-brand-blue mx-auto flex items-center justify-center mb-4 text-2xl">
            <i className="fa-solid fa-user-lock" />
          </div>
          <h2 className="text-2xl font-extrabold text-brand-charcoal mb-2">Welcome to OneVishwam</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Please log in or create an account to view and update your profile settings.
          </p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="w-full rounded-xl bg-brand-blue py-3 text-sm font-bold text-white hover:bg-brand-navy transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-right-to-bracket text-xs" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="w-full rounded-xl bg-slate-50 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            >
              Register Free
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userInitial = (user.name || user.fullName || user.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-[85vh] bg-slate-50/70 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── CATCHY TOP BANNER ── */}
        <div className="relative bg-gradient-to-b from-[#d9ebfa] via-[#e8f2fb] to-[#cfe4f6] rounded-3xl p-6 sm:p-8 text-slate-900 shadow-sm border border-sky-200/90 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-sky-300/40 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
            <div className="flex items-center gap-4 flex-col sm:flex-row">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-blue via-blue-500 to-indigo-500 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md ring-4 ring-white/80 shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  userInitial
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                    {user.name || user.fullName || 'My Profile'}
                  </h1>
                  <span className="rounded-full bg-white/90 text-brand-blue border border-sky-300/80 text-[11px] font-bold px-3 py-0.5 shadow-2xs">
                    {role}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold flex items-center justify-center sm:justify-start gap-2">
                  <i className="fa-solid fa-envelope text-brand-blue" />
                  <span>{user.email}</span>
                  <span>•</span>
                  <i className="fa-solid fa-location-dot text-brand-blue" />
                  <span>{city}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600/15 text-emerald-800 border border-emerald-500/30 shadow-2xs">
                <i className="fa-solid fa-shield-check" />
                Verified Account
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2 font-medium">
              <i className="fa-solid fa-circle-exclamation text-rose-500" />
              {error}
            </span>
            <button onClick={clearError} className="text-xs text-rose-500 hover:underline font-bold">Dismiss</button>
          </div>
        )}

        {/* ── 2 COLUMN LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT 2 COLUMNS: EDIT DETAILS FORM */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center text-lg font-bold">
                <i className="fa-solid fa-user-pen" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-brand-charcoal">Edit Profile Details</h2>
                <p className="text-xs text-slate-500">Update your account info anytime</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleProfileField('name', e.target.value, setName)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-brand-charcoal outline-none transition-all ${
                      profileErrors.name
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 bg-rose-50/20'
                        : 'border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 bg-white'
                    }`}
                    placeholder="Enter full name"
                  />
                  {profileErrors.name && <p className="mt-1 text-xs text-rose-500 font-semibold">{profileErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handleProfileField('phone', e.target.value, setPhone)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-brand-charcoal outline-none transition-all ${
                      profileErrors.phone
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 bg-rose-50/20'
                        : 'border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 bg-white'
                    }`}
                    placeholder="+91 98765 43210"
                  />
                  {profileErrors.phone && <p className="mt-1 text-xs text-rose-500 font-semibold">{profileErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-brand-charcoal outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 cursor-pointer"
                  >
                    <option value="Buyer / Customer">Buyer / Looking to Buy</option>
                    <option value="Property Owner / Seller">Property Owner / Seller</option>
                    <option value="Dealer / Agent">Dealer / Property Agent</option>
                    <option value="Retail Partner">Retail Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">City / Location</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-brand-charcoal outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
                    placeholder="e.g. Bengaluru"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address <span className="text-slate-400 font-normal">(Registered)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed select-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-brand-blue px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-brand-navy transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {loading && <i className="fa-solid fa-circle-notch fa-spin text-xs" />}
                  <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: QUICK SETTINGS & ACTION SHORTCUTS */}
          <div className="space-y-6">

            {/* ALERTS CARD */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-extrabold text-brand-charcoal flex items-center gap-2 mb-4">
                <i className="fa-solid fa-bell text-brand-blue" />
                Quick Alerts
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Email Notifications</span>
                    <span className="text-[11px] text-slate-400">Updates & property alerts</span>
                  </div>
                  <ToggleSwitch
                    checked={user?.notifications?.email ?? true}
                    disabled={loading}
                    onChange={(checked) =>
                      updateNotifications({
                        email: checked,
                        whatsapp: user?.notifications?.whatsapp ?? false,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="block text-xs font-bold text-slate-800">WhatsApp Alerts</span>
                    <span className="text-[11px] text-slate-400">Instant price & seller updates</span>
                  </div>
                  <ToggleSwitch
                    checked={user?.notifications?.whatsapp ?? false}
                    disabled={loading}
                    onChange={(checked) =>
                      updateNotifications({
                        email: user?.notifications?.email ?? true,
                        whatsapp: checked,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* SECURITY CARD */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-extrabold text-brand-charcoal flex items-center gap-2 mb-2">
                <i className="fa-solid fa-shield-halved text-amber-500" />
                Password & Security
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Need to update your password? We will send a secure reset link to your email.
              </p>
              <button
                type="button"
                onClick={handlePasswordResetRequest}
                disabled={sendingReset}
                className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 text-xs font-bold transition-all border border-slate-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {sendingReset && <i className="fa-solid fa-circle-notch fa-spin text-xs" />}
                <span>{sendingReset ? 'Sending Email...' : 'Send Password Reset Link'}</span>
              </button>
            </div>

            {/* QUICK LINKS */}
            <div className="bg-gradient-to-br from-brand-blue/5 to-amber-500/5 rounded-3xl border border-brand-blue/10 p-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue">Quick Actions</span>
              <div className="space-y-2 pt-1">
                <Link
                  to="/property/requirement"
                  className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-brand-blue hover:text-white transition-all text-xs font-bold text-brand-charcoal shadow-2xs group"
                >
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-pen-to-square text-brand-blue group-hover:text-white" />
                    Post Requirement
                  </span>
                  <i className="fa-solid fa-chevron-right text-[10px] opacity-60" />
                </Link>
                <Link
                  to="/property"
                  className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-amber-500 hover:text-white transition-all text-xs font-bold text-brand-charcoal shadow-2xs group"
                >
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-house-chimney text-amber-500 group-hover:text-white" />
                    Explore Properties
                  </span>
                  <i className="fa-solid fa-chevron-right text-[10px] opacity-60" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ProfileSettings;
