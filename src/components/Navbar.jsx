import { useCallback, useEffect, useRef, useState } from 'react';
import logo from '../assets/logo.png';
import { navLinks } from '../constants/siteContent';
import { marketplaceCategories } from '../constants/categoriesData';
import { cities, getCityLabel } from '../constants/locations';
import { useLocation } from '../store/locationSlice';
import { detectCurrentLocation } from '../utils/detectLocation';
import { PROPERTIES_ONLY } from '../config/appConfig';
import { Link, useLocation as useRouterLocation } from 'react-router-dom';
import TopNotificationBar from './TopNotificationBar';
import ListingRedirectModal from './modals/ListingRedirectModal';
import { useAuth } from '../store/authSlice';
import Swal from 'sweetalert2';

const CATEGORY_THEMES = {
  properties: {
    gradient: 'from-blue-600 to-indigo-600',
    shadow: 'shadow-blue-500/25',
    badgeText: 'text-blue-700',
    badgeBg: 'bg-blue-50 border-blue-100',
    tag: 'Flats · Plots · Villas',
    hoverBorder: 'hover:border-blue-300',
    hoverText: 'group-hover:text-blue-600',
  },
  'all-categories': {
    gradient: 'from-rose-500 to-red-600',
    shadow: 'shadow-rose-500/25',
    badgeText: 'text-rose-700',
    badgeBg: 'bg-rose-50 border-rose-100',
    tag: 'All Categories & Ecosystem',
    hoverBorder: 'hover:border-rose-300',
    hoverText: 'group-hover:text-rose-600',
  },
  'all-services': {
    gradient: 'from-rose-500 to-red-600',
    shadow: 'shadow-rose-500/25',
    badgeText: 'text-rose-700',
    badgeBg: 'bg-rose-50 border-rose-100',
    tag: 'All Categories & Ecosystem',
    hoverBorder: 'hover:border-rose-300',
    hoverText: 'group-hover:text-rose-600',
  },
  automobile: {
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/25',
    badgeText: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 border-emerald-100',
    tag: 'Cars, Bikes & Fleets',
    hoverBorder: 'hover:border-emerald-300',
    hoverText: 'group-hover:text-emerald-600',
  },
  'consumer-electronics': {
    gradient: 'from-violet-600 to-purple-600',
    shadow: 'shadow-violet-500/25',
    badgeText: 'text-violet-700',
    badgeBg: 'bg-violet-50 border-violet-100',
    tag: 'Appliances & Gadgets',
    hoverBorder: 'hover:border-violet-300',
    hoverText: 'group-hover:text-violet-600',
  },
  'bedding-comfort': {
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/25',
    badgeText: 'text-amber-700',
    badgeBg: 'bg-amber-50 border-amber-100',
    tag: 'Mattresses & Linen',
    hoverBorder: 'hover:border-amber-300',
    hoverText: 'group-hover:text-amber-600',
  },
};

function Navbar() {
  const dropdownCategories = marketplaceCategories.filter((cat) => cat.id !== 'all-categories');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const currentLocation = useRouterLocation();
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'categories', 'more', 'location', or null
  const menuRef = useRef(null);
  const categoryRef = useRef(null);
  const closeTimerRef = useRef(null);
  const locationRef = useRef(null);
  const { selectedCity, selectArea, selectCity, detectStatus, setDetectStatus } = useLocation();
  const { isLoggedIn, user, openAuthModal, logout } = useAuth();

  const handleLogoutConfirm = async () => {
    const result = await Swal.fire({
      title: 'Log out of your account?',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1a4b8c',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Log Out',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-5 py-2.5 font-bold',
        cancelButton: 'rounded-xl px-5 py-2.5 font-bold',
      },
    });

    if (result.isConfirmed) {
      logout();
      Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been logged out successfully.',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
    }
  };

  const visibleNavLinks = navLinks;

  const showDropdown = useCallback((name) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenDropdown(name);
  }, []);

  const hideDropdown = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  }, []);

  const toggleDropdown = useCallback((name) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenDropdown((prev) => (prev === name ? null : name));
  }, []);

  useEffect(() => {
    if (openDropdown === 'location') setDetectStatus('idle');
  }, [openDropdown, setDetectStatus]);

  // Mobile drawer body scroll lock & auto-close on navigation
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [currentLocation.pathname]);

  const handleDetect = useCallback(async (close) => {
    setDetectStatus('detecting');
    try {
      const result = await detectCurrentLocation();
      if (result) {
        selectArea(result.cityId, result.area);
        setDetectStatus('idle');
        close();
      } else {
        setDetectStatus('unsupported');
      }
    } catch {
      setDetectStatus('error');
    }
  }, [selectArea, setDetectStatus]);

  const handleSelectCity = (cityId, close) => {
    selectCity(cityId);
    setDetectStatus('idle');
    close();
  };

  const detectButton = (close) => (
    <button onClick={() => handleDetect(close)}
      disabled={detectStatus === 'detecting'}
      className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      {detectStatus === 'detecting' ? (
        <i className="fa-solid fa-spinner text-brand-blue animate-spin w-4" />
      ) : detectStatus === 'unsupported' ? (
        <i className="fa-solid fa-triangle-exclamation text-amber-500 w-4" />
      ) : (
        <i className="fa-solid fa-crosshairs text-brand-blue w-4" />
      )}
      <span className="flex-1 text-left">
        {detectStatus === 'detecting' ? 'Detecting...' :
         detectStatus === 'unsupported' ? 'Location not covered yet' :
         'Detect My Location'}
      </span>
    </button>
  );

  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setOpenDropdown(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleDropdown('location');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleDropdown]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      const clickedOutsideCategory = !categoryRef.current || !categoryRef.current.contains(e.target);
      const clickedOutsideMore = !menuRef.current || !menuRef.current.contains(e.target);
      const clickedOutsideLocation = !locationRef.current || !locationRef.current.contains(e.target);
      if (clickedOutsideCategory && clickedOutsideMore && clickedOutsideLocation) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  useEffect(() => {
    setOpenDropdown(null);
    setMenuOpen(false);
    setMobileCategoryOpen(false);
  }, [currentLocation.pathname]);

  const isCategoryActive =
    currentLocation.pathname.startsWith('/categories') ||
    currentLocation.pathname.startsWith('/our-services') ||
    currentLocation.pathname.startsWith('/properties') ||
    currentLocation.pathname.startsWith('/property') ||
    currentLocation.pathname.startsWith('/vehicles') ||
    currentLocation.pathname.startsWith('/vehicle') ||
    currentLocation.pathname.startsWith('/automobile') ||
    currentLocation.pathname.startsWith('/grocery') ||
    currentLocation.pathname.startsWith('/jewellery') ||
    currentLocation.pathname.startsWith('/garment') ||
    currentLocation.pathname.startsWith('/finance') ||
    currentLocation.pathname.startsWith('/electronics') ||
    currentLocation.pathname.startsWith('/bedding');

  const isActive = (link) => {
    const path = currentLocation.pathname;
    if (link.id === 'home') return path === '/' || path === '/home';
    if (link.id === 'category' || link.id === 'categories') return isCategoryActive;
    if (link.id === 'about') return path.startsWith('/about-us');
    if (link.id === 'enquiry' || link.id === 'contact') return path.startsWith('/enquiry') || path.startsWith('/contact-us');
    if (link.id === 'careers') return path.startsWith('/careers');
    return false;
  };

  const aboutLink = visibleNavLinks.find((l) => l.id === 'about');
  const enquiryLink = visibleNavLinks.find((l) => l.id === 'enquiry');

  const renderNavLink = (link) => {
    if (!link) return null;
    const active = isActive(link);
    if (link.submenu) {
      return (
        <div
          key={link.id}
          ref={menuRef}
          className="relative"
          onMouseEnter={() => showDropdown(link.id)}
          onMouseLeave={hideDropdown}
        >
          <button
            type="button"
            id={`${link.id}-dropdown-trigger`}
            aria-controls={`${link.id}-dropdown-menu`}
            aria-haspopup="true"
            aria-expanded={openDropdown === link.id}
            onClick={() => toggleDropdown(link.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-full transition-colors ${
              active ? 'text-brand-blue bg-blue-100/80 border border-blue-300/90 shadow-2xs font-extrabold' : 'text-slate-900 hover:text-brand-blue hover:bg-slate-100/90'
            }`}
          >
            {link.label}
            <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${openDropdown === link.id ? 'rotate-180' : ''}`} />
          </button>
          {openDropdown === link.id && (
            <div
              id={`${link.id}-dropdown-menu`}
              role="menu"
              aria-labelledby={`${link.id}-dropdown-trigger`}
              className="absolute left-0 top-full pt-1.5 min-w-[200px] z-50 animate-fade-in"
            >
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl py-2">
                {link.submenu.columns.map((col, ci) => (
                  <div key={ci} className="border-r border-slate-100 last:border-r-0">
                    {col.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        role="menuitem"
                        onClick={() => setOpenDropdown(null)}
                        className="block px-4 py-2 text-xs sm:text-sm text-slate-700 font-semibold hover:bg-slate-50 hover:text-brand-blue transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <Link
        key={link.id}
        to={link.href}
        className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-full transition-all ${
          active ? 'text-brand-blue bg-blue-100/80 border border-blue-300/90 shadow-2xs font-extrabold' : 'text-slate-900 hover:text-brand-blue hover:bg-slate-100/90'
        }`}
      >
        {link.label}
      </Link>
    );
  };

  const renderMobileNavLink = (link) => {
    if (!link) return null;
    return (
      <div key={link.id}>
        <Link
          to={link.href}
          onClick={() => setMenuOpen(false)}
          className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            isActive(link) ? 'text-brand-blue bg-brand-blue/5' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {link.label}
        </Link>
        {link.submenu && (
          <div className="ml-4 mt-1 space-y-0.5">
            {link.submenu.columns.flat().map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-gray-500 rounded-lg hover:bg-gray-50 hover:text-brand-blue transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div
          className={`transition-all duration-300 pointer-events-none ${
            scrolled ? 'pt-1 sm:pt-1.5 px-3 sm:px-6' : 'pt-0 px-0'
          }`}
        >
          <header
            className={`relative z-30 pointer-events-auto transition-all duration-300 ease-in-out ${
              scrolled
                ? 'mx-auto max-w-6xl xl:max-w-7xl rounded-full bg-white/98 backdrop-blur-md border border-slate-300 shadow-[0_12px_40px_rgba(15,23,42,0.18)] px-4 sm:px-6'
                : 'w-full bg-white/98 backdrop-blur-md border-b border-slate-300 shadow-sm px-4 sm:px-6 lg:px-8 rounded-none'
            }`}
          >
          <div className="w-full">
            <div className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? 'h-13 sm:h-14' : 'h-16 lg:h-14'
            }`}>
              <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Vishwam Home">
                <img
                  src={logo}
                  alt="Vishwam Logo"
                  className={`w-auto transition-all duration-300 ${scrolled ? 'h-7 sm:h-7.5' : 'h-8'}`}
                />
              </Link>

              <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
                {/* Home Link */}
                <Link
                  to="/home"
                  className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-full border transition-all ${
                    currentLocation.pathname === '/' || currentLocation.pathname === '/home'
                      ? 'text-brand-blue bg-blue-100/80 border-blue-300/90 shadow-2xs font-extrabold'
                      : 'text-slate-900 hover:text-brand-blue hover:bg-slate-100/90 border-transparent'
                  }`}
                >
                  Home
                </Link>

              {/* Category Dropdown Menu */}
              {/* About Us Link */}
              {renderNavLink(aboutLink)}

              {/* Enquiry Link */}
              {renderNavLink(enquiryLink)}

              {/* Categories Dropdown Menu */}
              <div
                ref={categoryRef}
                className="relative z-40"
                onMouseEnter={() => showDropdown('categories')}
                onMouseLeave={hideDropdown}
              >
                <button
                  type="button"
                  id="category-dropdown-trigger"
                  aria-controls="category-dropdown-menu"
                  aria-haspopup="true"
                  aria-expanded={openDropdown === 'categories'}
                  onClick={() => toggleDropdown('categories')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-full transition-colors ${
                    openDropdown === 'categories' || isCategoryActive
                      ? 'text-brand-blue bg-blue-100/80 border border-blue-300/90 font-extrabold shadow-2xs'
                      : 'text-slate-900 hover:text-brand-blue hover:bg-slate-100/90'
                  }`}
                >
                  <span>Categories</span>
                  <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${openDropdown === 'categories' ? 'rotate-180 text-brand-blue' : 'text-slate-500'}`} />
                </button>

                {openDropdown === 'categories' && (
                  <div
                    id="category-dropdown-menu"
                    role="menu"
                    aria-labelledby="category-dropdown-trigger"
                    className="absolute left-0 top-full pt-2 w-[560px] max-w-[calc(100vw-2rem)] z-50 animate-fade-in"
                  >
                    <div className="relative rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15 overflow-hidden">
                      {/* Top Accent Gradient Bar */}
                      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 w-full" />

                      {/* Dropdown Header */}
                      <div className="px-4 py-3 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                            Marketplace Categories
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                            {dropdownCategories.length} Active
                          </span>
                        </div>
                        <Link
                          to="/categories"
                          onClick={() => setOpenDropdown(null)}
                          className="text-xs font-semibold text-brand-blue hover:text-brand-navy inline-flex items-center gap-1 group"
                        >
                          <span>All Categories</span>
                          <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>

                      {/* Categories Grid with Highlighting Cards */}
                      <div className="p-3.5 grid grid-cols-2 gap-2.5 bg-gradient-to-b from-slate-50/60 to-white">
                        {dropdownCategories.map((cat) => {
                          const isItemActive = currentLocation.pathname === cat.href;
                          const theme = CATEGORY_THEMES[cat.id] || {
                            gradient: 'from-blue-600 to-indigo-600',
                            shadow: 'shadow-blue-500/25',
                            badgeText: 'text-blue-700',
                            badgeBg: 'bg-blue-50 border-blue-100',
                            tag: 'Explore',
                            hoverBorder: 'hover:border-blue-300',
                            hoverText: 'group-hover:text-blue-600',
                          };

                          return (
                            <Link
                              key={cat.id}
                              to={cat.href}
                              role="menuitem"
                              onClick={() => setOpenDropdown(null)}
                              className={`group flex items-start gap-3 p-3 rounded-xl border bg-white transition-all duration-200 ${
                                isItemActive
                                  ? 'border-brand-blue ring-2 ring-brand-blue/20 shadow-sm'
                                  : `border-slate-200/80 ${theme.hoverBorder} hover:shadow-md hover:-translate-y-0.5`
                              }`}
                            >
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white bg-gradient-to-br ${theme.gradient} ${theme.shadow} shadow-md text-base transition-transform duration-200 group-hover:scale-105`}
                              >
                                <i className={cat.icon} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <h4 className={`text-sm font-bold truncate transition-colors ${
                                    isItemActive ? 'text-brand-blue' : `text-slate-800 ${theme.hoverText}`
                                  }`}>
                                    {cat.label}
                                  </h4>
                                  <i className="fa-solid fa-arrow-right text-[10px] text-slate-300 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all shrink-0" />
                                </div>
                                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border mt-0.5 ${theme.badgeBg} ${theme.badgeText}`}>
                                  {theme.tag}
                                </span>
                                <p className="text-xs text-slate-500 line-clamp-1 mt-1 leading-snug">
                                  {cat.shortDesc}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Dropdown Footer */}
                      <div className="bg-slate-50/90 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <i className="fa-solid fa-circle-check text-emerald-600 text-xs" />
                          <span className="font-medium text-slate-600">100% Verified Listings</span>
                        </span>
                        <Link
                          to="/enquiry"
                          onClick={() => setOpenDropdown(null)}
                          className="font-semibold text-brand-blue hover:text-brand-navy inline-flex items-center gap-1"
                        >
                          Contact Team <i className="fa-solid fa-chevron-right text-[10px]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Want to list an item? Button */}
              <button
                type="button"
                onClick={() => setShowListingModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-amber-800 bg-amber-50 hover:bg-amber-100/90 border border-amber-300/80 rounded-full transition-all shadow-2xs hover:shadow-xs hover:-translate-y-0.5 cursor-pointer ml-1"
              >
                <i className="fa-solid fa-circle-plus text-amber-600 text-xs" />
                <span>Want to list an item?</span>
              </button>
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <div
                className="relative"
                ref={locationRef}
                onMouseEnter={() => showDropdown('location')}
                onMouseLeave={hideDropdown}
              >
                <button
                  type="button"
                  id="location-dropdown-trigger"
                  aria-controls="location-dropdown-menu"
                  aria-haspopup="true"
                  aria-expanded={openDropdown === 'location'}
                  onClick={() => toggleDropdown('location')}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-900 bg-slate-100/90 hover:bg-slate-200/90 border border-slate-300/80 rounded-full transition-all shadow-2xs cursor-pointer"
                >
                  <i className="fa-solid fa-location-dot text-brand-blue" />
                  <span className="hidden sm:inline truncate max-w-[120px]">{getCityLabel(selectedCity)}</span>
                  <i className={`fa-solid fa-chevron-down text-xs transition-transform ${openDropdown === 'location' ? 'rotate-180 text-brand-blue' : 'text-slate-500'}`} />
                </button>
                {openDropdown === 'location' && (
                  <div
                    id="location-dropdown-menu"
                    role="menu"
                    aria-labelledby="location-dropdown-trigger"
                    className="absolute right-0 top-full pt-1.5 w-56 z-50 animate-fade-in"
                  >
                    <div className="rounded-xl border border-slate-200 bg-white shadow-xl py-2">
                      <div className="px-3 py-2">
                        {detectButton(() => setOpenDropdown(null))}
                      </div>
                      <hr className="my-1.5 border-slate-100 mx-2" />
                      <div className="max-h-48 overflow-y-auto px-2">
                        {Object.entries(cities).map(([cityId, city]) => (
                          <button
                            key={cityId}
                            onClick={() => handleSelectCity(cityId, () => setOpenDropdown(null))}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${selectedCity === cityId ? 'bg-blue-50 text-brand-blue font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            {city.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Login / Profile CTA */}
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-slate-100/90 hover:bg-slate-200/90 rounded-full transition-colors border border-slate-300/80 shadow-2xs"
                  >
                    <i className="fa-solid fa-user text-brand-blue text-xs" />
                    <span className="truncate max-w-[120px] uppercase tracking-wider">{user?.name || user?.fullName || 'Profile'}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogoutConfirm}
                    className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <i className="fa-solid fa-right-from-bracket text-xs" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-brand-blue hover:bg-sky-700 border border-brand-blue rounded-full transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-95"
                >
                  <i className="fa-solid fa-right-to-bracket text-xs text-white" />
                  <span>Login</span>
                </button>
              )}
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'} text-base`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Notifications / Festival Offers Bar (Directly Under Menubar) ── */}
      <div className="relative z-10 pointer-events-auto">
        <TopNotificationBar isScrolled={scrolled} />
      </div>
        </div>
      </div>

      {/* Document flow spacer for fixed header & top ribbon */}
      <div className="h-[102px] lg:h-[98px]" aria-hidden="true" />

      {/* Mobile overlay */}
      <div className={`fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile sidebar */}
      <div className={`fixed top-0 right-0 z-[60] h-full w-72 bg-white shadow-xl transition-transform overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <span className="font-bold text-brand-navy">Menu</span>
          <button onClick={() => setMenuOpen(false)} className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Mobile Login / Account Bar */}
        <div className="p-4 border-b bg-gray-50/50">
          {isLoggedIn ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-user text-brand-blue text-sm" />
                <span className="text-sm font-bold text-brand-charcoal truncate max-w-[140px]">
                  {user?.name || user?.fullName || 'My Account'}
                </span>
              </div>
              <button
                onClick={() => { setMenuOpen(false); handleLogoutConfirm(); }}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setMenuOpen(false); openAuthModal('login'); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-brand-blue bg-white border border-brand-blue/30 rounded-xl hover:bg-brand-blue/5 transition-colors cursor-pointer shadow-2xs"
            >
              <i className="fa-solid fa-right-to-bracket text-sm text-brand-blue" />
              <span>Login / Register</span>
            </button>
          )}
        </div>

        <div className="p-4 border-b">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Your Location</p>
          <div className="space-y-1">
            {detectButton(() => setMenuOpen(false))}
            <hr className="my-1.5 border-gray-100" />
            {Object.entries(cities).map(([cityId, city]) => (
              <button key={cityId} onClick={() => handleSelectCity(cityId, () => setMenuOpen(false))}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedCity === cityId
                    ? 'bg-brand-blue/5 text-brand-blue font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {/* Home Link */}
          <Link
            to="/home"
            onClick={() => setMenuOpen(false)}
            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              currentLocation.pathname === '/' || currentLocation.pathname === '/home'
                ? 'text-brand-blue bg-brand-blue/5 font-semibold'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Home
          </Link>

          {/* Category Accordion */}
          {/* About Us Link */}
          {renderMobileNavLink(aboutLink)}

          {/* Enquiry Link */}
          {renderMobileNavLink(enquiryLink)}

          {/* Categories Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setMobileCategoryOpen((prev) => !prev)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isCategoryActive ? 'text-brand-blue bg-brand-blue/5 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Categories</span>
              <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-200 ${mobileCategoryOpen ? 'rotate-180 text-brand-blue' : 'text-gray-400'}`} />
            </button>

            {mobileCategoryOpen && (
              <div className="ml-4 pl-3 my-1.5 border-l-2 border-brand-blue/20 space-y-0.5">
                {dropdownCategories.map((cat) => {
                  if (cat.disabled) {
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-gray-400 opacity-40 cursor-not-allowed select-none"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <i className={`${cat.icon} w-4 text-center text-gray-300`} />
                          <span className="truncate">{cat.label}</span>
                        </div>
                        <span className="text-[9px] font-semibold text-gray-400 bg-gray-200/70 px-1.5 py-0.5 rounded shrink-0">
                          Coming Soon
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={cat.id}
                      to={cat.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        currentLocation.pathname === cat.href
                          ? 'text-brand-blue bg-brand-blue/5 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-brand-blue'
                      }`}
                    >
                      <i className={`${cat.icon} w-4 text-center text-gray-400`} />
                      <span className="truncate">{cat.label}</span>
                    </Link>
                  );
                })}
                <Link
                  to="/categories"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-brand-blue rounded-lg hover:bg-brand-blue/5 transition-colors"
                >
                  <i className="fa-solid fa-arrow-right w-4 text-center" />
                  <span>View All Categories</span>
                </Link>
              </div>
            )}
          </div>

          {/* Want to list an item? Mobile CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setShowListingModal(true);
              }}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 transition-all text-left shadow-2xs cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-circle-plus text-amber-600" />
                <span>Want to list an item?</span>
              </span>
              <i className="fa-solid fa-arrow-up-right-from-square text-xs text-amber-600" />
            </button>
          </div>
        </nav>
      </div>

      {/* Listing Redirect Confirmation Modal */}
      <ListingRedirectModal
        isOpen={showListingModal}
        onClose={() => setShowListingModal(false)}
      />
    </>
  );
}

export default Navbar;