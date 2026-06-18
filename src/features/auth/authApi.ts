import { apiClient } from '@/lib/api';
import type { User } from '@/lib/types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/register', { name, email, password }),
  me: () => apiClient.get<User>('/auth/me'),
  updateProfile: (updates: Partial<Pick<User, 'name' | 'avatar'>>) =>
    apiClient.put<User>('/auth/me', updates),
  logout: () => apiClient.post<{ ok: boolean }>('/auth/logout'),
};
