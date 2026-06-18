import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 3001),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/petproject',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};