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
