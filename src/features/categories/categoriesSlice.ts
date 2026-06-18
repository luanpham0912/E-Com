import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Category } from '@/lib/types';
import { categoriesApi } from './categoriesApi';
import { ApiError } from '@/lib/api';

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = { items: [], loading: false, error: null };

export const fetchCategories = createAsyncThunk<Category[], void, { rejectValue: string }>(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await categoriesApi.list();
    } catch (err) {
      if (err instanceof ApiError) return rejectWithValue(err.message);
      return rejectWithValue('Failed to load categories');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory(state, action: PayloadAction<Category>) {
      state.items.push(action.payload);
    },
    updateCategory(state, action: PayloadAction<Category>) {
      const idx = state.items.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeCategory(state, action: PayloadAction<string>) {
      state.items = state.items.filter((c) => c.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load categories';
      });
  },
});

export const { addCategory, updateCategory, removeCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
