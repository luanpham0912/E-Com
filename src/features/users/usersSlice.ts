import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { User } from '@/lib/types';
import { usersApi } from './usersApi';
import { ApiError } from '@/lib/api';

interface UsersState {
  items: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = { items: [], loading: false, error: null };

export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await usersApi.list();
    } catch (err) {
      if (err instanceof ApiError) return rejectWithValue(err.message);
      return rejectWithValue('Failed to load users');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load users';
      });
  },
});

export default usersSlice.reducer;
