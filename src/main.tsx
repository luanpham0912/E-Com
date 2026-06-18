import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from './app/store';
import Router from './app/router';
import { fetchProducts } from '@/features/products/productsSlice';
import { fetchCategories } from '@/features/categories/categoriesSlice';
import { restoreSessionAsync } from '@/features/auth/authSlice';
import { fetchOrders } from '@/features/orders/ordersSlice';
import '@/styles/globals.css';

// Kick off initial data loads (products, categories, session restore)
store.dispatch(fetchProducts({}));
store.dispatch(fetchCategories());
store.dispatch(restoreSessionAsync()).then((action) => {
  if ((action as { payload?: unknown }).payload) {
    store.dispatch(fetchOrders());
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Router />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </Provider>
  </StrictMode>
);
