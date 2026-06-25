import { axiosClient } from '@/lib/axios';
import type { Product, ProductFilters, Review } from '@/lib/types';

export interface ProductsListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export const productsApi = {
  list: (filters: Partial<ProductFilters> & { page?: number; limit?: number } = {}) =>
    axiosClient.get<ProductsListResponse>('/products', { params: filters }).then((r) => r.data),

  get: (id: string) => axiosClient.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (product: Omit<Product, 'id'>) =>
    axiosClient.post<Product>('/products', product).then((r) => r.data),

  update: (id: string, product: Partial<Product>) =>
    axiosClient.put<Product>(`/products/${id}`, product).then((r) => r.data),

  remove: (id: string) =>
    axiosClient.delete<{ id: string }>(`/products/${id}`).then((r) => r.data),

  reviews: (id: string) =>
    axiosClient.get<Review[]>(`/products/${id}/reviews`).then((r) => r.data),
};
