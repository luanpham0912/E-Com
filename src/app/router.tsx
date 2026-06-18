import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { useAppSelector } from './hooks';
import type { ReactNode } from 'react';

// Pages
import HomePage from '@/pages/store/HomePage';
import ShopPage from '@/pages/store/ShopPage';
import ProductPage from '@/pages/store/ProductPage';
import CartPage from '@/pages/store/CartPage';
import CheckoutPage from '@/pages/store/CheckoutPage';
import OrderConfirmationPage from '@/pages/store/OrderConfirmationPage';
import AccountPage from '@/pages/store/AccountPage';
import LoginPage from '@/pages/store/LoginPage';
import DashboardPage from '@/pages/admin/DashboardPage';
import ProductsPage from '@/pages/admin/ProductsPage';
import OrdersPage from '@/pages/admin/OrdersPage';
import CustomersPage from '@/pages/admin/CustomersPage';
import CategoriesPage from '@/pages/admin/CategoriesPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';

// Layouts
import StoreLayout from '@/components/layout/StoreLayout';
import AdminLayout from '@/components/layout/AdminLayout';

function Guard({ children, condition, redirect }: { children: ReactNode; condition: boolean; redirect: string }) {
  return condition ? <Navigate to={redirect} replace /> : <>{children}</>;
}

export default function Router() {
  const { isAuthenticated, role } = useAppSelector((s) => s.auth);

  const router = createBrowserRouter([
    // Customer Store
    {
      path: '/',
      element: <StoreLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'shop', element: <ShopPage /> },
        { path: 'products/:id', element: <ProductPage /> },
        { path: 'cart', element: <CartPage /> },
        {
          path: 'checkout',
          element: (
            <Guard condition={!isAuthenticated} redirect="/login">
              <CheckoutPage />
            </Guard>
          ),
        },
        { path: 'order/:id', element: <OrderConfirmationPage /> },
        {
          path: 'account',
          element: (
            <Guard condition={!isAuthenticated} redirect="/login">
              <AccountPage />
            </Guard>
          ),
        },
        { path: 'login', element: <LoginPage /> },
      ],
    },

    // Admin Dashboard
    {
      path: '/admin',
      element: (
        <Guard condition={!(isAuthenticated && role === 'admin')} redirect="/admin/login">
          <AdminLayout />
        </Guard>
      ),
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'orders', element: <OrdersPage /> },
        { path: 'customers', element: <CustomersPage /> },
        { path: 'categories', element: <CategoriesPage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
    { path: '/admin/login', element: <AdminLoginPage /> },
    { path: '*', element: <Navigate to="/" replace /> },
  ]);

  return <RouterProvider router={router} />;
}
