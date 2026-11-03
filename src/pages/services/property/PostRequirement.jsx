import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLocation } from '../../../store/locationSlice';
import { cities } from '../../../constants/locations';
import { Breadcrumbs } from '../../../components/ui';

const LOOKING_FOR = [
  { value: 'house', label: 'House' },
  { value: 'flat', label: 'Flat / Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'plot', label: 'Plot' },
  { value: 'land', label: 'Land' },
  { value: 'farm-land', label: 'Farm Land' },
  { value: 'commercial-shop', label: 'Commercial Shop' },
  { value: 'office', label: 'Office' },
  { value: 'warehouse', label: 'Warehouse' },
];

const REQUIREMENT_TYPES = ['Buy', 'Lease'];

const BEDROOM_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];

const PLOT_LAND_TYPES = ['plot', 'land', 'farm-land'];

function PostRequirement() {
  const navigate = useNavigate();
  const { selectedCity, selectCity } = useLocation();

  const [lookingFor, setLookingFor] = useState('');
  const [reqType, setReqType] = useState('Buy');
  const [city, setCity] = useState(selectedCity || '');
  const [area, setArea] = useState('');
  const [areaSearch, setAreaSearch] = useState('');
  const [areaOpen, setAreaOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [sizeMin, setSizeMin] = useState('');
  const [sizeMax, setSizeMax] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [additional, setAdditional] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const areaRef = useRef(null);

  const cityAreas = useMemo(() => {
    if (!city) return [];
    return cities[city]?.areas || [];
  }, [city]);

  const filteredAreas = useMemo(() => {
    if (!areaSearch) return cityAreas;
    return cityAreas.filter((a) => a.toLowerCase().includes(areaSearch.toLowerCase()));
  }, [cityAreas, areaSearch]);

  const isPlotOrLand = PLOT_LAND_TYPES.includes(lookingFor);

  useEffect(() => {
    function handleClick(e) {
      if (areaRef.current && !areaRef.current.contains(e.target)) {
        setAreaOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleCityChange(value) {
    setCity(value);
    setArea('');
    setAreaSearch('');
    if (value) selectCity(value);
  }

  function validate() {
    const e = {};
      if (!lookingFor) e.lookingFor = 'Select what you are looking for';
    if (!city) e.city = 'Select a city';
    if (pincode && !/^\d{6}$/.test(pincode)) e.pincode = 'Enter a valid 6-digit PIN code';
    if (!budgetMin) e.budgetMin = 'Enter minimum budget';
    if (!budgetMax) e.budgetMax = 'Enter maximum budget';
    if (budgetMin && budgetMax && Number(budgetMin) >= Number(budgetMax)) e.budgetMax = 'Max must be greater than min';
    if (!name.trim()) e.name = 'Name is required';
    if (!phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\+?[\d\s-]{10,15}$/.test(phone)) e.phone = 'Invalid phone number';
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = 'Invalid email format';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    navigate('/property/requirement/success');
  }

  function inputClass(field) {
    return `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
      errors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
        : 'border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10'
    }`;
  }

  return (
    <div className="min-h-screen pb-24 pt-4 sm:pt-6">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Breadcrumb navigation */}
        <div className="mb-6">
          <Breadcrumbs
            categoryName="Properties"
            categoryLink="/our-services/properties"
            itemTitle="Post Requirement"
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue mb-1">
            OneVishwam · Properties
          </p>
          <h1 className="text-2xl font-bold text-brand-charcoal sm:text-3xl">Tell Us What You're Looking For</h1>
          <p className="text-sm text-gray-500 mt-2">Fill in a few details, and we'll help you find matching properties.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Section: Property Details ── */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-brand-charcoal flex items-center gap-2">
              <i className="fa-solid fa-house text-brand-blue/60" />
              Property Details
            </h2>

            {/* Looking For */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                What are you looking for? <span className="text-red-400">*</span>
              </label>
              <select value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} className={inputClass('lookingFor')}>
                <option value="">Select property type</option>
                {LOOKING_FOR.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors.lookingFor && <p className="mt-1 text-xs text-red-500">{errors.lookingFor}</p>}
            </div>

            {/* Requirement Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you want to Buy, Rent or Lease? <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3">
                {REQUIREMENT_TYPES.map((t) => (
                  <label key={t} className={`flex items-center gap-2 rounded-xl border px-4 py-3 cursor-pointer transition-all text-sm font-medium ${
                    reqType === t
                      ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="reqType" value={t} checked={reqType === t}
                      onChange={(e) => setReqType(e.target.value)} className="sr-only"
                    />
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      reqType === t ? 'border-brand-blue' : 'border-gray-300'
                    }`}>
                      {reqType === t && <span className="w-2 h-2 rounded-full bg-brand-blue" />}
                    </span>
                    {t}
                  </label>
                ))}
              </div>
            </div>

            {/* Bedrooms (hidden for plot/land) */}
            {!isPlotOrLand && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bedrooms</label>
                <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={inputClass('bedrooms')}>
                  <option value="">Select bedrooms</option>
                  {BEDROOM_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}

            {/* Property Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Property Size (sq.ft)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input type="number" min="0" value={sizeMin} onChange={(e) => setSizeMin(e.target.value)}
                    placeholder="Min size" className={inputClass('sizeMin')}
                  />
                </div>
                <div>
                  <input type="number" min="0" value={sizeMax} onChange={(e) => setSizeMax(e.target.value)}
                    placeholder="Max size" className={inputClass('sizeMax')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section: Location ── */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-brand-charcoal flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-brand-blue/60" />
              Location
            </h2>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                City <span className="text-red-400">*</span>
              </label>
              <select value={city} onChange={(e) => handleCityChange(e.target.value)} className={inputClass('city')}>
                <option value="">Select city</option>
                {Object.entries(cities).map(([id, c]) => <option key={id} value={id}>{c.label}</option>)}
              </select>
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
            </div>

            {/* Area (searchable) */}
            <div ref={areaRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Area</label>
              <input type="text" value={areaOpen ? areaSearch : area}
                onFocus={() => { setAreaOpen(true); setAreaSearch(area); }}
                onChange={(e) => { setAreaSearch(e.target.value); }}
                placeholder={city ? 'Search area...' : 'Select a city first'}
                disabled={!city}
                className={inputClass('area')}
              />
              {areaOpen && city && (
                <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                  {filteredAreas.length > 0 ? filteredAreas.map((a) => (
                    <button key={a} type="button" onClick={() => { setArea(a); setAreaOpen(false); setAreaSearch(''); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-blue/5 transition-colors ${a === area ? 'bg-brand-blue/10 font-medium text-brand-blue' : 'text-gray-700'}`}
                    >
                      {a}
                    </button>
                  )) : (
                    <p className="px-4 py-3 text-sm text-gray-400">No areas found</p>
                  )}
                </div>
              )}
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">PIN Code</label>
              <input type="text" inputMode="numeric" maxLength={6} value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit PIN code" className={inputClass('pincode')}
              />
              {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
            </div>
          </div>

          {/* ── Section: Budget ── */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-brand-charcoal flex items-center gap-2">
              <i className="fa-solid fa-indian-rupee-sign text-brand-blue/60" />
              Budget
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Minimum Budget <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
                  <input type="number" min="0" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="20,00,000" className={`pl-8 ${inputClass('budgetMin')}`}
                  />
                </div>
                {errors.budgetMin && <p className="mt-1 text-xs text-red-500">{errors.budgetMin}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Maximum Budget <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
                  <input type="number" min="0" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="50,00,000" className={`pl-8 ${inputClass('budgetMax')}`}
                  />
                </div>
                {errors.budgetMax && <p className="mt-1 text-xs text-red-500">{errors.budgetMax}</p>}
              </div>
            </div>
          </div>

          {/* ── Section: Additional Requirements ── */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-brand-charcoal flex items-center gap-2">
              <i className="fa-solid fa-pen text-brand-blue/60" />
              Additional Requirements
            </h2>
            <textarea value={additional} onChange={(e) => setAdditional(e.target.value)}
              placeholder="Example: I need a 2 BHK flat near a school and hospital with covered parking."
              rows={4} className={inputClass('additional')}
            />
          </div>

          {/* ── Section: Contact Details ── */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-brand-charcoal flex items-center gap-2">
              <i className="fa-solid fa-address-card text-brand-blue/60" />
              Contact Details
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name" className={inputClass('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mobile Number <span className="text-red-400">*</span>
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your mobile number" className={inputClass('phone')}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" className={inputClass('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 py-3.5 text-sm font-extrabold transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <i className="fa-solid fa-paper-plane mr-2" />
              Submit Requirement
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-200 bg-white py-3.5 px-8 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostRequirement;
