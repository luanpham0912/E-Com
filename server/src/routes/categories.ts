import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../middleware/error.js';
import { serializeCategory } from '../utils/serialize.js';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  image: z.string().default(''),
  productCount: z.number().min(0).default(0),
});

const categoryUpdateSchema = categorySchema.partial();

router.get('/', async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ data: categories.map(serializeCategory) });
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid category id');
  const category = await Category.findById(id);
  if (!category) throw new HttpError(404, 'Category not found');
  res.json({ data: serializeCategory(category) });
});

router.post('/', authRequired, adminRequired, validate(categorySchema), async (req: Request, res: Response) => {
  const category = await Category.create(req.body);
  res.status(201).json({ data: serializeCategory(category) });
});

router.put('/:id', authRequired, adminRequired, validate(categoryUpdateSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid category id');
  const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
  if (!category) throw new HttpError(404, 'Category not found');
  res.json({ data: serializeCategory(category) });
});

router.delete('/:id', authRequired, adminRequired, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid category id');
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new HttpError(404, 'Category not found');
  res.json({ data: { id } });
});

export default router;