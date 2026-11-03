import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ServicesPage from './index';

describe('ServicesPage Marketplace Categories', () => {
  it('renders marketplace category divisions correctly', () => {
    render(
      <MemoryRouter initialEntries={['/categories']}>
        <Routes>
          <Route path="/categories/*" element={<ServicesPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('All Marketplace Divisions')).toBeInTheDocument();
    expect(screen.getAllByText('Properties').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Jewellery').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Automobiles').length).toBeGreaterThan(0);
  });

  it('renders unified search results section when query param is present', () => {
    render(
      <MemoryRouter initialEntries={['/categories?q=gold']}>
        <Routes>
          <Route path="/categories/*" element={<ServicesPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Results for "gold"/i)).toBeInTheDocument();
    expect(screen.getByText('All Products')).toBeInTheDocument();
  });
});

