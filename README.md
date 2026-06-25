# PetProject Store

Full-stack e-commerce app for pet products.

## Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Radix UI + React Query + Zustand
- **Backend**: Express + TypeScript + Mongoose + MongoDB
- **Auth**: JWT (httpOnly cookie) + CSRF token

## Quick Start

```bash
# Install dependencies
npm install && npm --prefix server install

# Start both client + server (concurrently)
npm run dev:full

# Or separately
npm run dev          # frontend at http://localhost:5173
npm --prefix server run dev  # backend at http://localhost:3001
```

## Seed data

```bash
cp server/.env.example server/.env
# Edit server/.env with your MONGODB_URI, then:
npm --prefix server run seed
```

---

## Deployment

### Architecture

```
Browser ──HTTPS──> Vercel (Frontend)
                        │
                        │ API calls (CORS)
                        ▼
                  Render (Backend) ──> MongoDB Atlas
```

### 1. MongoDB Atlas

Create a free M0 cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).

Get your connection string (`mongodb+srv://...`).

### 2. Deploy Backend to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **Blueprints** → Upload `render.yaml`
3. Connect your GitHub repo
4. Fill in env vars:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Generate: `openssl rand -hex 32` |
| `MONGODB_URI` | Your Atlas connection string |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` (after step 3) |
| `JWT_EXPIRES_IN` | `7d` |

5. Deploy starts automatically — copy the backend URL (e.g. `https://petproject-api.onrender.com`)

### 3. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → Import GitHub repo
2. Set env var:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api/v1`
3. Deploy

After first deploy, update Render env var `CORS_ORIGIN` to match your Vercel URL.

### 4. CI/CD (GitHub Actions)

On every push to `main`, the workflow in `.github/workflows/deploy.yml` will:
- Rebuild and deploy frontend to Vercel
- Trigger a new deployment on Render

Required GitHub Secrets:

| Secret | Where to get |
|--------|-------------|
| `VERCEL_TOKEN` | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | From Vercel project settings |
| `VERCEL_PROJECT_ID` | From Vercel project settings |
| `RENDER_API_KEY` | render.com/account/api-keys |
| `RENDER_SERVICE_ID` | From Render service URL |
| `VITE_API_URL` | `https://your-render-url.onrender.com/api/v1` |

### Database seed on production

After Atlas is set up, run once locally against the production DB:

```bash
MONGODB_URI=mongodb+srv://... JWT_SECRET=... npm --prefix server run seed
```

---

## Project Structure

```
.
├── src/                    # React frontend
│   ├── apis/               # Typed API functions
│   ├── components/         # UI components
│   ├── hooks/              # React Query hooks
│   ├── layouts/            # Page layouts
│   ├── lib/                 # Utils, schemas, axios
│   ├── pages/              # Route pages
│   └── store/              # Zustand stores
├── server/                 # Express backend
│   └── src/
│       ├── config/         # DB, env config
│       ├── middleware/      # Auth, CSRF, error
│       ├── models/          # Mongoose schemas
│       ├── routes/         # API routes
│       └── utils/           # Seed data
└── .github/workflows/      # CI/CD
```
