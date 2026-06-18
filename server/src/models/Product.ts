import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ProductDoc extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  tags: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  variants: { type: 'size' | 'color'; value: string; available: boolean }[];
  createdAt: Date;
}

const variantSchema = new Schema(
  {
    type: { type: String, enum: ['size', 'color'], required: true },
    value: { type: String, required: true },
    available: { type: Boolean, default: true },
  },
  { _id: false }
);

const productSchema = new Schema<ProductDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    variants: { type: [variantSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Product = mongoose.model<ProductDoc>('Product', productSchema);