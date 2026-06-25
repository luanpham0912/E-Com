// Inline seed data — no external dependencies needed

interface SeedProduct {
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
  variants: { type: string; value: string; available: boolean }[];
}

interface SeedCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

interface SeedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  createdAt: string;
}

interface SeedReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface SeedOrderItem {
  productId: string;
  quantity: number;
  variant?: { type: string; value: string };
}

interface SeedOrder {
  id: string;
  userId: string;
  items: SeedOrderItem[];
  total: number;
  status: string;
  shippingAddress: {
    fullName: string;
    line1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: string;
}

const users: SeedUser[] = [
  { id: 'user-1', name: 'Alexandra Reed', email: 'customer@store.com', avatar: 'https://fastly.picsum.photos/seed/alex-avatar/200/200', role: 'customer', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'user-2', name: 'Admin User', email: 'admin@store.com', avatar: 'https://fastly.picsum.photos/seed/admin-avatar/200/200', role: 'admin', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'user-3', name: 'Marcus Chen', email: 'marcus@example.com', avatar: 'https://fastly.picsum.photos/seed/marcus/200/200', role: 'customer', createdAt: '2025-02-01T10:00:00Z' },
  { id: 'user-4', name: 'Sophia Williams', email: 'sophia@example.com', avatar: 'https://fastly.picsum.photos/seed/sophia/200/200', role: 'customer', createdAt: '2025-02-10T10:00:00Z' },
  { id: 'user-5', name: 'James Park', email: 'james@example.com', avatar: 'https://fastly.picsum.photos/seed/james/200/200', role: 'customer', createdAt: '2025-02-15T10:00:00Z' },
];

const categories: SeedCategory[] = [
  { id: 'cat-1', name: 'Electronics', slug: 'electronics', image: 'https://fastly.picsum.photos/seed/electronics-cat/600/400', productCount: 4 },
  { id: 'cat-2', name: 'Fashion', slug: 'fashion', image: 'https://fastly.picsum.photos/seed/fashion-cat/600/400', productCount: 3 },
  { id: 'cat-3', name: 'Home & Living', slug: 'home-living', image: 'https://fastly.picsum.photos/seed/home-cat/600/400', productCount: 3 },
  { id: 'cat-4', name: 'Beauty', slug: 'beauty', image: 'https://fastly.picsum.photos/seed/beauty-cat/600/400', productCount: 2 },
  { id: 'cat-5', name: 'Sports', slug: 'sports', image: 'https://fastly.picsum.photos/seed/sports-cat/600/400', productCount: 2 },
  { id: 'cat-6', name: 'Books', slug: 'books', image: 'https://fastly.picsum.photos/seed/books-cat/600/400', productCount: 1 },
];

const products: SeedProduct[] = [
  { id: 'prod-1', name: 'Wireless Noise-Cancelling Headphones', slug: 'wireless-noise-cancelling-headphones', description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and studio-quality sound.', price: 299.99, salePrice: 249.99, images: ['https://fastly.picsum.photos/seed/headphones/800/800', 'https://fastly.picsum.photos/seed/headphones2/800/800'], category: 'Electronics', tags: ['audio', 'wireless', 'noise-cancelling'], stock: 45, rating: 4.8, reviewCount: 128, variants: [{ type: 'color', value: 'Black', available: true }, { type: 'color', value: 'Silver', available: true }] },
  { id: 'prod-2', name: 'Smart Fitness Watch', slug: 'smart-fitness-watch', description: 'Track your health 24/7 with heart rate monitoring, GPS, and 7-day battery life.', price: 199.99, images: ['https://fastly.picsum.photos/seed/watch/800/800', 'https://fastly.picsum.photos/seed/watch2/800/800'], category: 'Electronics', tags: ['fitness', 'wearable', 'health'], stock: 62, rating: 4.5, reviewCount: 89, variants: [{ type: 'size', value: '40mm', available: true }, { type: 'size', value: '44mm', available: true }] },
  { id: 'prod-3', name: 'Premium Leather Messenger Bag', slug: 'premium-leather-messenger-bag', description: 'Handcrafted full-grain leather messenger bag with brass hardware and cotton lining.', price: 189.99, salePrice: 149.99, images: ['https://fastly.picsum.photos/seed/bag/800/800'], category: 'Fashion', tags: ['leather', 'bag', 'handcrafted'], stock: 23, rating: 4.7, reviewCount: 56, variants: [] },
  { id: 'prod-4', name: 'Minimalist Ceramic Desk Lamp', slug: 'minimalist-ceramic-desk-lamp', description: 'Artisan-made ceramic lamp with warm LED bulb. Perfect for focused work or ambient lighting.', price: 89.99, images: ['https://fastly.picsum.photos/seed/lamp/800/800'], category: 'Home & Living', tags: ['lighting', 'ceramic', 'minimalist'], stock: 34, rating: 4.6, reviewCount: 42, variants: [{ type: 'color', value: 'White', available: true }, { type: 'color', value: 'Terracotta', available: true }] },
  { id: 'prod-5', name: 'Organic Cotton T-Shirt Pack', slug: 'organic-cotton-tshirt-pack', description: 'Set of 3 premium organic cotton t-shirts in timeless colors. Sustainably sourced and manufactured.', price: 59.99, images: ['https://fastly.picsum.photos/seed/tshirt/800/800'], category: 'Fashion', tags: ['sustainable', 'cotton', 'essential'], stock: 78, rating: 4.4, reviewCount: 67, variants: [{ type: 'size', value: 'S', available: true }, { type: 'size', value: 'M', available: true }, { type: 'size', value: 'L', available: true }] },
  { id: 'prod-6', name: 'Smart Indoor Plant System', slug: 'smart-indoor-plant-system', description: 'Self-watering planters with app-controlled grow lights. Grow herbs and small plants year-round.', price: 129.99, images: ['https://fastly.picsum.photos/seed/plants/800/800'], category: 'Home & Living', tags: ['plants', 'smart', 'indoor'], stock: 19, rating: 4.3, reviewCount: 31, variants: [] },
  { id: 'prod-7', name: 'Natural Skincare Set', slug: 'natural-skincare-set', description: 'Complete skincare routine with cleanser, toner, and moisturizer. All-natural ingredients.', price: 79.99, salePrice: 64.99, images: ['https://fastly.picsum.photos/seed/skincare/800/800'], category: 'Beauty', tags: ['natural', 'skincare', 'routine'], stock: 51, rating: 4.6, reviewCount: 94, variants: [] },
  { id: 'prod-8', name: 'Yoga Mat & Block Set', slug: 'yoga-mat-block-set', description: 'Premium 6mm yoga mat with cork block and adjustable strap. Non-slip surface.', price: 69.99, images: ['https://fastly.picsum.photos/seed/yoga/800/800'], category: 'Sports', tags: ['yoga', 'fitness', 'cork'], stock: 27, rating: 4.7, reviewCount: 73, variants: [{ type: 'color', value: 'Sage', available: true }, { type: 'color', value: 'Navy', available: true }] },
  { id: 'prod-9', name: 'Japanese Chef Knife Set', slug: 'japanese-chef-knife-set', description: '3-piece Damascus steel knife set. Hand-forged in Seki City with rosewood handles.', price: 249.99, images: ['https://fastly.picsum.photos/seed/knives/800/800'], category: 'Home & Living', tags: ['kitchen', 'japanese', 'professional'], stock: 15, rating: 4.9, reviewCount: 38, variants: [] },
  { id: 'prod-10', name: 'Resistance Band Kit', slug: 'resistance-band-kit', description: '5-level resistance band kit for full-body workouts. Includes door anchor and carrying case.', price: 34.99, images: ['https://fastly.picsum.photos/seed/bands/800/800'], category: 'Sports', tags: ['fitness', 'portable', 'home-workout'], stock: 94, rating: 4.2, reviewCount: 115, variants: [] },
  { id: 'prod-11', name: 'Botanical Perfume Collection', slug: 'botanical-perfume-collection', description: 'Set of 3 rollerball perfumes inspired by gardens. Notes of bergamot, jasmine, and vetiver.', price: 89.99, images: ['https://fastly.picsum.photos/seed/perfume/800/800'], category: 'Beauty', tags: ['perfume', 'botanical', 'natural'], stock: 38, rating: 4.5, reviewCount: 52, variants: [] },
  { id: 'prod-12', name: 'Cashmere Blend Scarf', slug: 'cashmere-blend-scarf', description: 'Luxuriously soft cashmere-wool blend scarf. Oversized drape, finished with hand-rolled edges.', price: 119.99, salePrice: 89.99, images: ['https://fastly.picsum.photos/seed/scarf/800/800'], category: 'Fashion', tags: ['cashmere', 'scarf', 'winter'], stock: 29, rating: 4.8, reviewCount: 44, variants: [{ type: 'color', value: 'Oatmeal', available: true }, { type: 'color', value: 'Charcoal', available: true }] },
  { id: 'prod-13', name: 'Portable Bluetooth Speaker', slug: 'portable-bluetooth-speaker', description: 'Compact waterproof speaker with 360-degree sound and 24-hour playtime.', price: 79.99, images: ['https://fastly.picsum.photos/seed/speaker/800/800'], category: 'Electronics', tags: ['audio', 'bluetooth', 'portable'], stock: 71, rating: 4.4, reviewCount: 203, variants: [{ type: 'color', value: 'Teal', available: true }, { type: 'color', value: 'Black', available: true }] },
  { id: 'prod-14', name: 'Classic Hardcover Journal Set', slug: 'classic-hardcover-journal-set', description: 'Set of 2 lay-flat hardcover journals with archival paper. 200 pages each.', price: 24.99, images: ['https://fastly.picsum.photos/seed/journal/800/800'], category: 'Books', tags: ['journal', 'stationery', 'gift'], stock: 112, rating: 4.6, reviewCount: 78, variants: [] },
  { id: 'prod-15', name: 'Wireless Charging Pad', slug: 'wireless-charging-pad', description: 'Fast 15W wireless charging for all Qi-compatible devices. Sleek aluminum finish.', price: 39.99, images: ['https://fastly.picsum.photos/seed/charger/800/800'], category: 'Electronics', tags: ['charging', 'wireless', 'accessory'], stock: 88, rating: 4.3, reviewCount: 156, variants: [{ type: 'color', value: 'Space Gray', available: true }, { type: 'color', value: 'White', available: true }] },
];

const reviews: SeedReview[] = [
  { id: 'rev-1', productId: 'prod-1', userId: 'user-3', userName: 'Marcus Chen', rating: 5, comment: 'Best headphones I have ever owned. The noise cancellation is incredible on flights.', createdAt: '2025-03-01T10:00:00Z' },
  { id: 'rev-2', productId: 'prod-1', userId: 'user-4', userName: 'Sophia Williams', rating: 5, comment: 'Battery life is as advertised. Comfortable for all-day wear.', createdAt: '2025-03-05T10:00:00Z' },
  { id: 'rev-3', productId: 'prod-2', userId: 'user-5', userName: 'James Park', rating: 4, comment: 'Great features, GPS is accurate. Wish the screen was slightly larger.', createdAt: '2025-03-10T10:00:00Z' },
  { id: 'rev-4', productId: 'prod-4', userId: 'user-3', userName: 'Marcus Chen', rating: 5, comment: 'Beautiful lamp. The ceramic texture is stunning in person.', createdAt: '2025-03-12T10:00:00Z' },
  { id: 'rev-5', productId: 'prod-7', userId: 'user-4', userName: 'Sophia Williams', rating: 4, comment: 'Skin felt great after first use. Lightweight formula absorbs quickly.', createdAt: '2025-03-15T10:00:00Z' },
  { id: 'rev-6', productId: 'prod-9', userId: 'user-5', userName: 'James Park', rating: 5, comment: 'Incredibly sharp and well-balanced. Worth every penny.', createdAt: '2025-03-20T10:00:00Z' },
  { id: 'rev-7', productId: 'prod-13', userId: 'user-3', userName: 'Marcus Chen', rating: 4, comment: 'Great sound for the size. Good for outdoor use.', createdAt: '2025-03-22T10:00:00Z' },
  { id: 'rev-8', productId: 'prod-5', userId: 'user-4', userName: 'Sophia Williams', rating: 5, comment: 'The fabric quality is exceptional. Will buy again.', createdAt: '2025-03-25T10:00:00Z' },
];

const orders: SeedOrder[] = [
  { id: 'ord-1', userId: 'user-1', items: [{ productId: 'prod-1', quantity: 1 }, { productId: 'prod-13', quantity: 2 }], total: 429.97, status: 'delivered', shippingAddress: { fullName: 'Alexandra Reed', line1: '123 Oak Street', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA' }, createdAt: '2025-02-20T14:30:00Z' },
  { id: 'ord-2', userId: 'user-3', items: [{ productId: 'prod-3', quantity: 1 }, { productId: 'prod-12', quantity: 1 }], total: 339.98, status: 'shipped', shippingAddress: { fullName: 'Marcus Chen', line1: '456 Pine Avenue', city: 'Seattle', state: 'WA', zip: '98101', country: 'USA' }, createdAt: '2025-03-01T09:15:00Z' },
  { id: 'ord-3', userId: 'user-4', items: [{ productId: 'prod-7', quantity: 1 }, { productId: 'prod-11', quantity: 1 }], total: 154.98, status: 'processing', shippingAddress: { fullName: 'Sophia Williams', line1: '789 Maple Drive', city: 'New York', state: 'NY', zip: '10001', country: 'USA' }, createdAt: '2025-03-10T16:45:00Z' },
  { id: 'ord-4', userId: 'user-5', items: [{ productId: 'prod-9', quantity: 1 }], total: 249.99, status: 'pending', shippingAddress: { fullName: 'James Park', line1: '321 Birch Lane', city: 'Austin', state: 'TX', zip: '78701', country: 'USA' }, createdAt: '2025-03-15T11:20:00Z' },
  { id: 'ord-5', userId: 'user-1', items: [{ productId: 'prod-4', quantity: 2 }, { productId: 'prod-14', quantity: 1 }], total: 204.97, status: 'delivered', shippingAddress: { fullName: 'Alexandra Reed', line1: '123 Oak Street', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA' }, createdAt: '2025-02-10T13:00:00Z' },
];

export { products, categories, orders, reviews, users };
