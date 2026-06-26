import { buildApp } from './testApp';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let app: ReturnType<typeof buildApp>;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGODB_URI!);
  app = buildApp();
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/v1/auth/register', () => {
  it('registers a new user and returns 201', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'John Doe',
        email: `john${Date.now()}@example.com`,
        password: 'password123',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 409 for duplicate email', async () => {
    const email = `dup${Date.now()}@example.com`;
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'John', email, password: 'password123' });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'John', email, password: 'password123' });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('logs in with valid credentials and returns 200', async () => {
    const email = `login${Date.now()}@example.com`;
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'John', email, password: 'password123' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.data.user).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    const email = `wrongpw${Date.now()}@example.com`;
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'John', email, password: 'password123' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('returns 401 for non-existent user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('clears auth cookie and returns 200', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.data.ok).toBe(true);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns current user when authenticated', async () => {
    const email = `me${Date.now()}@example.com`;
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'John', email, password: 'password123' });

    const agent = request.agent(app);
    await agent
      .post('/api/v1/auth/login')
      .send({ email, password: 'password123' });

    const res = await agent.get('/api/v1/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(email);
  });
});

describe('PUT /api/v1/auth/me', () => {
  it('updates name and avatar when authenticated', async () => {
    const email = `update${Date.now()}@example.com`;
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'John', email, password: 'password123' });

    const agent = request.agent(app);
    await agent
      .post('/api/v1/auth/login')
      .send({ email, password: 'password123' });

    const res = await agent.put('/api/v1/auth/me').send({
      name: 'Jane Doe',
      avatar: 'https://example.com/new-avatar.png',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Jane Doe');
    expect(res.body.data.avatar).toBe('https://example.com/new-avatar.png');
  });
});
