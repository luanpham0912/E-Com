// Reusable seed function used by both the CLI seed script and the smoke test.
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { products, categories, orders, reviews, users } from './seedData.js';

type SeedUser = typeof users[number];
type SeedProduct = typeof products[number];
type SeedCategory = typeof categories[number];
type SeedReview = typeof reviews[number];
type SeedOrder = typeof orders[number];
type SeedOrderItem = SeedOrder['items'][number];

export async function seed() {
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Order.deleteMany({}),
  ]);

  const defaultHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);
  const customerHash = await bcrypt.hash('customer123', 10);

  const userDocs = users.map((u) => {
    const passwordHash = u.email === 'admin@store.com'
      ? adminHash
      : u.email === 'customer@store.com'
        ? customerHash
        : defaultHash;
    return {
      _id: new mongoose.Types.ObjectId(),
      name: u.name,
      email: u.email,
      passwordHash,
      avatar: u.avatar,
      role: u.role,
      createdAt: new Date(u.createdAt),
    };
  });
  const userIdMap = new Map<string, mongoose.Types.ObjectId>();
  users.forEach((u, i) => userIdMap.set(u.id, userDocs[i]!._id));
  await User.insertMany(userDocs);

  await Category.insertMany(
    categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      image: c.image,
      productCount: c.productCount,
    }))
  );

  const insertedProducts = await Product.insertMany(
    products.map((p) => ({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      salePrice: p.salePrice,
      images: p.images,
      category: p.category,
      tags: p.tags,
      stock: p.stock,
      rating: p.rating,
      reviewCount: p.reviewCount,
      variants: p.variants,
    }))
  );
  const productIdMap = new Map<string, mongoose.Types.ObjectId>();
  products.forEach((p, i) => productIdMap.set(p.id, insertedProducts[i]!._id));

  const reviewDocs = reviews
    .map((r) => {
      const productId = productIdMap.get(r.productId);
      const userId = userIdMap.get(r.userId);
      if (!productId || !userId) return null;
      return {
        productId,
        userId,
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        createdAt: new Date(r.createdAt),
      };
    })
    .filter(Boolean);
  if (reviewDocs.length) await Review.insertMany(reviewDocs);

  const orderDocs = orders
    .map((o) => {
      const userId = userIdMap.get(o.userId);
      if (!userId) return null;
      const items = o.items
        .map((i) => {
          const productId = productIdMap.get(i.productId);
          if (!productId) return null;
          return { productId, quantity: i.quantity, variant: i.variant };
        })
        .filter(Boolean);
      if (!items.length) return null;
      return {
        userId,
        items,
        total: o.total,
        status: o.status,
        shippingAddress: o.shippingAddress,
        createdAt: new Date(o.createdAt),
      };
    })
    .filter(Boolean);
  if (orderDocs.length) await Order.insertMany(orderDocs);
}
