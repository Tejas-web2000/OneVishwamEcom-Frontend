# Quick Guide: Creating a New Category in 2 Files

With **`UniversalCategoryGallery`** and **`UniversalDetailPage`**, introducing any new category (e.g. *Furniture*, *Solar*, *Pets*, *Electronics*, *Appliances*) requires **only two simple files**. You don't have to design anything from scratch, write complex filter state, or manage responsive layouts.

---

## File 1: Gallery Page (`CategoryGallery.jsx`)

Just declare the data hook, what points to display on the card, and what filters to show in the sidebar:

```jsx
import React from 'react';
import { UniversalCategoryGallery } from '../../../components/common/templates';
import { useFurniture } from './furnitureHooks';

export default function FurnitureGallery() {
  return (
    <UniversalCategoryGallery
      categoryTitle="Explore Designer Furniture"
      categorySubtitle="Handcrafted solid wood, modern minimalist sofas, and ergonomic office furniture."
      breadcrumb="Furniture"
      useItems={useFurniture}
      // 1. Point-to-data mapping for cards:
      mapping={{
        id: (item) => item._id || item.id,
        title: (item) => item.name || item.title,
        image: (item) => item.images?.[0] || item.image,
        price: (item) => item.price,
        priceSuffix: (item) => item.discount ? `(${item.discount}% off)` : '',
        location: (item) => item.city || item.location || 'Bangalore',
        overline: (item) => item.material || item.category,
        badges: (item) => [
          item.inStock && { label: 'In Stock', className: 'bg-emerald-600 text-white' },
          item.warranty && { label: `${item.warranty} Warranty`, className: 'bg-blue-600 text-white' },
        ],
        pills: (item) => [item.woodType, item.dimensions, item.finish].filter(Boolean),
        detailUrl: (item) => `/services/furniture/${item._id || item.id}`,
      }}
      // 2. Sidebar Checkbox Filters:
      filterGroups={[
        { id: 'woodType', title: 'Wood & Material', options: ['Sheesham Wood', 'Teak Wood', 'Oak', 'Fabric'] },
        { id: 'room', title: 'Room Type', options: ['Living Room', 'Bedroom', 'Office', 'Dining'] },
      ]}
      // 3. Dual-thumb Budget Range Slider:
      rangeFilters={[
        { id: 'price', title: 'Budget Range', min: 0, max: 200000, step: 2000, unitLabel: '₹' },
      ]}
    />
  );
}
```

### What `UniversalCategoryGallery` does automatically:
- Searches across title, material, location, and keywords.
- Runs checkbox multiselect filtering and dual-thumb range slider calculations.
- Generates active filter chips and handles 1-click removal & reset.
- Renders responsive 3-column cards with image gradient, luxury status pills, and price badges.
- Handles pagination (`< Prev 1 2 3 Next >`), loading skeletons, and empty state when 0 matches found.

---

## File 2: Detail Page (`CategoryDetails.jsx`)

Just declare the data hooks, the main viewing attributes (description, price, bento highlights, specs table, and seller):

```jsx
import React from 'react';
import { UniversalDetailPage } from '../../../components/common/templates';
import { useFurnitureById, useSimilarFurniture } from './furnitureHooks';

export default function FurnitureDetails() {
  return (
    <UniversalDetailPage
      categoryTitle="Furniture"
      useItemById={useFurnitureById}
      useSimilarItems={useSimilarFurniture}
      // Point-to-data mapping for main detail view:
      mapping={{
        id: (item) => item._id || item.id,
        title: (item) => item.name || item.title,
        subtitle: (item) => `${item.woodType || ''} · Solid Wood Finish · Free Delivery in Bangalore`,
        price: (item) => item.price,
        priceSubtext: (item) => item.mrp ? `(MRP ${item.mrp})` : 'Inclusive of all taxes',
        description: (item) => item.description || 'Premium furniture crafted with termite-resistant solid wood.',
        images: (item) => item.images || [item.image],
        location: (item) => item.warehouseAddress || item.city || 'Bangalore, Karnataka',
        mapUrl: (item) => item.mapUrl,
        badges: (item) => [
          { label: '5 Year Warranty', className: 'bg-emerald-600 text-white' },
          { label: 'Free Installation', className: 'bg-blue-600 text-white' },
        ],
        // Bento Highlights Grid:
        highlights: (item) => [
          { label: 'Material', value: item.woodType || 'Solid Wood', icon: 'fa-tree', color: 'text-amber-600 bg-amber-50' },
          { label: 'Dimensions', value: item.dimensions || 'Standard', icon: 'fa-ruler-combined', color: 'text-blue-600 bg-blue-50' },
          { label: 'Seating / Type', value: item.seatingCapacity || '3 Seater', icon: 'fa-couch', color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Warranty', value: item.warranty || '5 Years', icon: 'fa-shield-halved', color: 'text-emerald-600 bg-emerald-50' },
        ],
        // Specifications Breakdown Table:
        specs: (item) => [
          {
            groupName: 'Material & Construction',
            items: [
              { key: 'Primary Material', value: item.woodType || 'Teak Wood' },
              { key: 'Finish', value: item.finish || 'Walnut Matte' },
              { key: 'Upholstery', value: item.fabric || 'High GSM Velvet' },
            ],
          },
          {
            groupName: 'Warranty & Care',
            items: [
              { key: 'Warranty Period', value: '5 Years On-Site Warranty' },
              { key: 'Care Instructions', value: 'Wipe with dry microfiber cloth' },
            ],
          },
        ],
        // Features list:
        features: (item) => item.features || ['Termite Proof', 'Free Delivery', 'Pre-Assembled', 'Water Resistant Finish'],
        // Seller / Brand contact:
        seller: (item) => ({
          name: item.brand || 'OneVishwam Partner Store',
          phone: item.contact || '8546996622',
          whatsapp: '8546996622',
          email: 'ceo@onevishwam.com',
          verified: true,
        }),
      }}
    />
  );
}
```

### What `UniversalDetailPage` does automatically:
- Extracts the ID from the route (`useParams`).
- Fetches main item and similar listings via the provided hooks.
- Renders hero image carousel with click-to-zoom modal lightbox.
- Renders Bento Highlights grid, About / Description with expandable read-more.
- Renders Specifications accordions, Features checklist, and Location with Google Maps directions button.
- Renders sleek bottom sticky action bar with Call, WhatsApp, Inquire, and Share buttons.
- Automatically hides the bottom action bar when scrolling past the footer (`IntersectionObserver`).
- Opens the standard lead inquiry modal with prefilled product and dealer details.
