# SPEC.md — E-Commerce Frontend Project

## 1. Concept & Vision

A complete frontend-only e-commerce platform with two distinct surfaces: a premium customer storefront and a powerful admin dashboard. The experience is polished, fast, and confident — the kind of store that feels like it was built by a team that cares about every pixel. No backend, no compromises on quality. All data is mocked and persisted in `localStorage` via Redux Persist, simulating a real production environment.

---

## 2. Design Language

### Aesthetic Direction
Premium consumer brand with clean, confident execution. Think Apple Store meets a well-funded DTC brand — restrained color, strong typography, purposeful whitespace. Not cold or corporate; warm but refined.

### Color Palette
- **Primary / Accent:** Slate-950 (`#0f172a`) for dark surfaces; Emerald-500 (`#10b981`) as the singular accent for CTAs, success states, and key highlights
- **Neutral base:** Zinc palette — off-white (`zinc-50`) for light background, zinc-900/950 for dark
- **Semantic:** Red-500 for errors/destructive, Amber-500 for warnings, Emerald for success
- **Dark mode:** Zinc-950 background with zinc-800 surfaces, zinc-100 text
- **No purple/blue gradient slop.** Accent stays emerald. Palette stays zinc family.

### Typography
- **Display / Headings:** Geist (sans-serif) — clean, modern, geometric
- **Body:** Geist — relaxed, readable
- **Mono / Numbers:** Geist Mono — for prices, order IDs, code snippets
- **Scale:** `text-4xl md:text-5xl lg:text-6xl tracking-tighter leading-none` for hero headlines; body at `text-base leading-relaxed`
- **No Inter.** No Fraunces/Instrument Serif as defaults.

### Spatial System
- Section padding: `py-16 md:py-24`
- Container: `max-w-7xl mx-auto px-4 md:px-6`
- Grid: CSS Grid over Flexbox math — `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Corner radius: soft-16 (`rounded-2xl`) — not sharp, not pill. Consistent across buttons, cards, inputs.

### Motion Philosophy
- **Purpose:** Motion communicates hierarchy, confirms actions, and reveals content in narrative order
- **Spring physics:** `cubic-bezier(0.16, 1, 0.3, 1)` as default easing — snappy with natural settle
- **Reduced motion:** All animations respect `prefers-reduced-motion`
- **Key animations:**
  - Page entrance: staggered fade + slide (50ms delay per item)
  - Product cards: hover lift (`y: -4`) + image scale (1.05)
  - Cart drawer: slide from right + backdrop fade
  - Hero: eyebrow → headline → subtext → CTAs in sequence
  - Scroll reveals: `whileInView` with `once: true`
  - Buttons: `whileTap={{ scale: 0.97 }}`

### Visual Assets
- Icons: lucide-react (`strokeWidth={1.5}` global standard)
- Images: Picsum seeded URLs (`https://picsum.photos/seed/{name}/{w}/{h}`)
- No hand-rolled SVGs for icons
- Skeleton loaders match the shape of final content

---

## 3. Layout & Structure

### Customer Store
```
RootLayout
  └── StoreLayout
      ├── Navbar (sticky, blur backdrop)
      │   ├── Logo
      │   ├── Nav links (Home, Shop, Account)
      │   ├── SearchBar (expandable)
      │   ├── ThemeToggle
      │   └── CartButton (badge count)
      │
      ├── <Outlet /> (page content)
      │
      └── Footer
          ├── Brand column
          ├── Links grid
          ├── Newsletter input
          └── Social icons + copyright
```

### Admin Dashboard
```
RootLayout
  └── AdminLayout
      ├── Sidebar (collapsible, icons + labels)
      │   ├── Logo
      │   ├── Nav items (Dashboard, Products, Orders, Customers, Categories, Settings)
      │   └── User avatar + role
      │
      ├── Header (breadcrumb, search, notifications, user menu)
      │
      └── <Outlet /> (page content)
```

### Responsive Strategy
- Mobile-first: single column, stacked nav (hamburger)
- `md: 768px`: two columns, inline nav
- `lg: 1024px`: full layout, sidebar expanded
- `xl: 1280px+`: max-width container centered

---

## 4. Features & Interactions

### Customer Store
| Page | Features | States |
|---|---|---|
| Home | Hero (asymmetric split), Featured Products bento grid, Category showcase, Testimonials strip, Newsletter CTA | Loading skeleton for products |
| Shop | Product grid, filter sidebar (category, price range, sort), search input, pagination | Empty filter results, loading |
| Product | Image gallery (thumbnails + main), variant selector (size/color), quantity picker, add-to-cart, breadcrumb, reviews section, related products | Out of stock, on sale badge |
| Cart | Line items with +/- quantity, remove item, subtotal/tax/total, checkout CTA | Empty cart |
| Checkout | Multi-step: Shipping info → Payment (mock) → Review → Confirmation | Form validation errors, success |
| Account | Order history table, profile form (name, email) | No orders yet |
| Login | Email + password form, role switch link | Invalid credentials |

### Admin Dashboard
| Page | Features | States |
|---|---|---|
| Dashboard | KPI cards (revenue, orders, customers, avg order value), AreaChart (30-day revenue), recent orders table | Loading |
| Products | TanStack Table with search, sort, filter; Add/Edit/Delete product modal | Empty, loading |
| Orders | Order list with status badges; order detail sheet; status update | Empty |
| Customers | Customer list with order counts | Empty |
| Categories | Category CRUD with product count | Empty |
| Settings | Theme toggle, store name, currency |

### Interactions
- **Cart:** Add item → toast notification → badge count increments → drawer opens briefly
- **Checkout:** Form validation inline on blur; submit → order created → redirect to confirmation
- **Admin CRUD:** Modal with form (React Hook Form + Zod); optimistic UI update
- **Route guards:** `/admin/*` → check admin role → redirect if unauthorized

---

## 5. Component Inventory

### shadcn/ui Primitives
`button`, `card`, `badge`, `dialog`, `sheet`, `input`, `label`, `select`, `separator`, `skeleton`, `table`, `tabs`, `sonner` (toast), `tooltip`, `avatar`, `dropdown-menu`, `checkbox`, `radio-group`, `switch`, `accordion`

### Shared Components
| Component | Description | States |
|---|---|---|
| `Navbar` | Sticky top, blur backdrop, responsive | Scrolled (elevated shadow), mobile (drawer) |
| `Footer` | 4-column grid, newsletter input | Default |
| `ProductCard` | Image, title, price (sale strikethrough), rating, quick-add | Default, hover, loading, out-of-stock |
| `CartDrawer` | Right-side sheet, line items, totals, CTA | Empty, has items |
| `CartItem` | Image thumb, name, variant, quantity controls, remove | Default |
| `SkeletonLoaders` | Product card skeleton, table row skeleton, hero skeleton | Loading |
| `EmptyState` | Icon + message + optional CTA | Cart empty, no orders, no results |
| `ThemeToggle` | Sun/moon icon toggle, persists to localStorage | Light, dark |
| `SearchBar` | Expandable input with icon | Focused, has value |

### Admin Components
| Component | Description | States |
|---|---|---|
| `AdminSidebar` | Collapsible with icon-only mode | Expanded, collapsed |
| `KPICard` | Metric value, label, trend arrow + percentage | Loading, positive trend, negative trend |
| `RevenueChart` | Recharts AreaChart, 30-day data | Loading |
| `DataTable` | TanStack Table wrapper: sort, filter, paginate | Loading, empty |
| `StatusBadge` | Order status: pending/processing/shipped/delivered/cancelled | Each status color |
| `ProductModal` | Add/edit product form (React Hook Form + Zod) | Create mode, edit mode |

---

## 6. Technical Approach

### Stack
- **Framework:** React 18 + TypeScript (strict)
- **Build:** Vite 5
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** Redux Toolkit + Redux Persist (localStorage)
- **Routing:** React Router DOM v6
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack React Table v8
- **Charts:** Recharts
- **Animation:** Framer Motion (Motion)
- **Icons:** lucide-react
- **Fonts:** Geist via @fontsource

### API Design (mock)
All data operations are synchronous Redux actions operating on in-memory state + localStorage persistence. No HTTP calls.

### Data Model
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  tags: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  variants: Variant[];
}

interface Variant {
  type: 'size' | 'color';
  value: string;
  available: boolean;
}

interface CartItem {
  productId: string;
  quantity: number;
  variant?: { type: string; value: string };
}

interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'customer' | 'admin';
  createdAt: string;
}
```

### Route Structure
```
/                          → HomePage
/shop                      → ShopPage
/products/:id              → ProductPage
/cart                      → CartPage
/checkout                  → CheckoutPage
/order/:id                 → OrderConfirmationPage
/account                   → AccountPage
/login                     → LoginPage

/admin                     → DashboardPage
/admin/products            → ProductsPage
/admin/orders              → OrdersPage
/admin/customers           → CustomersPage
/admin/categories          → CategoriesPage
/admin/settings            → SettingsPage
/admin/login               → AdminLoginPage
```

### SEO
- `<title>` per page via React Helmet or document.title updates
- Semantic HTML: `<header>`, `<main>`, `<nav>`, `<article>`, `<section>`
- Meta description per page
- Open Graph tags for product pages
