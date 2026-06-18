import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface CategoryDoc extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

const categorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, default: '' },
    productCount: { type: Number, default: 0 },
  },
  { versionKey: false }
);

export const Category = mongoose.model<CategoryDoc>('Category', categorySchema);