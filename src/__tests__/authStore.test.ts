import { useAuthStore } from '../store/authStore';

jest.mock('@/apis/authApi', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    me: jest.fn(),
    updateProfile: jest.fn(),
    logout: jest.fn(),
  },
}));

import { authApi } from '@/apis/authApi';

const mockUser = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://example.com/avatar.png',
  role: 'customer' as const,
  createdAt: '2024-01-01T00:00:00Z',
};

const typedAuthApi = authApi as jest.Mocked<typeof authApi>;

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      role: 'customer',
      isLoading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('fetches /me and sets authenticated state on success', async () => {
      typedAuthApi.me.mockResolvedValue(mockUser);
      await useAuthStore.getState().initialize();
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isLoading).toBe(false);
    });

    it('sets unauthenticated state when /me fails', async () => {
      typedAuthApi.me.mockRejectedValue(new Error('Unauthorized'));
      await useAuthStore.getState().initialize();
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('calls API and sets user state on success', async () => {
      typedAuthApi.login.mockResolvedValue({ user: mockUser });
      await useAuthStore.getState().login('john@example.com', 'password123');
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('sets error and rethrows on failure', async () => {
      typedAuthApi.login.mockRejectedValue(new Error('Invalid credentials'));
      await expect(
        useAuthStore.getState().login('john@example.com', 'wrong')
      ).rejects.toThrow('Invalid credentials');
      const state = useAuthStore.getState();
      expect(state.error).toBe('Invalid credentials');
    });
  });

  describe('register', () => {
    it('calls API and sets user state on success', async () => {
      typedAuthApi.register.mockResolvedValue({ user: mockUser });
      await useAuthStore
        .getState()
        .register('John Doe', 'john@example.com', 'password123');
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('sets error and rethrows on failure', async () => {
      typedAuthApi.register.mockRejectedValue(new Error('Email taken'));
      await expect(
        useAuthStore
          .getState()
          .register('John Doe', 'john@example.com', 'password123')
      ).rejects.toThrow('Email taken');
    });
  });

  describe('logout', () => {
    it('calls /logout and clears state', async () => {
      typedAuthApi.logout.mockResolvedValue(undefined);
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      await useAuthStore.getState().logout();
      const state = useAuthStore.getState();
      expect(typedAuthApi.logout).toHaveBeenCalled();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('updates user in state', async () => {
      const updatedUser = { ...mockUser, name: 'Jane Doe' };
      typedAuthApi.updateProfile.mockResolvedValue(updatedUser);
      useAuthStore.setState({ user: mockUser });
      await useAuthStore.getState().updateProfile({ name: 'Jane Doe' });
      expect(useAuthStore.getState().user?.name).toBe('Jane Doe');
    });
  });

  describe('clearError', () => {
    it('resets error to null', () => {
      useAuthStore.setState({ error: 'Some error' });
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
