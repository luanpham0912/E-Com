# Personal Project — E-Commerce Platform

> A production-ready e-commerce web application for pet products, with a customer storefront and a full admin dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS |
| **UI Components** | Radix UI (accessible primitives), shadcn/ui |
| **State Management** | Zustand (client state), React Query (server state) |
| **Forms** | React Hook Form + Zod |
| **Animations** | Framer Motion |
| **Backend** | Express.js, TypeScript |
| **Database** | MongoDB |
| **Auth** | JWT (httpOnly cookie), bcryptjs |
| **Validation** | Zod (shared schemas, client + server) |
| **Deployment** | Render |
| **Tools & AI** | Cursor |

---

## Features

### Customer Storefront
- **Product catalog** with search, category filter, and pagination
- **Product detail** page with image gallery, reviews, and variant selection
- **Shopping cart** with add/remove/update quantity, real-time price calculation
- **Multi-step checkout** — Shipping → Payment → Review → Place Order
- **Order confirmation** with order summary and status
- **User account** — profile management and order history
- **Auth** — register/login with JWT cookie (httpOnly, sameSite)

### Admin Dashboard
- **Dashboard overview** — revenue KPI, order count, avg order value, customer count
- **Revenue chart** — animated bar chart for last 30 days
- **Products management** — CRUD with inline status toggle (active/inactive)
- **Orders management** — list with status badge, update order status
- **Customers list** — view all registered customers
- **Categories management** — CRUD for product categories
- **Settings** — dark mode toggle, store name config

### Backend API
- **RESTful API** with `/api/v1` prefix and consistent `{ data }` response envelope
- **Role-based access control** — `customer` vs `admin` enforced at middleware level
- **Cart persistence** — MongoDB-backed, survives browser close
- **Price re-validation** on server at checkout (prevents client-side price manipulation)
- **Security** — Helmet, CORS, rate limiting, async error wrapper
- **Validation** — Zod schemas on both client (forms) and server (routes)

---

## Quick Start

```bash
# Clone & install
npm install && npm --prefix server install

# Start both client + server concurrently
npm run dev:full

# Or separately
npm run dev          # Frontend → http://localhost:5173
npm --prefix server run dev  # Backend → http://localhost:3001

# Or Live Demo 
https://petproject-5cqb.onrender.com  # Store 
https://petproject-5cqb.onrender.com/admin # Admin page

#account demo 
customer: customer@store.com/customer123
admin: admin@store.com/admin123

```



---

## Project Structure

```
# Frontend
src/               
├── apis/          # Typed API functions (axios)
├── components/
│   ├── admin/     # Dashboard-specific components
│   ├── shared/    # Navbar, Footer, CartDrawer, ProductCard...
│   └── ui/        # shadcn/ui primitives (Button, Card, Dialog...)
├── hooks/         # React Query hooks wrapping API calls
├── layouts/       # StoreLayout, AdminLayout
├── lib/           # Schemas (Zod), utils, constants, axios instance
├── pages/
│   ├── admin/     # Dashboard, Products, Orders, Customers, Categories, Settings
│   └── store/     # Home, Shop, Product, Cart, Checkout, Account, Login
├── routes/        # React Router configuration
└── store/         # Zustand stores (auth, cart, ui)

#Backend
server/src/
├── config/        # Database connection, environment config
├── middleware/    # Auth, validation, error handling
├── models/        # Mongoose schemas (User, Product, Order, Cart, Category, Review)
├── routes/        # API routes (auth, users, products, orders, cart, categories)
└── utils/         # Serializers, seed data

.github/workflows/
└── deploy.yml     # CI/CD — auto-deploys frontend to Vercel, backend to Render
```

---

## Testing

```bash
# Frontend (utils, schemas, stores) — 63 tests
npm test

# Backend (serializers, API routes) — requires MongoDB Memory Server
npm --prefix server test
```

Tests are powered by **Jest** with `ts-jest` for TypeScript support.

### Frontend — `src/__tests__/`
- `utils.test.ts` — pure utility functions (`formatCurrency`, `slugify`, etc.)
- `schemas.test.ts` — Zod schema validation (all form schemas)
- `cartStore.test.ts` — Zustand cart store (add/remove/update/clear)
- `authStore.test.ts` — auth store integration with mocked API

### Backend — `server/src/__tests__/`
- `serialize.test.ts` — serializer functions (pure, no DB)
- `auth.routes.test.ts` — auth routes with `supertest` + `mongodb-memory-server`
- `orders.routes.test.ts` — order routes with auth + RBAC tests
- `testApp.ts` — test app factory used by integration tests

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | — | Register user |
| POST | `/api/v1/auth/login` | — | Login |
| POST | `/api/v1/auth/logout` | — | Logout |
| GET | `/api/v1/auth/me` | Required | Get current user |
| PUT | `/api/v1/auth/me` | Required | Update profile |
| GET | `/api/v1/products` | — | List products (search, filter, paginate) |
| GET | `/api/v1/products/:id` | — | Get product detail |
| POST | `/api/v1/cart` | Required | Add to cart |
| GET | `/api/v1/cart` | Required | Get cart |
| PUT | `/api/v1/cart` | Required | Update cart item |
| DELETE | `/api/v1/cart` | Required | Remove item / clear cart |
| POST | `/api/v1/orders` | Required | Place order |
| GET | `/api/v1/orders` | Required | List own orders (admin: all) |
| GET | `/api/v1/orders/:id` | Required | Get order detail |
| PUT | `/api/v1/orders/:id/status` | Admin | Update order status |
| GET | `/api/v1/orders/stats/summary` | Admin | Dashboard KPIs |
| GET | `/api/v1/categories` | — | List categories |
| GET | `/api/v1/users` | Admin | List customers |
