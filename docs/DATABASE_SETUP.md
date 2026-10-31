# Database Setup Guide

## Option 1: Local PostgreSQL (Recommended for Development)

### Install PostgreSQL on macOS

```bash
# Using Homebrew
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb tryeno-one
```

### Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Seed demo data
npm run db:seed
```

### Verify Setup

```bash
# Open Prisma Studio to view data
npx prisma studio
```

**Local `.env` (Docker or manual Postgres):** set both URLs to the same direct connection:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/tryeno-one"
DIRECT_URL="postgresql://postgres:postgres@localhost:5433/tryeno-one"
```

---

## Option 2: Neon via Vercel (Production)

Use **Vercel Storage → Neon** for production PostgreSQL. Do not use Supabase for this project.

### 1. Add Neon in Vercel

1. Open your Vercel project → **Storage** → **Create Database** → **Neon**
2. Choose the **Hobby** plan (free tier)
3. Link the database to your project

Vercel injects connection variables, including:

- `POSTGRES_PRISMA_URL` — pooled (use for the app)
- `POSTGRES_URL_NON_POOLING` — direct (use for migrations)

### 2. Map environment variables

In **Project → Settings → Environment Variables** (Production + Preview):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Copy from `POSTGRES_PRISMA_URL` (pooled) |
| `DIRECT_URL` | Copy from `POSTGRES_URL_NON_POOLING` (non-pooled) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

Prisma uses `DATABASE_URL` at runtime and `DIRECT_URL` for `migrate deploy`.

### 3. Run migrations

```bash
cd api-web
npm i -g vercel
vercel login
vercel link
vercel env pull .env.production
npx prisma migrate deploy
npm run db:seed   # optional demo data
```

Full deploy steps: [Production Deployment Guide](./PROD_DEPLOYMENT.md)

---

## Demo Login Credentials

After seeding, use these credentials:

### Admin
- Email: admin@tryeno-one.com
- Password: Admin@123

### Staff
- Email: staff@tryeno-one.com
- Password: Staff@123

### Customer
- Email: customer@tryeno-one.com
- Password: Customer@123

---

## Troubleshooting

### Can't connect to database

Check if PostgreSQL is running:
```bash
brew services list
```

### Connection refused (local)

Make sure `DATABASE_URL` and `DIRECT_URL` in `.env` match your setup:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/tryeno-one"
DIRECT_URL="postgresql://postgres:postgres@localhost:5433/tryeno-one"
```

### Migration fails on Vercel / Neon

- Use **non-pooled** URL for `DIRECT_URL`
- Use **pooled** URL for `DATABASE_URL`
- Run `npx prisma migrate deploy` with env pulled via `vercel env pull`

### Migration fails (local)

Reset database:
```bash
npx prisma migrate reset
npm run db:seed
```
