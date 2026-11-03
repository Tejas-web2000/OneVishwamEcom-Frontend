import { primaryNavigation } from './siteContent';

export const footerBrandName = 'Vishwam';

export const footerSummary =
  'A massive multi-service ecosystem spanning finance, property, marketplace, and enterprise solutions.';

export const footerQuickLinks = primaryNavigation;

export const footerServiceLinks = [
  { label: 'All Categories', href: '/categories' },
  { label: 'Properties', href: '/categories/properties' },
  { label: 'Automobiles', href: '/categories/automobile' },
  { label: 'Consumer Electronics', href: '/categories/consumer-electronics' },
  { label: 'Comfort', href: '/categories/bedding-comfort' },
];

export const footerSocialLinks = [
  { label: 'Instagram', icon: 'fa-brands fa-instagram', href: 'https://www.instagram.com/onevishwam/' },
  { label: 'Facebook', icon: 'fa-brands fa-facebook-f', href: 'https://www.facebook.com/profile.php?id=61593017245527' },
];

export const footerLocations = [
  { label: 'Address', value: 'Bangalore-560004', primary: true },
  { label: 'Phone', value: '8546996622' },
  { label: 'Email', value: 'ceo@onevishwam.com' },
];

export const contactInfo = {
  brandName: 'OneVishwam',
  phoneDisplay: '+91 85469 96622',
  phoneRaw: '8546996622',
  phoneTel: '+918546996622',
  whatsapp: '918546996622',
  email: 'ceo@onevishwam.com',
};

export const contactInfoGroupB = {
  brandName: 'OneVishwam',
  phoneDisplay: '+91 85469 96622',
  phoneRaw: '8546996622',
  phoneTel: '+918546996622',
  whatsapp: '918546996622',
  email: 'ceo@onevishwam.com',
};

export const contactInfoVedantSuraksha = {
  brandName: 'OneVishwam',
  phoneDisplay: '+91 85469 96622',
  phoneRaw: '8546996622',
  phoneTel: '+918546996622',
  whatsapp: '918546996622',
  email: 'ceo@onevishwam.com',
};

export const GROUP_B_PROPERTY_TITLES = [
  'Nexon Travenza',
  'Zen Indraprastha',
  'Ramky Fortuna',
  'Purva Northern Lights',
  'Purvankar Northern Lights',
  'Vasundhanra Farms',
  'Vasundhara Farms',
  'Nexon',
  'TRU Aquapolis',
  'North East Properties',
  'SWASTHIK VENTURES',
];

export function getPropertyContactInfo(item) {
  if (!item) return contactInfo;

  let propObj = typeof item === 'object' ? item : null;
  const title = typeof item === 'string' ? item : (item?.title || item?.name || '');
  const tLower = title.toLowerCase().trim();

  // 1. Channel Partner Override (Highest Priority)
  const cp = propObj ? (
    Array.isArray(propObj.channelPartner)
      ? propObj.channelPartner[0]
      : (propObj.channelPartner || (Array.isArray(propObj.channelPartners) ? propObj.channelPartners[0] : propObj.channelPartners))
  ) : null;

  if (cp && (cp.phone || cp.email || cp.name)) {
    const rawPhone = String(cp.phone || cp.contact || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
    const formattedPhone = cleanPhone
      ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
      : contactInfo.phoneDisplay;

    return {
      brandName: cp.name || propObj?.vendorName || contactInfo.brandName,
      phoneDisplay: formattedPhone,
      phoneRaw: cleanPhone || contactInfo.phoneRaw,
      phoneTel: cleanPhone ? `+91${cleanPhone}` : contactInfo.phoneTel,
      whatsapp: cleanPhone ? `91${cleanPhone}` : contactInfo.whatsapp,
      email: cp.email || contactInfo.email,
    };
  }

  // 2. Property-level contact/email override
  if (propObj && (propObj.contact || propObj.email)) {
    const rawPhone = String(propObj.contact || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
    const formattedPhone = cleanPhone
      ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
      : contactInfo.phoneDisplay;

    return {
      brandName: propObj.vendorName || contactInfo.brandName,
      phoneDisplay: cleanPhone ? formattedPhone : contactInfo.phoneDisplay,
      phoneRaw: cleanPhone || contactInfo.phoneRaw,
      phoneTel: cleanPhone ? `+91${cleanPhone}` : contactInfo.phoneTel,
      whatsapp: cleanPhone ? `91${cleanPhone}` : contactInfo.whatsapp,
      email: propObj.email || contactInfo.email,
    };
  }

  // 3. VEDANT SURAKSHA Rule
  if (tLower.includes('vedant suraksha') || tLower.includes('vedantsuraksha')) {
    return contactInfoVedantSuraksha;
  }

  // 4. Group B Rule
  const isGroupB = GROUP_B_PROPERTY_TITLES.some((gt) => {
    const gLower = gt.toLowerCase();
    return tLower.includes(gLower) || gLower.includes(tLower);
  });
  return isGroupB ? contactInfoGroupB : contactInfo;
}
