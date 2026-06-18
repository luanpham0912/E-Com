import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../middleware/error.js';
import { serializeUser } from '../utils/serialize.js';

const router = Router();

router.use(authRequired, adminRequired);

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['customer', 'admin']).optional(),
  password: z.string().min(6).optional(),
});

router.get('/', async (_req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ data: users.map(serializeUser) });
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid user id');
  const user = await User.findById(id);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ data: serializeUser(user) });
});

router.put('/:id', validate(updateUserSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid user id');
  const updates = req.body as z.infer<typeof updateUserSchema>;
  if (updates.password) {
    updates.password = (await bcrypt.hash(updates.password, 10)) as unknown as string;
  }
  const user = await User.findByIdAndUpdate(id, updates, { new: true });
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ data: serializeUser(user) });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid user id');
  if (id === req.user!.userId) throw new HttpError(400, 'Cannot delete yourself');
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ data: { id } });
});

export default router;