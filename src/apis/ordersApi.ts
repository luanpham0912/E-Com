import { axiosClient } from '@/lib/axios';
import type { CartItem, Order, OrderStatus, Address } from '@/lib/types';

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  customersCount: number;
  productsCount: number;
}

export const ordersApi = {
  list: () => axiosClient.get<Order[]>('/orders').then((r) => r.data),

  get: (id: string) => axiosClient.get<Order>(`/orders/${id}`).then((r) => r.data),

  create: (shippingAddress: Address) =>
    axiosClient.post<Order>('/orders', { shippingAddress }).then((r) => r.data),

  updateStatus: (id: string, status: OrderStatus) =>
    axiosClient.put<Order>(`/orders/${id}/status`, { status }).then((r) => r.data),

  stats: () =>
    axiosClient.get<OrderStats>('/orders/stats/summary').then((r) => r.data),
};

export const cartApi = {
  get: () => axiosClient.get<{ items: CartItem[] }>('/cart').then((r) => r.data),

  add: (item: CartItem) =>
    axiosClient.post<{ items: CartItem[] }>('/cart/items', item).then((r) => r.data),

  update: (productId: string, quantity: number, variant?: CartItem['variant']) =>
    axiosClient
      .put<{ items: CartItem[] }>(`/cart/items/${productId}`, { quantity, variant })
      .then((r) => r.data),

  remove: (productId: string, _variant?: CartItem['variant']) =>
    axiosClient.delete<{ items: CartItem[] }>(`/cart/items/${productId}`).then((r) => r.data),

  clear: () =>
    axiosClient.delete<{ items: CartItem[] }>('/cart').then((r) => r.data),
};
