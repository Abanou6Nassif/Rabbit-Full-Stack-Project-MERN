# Rabbit (Full-Stack MERN E-Commerce)

React + Vite frontend and Express + MongoDB backend, configured for separate Vercel deployments.

## Project structure

- `frontend/` - React SPA (Vite)
- `backend/` - Express API (serverless on Vercel)

## Local development

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Runs on `http://localhost:3000`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Runs on `http://localhost:5173`.

Set `VITE_BACKEND_URL=http://localhost:3000` in `frontend/.env`.

## Deploy to Vercel

Deploy the frontend and backend as **two separate Vercel projects**, each with its **Root Directory** set in the Vercel dashboard.

### 1. Backend project

1. Import the repo and set **Root Directory** to `backend`.
2. Framework preset: **Other** (Vercel uses `vercel.json` + `api/index.js`).
3. Add environment variables from `backend/.env.example`:
   - `MONGO_URI` - MongoDB Atlas connection string (allow `0.0.0.0/0` or Vercel IPs)
   - `TOKEN_SECRET` - long random string for backward compatibility
   - `ACCESS_TOKEN_SECRET` - optional dedicated secret for access tokens
   - `REFRESH_TOKEN_SECRET` - optional dedicated secret for refresh tokens
   - `FRONTEND_ORIGIN` - your deployed frontend URL (e.g. `https://rabbit-store.vercel.app`)
   - `FRONTEND_URL` - same URL, used in password reset emails
   - `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` - Cloudinary
   - SMTP vars - optional, for password reset emails
   - `REDIS_URL` - optional; use [Upstash Redis](https://upstash.com/) for shared rate limiting
4. Deploy and note the backend URL (e.g. `https://rabbit-api.vercel.app`).

Health check: `GET /api/health`

### 2. Frontend project

1. Import the same repo and set **Root Directory** to `frontend`.
2. Framework preset: **Vite** (auto-detected).
3. Add environment variables from `frontend/.env.example`:
   - `VITE_BACKEND_URL` - your deployed backend URL (no trailing slash)
   - `VITE_PAYPAL_CLIENT_ID` - PayPal sandbox or live client ID
4. Deploy.

### 3. Cross-origin auth

Because frontend and backend run on different domains, JWT cookies use `Secure` + `SameSite=None` in production. Ensure:

- `FRONTEND_ORIGIN` on the backend exactly matches the frontend URL
- Both projects use HTTPS (Vercel provides this by default)

## Required third-party services

| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Database |
| Cloudinary | Product image uploads |
| PayPal | Checkout payments |
| SMTP provider | Password reset emails (optional) |
| Upstash Redis | Shared rate limiting (optional) |
