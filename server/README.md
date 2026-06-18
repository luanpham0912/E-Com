# PetProject Server

Express + MongoDB backend for the PetProject e-commerce frontend.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in values:
   ```bash
   cp .env.example .env
   ```

3. Make sure MongoDB is running locally (or update `MONGODB_URI`).

4. Seed the database:
   ```bash
   npm run seed
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

The API runs on `http://localhost:3001/api/v1`.

## Default credentials

- Admin: `admin@store.com` / `admin123`
- Customer: `customer@store.com` / `customer123`

## Scripts

- `npm run dev` — run with hot reload
- `npm run build` — compile TypeScript
- `npm start` — run production build
- `npm run seed` — populate DB with sample data