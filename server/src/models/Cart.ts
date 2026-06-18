import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface CartItemSubdoc {
  productId: Types.ObjectId;
  quantity: number;
  variant?: { type: string; value: string };
}

export interface CartDoc extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: CartItemSubdoc[];
  updatedAt: Date;
}

const cartItemSchema = new Schema<CartItemSubdoc>(
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

const cartSchema = new Schema<CartDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Cart = mongoose.model<CartDoc>('Cart', cartSchema);