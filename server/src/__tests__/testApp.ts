import type { Express } from 'express';
import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import authRoutes from '../routes/auth';
import productRoutes from '../routes/products';
import categoryRoutes from '../routes/categories';
import cartRoutes from '../routes/cart';
import orderRoutes from '../routes/orders';
import userRoutes from '../routes/users';
import { errorHandler, notFound } from '../middleware/error';

const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

export function buildApp(): Express {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(morgan('combined'));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    message: { error: { message: 'Too many attempts' } },
  });

  app.get('/api/v1/health', (_req, res) => {
    res.json({ data: { status: 'ok' } });
  });

  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/register', authLimiter);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/users', userRoutes);

  const distPath = path.resolve(process.cwd(), 'dist/public');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
