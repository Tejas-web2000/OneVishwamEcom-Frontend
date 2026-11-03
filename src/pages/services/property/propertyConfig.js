/**
 * Properties Sector Configuration
 */
import {
  PROPERTY_CARD_TYPES,
  CITY_OPTIONS,
  BEDROOM_OPTIONS,
  FURNISHING_OPTIONS,
  POSTED_BY_OPTIONS,
  POSSESSION_OPTIONS,
  AMENITIES_LIST,
  FACING_OPTIONS,
  AGE_OPTIONS,
  AVAILABILITY_OPTIONS,
} from './propertyConstants';

export const PROPERTY_BUDGET_CHIPS = [
  { label: 'Under ₹50L', min: 0, max: 5000000 },
  { label: '₹50L – ₹1Cr', min: 5000000, max: 10000000 },
  { label: '₹1Cr – ₹2.5Cr', min: 10000000, max: 25000000 },
  { label: '₹2.5Cr+', min: 25000000, max: Infinity },
];

export const propertyListingConfig = {
  sector: 'property',
  eyebrow: 'OneVishwam · Properties',
  title: 'Find Your Property',
  subtitle: 'Verified apartments, Villa, Plot, and commercial spaces across top Indian cities.',
  categories: PROPERTY_CARD_TYPES,
  cities: CITY_OPTIONS,
  bedrooms: BEDROOM_OPTIONS,
  furnishing: FURNISHING_OPTIONS,
  postedBy: POSTED_BY_OPTIONS,
  possession: POSSESSION_OPTIONS,
  amenities: AMENITIES_LIST,
  facing: FACING_OPTIONS,
  propertyAge: AGE_OPTIONS,
  availability: AVAILABILITY_OPTIONS,
  emptyState: {
    icon: 'fa-solid fa-building',
    title: 'No properties found.',
    subtitle: 'Try adjusting your search criteria or reset all filters.',
  },
};
