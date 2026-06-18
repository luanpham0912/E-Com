import { apiClient } from '@/lib/api';
import type { Product, ProductFilters } from '@/lib/types';

export interface ProductsListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export const productsApi = {
  list: (filters: Partial<ProductFilters> & { page?: number; limit?: number } = {}) =>
    apiClient.get<ProductsListResponse>('/products', filters),
  get: (id: string) => apiClient.get<Product>(`/products/${id}`),
  create: (product: Omit<Product, 'id'>) => apiClient.post<Product>('/products', product),
  update: (id: string, product: Partial<Product>) =>
    apiClient.put<Product>(`/products/${id}`, product),
  remove: (id: string) => apiClient.delete<{ id: string }>(`/products/${id}`),
  reviews: (id: string) => apiClient.get<unknown[]>(`/products/${id}/reviews`),
};
