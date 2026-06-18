import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { authRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../middleware/error.js';

const router = Router();

const variantSchema = z
  .object({
    type: z.string(),
    value: z.string(),
  })
  .optional();

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  variant: variantSchema,
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
  variant: variantSchema,
});

async function getOrCreateCart(userId: string) {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
}

function itemKey(productId: string, variant?: { type: string; value: string }): string {
  return `${productId}::${variant?.type ?? ''}::${variant?.value ?? ''}`;
}

router.use(authRequired);

router.get('/', async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.userId);
  res.json({
    data: {
      items: cart.items.map((i) => ({
        productId: i.productId.toString(),
        quantity: i.quantity,
        variant: i.variant,
      })),
    },
  });
});

router.post('/items', validate(addItemSchema), async (req: Request, res: Response) => {
  const { productId, quantity, variant } = req.body as z.infer<typeof addItemSchema>;
  if (!mongoose.isValidObjectId(productId)) throw new HttpError(400, 'Invalid product id');
  const product = await Product.findById(productId);
  if (!product) throw new HttpError(404, 'Product not found');

  const cart = await getOrCreateCart(req.user!.userId);
  const key = itemKey(productId, variant);
  const existing = cart.items.find(
    (i) => itemKey(i.productId.toString(), i.variant) === key
  );
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, 99);
  } else {
    cart.items.push({ productId: new mongoose.Types.ObjectId(productId), quantity, variant });
  }
  cart.updatedAt = new Date();
  await cart.save();
  res.status(201).json({
    data: {
      items: cart.items.map((i) => ({
        productId: i.productId.toString(),
        quantity: i.quantity,
        variant: i.variant,
      })),
    },
  });
});

router.put('/items/:productId', validate(updateItemSchema), async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { quantity, variant } = req.body as z.infer<typeof updateItemSchema>;
  const cart = await getOrCreateCart(req.user!.userId);
  const key = itemKey(productId, variant);
  const item = cart.items.find((i) => itemKey(i.productId.toString(), i.variant) === key);
  if (!item) throw new HttpError(404, 'Cart item not found');
  item.quantity = quantity;
  cart.updatedAt = new Date();
  await cart.save();
  res.json({
    data: {
      items: cart.items.map((i) => ({
        productId: i.productId.toString(),
        quantity: i.quantity,
        variant: i.variant,
      })),
    },
  });
});

router.delete('/items/:productId', async (req: Request, res: Response) => {
  const { productId } = req.params;
  const variantType = typeof req.query.variantType === 'string' ? req.query.variantType : '';
  const variantValue = typeof req.query.variantValue === 'string' ? req.query.variantValue : '';
  const variant = variantType || variantValue ? { type: variantType, value: variantValue } : undefined;
  const cart = await getOrCreateCart(req.user!.userId);
  const key = itemKey(productId, variant);
  cart.items = cart.items.filter((i) => itemKey(i.productId.toString(), i.variant) !== key) as typeof cart.items;
  cart.updatedAt = new Date();
  await cart.save();
  res.json({
    data: {
      items: cart.items.map((i) => ({
        productId: i.productId.toString(),
        quantity: i.quantity,
        variant: i.variant,
      })),
    },
  });
});

router.delete('/', async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.userId);
  cart.items = [];
  cart.updatedAt = new Date();
  await cart.save();
  res.json({ data: { items: [] } });
});

export default router;