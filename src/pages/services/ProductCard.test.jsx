import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';
import * as navigation from '../../config/navigation';

jest.mock('../../config/navigation', () => ({
  navigateTo: jest.fn(),
}));

jest.mock('../../store/authSlice', () => ({
  useAuth: () => ({ isLoggedIn: true, user: null, openAuthModal: jest.fn() }),
}));

describe('ProductCard Component', () => {
  const defaultProps = {
    title: 'Test Product',
    price: '₹10,000',
    priceSuffix: '/ month',
    location: 'Mumbai',
    pincode: '400001',
    tags: ['New', 'Sale'],
    badges: [{ label: 'Featured', className: 'bg-red-500 text-white' }],
    link: '/test-link',
    image: 'test.jpg',
    alt: 'Test Alt',
    overline: 'Electronics'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all product details correctly', () => {
    render(<ProductCard {...defaultProps} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₹10,000')).toBeInTheDocument();
    expect(screen.getByText('/ month')).toBeInTheDocument();
    expect(screen.getByText('Mumbai · 400001')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Sale')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    
    const image = screen.getByAltText('Test Alt');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'test.jpg');
  });

  it('calls navigateTo when clicked', () => {
    render(<ProductCard {...defaultProps} />);
    
    const titleEl = screen.getByText('Test Product');
    // The closest element with cursor-pointer should be our card
    const cardEl = titleEl.closest('.cursor-pointer');
    fireEvent.click(cardEl);
    
    expect(navigation.navigateTo).toHaveBeenCalledWith('/test-link');
  });
});
