import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';
import { cartApi } from '@/apis/ordersApi';
import { useAuthStore } from './authStore';

interface CartState {
  items: CartItem[];
  coupon: string | null;
  hydrated: boolean;

  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: CartItem['variant']) => void;
  updateQuantity: (productId: string, quantity: number, variant?: CartItem['variant']) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;

  setItems: (items: CartItem[]) => void;
  reset: () => void;
}

function itemKey(productId: string, variant?: CartItem['variant']): string {
  return `${productId}::${variant?.type ?? ''}::${variant?.value ?? ''}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      hydrated: false,

      setItems: (items) => set({ items, hydrated: true }),

      reset: () => set({ items: [], coupon: null, hydrated: false }),

      addItem: (item) => {
        set((state) => {
          const key = itemKey(item.productId, item.variant);
          const existing = state.items.find(
            (i) => itemKey(i.productId, i.variant) === key
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.productId, i.variant) === key
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, 99) }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });

        if (useAuthStore.getState().isAuthenticated) {
          cartApi.add(item).catch(() => {});
        }
      },

      removeItem: (productId, variant) => {
        const key = itemKey(productId, variant);
        set((state) => ({
          items: state.items.filter((i) => itemKey(i.productId, i.variant) !== key),
        }));

        if (useAuthStore.getState().isAuthenticated) {
          cartApi.remove(productId, variant).catch(() => {});
        }
      },

      updateQuantity: (productId, quantity, variant) => {
        if (quantity <= 0) {
          get().removeItem(productId, variant);
          return;
        }
        const key = itemKey(productId, variant);
        set((state) => ({
          items: state.items.map((i) =>
            itemKey(i.productId, i.variant) === key
              ? { ...i, quantity: Math.min(quantity, 99) }
              : i
          ),
        }));

        if (useAuthStore.getState().isAuthenticated) {
          cartApi.update(productId, quantity, variant).catch(() => {});
        }
      },

      clearCart: () => {
        set({ items: [], coupon: null });
        if (useAuthStore.getState().isAuthenticated) {
          cartApi.clear().catch(() => {});
        }
      },

      applyCoupon: (code) => set({ coupon: code }),
      removeCoupon: () => set({ coupon: null }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    }
  )
);
