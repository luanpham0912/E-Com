import type { UserDoc } from '../models/User.js';
import type { CategoryDoc } from '../models/Category.js';
import type { ProductDoc } from '../models/Product.js';
import type { OrderDoc } from '../models/Order.js';
import type { ReviewDoc } from '../models/Review.js';
import type { UserDTO, CategoryDTO, ProductDTO, OrderDTO, ReviewDTO } from '../lib/types.js';

export function serializeUser(u: UserDoc): UserDTO {
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  };
}

export function serializeCategory(c: CategoryDoc): CategoryDTO {
  return {
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    image: c.image,
    productCount: c.productCount,
  };
}

export function serializeProduct(p: ProductDoc): ProductDTO {
  return {
    id: p._id.toString(),
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
  };
}

export function serializeOrder(o: OrderDoc): OrderDTO {
  return {
    id: o._id.toString(),
    userId: o.userId.toString(),
    items: o.items.map((i) => ({
      productId: i.productId.toString(),
      quantity: i.quantity,
      variant: i.variant,
    })),
    total: o.total,
    status: o.status,
    shippingAddress: o.shippingAddress,
    createdAt: o.createdAt.toISOString(),
  };
}

export function serializeReview(r: ReviewDoc): ReviewDTO {
  return {
    id: r._id.toString(),
    productId: r.productId.toString(),
    userId: r.userId.toString(),
    userName: r.userName,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  };
}