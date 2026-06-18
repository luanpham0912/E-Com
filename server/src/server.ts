import express, { type Express, type Request, type Response } from 'express';
import 'express-async-errors';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import { errorHandler, notFound } from './middleware/error.js';

export function buildApp(): Express {
  const app = express();
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.json({ data: { status: 'ok', timestamp: new Date().toISOString() } });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/users', userRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

async function bootstrap() {
  const { connectDB } = await import('./config/db.js');
  await connectDB();

  const app = buildApp();
  app.listen(config.port, () => {
    console.log(`[server] listening on http://localhost:${config.port}/api/v1`);
  });
}

// Only auto-start when run directly (not when imported by smoke test)
if (import.meta.url === `file://${process.argv[1]}`) {
  bootstrap().catch((err) => {
    console.error('[fatal]', err);
    process.exit(1);
  });
}