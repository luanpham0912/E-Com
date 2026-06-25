export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  PRODUCT: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER: '/order/:id',
  ACCOUNT: '/account',
  LOGIN: '/login',

  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Living',
  'Beauty',
  'Sports',
  'Books',
] as const;

export const TAX_RATE = 0.08;

export const MAX_CART_QUANTITY = 99;
