import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);
    console.log(`[db] connected to ${config.mongoUri}`);
  } catch (err) {
    console.error('[db] connection error', err);
    process.exit(1);
  }
}