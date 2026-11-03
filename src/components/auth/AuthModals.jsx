import { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../store/authSlice';
import { navigateTo } from '../../config/navigation';
import { auth } from '../../firebase/config';
import { isJwtExpired } from '../../utils/tokenUtils';
import logo from '../../assets/logo.png';

const RULES = [
  { key: 'min', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { key: 'number', label: 'One number', test: (v) => /\d/.test(v) },
  { key: 'special', label: 'One special character', test: (v) => /[!@#$%^&*()_\-+=<>?/{}[\]~|]/.test(v) },
];

// Luxury Modern Architectural Properties / Home Image
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

// City skyline & architectural landmark silhouettes (styled in brand-blue)
function SkylineIllustration() {
  return (
    <svg
      className="w-full h-12 sm:h-14 text-brand-blue opacity-85 select-none pointer-events-none"
      viewBox="0 0 450 65"
      fill="currentColor"
      preserveAspectRatio="xMidYMax meet"
    >
      {/* Left: Taj Mahal Silhouette */}
      <g transform="translate(10, 5)">
        <path d="M40 50 L40 38 Q40 28 55 24 Q55 12 60 4 Q65 12 65 24 Q80 28 80 38 L80 50 Z" />
        <rect x="25" y="32" width="12" height="18" rx="1" />
        <path d="M31 22 L31 32" stroke="currentColor" strokeWidth="2" />
        <rect x="83" y="32" width="12" height="18" rx="1" />
        <path d="M89 22 L89 32" stroke="currentColor" strokeWidth="2" />
        <rect x="12" y="18" width="6" height="32" rx="1" />
        <polygon points="15,8 12,18 18,18" />
        <rect x="102" y="18" width="6" height="32" rx="1" />
        <polygon points="105,8 102,18 108,18" />
        <rect x="52" y="36" width="16" height="14" rx="4" fill="white" />
        <rect x="30" y="38" width="4" height="8" rx="1" fill="white" />
        <rect x="86" y="38" width="4" height="8" rx="1" fill="white" />
      </g>

      {/* Right: Leaning Tower of Pisa & Cathedral Dome */}
      <g transform="translate(340, 2)">
        <g transform="rotate(6 25 35)">
          <rect x="15" y="12" width="22" height="42" rx="1" />
          <line x1="15" y1="18" x2="37" y2="18" stroke="white" strokeWidth="1.5" />
          <line x1="15" y1="26" x2="37" y2="26" stroke="white" strokeWidth="1.5" />
          <line x1="15" y1="34" x2="37" y2="34" stroke="white" strokeWidth="1.5" />
          <line x1="15" y1="42" x2="37" y2="42" stroke="white" strokeWidth="1.5" />
          <path d="M22 6 L30 6 L28 12 L24 12 Z" />
        </g>
        <g transform="translate(42, 10)">
          <rect x="0" y="20" width="38" height="26" rx="1" />
          <rect x="5" y="6" width="10" height="14" rx="1" />
          <polygon points="10,0 5,6 15,6" />
          <rect x="23" y="6" width="10" height="14" rx="1" />
          <polygon points="28,0 23,6 33,6" />
          <rect x="14" y="28" width="10" height="18" rx="4" fill="white" />
        </g>
      </g>
    </svg>
  );
}

// Dotted flight trail with airplane
function FlightTrail() {
  return (
    <div className="absolute top-4 right-12 hidden sm:block pointer-events-none opacity-80">
      <svg className="w-28 h-14 text-brand-blue" viewBox="0 0 120 60" fill="none">
        <path
          d="M 5 50 C 40 45, 75 30, 100 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
        <g transform="translate(98, 8) rotate(35)">
          <path
            d="M0 6 L12 3 L18 0 L15 6 L20 8 L15 9 L12 12 L10 7 Z"
            fill="currentColor"
          />
        </g>
      </svg>
    </div>
  );
}

// ─── LOGIN FORM ───────────────────────────────────────────────────────────────
function LoginForm({ onSwitch, onClose }) {
  const { login, loginWithGoogle, loading, error, clearError, switchAuthMode } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    return e;
  }

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
    clearError();
    if (errors[field]) {
      const next = { ...errors };
      delete next[field];
      setErrors(next);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    try {
      await login({ email: form.email, password: form.password }).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
      onClose();
      const redirect = sessionStorage.getItem('vishwam_auth_redirect');
      if (redirect) {
        sessionStorage.removeItem('vishwam_auth_redirect');
        navigateTo(redirect);
      }
    } catch {}
  };

  const handleGoogleSignIn = async () => {
    try {
      const u = await loginWithGoogle().unwrap();
      const phone = u?.phoneNumber || u?.mobile || '';
      if (!phone || !phone.trim()) {
        switchAuthMode('require-phone');
        return;
      }
      Swal.fire({
        icon: 'success',
        title: 'Signed in with Google!',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
      onClose();
      const redirect = sessionStorage.getItem('vishwam_auth_redirect');
      if (redirect) {
        sessionStorage.removeItem('vishwam_auth_redirect');
        navigateTo(redirect);
      }
    } catch (err) {
      console.error('[Google Sign-In Error]:', err);
      Swal.fire({
        icon: 'error',
        title: 'Sign In Failed',
        text: typeof err === 'string' ? err : (err?.message || 'Google sign-in failed'),
        confirmButtonColor: '#1d4ed8',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs text-red-600 font-medium animate-in fade-in">
          {error}
        </div>
      )}

      {/* Email Input with floating label pill */}
      <div className="relative pt-1.5">
        <span className="absolute top-0 left-3.5 bg-white px-1.5 text-[11px] font-bold text-brand-blue z-10 tracking-wide select-none">
          Email id
        </span>
        <div
          className={`flex items-center gap-3 px-3.5 py-2.5 sm:py-3 rounded-xl border bg-white transition-all ${
            errors.email
              ? 'border-red-400 ring-2 ring-red-500/10'
              : 'border-brand-blue/40 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/15'
          }`}
        >
          <i className="fa-regular fa-envelope text-brand-blue text-sm shrink-0" />
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="user@example.com"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300 font-medium"
          />
        </div>
        {errors.email && <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.email}</p>}
      </div>

      {/* Password Input with floating label pill */}
      <div className="relative pt-1.5">
        <span className="absolute top-0 left-3.5 bg-white px-1.5 text-[11px] font-bold text-brand-blue z-10 tracking-wide select-none">
          Password
        </span>
        <div
          className={`flex items-center gap-3 px-3.5 py-2.5 sm:py-3 rounded-xl border bg-white transition-all ${
            errors.password
              ? 'border-red-400 ring-2 ring-red-500/10'
              : 'border-brand-blue/40 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/15'
          }`}
        >
          <i className="fa-solid fa-lock text-brand-blue text-sm shrink-0" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="••••••••••••"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300 font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-brand-blue transition-colors p-0.5 cursor-pointer"
            aria-label="Toggle password visibility"
          >
            <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`} />
          </button>
        </div>
        {errors.password && <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.password}</p>}
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <button
          type="button"
          onClick={() => switchAuthMode('forgot')}
          className="text-xs text-slate-500 hover:text-brand-blue font-medium transition-colors cursor-pointer"
        >
          Forgot your password?
        </button>
      </div>

      {/* LOGIN Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy hover:from-[#153e74] hover:to-[#07162c] active:scale-[0.99] text-white text-xs font-black tracking-widest uppercase transition-all shadow-md shadow-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading && <i className="fa-solid fa-circle-notch fa-spin text-xs" />}
        <span>LOGIN</span>
      </button>

      {/* OR Divider */}
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span className="bg-white px-3">OR CONTINUE WITH</span>
        </div>
      </div>

      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-300 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
        title="Sign in with Google"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Sign in with Google</span>
      </button>

      {/* Switch to Register */}
      <p className="text-center text-xs text-slate-500 font-medium pt-1">
        Don&rsquo;t have account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="font-extrabold text-brand-blue hover:text-brand-navy transition-colors cursor-pointer"
        >
          Register Now
        </button>
      </p>
    </form>
  );
}

// ─── REGISTER FORM ────────────────────────────────────────────────────────────
function RegisterForm({ onSwitch, onClose }) {
  const { register, loginWithGoogle, loading, error, clearError, switchAuthMode } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Mobile number is mandatory and required';
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/[\s-]/g, ''))) e.phone = 'Please enter a valid 10-digit mobile number';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'At least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  }

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
    clearError();
    if (errors[field]) {
      const next = { ...errors };
      delete next[field];
      setErrors(next);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    try {
      await register({
        name: form.name,
        fullName: form.name,
        email: form.email,
        phoneNumber: form.phone,
        mobile: form.phone,
        password: form.password,
      }).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
      onClose();
      const redirect = sessionStorage.getItem('vishwam_auth_redirect');
      if (redirect) {
        sessionStorage.removeItem('vishwam_auth_redirect');
        navigateTo(redirect);
      }
    } catch {}
  };

  const handleGoogleSignIn = async () => {
    try {
      const u = await loginWithGoogle().unwrap();
      const phone = u?.phoneNumber || u?.mobile || '';
      if (!phone || !phone.trim()) {
        switchAuthMode('require-phone');
        return;
      }
      Swal.fire({
        icon: 'success',
        title: 'Signed in with Google!',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
      onClose();
      const redirect = sessionStorage.getItem('vishwam_auth_redirect');
      if (redirect) {
        sessionStorage.removeItem('vishwam_auth_redirect');
        navigateTo(redirect);
      }
    } catch (err) {
      console.error('[Google Sign-In Error]:', err);
      Swal.fire({
        icon: 'error',
        title: 'Sign In Failed',
        text: typeof err === 'string' ? err : (err?.message || 'Google sign-in failed'),
        confirmButtonColor: '#1d4ed8',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Name Input */}
      <div className="relative pt-1.5">
        <span className="absolute top-0 left-3.5 bg-white px-1.5 text-[11px] font-bold text-brand-blue z-10 tracking-wide select-none">
          Full Name
        </span>
        <div
          className={`flex items-center gap-3 px-3.5 py-2 sm:py-2.5 rounded-xl border bg-white transition-all ${
            errors.name
              ? 'border-red-400 ring-2 ring-red-500/10'
              : 'border-brand-blue/40 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/15'
          }`}
        >
          <i className="fa-regular fa-user text-brand-blue text-sm shrink-0" />
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="John Doe"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300 font-medium"
          />
        </div>
        {errors.name && <p className="mt-0.5 text-[10px] text-red-500 font-medium">{errors.name}</p>}
      </div>

      {/* Phone Input */}
      <div className="relative pt-1.5">
        <span className="absolute top-0 left-3.5 bg-white px-1.5 text-[11px] font-bold text-brand-blue z-10 tracking-wide select-none">
          Mobile Number <span className="text-red-500 font-bold">*</span>
        </span>
        <div
          className={`flex items-center gap-3 px-3.5 py-2 sm:py-2.5 rounded-xl border bg-white transition-all ${
            errors.phone
              ? 'border-red-400 ring-2 ring-red-500/10'
              : 'border-brand-blue/40 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/15'
          }`}
        >
          <i className="fa-solid fa-phone text-brand-blue text-sm shrink-0" />
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="9876543210"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300 font-medium"
          />
        </div>
        {errors.phone && <p className="mt-0.5 text-[10px] text-red-500 font-medium">{errors.phone}</p>}
      </div>

      {/* Email Input */}
      <div className="relative pt-1.5">
        <span className="absolute top-0 left-3.5 bg-white px-1.5 text-[11px] font-bold text-brand-blue z-10 tracking-wide select-none">
          Email id
        </span>
        <div
          className={`flex items-center gap-3 px-3.5 py-2 sm:py-2.5 rounded-xl border bg-white transition-all ${
            errors.email
              ? 'border-red-400 ring-2 ring-red-500/10'
              : 'border-brand-blue/40 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/15'
          }`}
        >
          <i className="fa-regular fa-envelope text-brand-blue text-sm shrink-0" />
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="name@email.com"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300 font-medium"
          />
        </div>
        {errors.email && <p className="mt-0.5 text-[10px] text-red-500 font-medium">{errors.email}</p>}
      </div>

      {/* Passwords grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="relative pt-1.5">
          <span className="absolute top-0 left-3 bg-white px-1 text-[10px] font-bold text-brand-blue z-10 tracking-wide select-none">
            Password
          </span>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-blue/40 bg-white">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-300 font-medium"
            />
          </div>
          {errors.password && <p className="mt-0.5 text-[10px] text-red-500 font-medium">{errors.password}</p>}
        </div>

        <div className="relative pt-1.5">
          <span className="absolute top-0 left-3 bg-white px-1 text-[10px] font-bold text-brand-blue z-10 tracking-wide select-none">
            Confirm
          </span>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-blue/40 bg-white">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.confirm}
              onChange={(e) => handleChange('confirm', e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-300 font-medium"
            />
          </div>
          {errors.confirm && <p className="mt-0.5 text-[10px] text-red-500 font-medium">{errors.confirm}</p>}
        </div>
      </div>

      {/* CREATE ACCOUNT Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy hover:from-[#153e74] hover:to-[#07162c] active:scale-[0.99] text-white text-xs font-black tracking-widest uppercase transition-all shadow-md shadow-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-1"
      >
        {loading && <i className="fa-solid fa-circle-notch fa-spin text-xs" />}
        <span>CREATE ACCOUNT</span>
      </button>

      {/* OR Divider */}
      <div className="relative my-2.5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span className="bg-white px-3">OR SIGN UP WITH</span>
        </div>
      </div>

      {/* Google Sign-Up Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-300 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
        title="Sign up with Google"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Sign up with Google</span>
      </button>

      {/* Switch to Login */}
      <p className="text-center text-xs text-slate-500 font-medium pt-1">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="font-extrabold text-brand-blue hover:text-brand-navy transition-colors cursor-pointer"
        >
          Login
        </button>
      </p>
    </form>
  );
}

// ─── FORGOT PASSWORD FORM ─────────────────────────────────────────────────────
function ForgotPasswordForm({ onBack, onNext }) {
  const { forgotPassword, loading, error, clearError, switchAuthMode } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  function validate(value) {
    if (!value.trim()) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email format';
    return '';
  }

  function handleChange(value) {
    setEmail(value);
    clearError();
    setEmailError(validate(value));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate(email);
    setEmailError(err);
    if (err) return;
    try {
      await forgotPassword(email).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Reset Link Sent!',
        text: `We have sent password reset instructions to ${email}`,
        timer: 4000,
        showConfirmButton: true,
        confirmButtonText: 'Back to Login',
      }).then(() => {
        switchAuthMode('login');
      });
    } catch {}
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}
      <p className="text-xs text-slate-500 leading-relaxed">
        Enter the email address registered with your OneVishwam account. We&rsquo;ll send you a link to reset your password.
      </p>

      {/* Email Input */}
      <div className="relative pt-1.5">
        <span className="absolute top-0 left-3.5 bg-white px-1.5 text-[11px] font-bold text-brand-blue z-10 tracking-wide select-none">
          Email Address
        </span>
        <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-brand-blue/40 bg-white">
          <i className="fa-regular fa-envelope text-brand-blue text-sm shrink-0" />
          <input
            type="email"
            value={email}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="user@example.com"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300 font-medium"
          />
        </div>
        {emailError && <p className="mt-1 text-[11px] text-red-500 font-medium">{emailError}</p>}
      </div>

      <button
        type="submit"
        onClick={handleSubmit}
        disabled={loading || !email}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy hover:from-[#153e74] hover:to-[#07162c] active:scale-[0.99] text-white text-xs font-black tracking-widest uppercase transition-all shadow-md shadow-brand-blue/20 disabled:opacity-50 cursor-pointer"
      >
        {loading && <i className="fa-solid fa-circle-notch fa-spin text-xs mr-2" />}
        <span>SEND RESET LINK</span>
      </button>

      <div className="text-center text-xs text-slate-500 pt-1">
        Remember your password?{' '}
        <button
          type="button"
          onClick={onBack}
          className="font-extrabold text-brand-blue hover:text-brand-navy transition-colors cursor-pointer"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

// ─── VERIFY OTP FORM ──────────────────────────────────────────────────────────
function VerifyOtpForm({ onBack, onNext }) {
  const { verifyOtp, resendOtp, loading, error, clearError, forgotEmail } = useAuth();
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [otpError, setOtpError] = useState('');
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  function handleChange(index, value) {
    clearError();
    setOtpError('');
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }
    try {
      const result = await verifyOtp({ email: forgotEmail, otp: code }).unwrap();
      onNext(result.verifyToken);
    } catch {}
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}
      <p className="text-xs text-slate-500 text-center">
        Enter the 6-digit code sent to <strong className="text-slate-800">{forgotEmail}</strong>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 justify-center py-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-11 w-10 sm:h-12 sm:w-11 rounded-xl border border-brand-blue/40 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 text-center text-lg font-black text-slate-800 outline-none transition-all"
            />
          ))}
        </div>
        {otpError && <p className="text-xs text-red-500 text-center font-medium">{otpError}</p>}

        <button
          type="submit"
          disabled={loading || otp.join('').length !== 6}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy hover:from-[#153e74] hover:to-[#07162c] text-white text-xs font-black tracking-widest uppercase transition-all shadow-md shadow-brand-blue/20 disabled:opacity-50 cursor-pointer"
        >
          {loading && <i className="fa-solid fa-circle-notch fa-spin text-xs mr-2" />}
          <span>VERIFY CODE</span>
        </button>

        <div className="text-center space-y-1 text-xs text-slate-400">
          <p>
            Code expires in <span className="font-mono font-bold text-slate-700">{formatTime(timer)}</span>
          </p>
          {canResend && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await resendOtp(forgotEmail).unwrap();
                  setTimer(300);
                  setCanResend(false);
                } catch {}
              }}
              className="text-brand-blue hover:underline font-bold"
            >
              Resend Code
            </button>
          )}
        </div>
      </form>

      <div className="text-center text-xs text-slate-500 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="font-extrabold text-brand-blue hover:text-brand-navy transition-colors cursor-pointer"
        >
          Use a different email
        </button>
      </div>
    </div>
  );
}

// ─── SET PASSWORD FORM ────────────────────────────────────────────────────────
function SetPasswordForm({ onBack, onSuccess }) {
  const { resetPasswordWithOtp, loading, error, clearError, forgotEmail, verifyToken } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!password) e.password = 'Password is required';
    else if (!RULES.every((r) => r.test(password))) e.password = 'Does not meet all requirements';
    if (!confirm) e.confirm = 'Please confirm password';
    else if (password !== confirm) e.confirm = 'Passwords do not match';
    return e;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    try {
      await resetPasswordWithOtp({ email: forgotEmail, verifyToken, password }).unwrap();
      onSuccess();
    } catch {}
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Password */}
      <div className="relative pt-1.5">
        <span className="absolute top-0 left-3.5 bg-white px-1.5 text-[11px] font-bold text-brand-blue z-10 tracking-wide select-none">
          New Password
        </span>
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-brand-blue/40 bg-white">
          <i className="fa-solid fa-lock text-brand-blue text-sm shrink-0" />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
            }}
            placeholder="••••••••••••"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300 font-medium"
          />
        </div>
        {errors.password && <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.password}</p>}
      </div>

      {/* Confirm */}
      <div className="relative pt-1.5">
        <span className="absolute top-0 left-3.5 bg-white px-1.5 text-[11px] font-bold text-brand-blue z-10 tracking-wide select-none">
          Confirm Password
        </span>
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-brand-blue/40 bg-white">
          <i className="fa-solid fa-lock text-brand-blue text-sm shrink-0" />
          <input
            type="password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              clearError();
            }}
            placeholder="••••••••••••"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300 font-medium"
          />
        </div>
        {errors.confirm && <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.confirm}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy hover:from-[#153e74] hover:to-[#07162c] text-white text-xs font-black tracking-widest uppercase transition-all shadow-md shadow-brand-blue/20 disabled:opacity-50 cursor-pointer"
      >
        {loading && <i className="fa-solid fa-circle-notch fa-spin text-xs mr-2" />}
        <span>SAVE NEW PASSWORD</span>
      </button>
    </form>
  );
}

// ─── RESET SUCCESS VIEW ───────────────────────────────────────────────────────
function ResetSuccessView({ onClose }) {
  return (
    <div className="text-center py-4 space-y-4">
      <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
        <i className="fa-solid fa-check text-2xl" />
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-900">Password Updated!</h3>
        <p className="text-xs text-slate-500 mt-1">
          Your password has been changed successfully. You can now log in.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy hover:from-[#153e74] hover:to-[#07162c] text-white text-xs font-black tracking-widest uppercase transition-all shadow-md shadow-brand-blue/20 cursor-pointer"
      >
        Go to Login
      </button>
    </div>
  );
}

// ─── REQUIRE PHONE FORM (MANDATORY FOR SOCIAL LOGIN) ─────────────────────────
function RequirePhoneForm({ onClose }) {
  const { user, updateProfile, loading, error, clearError, logout, switchAuthMode } = useAuth();
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const isSessionExpired =
    (error && /expired|unauthorized/i.test(error)) ||
    (phoneError && /expired|unauthorized/i.test(phoneError));

  const handleSessionExpiredLogin = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    switchAuthMode('login');
  };

  const validatePhone = (val) => {
    const digits = (val || '').replace(/[\s-]/g, '');
    if (!digits) return 'Mobile number is mandatory and required';
    if (!/^[6-9]\d{9}$/.test(digits)) return 'Please enter a valid 10-digit mobile number starting with 6-9';
    return '';
  };

  const resolveErrorMessage = (raw) => {
    if (!raw) return '';
    const str = String(raw);
    if ((/duplicate key|E11000|already registered/i.test(str)) && !/null/i.test(str)) {
      return 'This mobile number is already registered with another account. Please use a different number.';
    }
    return str;
  };

  const displayError = resolveErrorMessage(phoneError || error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validatePhone(phone);
    if (err) {
      setPhoneError(err);
      return;
    }

    try {
      const cleanPhone = phone.replace(/[\s-]/g, '');
      await updateProfile({
        name: user?.name || user?.fullName || 'User',
        fullName: user?.fullName || user?.name || 'User',
        phoneNumber: cleanPhone,
        mobile: cleanPhone,
        role: 'user',
      }).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Registration Complete!',
        text: 'Your mobile number has been registered.',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
      onClose();

      const redirect = sessionStorage.getItem('vishwam_auth_redirect');
      if (redirect) {
        sessionStorage.removeItem('vishwam_auth_redirect');
        navigateTo(redirect);
      }
    } catch (apiErr) {
      const msg = typeof apiErr === 'string' ? apiErr : (apiErr?.message || 'Failed to save mobile number');
      setPhoneError(resolveErrorMessage(msg));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSessionExpired ? (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <i className="fa-solid fa-clock-rotate-left text-amber-600" />
            <span>Session Expired</span>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            Your login session has expired. Please sign in again to complete your account registration.
          </p>
          <button
            type="button"
            onClick={handleSessionExpiredLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy hover:from-[#153e74] hover:to-[#07162c] text-white text-xs font-black tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            <i className="fa-solid fa-arrow-right-to-bracket" />
            <span>SIGN IN AGAIN</span>
          </button>
        </div>
      ) : (
        <>
          {displayError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs text-red-600 font-medium">
              {displayError}
            </div>
          )}
        </>
      )}

      <div className="text-center mb-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue mx-auto flex items-center justify-center text-xl mb-2">
          <i className="fa-solid fa-mobile-screen-button" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Mobile Number Required</h3>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
          Please enter your mobile number to complete registration. This is mandatory for all OneVishwam accounts.
        </p>
      </div>

      <div className="relative pt-1.5">
        <span className="absolute top-0 left-3.5 bg-white px-1.5 text-[11px] font-bold text-brand-blue z-10 tracking-wide select-none">
          Mobile Number <span className="text-red-500 font-bold">*</span>
        </span>
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2.5 sm:py-3 rounded-xl border bg-white transition-all ${
            displayError
              ? 'border-red-400 ring-2 ring-red-500/10'
              : 'border-brand-blue/40 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/15'
          }`}
        >
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">+91</span>
          <input
            type="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
              setPhone(val);
              setPhoneError('');
              if (clearError) clearError();
            }}
            placeholder="9876543210"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300 font-semibold tracking-wider"
            autoFocus
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || isSessionExpired}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy hover:from-[#153e74] hover:to-[#07162c] active:scale-[0.99] text-white text-xs font-black tracking-widest uppercase transition-all shadow-md shadow-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-1"
      >
        {loading && <i className="fa-solid fa-circle-notch fa-spin text-xs" />}
        <span>COMPLETE REGISTRATION</span>
      </button>
    </form>
  );
}

// ─── MAIN AUTH MODALS WRAPPER (2-COLUMN DESIGN) ──────────────────────────────
export default function AuthModals() {
  const { user, isLoggedIn, showAuthModal, closeAuthModal, openAuthModal, authModalMode, switchAuthMode, setVerifyToken, logout, fetchMe } = useAuth();
  const checkedPhoneForUserRef = useRef(null);

  // Listen to auth:logout events from Axios interceptors
  useEffect(() => {
    const handleLogoutEvent = () => {
      logout();
    };
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, [logout]);

  // Check if session is actually valid when prompt opens or on load
  useEffect(() => {
    let isCancelled = false;
    const verifySession = async () => {
      if (!isLoggedIn) return;
      if (auth && typeof auth.authStateReady === 'function') {
        await auth.authStateReady();
      }
      if (isCancelled) return;
      if (!auth.currentUser) {
        const token = localStorage.getItem('accessToken');
        if (!token || isJwtExpired(token)) {
          logout();
        }
      }
    };
    verifySession();
    return () => {
      isCancelled = true;
    };
  }, [isLoggedIn, logout]);

  // If user is logged in, verify whether phone exists in MongoDB Atlas before prompting for mandatory phone
  // Guarded to prevent repetitive /auth/me call loops
  useEffect(() => {
    let isCancelled = false;

    if (!isLoggedIn || !user) {
      checkedPhoneForUserRef.current = null;
      return;
    }

    const hasLocalPhone = Boolean(user.phoneNumber || user.mobile || user.phone);
    if (hasLocalPhone) {
      if (showAuthModal && authModalMode === 'require-phone') {
        closeAuthModal();
      }
      return;
    }

    const userId = user._id || user.uid || user.firebaseUid || user.email;
    // Only check remote profile ONCE per logged-in user to avoid re-triggering fetchMe in a loop
    if (checkedPhoneForUserRef.current === userId) {
      if (!showAuthModal || authModalMode !== 'require-phone') {
        openAuthModal('require-phone');
      }
      return;
    }

    checkedPhoneForUserRef.current = userId;

    const verifyPhoneRequirement = async () => {
      // If local cache lacks phone, check authoritative MongoDB Atlas profile once
      try {
        const freshUser = await fetchMe().unwrap();
        if (isCancelled) return;

        const hasRemotePhone = Boolean(freshUser?.phoneNumber || freshUser?.mobile || freshUser?.phone);
        if (hasRemotePhone) {
          if (showAuthModal && authModalMode === 'require-phone') {
            closeAuthModal();
          }
          return;
        }
      } catch {
        // Network or fetch failed, fallback to local check
      }

      if (!isCancelled) {
        if (!showAuthModal || authModalMode !== 'require-phone') {
          openAuthModal('require-phone');
        }
      }
    };

    verifyPhoneRequirement();

    return () => {
      isCancelled = true;
    };
  }, [isLoggedIn, user, showAuthModal, authModalMode, openAuthModal, closeAuthModal, fetchMe]);

  useEffect(() => {
    if (!showAuthModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (authModalMode === 'require-phone') {
          Swal.fire({
            icon: 'warning',
            title: 'Phone Number Required',
            text: 'Mobile number is mandatory to complete your account registration.',
            confirmButtonColor: '#003366',
          });
          return;
        }
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showAuthModal, closeAuthModal, authModalMode]);

  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      {/* Outer Card: 2 Column Layout with Left Hero & Right Form */}
      <div
        className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-[0_25px_70px_rgba(10,31,63,0.35)] overflow-hidden border border-brand-blue/10 grid grid-cols-1 md:grid-cols-12 min-h-0 sm:min-h-[530px] max-h-[92vh] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Sleek Close Button */}
        {authModalMode !== 'require-phone' && (
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/90 text-slate-400 hover:text-brand-navy hover:bg-white border border-slate-200/80 backdrop-blur-md transition-all shadow-xs active:scale-95 cursor-pointer"
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        )}

        {/* ─── LEFT COLUMN: Brand Hero Banner with Official Logo ─── */}
        <div className="md:col-span-5 relative hidden md:flex flex-col justify-between p-8 overflow-hidden bg-gradient-to-b from-[#d9ebfa] via-[#e8f2fb] to-[#cfe4f6] text-slate-900 select-none border-r border-sky-200/80">
          {/* Ambient Soft Glow Lights */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-300/35 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

          {/* Background Luxury Architectural Image */}
          <img
            src={HERO_IMAGE}
            alt="OneVishwam Living"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30 select-none pointer-events-none"
            loading="eager"
          />
          {/* Luminous Footer Blue Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#d9ebfa]/80 via-[#e8f2fb]/70 to-[#cfe4f6]/80 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#cfe4f6] via-[#cfe4f6]/60 to-transparent pointer-events-none" />

          {/* Top Brand Logo & Tagline */}
          <div className="relative z-10 space-y-4 pt-1">
            {/* Official Logo in a translucent glass container */}
            <div className="inline-flex items-center bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xs border border-sky-200/80">
              <img src={logo} alt="OneVishwam Logo" className="h-8 w-auto object-contain" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg lg:text-xl font-black text-slate-950 tracking-tight">
                Unlock Your Next Chapter
              </h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-xs">
                Your all-in-one destination for verified Properties, Smart Finance, and Lifestyle Services.
              </p>
            </div>
          </div>

          {/* Bottom Highlights Pill */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-bold text-slate-800 border border-sky-200/90 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
              <span>Properties • Finance • Marketplace</span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Form & Landmarks ─── */}
        <div className="md:col-span-7 relative flex flex-col justify-between bg-white px-5 py-6 sm:px-10 sm:py-10 overflow-y-auto">
          {/* Top Flight Trail Curve */}
          <FlightTrail />

          <div className="relative z-10 max-w-sm mx-auto w-full my-auto">
            {/* Header */}
            <div className="text-center mb-5">
              {/* Mobile-only Logo */}
              <div className="flex justify-center mb-3 md:hidden">
                <img src={logo} alt="OneVishwam Logo" className="h-8 w-auto object-contain" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-brand-blue tracking-tight">
                {authModalMode === 'login'
                  ? 'Welcome'
                  : authModalMode === 'register'
                  ? 'Register'
                  : authModalMode === 'require-phone'
                  ? 'One Last Step'
                  : authModalMode === 'forgot'
                  ? 'Reset Password'
                  : authModalMode === 'verify-otp'
                  ? 'Verify Email'
                  : authModalMode === 'reset-password'
                  ? 'New Password'
                  : 'Welcome'}
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {authModalMode === 'login'
                  ? 'Login with Email'
                  : authModalMode === 'register'
                  ? 'Join OneVishwam Today'
                  : authModalMode === 'require-phone'
                  ? 'Mobile Number Mandatory'
                  : 'Follow the steps to continue'}
              </p>
            </div>

            {/* Forms */}
            {authModalMode === 'login' ? (
              <LoginForm onSwitch={() => switchAuthMode('register')} onClose={closeAuthModal} />
            ) : authModalMode === 'register' ? (
              <RegisterForm onSwitch={() => switchAuthMode('login')} onClose={closeAuthModal} />
            ) : authModalMode === 'require-phone' ? (
              <RequirePhoneForm onClose={closeAuthModal} />
            ) : authModalMode === 'forgot' ? (
              <ForgotPasswordForm
                onBack={() => switchAuthMode('login')}
                onNext={() => switchAuthMode('verify-otp')}
              />
            ) : authModalMode === 'verify-otp' ? (
              <VerifyOtpForm
                onBack={() => switchAuthMode('forgot')}
                onNext={(vt) => {
                  setVerifyToken(vt);
                  switchAuthMode('reset-password');
                }}
              />
            ) : authModalMode === 'reset-password' ? (
              <SetPasswordForm
                onBack={() => switchAuthMode('verify-otp')}
                onSuccess={() => switchAuthMode('reset-success')}
              />
            ) : authModalMode === 'reset-success' ? (
              <ResetSuccessView onClose={closeAuthModal} />
            ) : null}
          </div>

          {/* Bottom Landmarks / Monuments Illustration */}
          <div className="relative pt-4 sm:pt-6 -mx-6 sm:-mx-10 -mb-8 sm:-mb-10 overflow-hidden">
            <SkylineIllustration />
          </div>
        </div>
      </div>
    </div>
  );
}