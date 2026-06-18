import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, UserRole } from '@/lib/types';
import { authApi, type AuthResponse } from './authApi';
import { ApiError } from '@/lib/api';

interface AuthState {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const storedUser = localStorage.getItem('auth_user');
const storedRole = localStorage.getItem('auth_role') as UserRole | null;
const storedToken = localStorage.getItem('auth_token');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  role: storedRole ?? 'customer',
  isAuthenticated: !!storedUser && !!storedToken,
  loading: false,
  error: null,
};

function persistAuth(user: User | null, role: UserRole | null, token: string | null) {
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_role', role ?? user.role);
  } else {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
  }
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}

export const loginAsync = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await authApi.login(email, password);
  } catch (err) {
    if (err instanceof ApiError) return rejectWithValue(err.message);
    return rejectWithValue('Login failed');
  }
});

export const registerAsync = createAsyncThunk<
  AuthResponse,
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.register(payload.name, payload.email, payload.password);
  } catch (err) {
    if (err instanceof ApiError) return rejectWithValue(err.message);
    return rejectWithValue('Registration failed');
  }
});

export const restoreSessionAsync = createAsyncThunk<User | null, void, { rejectValue: string }>(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    if (!localStorage.getItem('auth_token')) return null;
    try {
      return await authApi.me();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        persistAuth(null, null, null);
        return null;
      }
      return rejectWithValue('Session restore failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Legacy reducer kept for non-async flows (e.g. demo role toggle)
    login(state, action: PayloadAction<{ email: string; password: string }>) {
      const { email, password } = action.payload;
      const adminCredentials = [
        { email: 'admin@store.com', password: 'admin123', role: 'admin' as UserRole },
        { email: 'customer@store.com', password: 'customer123', role: 'customer' as UserRole },
      ];
      const cred = adminCredentials.find(
        (c) => c.email === email && c.password === password
      );
      if (cred) {
        const user: User = {
          id: `demo-${Date.now()}`,
          name: email.split('@')[0],
          email,
          avatar: `https://picsum.photos/seed/${email}/200/200`,
          role: cred.role,
          createdAt: new Date().toISOString(),
        };
        state.user = user;
        state.role = cred.role;
        state.isAuthenticated = true;
        persistAuth(user, cred.role, null);
      }
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.role = 'customer';
      state.error = null;
      persistAuth(null, null, null);
    },
    switchRole(state, action: PayloadAction<UserRole>) {
      state.role = action.payload;
      const isAdmin = action.payload === 'admin';
      const user: User = {
        id: isAdmin ? 'demo-admin' : 'demo-customer',
        name: isAdmin ? 'Admin User' : 'Alexandra Reed',
        email: isAdmin ? 'admin@store.com' : 'customer@store.com',
        avatar: isAdmin
          ? 'https://picsum.photos/seed/admin-avatar/200/200'
          : 'https://picsum.photos/seed/alex-avatar/200/200',
        role: action.payload,
        createdAt: new Date().toISOString(),
      };
      state.user = user;
      state.isAuthenticated = true;
      persistAuth(user, action.payload, null);
    },
    updateProfile(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('auth_user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.isAuthenticated = true;
        state.error = null;
        persistAuth(action.payload.user, action.payload.user.role, action.payload.token);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Login failed';
      })
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.isAuthenticated = true;
        state.error = null;
        persistAuth(action.payload.user, action.payload.user.role, action.payload.token);
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Registration failed';
      })
      .addCase(restoreSessionAsync.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.role = action.payload.role;
          state.isAuthenticated = true;
          persistAuth(action.payload, action.payload.role, localStorage.getItem('auth_token'));
        } else {
          state.isAuthenticated = false;
        }
      });
  },
});

export const { login, logout, switchRole, updateProfile } = authSlice.actions;
export default authSlice.reducer;
