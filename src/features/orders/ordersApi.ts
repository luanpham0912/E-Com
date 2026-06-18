import { apiClient } from '@/lib/api';
import type { CartItem, Order, OrderStatus, Address } from '@/lib/types';

export const ordersApi = {
  list: () => apiClient.get<Order[]>('/orders'),
  get: (id: string) => apiClient.get<Order>(`/orders/${id}`),
  create: (shippingAddress: Address) =>
    apiClient.post<Order>('/orders', { shippingAddress }),
  updateStatus: (id: string, status: OrderStatus) =>
    apiClient.put<Order>(`/orders/${id}/status`, { status }),
  stats: () =>
    apiClient.get<{
      totalOrders: number;
      pendingOrders: number;
      revenue: number;
      customersCount: number;
      productsCount: number;
    }>('/orders/stats/summary'),
};

export const cartApi = {
  get: () => apiClient.get<{ items: CartItem[] }>('/cart'),
  add: (item: CartItem) => apiClient.post<{ items: CartItem[] }>('/cart/items', item),
  update: (productId: string, quantity: number, variant?: CartItem['variant']) =>
    apiClient.put<{ items: CartItem[] }>(`/cart/items/${productId}`, { quantity, variant }),
  remove: (_productId: string, _variant?: CartItem['variant']) =>
    apiClient.delete<{ items: CartItem[] }>(`/cart/items/${_productId}`),
  clear: () => apiClient.delete<{ items: CartItem[] }>('/cart'),
};
