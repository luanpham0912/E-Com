import { createAsyncThunk } from '@reduxjs/toolkit';
import { productsApi } from './productsApi';
import { ApiError } from '@/lib/api';
import type { Product } from '@/lib/types';

export const fetchProduct = createAsyncThunk<Product, string, { rejectValue: string }>(
  'products/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await productsApi.get(id);
    } catch (err) {
      if (err instanceof ApiError) return rejectWithValue(err.message);
      return rejectWithValue('Failed to load product');
    }
  }
);
