import { serializeUser, serializeOrder, serializeProduct } from '../utils/serialize';
import { Types } from 'mongoose';

function makeMockObjectId(id = '000000000000000000000001'): Types.ObjectId {
  return new Types.ObjectId(id);
}

const asDoc = <T>(obj: T): any => obj;

describe('serializeUser', () => {
  it('strips passwordHash from user object', () => {
    const user = asDoc({
      _id: makeMockObjectId(),
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/avatar.png',
      role: 'customer' as const,
      passwordHash: 'super-secret-hash',
      createdAt: new Date('2024-01-01'),
    });

    const result = serializeUser(user);

    expect(result).not.toHaveProperty('passwordHash');
    expect(result.id).toBe(user._id.toString());
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
    expect(result.role).toBe('customer');
    expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z');
  });
});

describe('serializeOrder', () => {
  it('serializes order with correct shape', () => {
    const orderId = makeMockObjectId('000000000000000000000001');
    const userId = makeMockObjectId('000000000000000000000002');
    const productId = makeMockObjectId('000000000000000000000003');

    const order = asDoc({
      _id: orderId,
      userId: userId,
      items: [
        {
          productId: productId,
          quantity: 2,
          variant: { type: 'size' as const, value: 'M' },
        },
      ],
      total: 59.98,
      status: 'pending' as const,
      shippingAddress: {
        fullName: 'John Doe',
        line1: '123 Main St',
        line2: undefined,
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
      },
      createdAt: new Date('2024-03-15'),
    });

    const result = serializeOrder(order);

    expect(result.id).toBe(orderId.toString());
    expect(result.userId).toBe(userId.toString());
    expect(result.items).toHaveLength(1);
    expect(result.items[0].productId).toBe(productId.toString());
    expect(result.items[0].quantity).toBe(2);
    expect(result.total).toBe(59.98);
    expect(result.status).toBe('pending');
    expect(result.createdAt).toBe('2024-03-15T00:00:00.000Z');
  });

  it('converts productId and userId to strings', () => {
    const order = asDoc({
      _id: makeMockObjectId(),
      userId: makeMockObjectId(),
      items: [{ productId: makeMockObjectId(), quantity: 1, variant: undefined }],
      total: 10,
      status: 'pending' as const,
      shippingAddress: {
        fullName: 'J',
        line1: '1',
        city: 'C',
        state: 'S',
        zip: '1',
        country: 'US',
      },
      createdAt: new Date(),
    });

    const result = serializeOrder(order);

    expect(typeof result.userId).toBe('string');
    expect(typeof result.items[0].productId).toBe('string');
  });
});

describe('serializeProduct', () => {
  it('serializes product with correct shape', () => {
    const product = asDoc({
      _id: makeMockObjectId(),
      name: 'Dog Food',
      slug: 'dog-food',
      description: 'Premium food for dogs',
      price: 29.99,
      salePrice: 24.99,
      images: ['https://example.com/dog-food.jpg'],
      category: 'food',
      tags: ['dog', 'food'],
      stock: 50,
      rating: 4.5,
      reviewCount: 12,
      variants: [{ type: 'size' as const, value: '1kg', available: true }],
    });

    const result = serializeProduct(product);

    expect(result.id).toBe(product._id.toString());
    expect(result.name).toBe('Dog Food');
    expect(result.price).toBe(29.99);
    expect(result.salePrice).toBe(24.99);
    expect(result.category).toBe('food');
    expect(result.variants).toHaveLength(1);
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('handles product without salePrice', () => {
    const product = asDoc({
      _id: makeMockObjectId(),
      name: 'Toy',
      slug: 'toy',
      description: 'A toy',
      price: 9.99,
      salePrice: undefined,
      images: [],
      category: 'toys',
      tags: [],
      stock: 0,
      rating: 0,
      reviewCount: 0,
      variants: [],
    });

    const result = serializeProduct(product);

    expect(result.salePrice).toBeUndefined();
    expect(result.price).toBe(9.99);
  });
});
