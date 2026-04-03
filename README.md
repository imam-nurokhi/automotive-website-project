# AutoFlow — Automotive Workshop Management System

<div align="center">
  <h3>A full-stack automotive workshop management platform built with Next.js 15, Prisma v7, and PostgreSQL</h3>
  <p>Customer portal · Admin CMS · Real-time inventory · Service tracking</p>
</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Test Accounts](#test-accounts)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

AutoFlow is a comprehensive workshop management system (bengkel) that provides:

- A **marketing landing page** with hero, services, and live promotional offers
- A **customer dashboard** for vehicle management and service history
- A **admin/mechanic CMS** for managing services, inventory, and analytics
- **Role-based access control** (CUSTOMER · ADMIN · MECHANIC)
- **Real-time inventory** with automatic stock deduction on service creation
- **JWT authentication** with edge-compatible middleware

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 15 (App Router)                  │
│                                                                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  (marketing)/   │  │  (dashboard)/    │  │   (admin)/     │ │
│  │  Landing Page   │  │  Customer Portal │  │  Admin CMS     │ │
│  │  + PromoSection │  │  Vehicles        │  │  Inventory     │ │
│  │  + HeroSection  │  │  Service History │  │  Services      │ │
│  └────────┬────────┘  └────────┬─────────┘  └───────┬────────┘ │
│           │                    │                     │          │
│  ┌────────▼────────────────────▼─────────────────────▼────────┐ │
│  │                     API Routes (/api/*)                    │ │
│  │  auth · register · vehicles · inventory · services · promos│ │
│  └────────────────────────────┬───────────────────────────────┘ │
│                               │                                  │
│  ┌────────────────────────────▼───────────────────────────────┐ │
│  │            Prisma Client v7 + @prisma/adapter-pg           │ │
│  └────────────────────────────┬───────────────────────────────┘ │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │   PostgreSQL 16       │
                    │   Database: autoflow  │
                    └──────────────────────┘

Edge Runtime (Middleware):
  src/middleware.ts ──► src/lib/auth-edge.ts (JWT-only, no DB)
```

**Route Groups:**
```
src/app/
├── (marketing)/          → Public marketing site
│   ├── layout.tsx        → Navbar + Footer wrapper
│   └── page.tsx          → Home (SSR, fetches promos from DB)
├── (dashboard)/          → Customer portal (auth-protected)
│   ├── layout.tsx        → Sidebar + Header
│   └── dashboard/        → Customer dashboard, vehicles, services
├── (admin)/              → Admin/Mechanic CMS (ADMIN role required)
│   ├── layout.tsx        → Admin sidebar
│   └── admin/            → Dashboard, inventory, services
└── api/                  → REST API endpoints
```

---

## Features

### Customer Portal
- 🏠 **Landing page** — Hero, services overview, live promo cards
- 🚗 **Vehicle management** — Add and track your vehicles
- 🔧 **Service history** — Animated timeline of all past services
- 🔐 **Auth** — Register/login with bcrypt-hashed passwords

### Admin & Mechanic CMS
- 📊 **Analytics dashboard** — KPI cards + 6-month revenue chart (Recharts)
- 📦 **Inventory management** — Real-time stock editing, category filters, low-stock alerts
- ➕ **Service entry** — 3-step multi-part form with transactional stock deduction
- 📋 **Services list** — Full service records with status tracking
- ⚠️ **Low-stock alerts** — Items at or below minimum threshold are highlighted

### Security & Infrastructure
- 🔒 **Role-based auth** — CUSTOMER, ADMIN, MECHANIC via NextAuth.js v5 JWT
- 🌐 **Edge middleware** — Route protection without DB calls in middleware
- ✅ **Type-safe API** — Full TypeScript coverage with Zod validation
- 🔄 **Transactions** — Service creation atomically deducts inventory stock

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| ORM | Prisma v7 + `@prisma/adapter-pg` |
| Database | PostgreSQL 16 |
| Auth | NextAuth.js v5 beta (JWT, Credentials) |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table v8 |
| Charts | Recharts v3 |
| Animations | Framer Motion v12 |
| Runtime | Node.js v20+ |

---

## Quick Start

### Prerequisites

- Node.js 20+ (tested on v25)
- PostgreSQL 16 running locally
- npm 10+

### 1. Clone and install

```bash
git clone <repo-url>
cd automotive-website-project
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your database credentials and a generated AUTH_SECRET
```

Generate a secure `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Setup the database

```bash
# Create the database
createdb autoflow

# Run migrations
npm run db:migrate

# Seed with test data
npm run db:seed
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Generate Prisma client + production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema changes without migration |
| `npm run db:migrate` | Run migrations (interactive) |
| `npm run db:seed` | Seed database with test data |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## Environment Variables

Create a `.env` file in the project root:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/autoflow?schema=public"

# NextAuth base URL (change in production)
NEXTAUTH_URL="http://localhost:3000"

# Random secret for JWT signing — generate with: openssl rand -base64 32
AUTH_SECRET="your-generated-secret-here"
```

> **Note:** In production, use a strong `AUTH_SECRET` and point `DATABASE_URL` to your hosted PostgreSQL (e.g. Neon, Supabase, Railway).

---

## Database Schema

```
User
├── id, name, email, password (bcrypt), phone
├── role: CUSTOMER | ADMIN | MECHANIC
└── → vehicles[], serviceRecords[] (as mechanic), accounts[], sessions[]

Vehicle
├── id, licensePlate (unique), brand, model, year, color, engineCC, notes
└── → serviceRecords[]

ServiceRecord
├── id, date, mileage, description, totalCost (Decimal), status, notes
├── status: PENDING | IN_PROGRESS | COMPLETED | CANCELLED
└── → serviceItems[], vehicle, mechanic (User)

Inventory
├── id, itemCode (unique), name, category, stockQuantity, minimumThreshold
├── price (Decimal), unit, description
├── category: OIL | FILTER | BRAKE | ELECTRICAL | BODY | ENGINE | TRANSMISSION | COOLING | EXHAUST | OTHER
└── → serviceItems[]

ServiceItem
├── id, quantity, unitPrice (Decimal)
└── → serviceRecord, inventory

Promo
└── id, title, image, description, discount (%), validUntil, isActive
```

---

## API Reference

All API responses are JSON. Protected routes require a valid session cookie (set by NextAuth after login).

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/promos` | Public | List active, non-expired promos |
| `POST` | `/api/register` | Public | Register new CUSTOMER user |
| `GET` | `/api/vehicles` | Customer+ | Get current user's vehicles |
| `POST` | `/api/vehicles` | Customer+ | Add a vehicle to current user |
| `GET` | `/api/vehicles/all` | Admin/Mech | Get all vehicles with owner info |
| `GET` | `/api/inventory` | Any auth | List all inventory items |
| `POST` | `/api/inventory` | Admin/Mech | Create inventory item |
| `PATCH` | `/api/inventory/[id]` | Admin/Mech | Update stock, price, threshold |
| `DELETE` | `/api/inventory/[id]` | Admin | Delete inventory item |
| `GET` | `/api/services` | Admin/Mech | List all service records |
| `POST` | `/api/services` | Admin/Mech | Create service + deduct stock (transaction) |
| `GET` | `/api/services/[id]` | Admin/Mech | Get single service record |
| `PATCH` | `/api/services/[id]` | Admin/Mech | Update service status |

---

## Test Accounts

Seeded by `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@autoflow.id` | `admin123456` |
| Mechanic | `mekanik@autoflow.id` | `mechanic123456` |
| Customer | `pelanggan@autoflow.id` | `customer123456` |

**Route access:**
- `/` — public marketing page
- `/dashboard` — requires login (any role)
- `/admin` — requires ADMIN role

---

## Deployment

### Vercel + Neon PostgreSQL (Recommended)

1. **Create a Neon database** at [neon.tech](https://neon.tech) and copy the connection string.

2. **Deploy to Vercel:**
   ```bash
   npx vercel
   ```

3. **Set environment variables** in Vercel dashboard:
   - `DATABASE_URL` — your Neon connection string (with `?sslmode=require`)
   - `NEXTAUTH_URL` — your production URL (e.g. `https://autoflow.vercel.app`)
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`

4. **Run migrations against production DB:**
   ```bash
   DATABASE_URL="<neon-url>" npx prisma migrate deploy
   DATABASE_URL="<neon-url>" npm run db:seed
   ```

### Docker (Self-hosted)

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

---

## Troubleshooting

### `PrismaClientInitializationError` — needs adapter
Prisma v7 requires an adapter. Ensure `src/lib/prisma.ts` uses `PrismaPg` adapter and your seed file imports it the same way.

### Cannot connect to database
```bash
pg_isready              # Check if PostgreSQL is running
brew services start postgresql@16   # Start on macOS
createdb autoflow       # Create the database
```

### `AUTH_SECRET` not set
Generate one with `openssl rand -base64 32` and add it to `.env`.

### Build fails with TypeScript errors
```bash
npm run db:generate     # Regenerate Prisma types
npm run build           # Rebuild
```

### Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill   # Kill process on port 3000
npm run dev
```


### Authentication & Security
- Role-based access control: CUSTOMER, ADMIN, MECHANIC
- Middleware protection for `/admin` and `/dashboard` routes
- Edge-compatible middleware (no Prisma in edge runtime)
- Secure password hashing with bcrypt

## Project Structure

```
src/
├── app/
│   ├── (marketing)/         # Public landing pages
│   ├── (dashboard)/         # Customer portal (auth required)
│   ├── (admin)/             # Admin/Mechanic CMS (auth + role required)
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   └── api/                 # API routes
│       ├── auth/[...nextauth]/
│       ├── register/
│       ├── vehicles/
│       ├── inventory/
│       └── services/
├── components/
│   ├── marketing/           # Landing page components
│   ├── dashboard/           # Customer dashboard components
│   └── admin/               # Admin CMS components
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── auth.ts              # NextAuth configuration
│   └── auth-edge.ts         # Edge-compatible auth for middleware
└── middleware.ts            # Route protection middleware
```

## Database Schema

- **User** - CUSTOMER, ADMIN, MECHANIC roles
- **Vehicle** - linked to User with license plate, brand, model, year
- **ServiceRecord** - linked to Vehicle and Mechanic with status tracking
- **Inventory** - stock opname with minimum threshold alerts
- **ServiceItem** - join table for ServiceRecord ↔ Inventory (tracks parts used)
- **Promo** - promotional campaigns
