import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../middleware/error.js';
import { serializeProduct, serializeReview } from '../utils/serialize.js';

const router = Router();

const variantSchema = z.object({
  type: z.enum(['size', 'color']),
  value: z.string().min(1),
  available: z.boolean().default(true),
});

const productCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().default(''),
  price: z.number().min(0),
  salePrice: z.number().min(0).optional(),
  images: z.array(z.string()).default([]),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  stock: z.number().min(0).default(0),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().min(0).default(0),
  variants: z.array(variantSchema).default([]),
});

const productUpdateSchema = productCreateSchema.partial();

const listQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(['price-asc', 'price-desc', 'rating', 'newest']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

router.get('/', validate(listQuerySchema, 'query'), async (req: Request, res: Response) => {
  const { category, minPrice, maxPrice, sortBy, search, page, limit } =
    req.query as unknown as z.infer<typeof listQuerySchema>;

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    const price: Record<string, number> = {};
    if (minPrice !== undefined) price.$gte = minPrice;
    if (maxPrice !== undefined) price.$lte = maxPrice;
    filter.price = price;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  const sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (sortBy === 'price-asc') sort.price = 1;
  else if (sortBy === 'price-desc') sort.price = -1;
  else if (sortBy === 'rating') sort.rating = -1;
  else if (sortBy === 'newest') sort.createdAt = -1;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    data: {
      items: items.map(serializeProduct),
      total,
      page,
      limit,
    },
  });
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid product id');
  const product = await Product.findById(id);
  if (!product) throw new HttpError(404, 'Product not found');
  res.json({ data: serializeProduct(product) });
});

router.post('/', authRequired, adminRequired, validate(productCreateSchema), async (req: Request, res: Response) => {
  const product = await Product.create(req.body);
  res.status(201).json({ data: serializeProduct(product) });
});

router.put('/:id', authRequired, adminRequired, validate(productUpdateSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid product id');
  const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
  if (!product) throw new HttpError(404, 'Product not found');
  res.json({ data: serializeProduct(product) });
});

router.delete('/:id', authRequired, adminRequired, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid product id');
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new HttpError(404, 'Product not found');
  res.json({ data: { id } });
});

router.get('/:id/reviews', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid product id');
  const reviews = await Review.find({ productId: id }).sort({ createdAt: -1 });
  res.json({ data: reviews.map(serializeReview) });
});

export default router;