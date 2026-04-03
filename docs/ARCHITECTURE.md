# System Architecture

Deep-dive into the AutoFlow system design, component hierarchy, and data flow.

---

## High-Level Architecture

```
                    ┌─────────────────────────────────────┐
                    │           Browser / Client           │
                    └─────────────────┬───────────────────┘
                                      │ HTTPS
                    ┌─────────────────▼───────────────────┐
                    │          Next.js 15 Server           │
                    │  ┌─────────────────────────────────┐ │
                    │  │  Edge Runtime (Middleware)       │ │
                    │  │  src/middleware.ts               │ │
                    │  │  → JWT verification only         │ │
                    │  │  → Route protection & redirect   │ │
                    │  └─────────────┬───────────────────┘ │
                    │                │ Allowed              │
                    │  ┌─────────────▼───────────────────┐ │
                    │  │    Node.js Runtime (App Router)  │ │
                    │  │                                  │ │
                    │  │  Server Components (RSC)         │ │
                    │  │  → Fetch data from Prisma        │ │
                    │  │  → Render to HTML                │ │
                    │  │                                  │ │
                    │  │  API Routes (/api/*)             │ │
                    │  │  → Auth via NextAuth session     │ │
                    │  │  → CRUD via Prisma               │ │
                    │  │  → JSON responses                │ │
                    │  │                                  │ │
                    │  │  Client Components ("use client")│ │
                    │  │  → Forms, charts, tables         │ │
                    │  │  → React state & animations      │ │
                    │  └─────────────┬───────────────────┘ │
                    └────────────────┼────────────────────┘
                                     │ TCP
                    ┌────────────────▼────────────────────┐
                    │         Prisma v7 Client             │
                    │         @prisma/adapter-pg           │
                    └────────────────┬────────────────────┘
                                     │
                    ┌────────────────▼────────────────────┐
                    │          PostgreSQL 16               │
                    │          Database: autoflow          │
                    └─────────────────────────────────────┘
```

---

## Route Structure

```
src/app/
│
├── layout.tsx                     # Root layout (html, body)
│
├── (marketing)/                   # Route group: public marketing
│   ├── layout.tsx                 # Navbar + Footer
│   └── page.tsx                   # /  (SSR — fetches promos from Prisma)
│
├── (auth)/                        # Route group: auth pages
│   ├── login/page.tsx             # /login
│   └── register/page.tsx          # /register
│
├── (dashboard)/                   # Route group: customer portal
│   ├── layout.tsx                 # Sidebar + Header (checks auth)
│   └── dashboard/
│       ├── page.tsx               # /dashboard (SSR — vehicles, services)
│       ├── services/page.tsx      # /dashboard/services
│       └── vehicles/add/page.tsx  # /dashboard/vehicles/add
│
├── (admin)/                       # Route group: admin CMS
│   ├── layout.tsx                 # Admin sidebar (checks ADMIN role)
│   └── admin/
│       ├── page.tsx               # /admin (SSR — analytics, KPIs)
│       ├── inventory/page.tsx     # /admin/inventory (SSR)
│       └── services/
│           ├── page.tsx           # /admin/services (SSR)
│           └── new/page.tsx       # /admin/services/new
│
└── api/
    ├── auth/[...nextauth]/route.ts  # NextAuth handlers
    ├── register/route.ts
    ├── promos/route.ts
    ├── vehicles/
    │   ├── route.ts
    │   └── all/route.ts
    ├── inventory/
    │   ├── route.ts
    │   └── [id]/route.ts
    └── services/
        ├── route.ts
        └── [id]/route.ts
```

---

## Component Tree

```
RootLayout
├── (marketing) Layout
│   ├── Navbar
│   ├── HomePage
│   │   ├── HeroSection           [client — animations]
│   │   ├── ServicesSection       [client — animations]
│   │   └── PromoSection          [client — Framer Motion cards]
│   └── Footer
│
├── (dashboard) Layout
│   ├── DashboardSidebar          [client — mobile toggle]
│   ├── DashboardHeader           [client — user menu]
│   └── DashboardPage             [server — Prisma queries]
│       ├── VehicleCard           [client — hover effects]
│       └── ServiceTimeline       [client — animations]
│
├── (admin) Layout
│   ├── AdminSidebar              [client — active links]
│   └── AdminDashboardPage        [server — Prisma queries]
│       ├── AdminAnalytics        [client — Recharts bar chart]
│       ├── InventoryTable        [client — TanStack Table + editing]
│       └── ServiceForm           [client — React Hook Form, multi-step]
│
└── LoginPage / RegisterPage      [client — React Hook Form + Zod]
```

---

## Authentication Flow

```
User submits credentials
        │
        ▼
POST /api/auth/callback/credentials
        │
        ▼
NextAuth CredentialsProvider.authorize()
        │
        ├── prisma.user.findUnique({ email })
        ├── bcrypt.compare(password, hash)
        └── return { id, email, name, role }
        │
        ▼
JWT callback: { token.id = user.id, token.role = user.role }
        │
        ▼
Session callback: { session.user.id, session.user.role }
        │
        ▼
Browser receives session cookie (next-auth.session-token)
        │
        ▼
Middleware reads JWT (edge-compatible, no DB)
        │
        ├── /admin → requires role === "ADMIN"
        ├── /dashboard → requires isLoggedIn
        └── /login|register → redirect if already logged in
```

---

## Data Flow: Create Service Record

```
Admin fills ServiceForm (client component)
        │
        ▼ POST /api/services
API Route: auth check (ADMIN | MECHANIC)
        │
        ▼
prisma.$transaction(async (tx) => {
  // 1. Validate stock for each part
  for (part of parts) {
    inventory = tx.inventory.findUnique(part.inventoryId)
    if (inventory.stockQuantity < part.quantity) throw Error
  }
  // 2. Create ServiceRecord
  serviceRecord = tx.serviceRecord.create(...)
  // 3. Create ServiceItems + deduct stock
  for (part of parts) {
    tx.serviceItem.create({ serviceRecordId, ...part })
    tx.inventory.update({ decrement: part.quantity })
  }
  return serviceRecord
})
        │
        ├── Success: 201 + serviceRecord JSON
        └── Failure: 500 + error message (transaction rolled back)
```

---

## Key Libraries & Patterns

### Prisma v7 Driver Adapter Pattern
Unlike Prisma v5/v6, Prisma v7 requires an explicit driver adapter. The `PrismaPg` adapter wraps the `pg` library:
```typescript
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
```
The datasource URL is no longer in `schema.prisma` — it lives in `prisma.config.ts` (for CLI tools) and in the adapter constructor (for runtime).

### Edge-Compatible Auth
The middleware uses a separate auth config (`src/lib/auth-edge.ts`) that does NOT import Prisma or bcrypt. This is required because Next.js middleware runs in the Edge Runtime which doesn't support Node.js-specific modules.

### Server Components as Data Layer
Admin and dashboard pages are React Server Components (RSC) that query Prisma directly — no separate API call needed for page loads. Only mutations go through API routes.

### TanStack Table for Inventory
The `InventoryTable` component uses TanStack Table v8 with inline editing cells. Stock and price updates hit `PATCH /api/inventory/[id]` via `fetch()`.

### Zod v4 Validation
Forms use Zod v4 for schema definition and `@hookform/resolvers` to bridge React Hook Form. Zod is also used in API routes for request body validation.
