import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Order, OrderStatus, Address, CartItem } from '@/lib/types';
import { ordersApi } from './ordersApi';
import { ApiError } from '@/lib/api';

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = { orders: [], loading: false, error: null };

export const fetchOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  'orders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await ordersApi.list();
    } catch (err) {
      if (err instanceof ApiError) return rejectWithValue(err.message);
      return rejectWithValue('Failed to load orders');
    }
  }
);

export const createOrderAsync = createAsyncThunk<
  Order,
  { shippingAddress: Address },
  { rejectValue: string }
>('orders/create', async ({ shippingAddress }, { rejectWithValue }) => {
  try {
    return await ordersApi.create(shippingAddress);
  } catch (err) {
    if (err instanceof ApiError) return rejectWithValue(err.message);
    return rejectWithValue('Failed to create order');
  }
});

export const updateOrderStatusAsync = createAsyncThunk<
  Order,
  { orderId: string; status: OrderStatus },
  { rejectValue: string }
>('orders/updateStatus', async ({ orderId, status }, { rejectWithValue }) => {
  try {
    return await ordersApi.updateStatus(orderId, status);
  } catch (err) {
    if (err instanceof ApiError) return rejectWithValue(err.message);
    return rejectWithValue('Failed to update order status');
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    createOrder(
      state,
      action: PayloadAction<{ userId: string; items: CartItem[]; total: number; shippingAddress: Address }>
    ) {
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        ...action.payload,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      state.orders.unshift(newOrder);
    },
    updateOrderStatus(state, action: PayloadAction<{ orderId: string; status: OrderStatus }>) {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) order.status = action.payload.status;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load orders';
      })
      .addCase(createOrderAsync.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      })
      .addCase(updateOrderStatusAsync.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.orders[idx] = action.payload;
      });
  },
});

export const { createOrder, updateOrderStatus, setLoading } = ordersSlice.actions;
export default ordersSlice.reducer;
