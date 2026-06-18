import { apiClient } from '@/lib/api';
import type { User, UserRole } from '@/lib/types';

export const usersApi = {
  list: () => apiClient.get<User[]>('/users'),
  get: (id: string) => apiClient.get<User>(`/users/${id}`),
  update: (id: string, updates: Partial<{ name: string; email: string; role: UserRole; password: string }>) =>
    apiClient.put<User>(`/users/${id}`, updates),
  remove: (id: string) => apiClient.delete<{ id: string }>(`/users/${id}`),
};
