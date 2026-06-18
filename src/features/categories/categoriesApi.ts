import { apiClient } from '@/lib/api';
import type { Category } from '@/lib/types';

export const categoriesApi = {
  list: () => apiClient.get<Category[]>('/categories'),
  create: (category: Omit<Category, 'id' | 'productCount'>) =>
    apiClient.post<Category>('/categories', category),
  update: (id: string, category: Partial<Category>) =>
    apiClient.put<Category>(`/categories/${id}`, category),
  remove: (id: string) => apiClient.delete<{ id: string }>(`/categories/${id}`),
};
