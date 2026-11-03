const welcomeImage =
  'https://images.unsplash.com/photo-1733146670498-374b049a5d95?auto=format&fit=crop&w=1600&q=80';
const servicesImage =
  'https://images.unsplash.com/photo-1691480189419-b0c138c00c10?auto=format&fit=crop&w=1600&q=80';
const whyChooseImage =
  'https://images.unsplash.com/photo-1758518729759-f580dc06770f?auto=format&fit=crop&w=1600&q=80';

export const welcomeHighlights = [
  {
    icon: 'fa-solid fa-globe',
    title: 'All in One Place',
    description: 'Find loans, houses, vehicles, clothes, groceries, and more — all in one place.',
  },
  {
    icon: 'fa-solid fa-mobile-screen',
    title: 'Mobile Apps',
    description: 'Use our mobile apps for buying, selling, and managing everything.',
  },
  {
    icon: 'fa-solid fa-chart-line',
    title: 'Starting in Karnataka',
    description: 'We are starting from Karnataka and will expand across India soon.',
  },
];

export const appFeatures = {
  customer: {
    title: 'Buyer App',
    icon: 'fa-solid fa-user',
    features: ['Sign Up & Verify', 'Browse Items & Book', 'Pay with EMI or Wallet', 'Track Loans & Property']
  },
  vendor: {
    title: 'Seller Portal',
    icon: 'fa-solid fa-store',
    features: ['Manage Your Items', 'Track Orders & Leads', 'Get Paid', 'Upload New Products']
  },
  admin: {
    title: 'Team Dashboard',
    icon: 'fa-solid fa-desktop',
    features: ['Manage Properties & Loans', 'Assign Leads', 'Manage Franchises', 'View Reports']
  }
};

export const whyChoosePoints = [
  {
    icon: 'fa-solid fa-handshake',
    title: 'One Person Helps You',
    description: 'One person handles your request from start to finish. No back and forth.',
  },
  {
    icon: 'fa-solid fa-shield-halved',
    title: 'No Hidden Charges',
    description: 'Everything is clear and open. No hidden fees, no surprises.',
  },
  {
    icon: 'fa-solid fa-bolt',
    title: 'Fast Service',
    description: 'We work quickly so you get answers and results without long waits.',
  },
  {
    icon: 'fa-solid fa-location-dot',
    title: 'Local Presence',
    description: 'We operate across Karnataka in Bangalore, Mysore, Hubli, Mangalore, and more cities.',
  },
];

export const trustCards = [
  {
    id: 'privacy',
    icon: 'fa-solid fa-shield-halved',
    eyebrow: 'Privacy',
    title: 'Your Data is Safe',
    description:
      'We keep your information private and secure. We never share it without your permission.',
    cta: 'Read policy',
    href: '#privacy',
  },
  {
    id: 'careers',
    icon: 'fa-solid fa-briefcase',
    eyebrow: 'Careers',
    title: 'Work With Us',
    description:
      'We are hiring for sales, operations, and customer support. Join our growing team.',
    cta: 'View openings',
    href: '#careers',
  },
  {
    id: 'contacts',
    icon: 'fa-solid fa-phone-volume',
    eyebrow: 'Contacts',
    title: 'Enquiry',
    description:
      'Call or message us for property listings, loans, partnerships, or any questions.',
    cta: 'Get in touch',
    href: '/enquiry/',
  },
];

export const homeImages = {
  welcomeImage,
  servicesImage,
  whyChooseImage,
};
