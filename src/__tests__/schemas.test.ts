import {
  loginSchema,
  registerSchema,
  shippingSchema,
  paymentSchema,
  productFormSchema,
  profileSchema,
} from '../lib/schemas';

describe('loginSchema', () => {
  it('passes with valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('fails with invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('fails with short password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('passes with valid data', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('fails with short name', () => {
    const result = registerSchema.safeParse({
      name: 'J',
      email: 'john@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('fails with invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });
});

describe('shippingSchema', () => {
  const validAddress = {
    fullName: 'John Doe',
    email: 'john@example.com',
    line1: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA',
  };

  it('passes with valid address', () => {
    const result = shippingSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it('fails with bad ZIP format', () => {
    const result = shippingSchema.safeParse({ ...validAddress, zip: 'ABC' });
    expect(result.success).toBe(false);
  });

  it('fails with missing required field', () => {
    const { fullName, ...withoutName } = validAddress;
    const result = shippingSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
  });

  it('accepts ZIP with extension', () => {
    const result = shippingSchema.safeParse({ ...validAddress, zip: '10001-1234' });
    expect(result.success).toBe(true);
  });
});

describe('paymentSchema', () => {
  const validCard = {
    cardNumber: '1234 5678 9012 3456',
    expiry: '12/28',
    cvc: '123',
    nameOnCard: 'John Doe',
  };

  it('passes with valid card data', () => {
    const result = paymentSchema.safeParse(validCard);
    expect(result.success).toBe(true);
  });

  it('fails with invalid card number format', () => {
    const result = paymentSchema.safeParse({ ...validCard, cardNumber: '1234' });
    expect(result.success).toBe(false);
  });

  it('fails with bad expiry format', () => {
    const result = paymentSchema.safeParse({ ...validCard, expiry: '13/28' });
    expect(result.success).toBe(false);
  });

  it('fails with too short CVC', () => {
    const result = paymentSchema.safeParse({ ...validCard, cvc: '12' });
    expect(result.success).toBe(false);
  });
});

describe('productFormSchema', () => {
  const validProduct = {
    name: 'Dog Food',
    description: 'Premium dog food for all breeds',
    price: 29.99,
    category: 'food',
    stock: 100,
  };

  it('passes with valid product data', () => {
    const result = productFormSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('fails with negative price', () => {
    const result = productFormSchema.safeParse({ ...validProduct, price: -5 });
    expect(result.success).toBe(false);
  });

  it('fails with non-integer stock', () => {
    const result = productFormSchema.safeParse({ ...validProduct, stock: 10.5 });
    expect(result.success).toBe(false);
  });

  it('fails with zero price', () => {
    const result = productFormSchema.safeParse({ ...validProduct, price: 0 });
    expect(result.success).toBe(false);
  });

  it('accepts optional salePrice', () => {
    const result = productFormSchema.safeParse({ ...validProduct, salePrice: 19.99 });
    expect(result.success).toBe(true);
  });
});

describe('profileSchema', () => {
  it('passes with valid profile data', () => {
    const result = profileSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('fails with invalid email', () => {
    const result = profileSchema.safeParse({
      name: 'John Doe',
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('fails with short name', () => {
    const result = profileSchema.safeParse({
      name: 'J',
      email: 'john@example.com',
    });
    expect(result.success).toBe(false);
  });
});
