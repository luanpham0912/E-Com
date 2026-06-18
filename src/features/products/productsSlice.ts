import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { Product, ProductFilters } from '@/lib/types';
import { productsApi, type ProductsListResponse } from './productsApi';
import { fetchProduct } from './productsThunks';
import { ApiError } from '@/lib/api';
interface ProductsState {
  items: Product[];
  filters: ProductFilters;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  filters: {
    category: '',
    minPrice: 0,
    maxPrice: 10000,
    sortBy: 'newest',
    search: '',
  },
  loading: false,
  error: null,
};

export type ProductListParams = Partial<ProductFilters> & {
  page?: number;
  limit?: number;
};

export const fetchProducts = createAsyncThunk<
  ProductsListResponse,
  ProductListParams | undefined,
  { rejectValue: string }
>('products/fetchAll', async (filters, { rejectWithValue }) => {
  try {
    return await productsApi.list(filters ?? {});
  } catch (err) {
    if (err instanceof ApiError) return rejectWithValue(err.message);
    return rejectWithValue('Failed to load products');
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<ProductFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.items.unshift(action.payload);
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    deleteProduct(state, action: PayloadAction<string>) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load products';
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx === -1) state.items.push(action.payload);
        else state.items[idx] = action.payload;
      });
  },
});

export const { setFilters, resetFilters, addProduct, updateProduct, deleteProduct, setLoading } =
  productsSlice.actions;
export default productsSlice.reducer;
