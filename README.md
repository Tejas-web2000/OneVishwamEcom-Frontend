# OneVishwam E-Commerce — Frontend

## Project Overview
React + Vite frontend for the OneVishwam multi-service platform (Properties, Vehicles, Jewellery, Finance, Groceries, Garments, etc.)

## Tech Stack
- React 18, Vite 5
- React Router 6, Redux Toolkit
- Axios (API client with token refresh)
- Tailwind CSS, FontAwesome
- Jest + React Testing Library

## Development
```bash
npm install
npm run dev        # Start dev server (port 5173)
npm run build      # Production build
npm test           # Run tests
```

## Environment
- `VITE_API_BASE_URL` — backend API base (default: `/api`)

## 🔒 Operational Constraints (Mandatory)
- **No user creation/deletion** without explicit user permission
- **No code pushes** (git push, PR creation, deployments) without explicit user permission
- All changes require review and approval before any remote operations

## Project Structure
```
src/
├── api.js              # Axios client + all API modules
├── components/         # Shared UI components
├── pages/
│   ├── home/           # Landing page
│   ├── services/       # Service-specific galleries/details
│   │   ├── finance/    # Finance services + Loan products
│   │   ├── property/   # Properties
│   │   ├── automobile/ # Vehicles
│   │   ├── jewellery/  # Jewellery & Gold
│   │   ├── grocery/    # Groceries
│   │   └── garments/   # Garments
│   └── add-listing/    # Post new listing flow
├── hooks/              # Custom React hooks
├── store/              # Redux slices (auth, location)
└── config/             # Navigation, constants
```

## API Modules (src/api.js)
- `authAPI` — login, register, refresh, profile
- `propertyAPI` — CRUD + search for properties
- `vehicleAPI` — CRUD for vehicles
- `jewelleryAPI` — CRUD for jewellery
- `financeAPI` — CRUD for finance services
- `publicAPI.getLoans()` — Loan products
- `groceryAPI`, `garmentAPI` — create endpoints

## Key Features
- JWT auth with auto-refresh (interceptors in `api.js`)
- Server-side filtering/pagination for all galleries
- Mobile-first responsive UI with filter drawers
- Enquiry cart + slide-in panel
- Lazy-loaded routes with Suspense

## Branch
- Main development: `feature/products`