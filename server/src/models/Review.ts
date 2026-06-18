import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ReviewDoc extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<ReviewDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Review = mongoose.model<ReviewDoc>('Review', reviewSchema);