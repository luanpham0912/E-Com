import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { OrderStatus } from '../lib/types.js';

export interface OrderDoc extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: { productId: Types.ObjectId; quantity: number; variant?: { type: string; value: string } }[];
  total: number;
  status: OrderStatus;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: Date;
}

const itemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    variant: {
      type: { type: String },
      value: { type: String },
      _id: false,
    },
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [itemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: { type: addressSchema, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Order = mongoose.model<OrderDoc>('Order', orderSchema);