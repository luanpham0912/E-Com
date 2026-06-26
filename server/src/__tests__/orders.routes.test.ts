import { buildApp } from './testApp';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let app: ReturnType<typeof buildApp>;
let userAgent: ReturnType<typeof request.agent>;
let adminAgent: ReturnType<typeof request.agent>;
let mongoServer: MongoMemoryServer;

async function registerUser(email: string, role: 'customer' | 'admin' = 'customer') {
  const agent = request.agent(app);
  await agent
    .post('/api/v1/auth/register')
    .send({ name: 'Test User', email, password: 'password123' });

  if (role === 'admin') {
    await mongoose.model('User').findOneAndUpdate({ email }, { role: 'admin' });
  }

  return agent;
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGODB_URI!);
  app = buildApp();
  userAgent = await registerUser(`user${Date.now()}@example.com`);
  adminAgent = await registerUser(`admin${Date.now()}@example.com`, 'admin');
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const validAddress = {
  fullName: 'John Doe',
  line1: '123 Main Street',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  country: 'USA',
};

describe('POST /api/v1/orders', () => {
  it('returns 400 when cart is empty', async () => {
    const res = await userAgent
      .post('/api/v1/orders')
      .send({ shippingAddress: validAddress });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/cart/i);
  });
});

describe('GET /api/v1/orders', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/v1/orders');
    expect(res.status).toBe(401);
  });

  it('returns only own orders for customer', async () => {
    const res = await userAgent.get('/api/v1/orders');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns all orders for admin', async () => {
    const res = await adminAgent.get('/api/v1/orders');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/v1/orders/:id', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/v1/orders/000000000000000000000001');
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid order id format', async () => {
    const res = await userAgent.get('/api/v1/orders/not-a-valid-id');
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent order', async () => {
    const res = await userAgent.get(
      '/api/v1/orders/000000000000000000000001'
    );
    expect(res.status).toBe(404);
  });

  it('returns 403 when customer tries to access another users order', async () => {
    const otherAgent = await registerUser(`other${Date.now()}@example.com`);

    const res = await otherAgent.get('/api/v1/orders/000000000000000000000001');
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/v1/orders/:id/status', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .put('/api/v1/orders/000000000000000000000001/status')
      .send({ status: 'processing' });
    expect(res.status).toBe(401);
  });

  it('returns 403 when non-admin tries to update status', async () => {
    const res = await userAgent
      .put('/api/v1/orders/000000000000000000000001/status')
      .send({ status: 'processing' });
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid order id format', async () => {
    const res = await adminAgent
      .put('/api/v1/orders/not-a-valid-id/status')
      .send({ status: 'processing' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid status value', async () => {
    const res = await adminAgent
      .put('/api/v1/orders/000000000000000000000001/status')
      .send({ status: 'invalid-status' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent order', async () => {
    const res = await adminAgent
      .put('/api/v1/orders/000000000000000000000001/status')
      .send({ status: 'processing' });
    expect(res.status).toBe(404);
  });
});
