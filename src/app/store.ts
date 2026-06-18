import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import cartReducer from '@/features/cart/cartSlice';
import productsReducer from '@/features/products/productsSlice';
import ordersReducer from '@/features/orders/ordersSlice';
import categoriesReducer from '@/features/categories/categoriesSlice';
import usersReducer from '@/features/users/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    orders: ordersReducer,
    categories: categoriesReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;