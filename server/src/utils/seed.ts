import 'dotenv/config';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { seed } from './seedHelper.js';

async function main() {
  await connectDB();
  console.log('[seed] connected, clearing collections...');
  await seed();
  console.log('[seed] done');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
