import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import StoreLayout from '@/layouts/StoreLayout';
import AdminLayout from '@/layouts/AdminLayout';
import { useAuthStore } from '@/store/authStore';

function PageSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-4rem)] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function SuspensePage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

function AuthGate({ children, redirect }: { children: React.ReactNode; redirect: string }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <PageSkeleton />;
  return isAuthenticated ? <>{children}</> : <Navigate to={redirect} replace />;
}

function AdminGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role, isLoading } = useAuthStore();
  if (isLoading) return <PageSkeleton />;
  if (!isAuthenticated || role !== 'admin') return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

const HomePage = lazy(() => import('@/pages/store/HomePage'));
const ShopPage = lazy(() => import('@/pages/store/ShopPage'));
const ProductPage = lazy(() => import('@/pages/store/ProductPage'));
const CartPage = lazy(() => import('@/pages/store/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/store/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/store/OrderConfirmationPage'));
const AccountPage = lazy(() => import('@/pages/store/AccountPage'));
const LoginPage = lazy(() => import('@/pages/store/LoginPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/DashboardPage'));
const ProductsPage = lazy(() => import('@/pages/admin/ProductsPage'));
const OrdersPage = lazy(() => import('@/pages/admin/OrdersPage'));
const CustomersPage = lazy(() => import('@/pages/admin/CustomersPage'));
const CategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <StoreLayout />,
    children: [
      { index: true, element: <SuspensePage><HomePage /></SuspensePage> },
      { path: 'shop', element: <SuspensePage><ShopPage /></SuspensePage> },
      { path: 'products/:id', element: <SuspensePage><ProductPage /></SuspensePage> },
      { path: 'cart', element: <SuspensePage><CartPage /></SuspensePage> },
      { path: 'checkout', element: <SuspensePage><AuthGate redirect="/login"><CheckoutPage /></AuthGate></SuspensePage> },
      { path: 'order/:id', element: <SuspensePage><OrderConfirmationPage /></SuspensePage> },
      { path: 'account', element: <SuspensePage><AuthGate redirect="/login"><AccountPage /></AuthGate></SuspensePage> },
      { path: 'login', element: <SuspensePage><LoginPage /></SuspensePage> },
    ],
  },
  {
    path: '/admin',
    element: (
      <AdminGate>
        <AdminLayout />
      </AdminGate>
    ),
    children: [
      { index: true, element: <SuspensePage><AdminDashboard /></SuspensePage> },
      { path: 'products', element: <SuspensePage><ProductsPage /></SuspensePage> },
      { path: 'orders', element: <SuspensePage><OrdersPage /></SuspensePage> },
      { path: 'customers', element: <SuspensePage><CustomersPage /></SuspensePage> },
      { path: 'categories', element: <SuspensePage><CategoriesPage /></SuspensePage> },
      { path: 'settings', element: <SuspensePage><SettingsPage /></SuspensePage> },
    ],
  },
  { path: '/admin/login', element: <SuspensePage><AdminLoginPage /></SuspensePage> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
