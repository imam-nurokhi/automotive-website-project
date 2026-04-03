# Deployment Guide

Production deployment for AutoFlow using Vercel + Neon (recommended) or self-hosted options.

---

## Option 1: Vercel + Neon PostgreSQL (Recommended)

### Why this stack?
- **Vercel** — zero-config Next.js deployment, automatic CI/CD, edge network
- **Neon** — serverless PostgreSQL with branching, free tier available
- Both support the `@prisma/adapter-pg` driver adapter used by this project

---

### Step 1: Create Neon Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project (e.g. "autoflow-prod")
3. Copy the **connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

---

### Step 2: Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel
```

**Option B: GitHub integration**
1. Push your repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Vercel auto-detects Next.js — click Deploy

---

### Step 3: Set Environment Variables

In the Vercel dashboard → Project Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string (with `?sslmode=require`) |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` |
| `AUTH_SECRET` | Output of `openssl rand -base64 32` |

> **Important:** Set these for **Production**, **Preview**, and **Development** environments as needed.

---

### Step 4: Run Production Migrations

After deployment, run migrations against your Neon database:

```bash
# Set env temporarily for migration
DATABASE_URL="<your-neon-url>" npx prisma migrate deploy

# Seed with initial data (optional)
DATABASE_URL="<your-neon-url>" npm run db:seed
```

Or add a `postinstall` script to `package.json` to auto-migrate on deploy:
```json
"postinstall": "prisma generate && prisma migrate deploy"
```

---

### Step 5: Verify Deployment

```bash
# Test the API
curl https://your-project.vercel.app/api/promos

# Should return your seeded promos
```

---

## Option 2: Railway

Railway provides PostgreSQL + Node.js hosting in one platform.

1. Go to [railway.app](https://railway.app) → New Project
2. Add a **PostgreSQL** service → copy `DATABASE_URL`
3. Add a **Node.js** service → connect your GitHub repo
4. Set environment variables (same as Vercel above)
5. Railway auto-builds on push

---

## Option 3: Self-Hosted (VPS/Docker)

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: autoflow
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/autoflow?schema=public
      NEXTAUTH_URL: http://localhost:3000
      AUTH_SECRET: your-secret-here
    depends_on:
      - db
    command: sh -c "npx prisma migrate deploy && npm start"

volumes:
  postgres_data:
```

**Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Run:
```bash
docker-compose up -d
docker-compose exec app npm run db:seed
```

---

## Option 4: Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection String → URI
3. Use the **Direct connection** string (not pooler) for Prisma migrations
4. For the app runtime, use the **Transaction pooler** connection string
5. Append `?pgbouncer=true&connection_limit=1` to the pooler URL
6. Deploy to Vercel following Option 1 steps above

### Supabase environment notes

- **Runtime vs Migrations:** Use the *Direct connection* string when running `prisma migrate deploy` and seeding. For app runtime (Vercel/Railway), use the *pooler* URL and append `?pgbouncer=true&connection_limit=1`.
- **Required environment variables** (add these in your host / secrets manager; do NOT commit keys):
  - `DATABASE_URL` — runtime pooler URL (or set per-stage in Vercel). For migrations use the Direct URL temporarily.
  - `NEXTAUTH_URL` — https://your-domain
  - `AUTH_SECRET` — strong random secret (e.g. `openssl rand -base64 32`)
  - `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL (client-safe)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key (client-safe)
  - `SUPABASE_SERVICE_ROLE_KEY` — server-only service role key (never expose to client)
  - `SUPABASE_URL` / `SUPABASE_KEY` — optional server-side vars if you reference Supabase directly
- **Running migrations & seed (example):**
```bash
# For migrations (use Direct connection string)
DATABASE_URL="<direct-connection-string>" npx prisma migrate deploy
DATABASE_URL="<direct-connection-string>" npm run db:seed
```

If you plan to use Supabase features (Auth/Storage/Realtime), set the `NEXT_PUBLIC_*` vars for client usage and keep `SUPABASE_SERVICE_ROLE_KEY` in server-only secrets.

## Automated CI: GitHub Actions (migrations + deploy)

This repository includes a GitHub Actions workflow at [/.github/workflows/ci-deploy.yml](.github/workflows/ci-deploy.yml) that will:

- Install dependencies and build the app (using the pooler `DATABASE_URL` during build)
- Run Prisma migrations and seed using the **Direct** Supabase connection string
- Deploy the built site to Vercel via the Vercel Action

Required GitHub Secrets (set these in your repository settings → Secrets):

- `SUPABASE_DB_DIRECT_URL` — Supabase **Direct connection** string (use for migrations & seed)
- `SUPABASE_DB_POOLER_URL` — Supabase **Pooler** / runtime connection string (used during build/runtime)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (client)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon public key (client)
- `SUPABASE_SERVICE_ROLE_KEY` — Server-only key (DO NOT expose to client)
- `VERCEL_TOKEN` — Token for Vercel deployment (create via Vercel dashboard)
- `VERCEL_ORG_ID` — Vercel organization id for the project
- `VERCEL_PROJECT_ID` — Vercel project id

Workflow notes:

- The workflow runs `npx prisma migrate deploy` with `SUPABASE_DB_DIRECT_URL`. Keep the direct DB URL secret and only available in CI.
- The workflow then runs `npm run db:seed` to populate initial admin and demo data.
- Finally the workflow deploys to Vercel using the provided token and project identifiers.

If you prefer Vercel's native GitHub integration for deploys, either remove the Vercel deploy step and rely on Vercel to deploy on push, or use this workflow to ensure migrations run before the Vercel deploy by keeping the deploy step here.

---

## Production Checklist

Before going live:

- [ ] `AUTH_SECRET` is a strong random value (not the example)
- [ ] `NEXTAUTH_URL` matches your actual domain
- [ ] `DATABASE_URL` points to your production database
- [ ] `npm run build` succeeds locally before deploying
- [ ] Database migrations applied (`prisma migrate deploy`)
- [ ] Initial admin account created (via seed or manually)
- [ ] HTTPS is enabled (Vercel/Railway handle this automatically)
- [ ] Consider adding `NEXTAUTH_SECRET` as alias for older NextAuth versions
- [ ] Remove `dev.log` from git (it's already in `.gitignore` if you add it)

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ | Full base URL of your deployment |
| `AUTH_SECRET` | ✅ | Random secret for JWT signing |

---

## Monitoring & Logs

**Vercel Logs:**
```bash
vercel logs your-project-name
```

**Database monitoring:**
- Neon: Built-in query monitoring in dashboard
- Self-hosted: Use `pg_stat_activity` or `pgBadger`

**Error tracking (optional):**
Add Sentry by installing `@sentry/nextjs` and following their Next.js setup guide.
