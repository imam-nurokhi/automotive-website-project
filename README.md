# AutoFlow - Sistem Manajemen Bengkel Premium

A comprehensive automotive workshop management system built with **Next.js 15**, **Tailwind CSS**, **Prisma ORM**, **PostgreSQL**, and **NextAuth.js**.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Prisma ORM v7** + PostgreSQL
- **NextAuth.js v5** (credentials provider + JWT)
- **Framer Motion** (animations)
- **Recharts** (analytics charts)
- **TanStack Table** (data tables)
- **React Hook Form** + **Zod** (form validation)

## Features

### Customer Portal
- Landing page with hero section, service status search, promo cards, services
- Customer dashboard with vehicle management
- Service history animated timeline
- Register/Login with secure authentication

### Admin & Mechanic CMS
- Admin dashboard with KPI cards (Bento-style) and revenue analytics chart
- Inventory management with inline stock editing, search, category filter, low-stock alerts
- New service entry with 3-step multi-step form
- Transactional stock deduction when logging a service
- Services listing with status tracking

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

## Getting Started

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL and AUTH_SECRET
   ```

3. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

4. **Seed the database:**
   ```bash
   npm run db:seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

## Test Accounts (after seeding)

| Role     | Email                     | Password         |
|----------|---------------------------|------------------|
| Admin    | admin@autoflow.id         | admin123456      |
| Mechanic | mekanik@autoflow.id       | mechanic123456   |
| Customer | pelanggan@autoflow.id     | customer123456   |

## Key Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database (no migration)
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```
