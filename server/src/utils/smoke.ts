// End-to-end smoke test using an in-memory MongoDB instance.
// Usage: cd server && npm run smoke

import 'dotenv/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

async function start() {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  console.log('[smoke] mongo memory server at', process.env.MONGODB_URI);

  // Now import the rest of the app (it will use the new MONGODB_URI)
  const { connectDB } = await import('../config/db.js');
  const { seed } = await import('./seedHelper.js');
  const { buildApp } = await import('../server.js');

  await connectDB();
  await seed();

  const app = await buildApp();
  const server = app.listen(0);
  const port = (server.address() as { port: number }).port;
  const base = `http://localhost:${port}/api/v1`;
  console.log('[smoke] api at', base);

  const results: Array<{ name: string; ok: boolean; detail?: string }> = [];

  async function call(
    method: string,
    path: string,
    bodyOrOpts?: unknown
  ): Promise<{ status: number; body: { data?: unknown; error?: { message: string; details?: unknown } } | null }> {
    let body: unknown;
    let token: string | undefined;
    if (bodyOrOpts && typeof bodyOrOpts === 'object' && !Array.isArray(bodyOrOpts)) {
      const o = bodyOrOpts as Record<string, unknown>;
      if ('body' in o || 'token' in o) {
        body = o.body;
        token = o.token as string | undefined;
      } else {
        body = o;
      }
    } else {
      body = bodyOrOpts;
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json: { data?: unknown; error?: { message: string; details?: unknown } } | null = null;
    if (text) {
      try {
        json = JSON.parse(text) as typeof json;
      } catch {
        json = null;
      }
    }
    return { status: res.status, body: json };
  }

  async function check(name: string, ok: boolean, detail?: string) {
    results.push({ name, ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
  }

  // 1. Health
  let r = await call('GET', '/health');
  await check('health', r.status === 200, `status=${r.status}`);

  // 2. Categories list
  r = await call('GET', '/categories');
  const cats = (r.body?.data as unknown[]) ?? [];
  await check('GET /categories', r.status === 200 && cats.length >= 5, `count=${cats.length}`);

  // 3. Products list
  r = await call('GET', '/products');
  const products = ((r.body?.data as { items: unknown[] })?.items) ?? [];
  await check('GET /products', r.status === 200 && products.length >= 10, `count=${products.length}`);

  // 4. Product filter by category
  const firstCat = cats[0] as { name: string };
  r = await call('GET', `/products?category=${encodeURIComponent(firstCat.name)}`);
  const filtered = ((r.body?.data as { items: unknown[] })?.items) ?? [];
  await check('GET /products?category=', r.status === 200 && filtered.length > 0, `count=${filtered.length}`);

  // 5. Login as admin
  r = await call('POST', '/auth/login', { email: 'admin@store.com', password: 'admin123' });
  if (r.status !== 200) {
    console.log('[debug] login error body:', JSON.stringify(r.body, null, 2));
  }
  const adminLogin = r.body?.data as { token: string; user: { role: string } };
  await check('POST /auth/login (admin)', r.status === 200 && adminLogin?.user?.role === 'admin', `status=${r.status}`);

  // 6. Login as customer
  r = await call('POST', '/auth/login', { email: 'customer@store.com', password: 'customer123' });
  const customerLogin = r.body?.data as { token: string; user: { role: string } };
  await check('POST /auth/login (customer)', r.status === 200 && customerLogin.user.role === 'customer');

  const customerToken = customerLogin.token;
  const adminToken = adminLogin.token;

  // 7. /auth/me
  r = await call('GET', '/auth/me', { token: customerToken });
  await check('GET /auth/me', r.status === 200);

  // 8. Wrong password rejected
  r = await call('POST', '/auth/login', { email: 'admin@store.com', password: 'wrong' });
  await check('POST /auth/login bad pass rejected', r.status === 401);

  // 9. Add to cart
  const firstProduct = products[0] as { id: string };
  r = await call('POST', '/cart/items', { token: customerToken, body: { productId: firstProduct.id, quantity: 2 } });
  await check('POST /cart/items', r.status === 201);

  // 10. Get cart
  r = await call('GET', '/cart', { token: customerToken });
  const cartItems = ((r.body?.data as { items: unknown[] })?.items) ?? [];
  await check('GET /cart', r.status === 200 && cartItems.length === 1, `items=${cartItems.length}`);

  // 11. Create order
  r = await call('POST', '/orders', {
    token: customerToken,
    body: {
      shippingAddress: {
        fullName: 'Test Customer',
        line1: '1 Test Street',
        city: 'Test City',
        state: 'CA',
        zip: '90001',
        country: 'US',
      },
    },
  });
  const createdOrder = r.body?.data as { id: string; total: number; status: string };
  await check('POST /orders', r.status === 201 && createdOrder.total > 0, `total=${createdOrder?.total}`);

  // 12. Cart is cleared
  r = await call('GET', '/cart', { token: customerToken });
  const clearedItems = ((r.body?.data as { items: unknown[] })?.items) ?? [];
  await check('Cart cleared after order', clearedItems.length === 0, `items=${clearedItems.length}`);

  // 13. Customer orders list
  r = await call('GET', '/orders', { token: customerToken });
  const customerOrders = (r.body?.data as unknown[]) ?? [];
  await check('GET /orders (customer)', r.status === 200 && customerOrders.length >= 1);

  // 14. Admin sees all orders
  r = await call('GET', '/orders', { token: adminToken });
  const allOrders = (r.body?.data as unknown[]) ?? [];
  await check('GET /orders (admin sees all)', r.status === 200 && allOrders.length >= customerOrders.length);

  // 15. Admin updates status
  r = await call('PUT', `/orders/${createdOrder.id}/status`, {
    token: adminToken,
    body: { status: 'shipped' },
  });
  const updated = r.body?.data as { status: string };
  await check('PUT /orders/:id/status', r.status === 200 && updated.status === 'shipped', `status=${updated.status}`);

  // 16. Customer cannot update status
  r = await call('PUT', `/orders/${createdOrder.id}/status`, {
    token: customerToken,
    body: { status: 'delivered' },
  });
  await check('PUT /orders/:id/status forbidden for customer', r.status === 403);

  // 17. Admin stats
  r = await call('GET', '/orders/stats/summary', { token: adminToken });
  const stats = r.body?.data as { totalOrders: number; revenue: number };
  await check('GET /orders/stats/summary', r.status === 200 && stats.totalOrders > 0);

  // 18. Admin creates a product
  r = await call('POST', '/products', {
    token: adminToken,
    body: {
      name: 'Smoke Test Widget',
      slug: 'smoke-test-widget',
      description: 'Created by smoke test',
      price: 99,
      category: 'Electronics',
      stock: 5,
      tags: ['test'],
    },
  });
  await check('POST /products (admin)', r.status === 201);

  // 19. Customer cannot create a product
  r = await call('POST', '/products', {
    token: customerToken,
    body: { name: 'Should fail', slug: 'should-fail', price: 1, category: 'X' },
  });
  await check('POST /products forbidden for customer', r.status === 403);

  // 20. Admin updates a product
  const newProduct = (r.status === 403) ? null : null; // already created above
  const created = await call('GET', '/products?search=Smoke%20Test');
  const smokeProduct = ((created.body?.data as { items: { id: string }[] })?.items ?? [])[0];
  if (smokeProduct) {
    r = await call('PUT', `/products/${smokeProduct.id}`, {
      token: adminToken,
      body: { price: 79 },
    });
    const updatedProd = r.body?.data as { price: number };
    await check('PUT /products/:id (admin)', r.status === 200 && updatedProd.price === 79, `price=${updatedProd?.price}`);

    r = await call('DELETE', `/products/${smokeProduct.id}`, { token: adminToken });
    await check('DELETE /products/:id (admin)', r.status === 200);
  }

  // 21. Users (admin)
  r = await call('GET', '/users', { token: adminToken });
  const users = (r.body?.data as unknown[]) ?? [];
  await check('GET /users (admin)', r.status === 200 && users.length >= 2, `users=${users.length}`);

  // 22. Users forbidden for customer
  r = await call('GET', '/users', { token: customerToken });
  await check('GET /users forbidden for customer', r.status === 403);

  // 23. Logout
  r = await call('POST', '/auth/logout', { token: customerToken });
  await check('POST /auth/logout', r.status === 200);

  // Summary
  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;
  console.log(`\n[smoke] ${passed}/${results.length} passed, ${failed} failed`);

  await mongoose.disconnect();
  server.close();
  await mongod.stop();
  process.exit(failed > 0 ? 1 : 0);
}

start().catch((err) => {
  console.error('[smoke] failed:', err);
  process.exit(1);
});
