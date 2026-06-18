import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { UserRole } from '../lib/types.js';

export interface UserDoc extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  role: UserRole;
  createdAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const User = mongoose.model<UserDoc>('User', userSchema);