import {
  applySort,
  compareByPrice,
  compareByDate,
  SORT_LATEST,
  SORT_PRICE_LOW,
  SORT_PRICE_HIGH,
} from './sortBy';
import { loadSessionState, saveSessionState, clearSessionState } from './sessionStore';
import { parseIndianPrice, formatINR } from './priceUtils';
import { normalizeListing } from './cards/normalizeListing';

describe('Shared Utilities', () => {
  describe('sortBy', () => {
    const items = [
      { id: 1, name: 'A', price: '₹10,000', createdAt: '2026-01-01' },
      { id: 2, name: 'B', price: '₹5,000', createdAt: '2026-01-02' },
      { id: 3, name: 'C', price: '₹20,000', createdAt: '2026-01-03' },
    ];

    it('sorts by price low to high', () => {
      const sorted = applySort(items, SORT_PRICE_LOW);
      expect(sorted[0].name).toBe('B');
      expect(sorted[1].name).toBe('A');
      expect(sorted[2].name).toBe('C');
    });

    it('sorts by price high to low', () => {
      const sorted = applySort(items, SORT_PRICE_HIGH);
      expect(sorted[0].name).toBe('C');
      expect(sorted[1].name).toBe('A');
      expect(sorted[2].name).toBe('B');
    });

    it('sorts by latest date', () => {
      const sorted = applySort(items, SORT_LATEST);
      expect(sorted[0].name).toBe('C');
      expect(sorted[2].name).toBe('A');
    });

    it('prioritizes in-house and ceo@onevishwam.com listings at the top regardless of sort', () => {
      const mixed = [
        { id: 1, name: 'Normal 1', price: '₹1,000' },
        { id: 2, name: 'CEO Property', price: '₹99,000', contributor: { email: 'ceo@onevishwam.com' } },
        { id: 3, name: 'Normal 2', price: '₹2,000' },
        { id: 4, name: 'In-house project', price: '₹50,000', origin: 'in_house_project' },
      ];
      const sorted = applySort(mixed, SORT_PRICE_LOW);
      expect(sorted[0].name).toBe('In-house project');
      expect(sorted[1].name).toBe('CEO Property');
      expect(sorted[2].name).toBe('Normal 1');
      expect(sorted[3].name).toBe('Normal 2');
    });
  });

  describe('priceUtils', () => {
    it('parses Indian prices correctly', () => {
      expect(parseIndianPrice('₹4.5 L')).toBe(450000);
      expect(parseIndianPrice('2.5 Cr')).toBe(25000000);
      expect(parseIndianPrice('50000')).toBe(50000);
    });

    it('formats Indian INR correctly', () => {
      expect(formatINR(500000, { compact: true })).toBe('₹5 L');
      expect(formatINR(20000000, { compact: true })).toBe('₹2 Cr');
    });
  });

  describe('sessionStore', () => {
    const key = 'test_key';

    beforeEach(() => {
      sessionStorage.clear();
    });

    it('saves and loads session state safely', () => {
      saveSessionState(key, { page: 2, filter: 'active' });
      const loaded = loadSessionState(key, { fallback: true });
      expect(loaded.page).toBe(2);
      expect(loaded.filter).toBe('active');
    });

    it('persists and restores page 7 for gallery return navigation', () => {
      const galleryKey = 'gallery_page_/categories/automobile';
      saveSessionState(galleryKey, { page: 7 });
      const loaded = loadSessionState(galleryKey, { page: 1 });
      expect(loaded.page).toBe(7);
    });

    it('returns fallback for non-existent keys', () => {
      const loaded = loadSessionState('non_existent', { fallback: true });
      expect(loaded.fallback).toBe(true);
    });

    it('clears session state', () => {
      saveSessionState(key, { a: 1 });
      clearSessionState(key);
      const loaded = loadSessionState(key, { fallback: true });
      expect(loaded.fallback).toBe(true);
    });
  });

  describe('normalizeListing', () => {
    it('normalizes property listing object correctly', () => {
      const property = {
        _id: 'prop-123',
        title: '3 BHK Luxury Apartment',
        price: '₹2.5 Cr',
        location: 'Indiranagar',
        pincode: '560038',
        bhk: '3 BHK',
        loanApproved: true,
        images: ['https://images.com/prop.jpg'],
      };
      const normalized = normalizeListing(property, 'property');
      expect(normalized.id).toBe('prop-123');
      expect(normalized.link).toBe('/property/prop-123');
      expect(normalized.title).toBe('3 BHK Luxury Apartment');
      expect(normalized.location).toBe('Indiranagar');
      expect(normalized.pincode).toBe('560038');
      expect(normalized.badges.some(b => b.label === 'Pre-Approved' || b.label.includes('Occupy'))).toBe(true);
    });

    it('normalizes vehicle listing object correctly', () => {
      const vehicle = {
        _id: 'veh-456',
        brand: 'Hyundai',
        model: 'Creta SX',
        price: 1450000,
        fuelType: 'Petrol',
        year: 2023,
        condition: 'new',
        location: 'Koramangala',
        images: ['https://images.com/car.jpg'],
      };
      const normalized = normalizeListing(vehicle, 'automobile');
      expect(normalized.id).toBe('veh-456');
      expect(normalized.link).toBe('/vehicle/veh-456');
      expect(normalized.title).toBe('Hyundai Creta SX');
      expect(normalized.tags).toContain('Petrol');
      expect(normalized.tags).toContain('2023');
      expect(normalized.badges[0].label).toBe('New');
    });

    it('normalizes grocery listing object correctly', () => {
      const grocery = {
        _id: 'groc-789',
        name: 'Organic Alphonso Mangoes',
        pricePerUnit: 450,
        unit: 'dozen',
        organic: true,
        location: { area: 'Malleshwaram', city: 'Bengaluru', pincode: '560003' },
        images: ['https://images.com/mango.jpg'],
      };
      const normalized = normalizeListing(grocery, 'grocery');
      expect(normalized.id).toBe('groc-789');
      expect(normalized.link).toBe('/grocery/groc-789');
      expect(normalized.title).toBe('Organic Alphonso Mangoes');
      expect(normalized.priceSuffix).toBe('/dozen');
      expect(normalized.location).toBe('Malleshwaram');
      expect(normalized.pincode).toBe('560003');
      expect(normalized.badges[0].label).toBe('Organic');
    });

    it('normalizes garments and jewellery listings correctly', () => {
      const garment = {
        id: 'gar-101',
        name: 'Silk Embroidered Saree',
        brand: 'FabIndia',
        price: '₹4,999',
        category: 'Ethnic Wear',
        fabric: 'Silk',
      };
      const normGarment = normalizeListing(garment, 'garments');
      expect(normGarment.link).toBe('/garment/gar-101');
      expect(normGarment.title).toBe('Silk Embroidered Saree');
      expect(normGarment.overline).toBe('FabIndia');

      const jewellery = {
        _id: 'jew-202',
        name: '22K Gold Temple Necklace',
        metalType: 'Gold',
        purity: '22K',
        price: 85000,
        certified: true,
      };
      const normJewellery = normalizeListing(jewellery, 'jewellery');
      expect(normJewellery.link).toBe('/jewellery/jew-202');
      expect(normJewellery.title).toBe('22K Gold Temple Necklace');
      expect(normJewellery.badges[0].label).toBe('Certified');
    });
  });
});


