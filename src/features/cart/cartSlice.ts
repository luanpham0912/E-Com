import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  coupon: string | null;
}

const storedItems = localStorage.getItem('cart_items');
const initialState: CartState = {
  items: storedItems ? JSON.parse(storedItems) : [],
  coupon: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const { productId, variant } = action.payload;
      const existing = state.items.find(
        (i) => i.productId === productId && JSON.stringify(i.variant) === JSON.stringify(variant)
      );
      if (existing) {
        existing.quantity = Math.min(existing.quantity + action.payload.quantity, 99);
      } else {
        state.items.push({ ...action.payload });
      }
      localStorage.setItem('cart_items', JSON.stringify(state.items));
    },
    removeItem(state, action: PayloadAction<{ productId: string; variant?: CartItem['variant'] }>) {
      const { productId, variant } = action.payload;
      state.items = state.items.filter(
        (i) => !(i.productId === productId && JSON.stringify(i.variant) === JSON.stringify(variant))
      );
      localStorage.setItem('cart_items', JSON.stringify(state.items));
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number; variant?: CartItem['variant'] }>) {
      const { productId, quantity, variant } = action.payload;
      const item = state.items.find(
        (i) => i.productId === productId && JSON.stringify(i.variant) === JSON.stringify(variant)
      );
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(
            (i) => !(i.productId === productId && JSON.stringify(i.variant) === JSON.stringify(variant))
          );
        } else {
          item.quantity = Math.min(quantity, 99);
        }
      }
      localStorage.setItem('cart_items', JSON.stringify(state.items));
    },
    clearCart(state) {
      state.items = [];
      state.coupon = null;
      localStorage.setItem('cart_items', JSON.stringify([]));
    },
    applyCoupon(state, action: PayloadAction<string>) {
      state.coupon = action.payload;
    },
    removeCoupon(state) {
      state.coupon = null;
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;
