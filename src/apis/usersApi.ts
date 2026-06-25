import { axiosClient } from '@/lib/axios';
import type { User, UserRole } from '@/lib/types';

export const usersApi = {
  list: () => axiosClient.get<User[]>('/users').then((r) => r.data),

  get: (id: string) => axiosClient.get<User>(`/users/${id}`).then((r) => r.data),

  update: (
    id: string,
    updates: Partial<{ name: string; email: string; role: UserRole; password: string }>
  ) => axiosClient.put<User>(`/users/${id}`, updates).then((r) => r.data),

  remove: (id: string) =>
    axiosClient.delete<{ id: string }>(`/users/${id}`).then((r) => r.data),
};
