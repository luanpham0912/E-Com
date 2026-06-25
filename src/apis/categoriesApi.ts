import { axiosClient } from '@/lib/axios';
import type { Category } from '@/lib/types';

export const categoriesApi = {
  list: () => axiosClient.get<Category[]>('/categories').then((r) => r.data),

  create: (category: Omit<Category, 'id' | 'productCount'>) =>
    axiosClient.post<Category>('/categories', category).then((r) => r.data),

  update: (id: string, category: Partial<Category>) =>
    axiosClient.put<Category>(`/categories/${id}`, category).then((r) => r.data),

  remove: (id: string) =>
    axiosClient.delete<{ id: string }>(`/categories/${id}`).then((r) => r.data),
};
