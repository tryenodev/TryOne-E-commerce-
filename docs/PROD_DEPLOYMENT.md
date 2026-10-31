# Production Deployment Guide

Deploy Tryeno One for **FREE** to production.

---

## How Production Works

**Local Development:**
- Docker runs PostgreSQL locally (`docker-compose.yml`)
- `DATABASE_URL` and `DIRECT_URL` point to `localhost:5433`

**Production (recommended):**
- **Vercel** hosts the Next.js app
- **Neon** (via Vercel Storage) hosts PostgreSQL
- Pooled URL for the app; non-pooled URL for Prisma migrations

**What makes it work:**
- `prisma/schema.prisma` → `DATABASE_URL` (runtime) + `DIRECT_URL` (migrations)
- `.env` (local) → Docker database
- Vercel environment variables (production) → Neon connection strings
- Your Next.js code does not change between environments

---

## Platform Comparison

| Platform | Free Tier | Database | Best For |
|----------|-----------|----------|----------|
| **Vercel + Neon** ⭐ | Yes | Neon (via Vercel Storage) | Recommended — demos & production |
| **Railway** | $5/month credit | 1 GB PostgreSQL | Larger production apps |
| **Render + Neon** | Yes (100%) | Neon (separate account) | Free hosting, no credit card |

**Not used:** Supabase — this project uses **Neon only** for cloud PostgreSQL.

---

## Option 1: Vercel + Neon (⭐ Recommended)

**What you get:** Vercel hosting + Neon PostgreSQL, auto-deploy from GitHub

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/tryeno-one.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click **New Project** → Select your GitHub repo
   - **Root Directory:** `api-web`
   - Click **Deploy** (first deploy may fail until env vars are set — expected)

3. **Add Neon database**
   - In the Vercel project → **Storage** → **Create Database** → **Neon**
   - Select **Hobby** (free)
   - **Link** the database to this project
   - Vercel adds `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, and related vars

4. **Set environment variables**

   Go to **Settings → Environment Variables** (Production + Preview):

   | Name | Value | Notes |
   |------|-------|--------|
   | `DATABASE_URL` | Value of `POSTGRES_PRISMA_URL` | Pooled — app runtime |
   | `DIRECT_URL` | Value of `POSTGRES_URL_NON_POOLING` | Non-pooled — migrations |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Required |
   | `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | Your real Vercel URL |

   **Tip:** In Storage → your Neon DB → **.env.local** tab, copy the pooled and non-pooled URLs.

5. **Run migrations & seed**
   ```bash
   cd api-web
   npm i -g vercel
   vercel login
   vercel link
   vercel env pull .env.production
   npx prisma migrate deploy
   npm run db:seed   # Optional: demo users/products
   ```

6. **Redeploy**
   - **Deployments** → **Redeploy** (latest)
   - Wait for build to finish

**Done!** Visit `https://your-app-name.vercel.app`

### Auto-Deploy After Setup

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel rebuilds and deploys automatically on each push to `main`.

**Test with demo credentials (after seed):**
- Admin: `admin@tryeno-one.com` / `Admin@123`
- Staff: `staff@tryeno-one.com` / `Staff@123`
- Customer: `customer@tryeno-one.com` / `Customer@123`

---

## Option 2: Railway

**What you get:** Full-stack hosting (App + Database)

### Steps

1. **Push to GitHub** (same as Option 1)

2. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub → Select repo

3. **Add PostgreSQL**
   - In project → + New → Database → PostgreSQL
   - Railway auto-links `DATABASE_URL`
   - Set `DIRECT_URL` to the same URL (Railway uses direct connections)

4. **Configure Service**
   - Click web service → Settings:
   - Root Directory: `api-web`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

5. **Set Environment Variables**
   ```
   NEXTAUTH_SECRET=<run: openssl rand -base64 32>
   NEXTAUTH_URL=https://your-app.railway.app
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   DIRECT_URL=${{Postgres.DATABASE_URL}}
   ```

6. **Run Migrations**
   ```bash
   npm i -g @railway/cli
   railway login
   railway link
   railway run npx prisma migrate deploy
   ```

**Done!** Visit your Railway URL

---

## Option 3: Render + Neon

**What you get:** Free Render hosting + Neon database (no Supabase)

### Steps

1. **Create Neon database**
   - Go to [neon.tech](https://neon.tech) → New Project
   - Copy **pooled** connection string → `DATABASE_URL`
   - Copy **direct** connection string → `DIRECT_URL`

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - New + → Web Service → Connect GitHub repo
   - Root Directory: `api-web`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

3. **Set Environment Variables**
   ```
   DATABASE_URL=<neon-pooled-connection-string>
   DIRECT_URL=<neon-direct-connection-string>
   NEXTAUTH_SECRET=<run: openssl rand -base64 32>
   NEXTAUTH_URL=https://your-app.onrender.com
   ```

4. **Run Migrations**
   - In Render → Shell tab:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

**Done!** Visit your Render URL

**Note:** Free tier sleeps after 15 min inactivity (~30s wake-up)

---

## Post-Deployment Checklist

✅ Homepage loads
✅ Login works (test all 3 roles)
✅ Admin dashboard accessible
✅ User management works
✅ Database queries working

---

## Environment Variables

Required for all platforms:

```env
DATABASE_URL="postgresql://..."    # Pooled (Neon) or direct (local/Railway)
DIRECT_URL="postgresql://..."      # Non-pooled for migrations; same as DATABASE_URL locally
NEXTAUTH_SECRET="<generate-random>" # openssl rand -base64 32
NEXTAUTH_URL="https://your-app-url.com"
```

**Notes:**
- `NODE_ENV` is set automatically by Vercel — do not add it manually
- **Neon on Vercel:** `DATABASE_URL` = pooled, `DIRECT_URL` = non-pooled
- **Local Docker:** both URLs are the same direct connection
- Swagger/API docs are disabled in production for security

---

## Troubleshooting

### Database Connection Failed
- Verify `DATABASE_URL` and `DIRECT_URL` in Vercel environment variables
- Confirm Neon database is linked under **Storage**
- Use pooled URL only for `DATABASE_URL`

### Prisma Client Error
- Update build command: `npm install && npx prisma generate && npm run build`

### Migrations Not Applied
- Run with production env: `vercel env pull .env.production && npx prisma migrate deploy`
- Ensure `DIRECT_URL` is the **non-pooled** Neon URL

### 404 on Routes
- Set Root Directory to `api-web` in platform settings

---

## Auto-Deploy with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy and Migrate

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd api-web && npm install
      - run: cd api-web && npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
```

Add `DATABASE_URL` and `DIRECT_URL` secrets in GitHub → Settings → Secrets

---

## Custom Domain (Optional)

**Vercel:** Project → Settings → Domains → Add domain → Update DNS
**Railway:** Service → Settings → Domains → Add custom domain
**Render:** Service → Settings → Custom Domain

All platforms provide free SSL automatically.

---

## Recommended Setup

**Best Overall:** Vercel + Neon ⭐ (integrated storage, serverless-friendly pooling)
**Production Apps:** Railway ($5/month credit, better limits)
**100% Free (with tradeoffs):** Render + Neon (cold starts after 15min on Render free tier)

---

**Questions?** Check main [README.md](../README.md) or [Database Setup](./DATABASE_SETUP.md).
