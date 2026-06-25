import { axiosClient } from '@/lib/axios';
import type { User } from '@/lib/types';

export interface AuthResponse {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  login: (data: LoginCredentials) =>
    axiosClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterCredentials) =>
    axiosClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  me: () => axiosClient.get<User>('/auth/me').then((r) => r.data),

  updateProfile: (updates: Partial<Pick<User, 'name' | 'avatar'>>) =>
    axiosClient.put<User>('/auth/me', updates).then((r) => r.data),

  logout: () => axiosClient.post('/auth/logout').then((r) => r.data),
};
