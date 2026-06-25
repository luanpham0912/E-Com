import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { User } from '../models/User.js';
import { authRequired, signToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../middleware/error.js';
import { serializeUser } from '../utils/serialize.js';
import { config } from '../config/env.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
});

function setAuthCookies(res: Response, token: string) {
  const isProd = config.nodeEnv === 'production';
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
  const csrfToken = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf_token', csrfToken, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('csrf_token', { path: '/' });
}

router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  const { name, email, password } = req.body as z.infer<typeof registerSchema>;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new HttpError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    avatar: `https://picsum.photos/seed/${email}/200/200`,
    role: 'customer',
  });

  const token = signToken({ userId: user._id.toString(), role: user.role });
  setAuthCookies(res, token);
  res.status(201).json({ data: { user: serializeUser(user) } });
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new HttpError(401, 'Invalid email or password');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid email or password');

  const token = signToken({ userId: user._id.toString(), role: user.role });
  setAuthCookies(res, token);
  res.json({ data: { user: serializeUser(user) } });
});

router.get('/me', authRequired, async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ data: serializeUser(user) });
});

router.put('/me', authRequired, validate(updateProfileSchema), async (req: Request, res: Response) => {
  const updates = req.body as z.infer<typeof updateProfileSchema>;
  const user = await User.findByIdAndUpdate(req.user!.userId, updates, { new: true });
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ data: serializeUser(user) });
});

router.post('/logout', (_req: Request, res: Response) => {
  clearAuthCookies(res);
  res.json({ data: { ok: true } });
});

export default router;
