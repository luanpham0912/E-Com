import { create } from 'zustand';
import { authApi } from '@/apis/authApi';
import type { User, UserRole } from '@/lib/types';
import { setAuthToken, clearAuthToken, getAuthToken } from '@/lib/axios/requestInterceptor';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'avatar'>>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  role: 'customer',
  isLoading: true,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    const storedToken = getAuthToken();
    if (storedToken) {
      try {
        const user = await authApi.me();
        set({ user, isAuthenticated: true, role: user.role, isLoading: false });
      } catch {
        clearAuthToken();
        set({ user: null, isAuthenticated: false, role: 'customer', isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authApi.login({ email, password });
      if (token) setAuthToken(token);
      set({ user, isAuthenticated: true, role: user.role, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authApi.register({ name, email, password });
      if (token) setAuthToken(token);
      set({ user, isAuthenticated: true, role: user.role, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuthToken();
      set({ user: null, isAuthenticated: false, role: 'customer', error: null });
    }
  },

  updateProfile: async (updates) => {
    const user = await authApi.updateProfile(updates);
    set({ user });
  },

  clearError: () => set({ error: null }),
}));
