// Bridges the frontend mock data into the server seed.
// Uses relative imports so it works with `tsx` without extra config.

import { products, categories, orders, reviews, users } from '../../../src/features/products/mockData.js';

export { products, categories, orders, reviews, users };
