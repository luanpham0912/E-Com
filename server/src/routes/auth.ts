import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { authRequired, signToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../middleware/error.js';
import { serializeUser } from '../utils/serialize.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
});

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
  res.status(201).json({ data: { user: serializeUser(user), token } });
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new HttpError(401, 'Invalid email or password');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid email or password');

  const token = signToken({ userId: user._id.toString(), role: user.role });
  res.json({ data: { user: serializeUser(user), token } });
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
  // JWT is stateless; client should drop the token
  res.json({ data: { ok: true } });
});

export default router;