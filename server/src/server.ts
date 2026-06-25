import express, { type Express, type Request, type Response } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { csrfProtection } from './middleware/csrf.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import { errorHandler, notFound } from './middleware/error.js';

export function buildApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
  }));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    message: { error: { message: 'Too many attempts, please try again later.' } },
  });

  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.json({ data: { status: 'ok', timestamp: new Date().toISOString() } });
  });

  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/register', authLimiter);
  app.use('/api/v1/auth', csrfProtection, authRoutes);
  app.use('/api/v1/products', csrfProtection, productRoutes);
  app.use('/api/v1/categories', csrfProtection, categoryRoutes);
  app.use('/api/v1/cart', csrfProtection, cartRoutes);
  app.use('/api/v1/orders', csrfProtection, orderRoutes);
  app.use('/api/v1/users', csrfProtection, userRoutes);

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

if (import.meta.url === `file://${process.argv[1]}`) {
  bootstrap().catch((err) => {
    console.error('[fatal]', err);
    process.exit(1);
  });
}
