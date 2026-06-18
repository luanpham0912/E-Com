import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../middleware/error.js';
import { serializeOrder } from '../utils/serialize.js';

const router = Router();

const addressSchema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

const createOrderSchema = z.object({
  shippingAddress: addressSchema,
  paymentInfo: z.object({}).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

router.use(authRequired);

router.get('/stats/summary', adminRequired, async (_req: Request, res: Response) => {
  const [totalOrders, pendingOrders, revenueAgg, customersCount, productsCount] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    mongoose.connection.db?.collection('users').countDocuments({ role: 'customer' }),
    mongoose.connection.db?.collection('products').countDocuments(),
  ]);
  const revenue = revenueAgg[0]?.total ?? 0;
  res.json({
    data: {
      totalOrders,
      pendingOrders,
      revenue,
      customersCount: customersCount ?? 0,
      productsCount: productsCount ?? 0,
    },
  });
});

router.post('/', validate(createOrderSchema), async (req: Request, res: Response) => {
  const { shippingAddress } = req.body as z.infer<typeof createOrderSchema>;

  const cart = await Cart.findOne({ userId: req.user!.userId });
  if (!cart || cart.items.length === 0) throw new HttpError(400, 'Cart is empty');

  // Recompute total server-side from current product prices
  const productIds = cart.items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const priceMap = new Map(products.map((p) => [p._id.toString(), p.salePrice ?? p.price]));

  let total = 0;
  const orderItems = cart.items.map((i) => {
    const price = priceMap.get(i.productId.toString());
    if (price === undefined) throw new HttpError(400, 'One or more products are unavailable');
    total += price * i.quantity;
    return {
      productId: i.productId,
      quantity: i.quantity,
      variant: i.variant,
    };
  });

  const order = await Order.create({
    userId: req.user!.userId,
    items: orderItems,
    total: Math.round(total * 100) / 100,
    shippingAddress,
    status: 'pending',
  });

  // Clear cart after successful order
  cart.items = [];
  cart.updatedAt = new Date();
  await cart.save();

  res.status(201).json({ data: serializeOrder(order) });
});

router.get('/', async (req: Request, res: Response) => {
  const filter = req.user!.role === 'admin' ? {} : { userId: req.user!.userId };
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ data: orders.map(serializeOrder) });
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid order id');
  const order = await Order.findById(id);
  if (!order) throw new HttpError(404, 'Order not found');
  if (req.user!.role !== 'admin' && order.userId.toString() !== req.user!.userId) {
    throw new HttpError(403, 'Forbidden');
  }
  res.json({ data: serializeOrder(order) });
});

router.put('/:id/status', adminRequired, validate(updateStatusSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid order id');
  const { status } = req.body as z.infer<typeof updateStatusSchema>;
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!order) throw new HttpError(404, 'Order not found');
  res.json({ data: serializeOrder(order) });
});

export default router;