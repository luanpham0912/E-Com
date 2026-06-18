// Shared API types (mirror of frontend/src/lib/types.ts)

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type UserRole = 'customer' | 'admin';

export interface Variant {
  type: 'size' | 'color';
  value: string;
  available: boolean;
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  tags: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  variants: Variant[];
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface CartItemDTO {
  productId: string;
  quantity: number;
  variant?: { type: string; value: string };
}

export interface AddressDTO {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderDTO {
  id: string;
  userId: string;
  items: CartItemDTO[];
  total: number;
  status: OrderStatus;
  shippingAddress: AddressDTO;
  createdAt: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  createdAt: string;
}

export interface ReviewDTO {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}