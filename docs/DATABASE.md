# Database Documentation

Schema reference, ER diagram, and migration guide for AutoFlow.

---

## Database

- **Engine:** PostgreSQL 16
- **Database name:** `autoflow`
- **Schema:** `public`
- **ORM:** Prisma v7 with `@prisma/adapter-pg` (driver adapter pattern)

---

## ER Diagram

```
┌─────────────────────┐         ┌──────────────────────────┐
│        User         │         │         Account          │
├─────────────────────┤         ├──────────────────────────┤
│ id (PK, cuid)       │◄────────│ userId (FK)              │
│ name                │         │ provider                 │
│ email (unique)      │         │ providerAccountId        │
│ password            │         │ type, tokens...          │
│ phone               │         └──────────────────────────┘
│ role (enum)         │
│ createdAt, updatedAt│         ┌──────────────────────────┐
└──────────┬──────────┘         │         Session          │
           │                   ├──────────────────────────┤
           │ 1:N               │ sessionToken (unique)    │
           ▼                   │ userId (FK)              │
┌──────────────────────┐       │ expires                  │
│       Vehicle        │       └──────────────────────────┘
├──────────────────────┤
│ id (PK, cuid)        │
│ licensePlate (unique)│
│ brand, model, year   │
│ color, engineCC      │
│ notes                │
│ userId (FK)          │
│ createdAt, updatedAt │
└──────────┬───────────┘
           │ 1:N
           ▼
┌───────────────────────────┐       ┌────────────────────────┐
│       ServiceRecord       │       │          User          │
├───────────────────────────┤       │ (mechanic role)        │
│ id (PK, cuid)             │       └────────────┬───────────┘
│ date                      │                    │ N:1
│ mileage                   │◄───────────────────┘
│ description (Text)        │ mechanicId (FK, nullable)
│ totalCost (Decimal 12,2)  │
│ status (enum)             │
│ notes (Text, nullable)    │
│ vehicleId (FK)            │
│ mechanicId (FK, nullable) │
│ createdAt, updatedAt      │
└──────────┬────────────────┘
           │ 1:N
           ▼
┌───────────────────────────┐       ┌────────────────────────┐
│       ServiceItem         │       │       Inventory        │
├───────────────────────────┤       ├────────────────────────┤
│ id (PK, cuid)             │       │ id (PK, cuid)          │
│ quantity                  │◄──────│ itemCode (unique)      │
│ unitPrice (Decimal 12,2)  │       │ name                   │
│ serviceRecordId (FK)      │       │ category (enum)        │
│ inventoryId (FK)          │       │ stockQuantity          │
│ createdAt                 │       │ minimumThreshold       │
└───────────────────────────┘       │ price (Decimal 12,2)   │
                                    │ unit, description      │
                                    │ createdAt, updatedAt   │
                                    └────────────────────────┘

┌──────────────────────────┐
│          Promo           │
├──────────────────────────┤
│ id (PK, cuid)            │
│ title                    │
│ image (nullable)         │
│ description (Text)       │
│ discount (Int, nullable) │
│ validUntil               │
│ isActive                 │
│ createdAt, updatedAt     │
└──────────────────────────┘
```

---

## Models

### User

| Column | Type | Notes |
|--------|------|-------|
| `id` | String (cuid) | PK |
| `name` | String? | Display name |
| `email` | String? | Unique |
| `emailVerified` | DateTime? | NextAuth field |
| `image` | String? | Avatar URL |
| `password` | String? | bcrypt hash |
| `phone` | String? | Optional |
| `role` | Role (enum) | Default: CUSTOMER |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto |

**Role enum:** `CUSTOMER`, `ADMIN`, `MECHANIC`

---

### Vehicle

| Column | Type | Notes |
|--------|------|-------|
| `id` | String (cuid) | PK |
| `licensePlate` | String | Unique |
| `brand` | String | e.g. Toyota |
| `model` | String | e.g. Avanza |
| `year` | Int | |
| `color` | String? | |
| `engineCC` | Int? | Engine displacement |
| `notes` | String? | Freeform notes |
| `userId` | String | FK → User (cascade delete) |

---

### ServiceRecord

| Column | Type | Notes |
|--------|------|-------|
| `id` | String (cuid) | PK |
| `date` | DateTime | Default now() |
| `mileage` | Int | Odometer reading |
| `description` | String (Text) | Service description |
| `totalCost` | Decimal(12,2) | Total cost in IDR |
| `status` | ServiceStatus | Default: PENDING |
| `notes` | String? (Text) | Additional notes |
| `vehicleId` | String | FK → Vehicle (cascade) |
| `mechanicId` | String? | FK → User (nullable) |

**ServiceStatus enum:** `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

---

### Inventory

| Column | Type | Notes |
|--------|------|-------|
| `id` | String (cuid) | PK |
| `itemCode` | String | Unique item code |
| `name` | String | Part name |
| `category` | InventoryCategory | Enum |
| `stockQuantity` | Int | Current stock |
| `minimumThreshold` | Int | Alert below this |
| `price` | Decimal(12,2) | Price per unit |
| `unit` | String | Default: "pcs" |
| `description` | String? | Optional desc |

**InventoryCategory enum:** `OIL`, `FILTER`, `BRAKE`, `ELECTRICAL`, `BODY`, `ENGINE`, `TRANSMISSION`, `COOLING`, `EXHAUST`, `OTHER`

---

### ServiceItem

Junction table between `ServiceRecord` and `Inventory`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | String (cuid) | PK |
| `quantity` | Int | Units used |
| `unitPrice` | Decimal(12,2) | Price at time of service |
| `serviceRecordId` | String | FK → ServiceRecord (cascade) |
| `inventoryId` | String | FK → Inventory |

---

### Promo

| Column | Type | Notes |
|--------|------|-------|
| `id` | String (cuid) | PK |
| `title` | String | Promo title |
| `image` | String? | Image URL |
| `description` | String (Text) | Description |
| `discount` | Int? | Percentage discount |
| `validUntil` | DateTime | Expiry date |
| `isActive` | Boolean | Default: true |

---

## Migrations

### Run all pending migrations
```bash
npm run db:migrate
# Prompts for migration name if there are pending schema changes
```

### Create a new migration (dry-run first)
```bash
npx prisma migrate dev --create-only --name <migration-name>
# Review the generated SQL, then apply:
npx prisma migrate dev
```

### Apply migrations in production
```bash
npx prisma migrate deploy
```

### Reset database (⚠️ destroys all data)
```bash
npx prisma migrate reset
```

### View migration history
```bash
ls prisma/migrations/
```

---

## Seeding

The seed script is located at `prisma/seed.ts`. It uses the `PrismaPg` adapter and `dotenv/config` for environment variables.

```bash
npm run db:seed
```

**Creates:**
- 3 users (Admin, Mechanic, Customer)
- 1 vehicle (Toyota Avanza for the customer)
- 8 inventory items across different categories
- 3 promotional offers
- 1 completed service record with parts

To re-run seeding after clearing data:
```bash
npx prisma migrate reset   # Wipes DB and re-runs migrations
npm run db:seed            # Re-seeds
```

---

## Connection Configuration

The project uses Prisma v7 with the driver adapter pattern. Connection is configured in two places:

**`prisma.config.ts`** (for CLI tools like `prisma migrate`, `prisma studio`):
```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

**`src/lib/prisma.ts`** (for the application runtime):
```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
```
