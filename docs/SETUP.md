# Setup Guide

Detailed step-by-step setup for local development on macOS, Linux, and Windows (WSL2).

---

## Prerequisites

| Requirement | Version | Check |
|-------------|---------|-------|
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |
| PostgreSQL | 14+ (16 recommended) | `psql --version` |
| Git | Any | `git --version` |

---

## macOS Setup

### 1. Install Node.js

Using nvm (recommended):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

Or using Homebrew:
```bash
brew install node@20
```

### 2. Install PostgreSQL

```bash
brew install postgresql@16
brew services start postgresql@16
```

Verify:
```bash
pg_isready   # Should say: /tmp:5432 - accepting connections
```

### 3. Create the database

```bash
createdb autoflow
```

If you need a specific user/password:
```bash
psql postgres
CREATE USER myuser WITH PASSWORD 'mypassword';
CREATE DATABASE autoflow OWNER myuser;
\q
```

---

## Linux (Ubuntu/Debian) Setup

### 1. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install PostgreSQL
```bash
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Create database
```bash
sudo -u postgres createdb autoflow
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

---

## Windows (WSL2) Setup

1. Install WSL2 with Ubuntu from Microsoft Store
2. Inside WSL2, follow the Linux instructions above
3. Clone the repo inside WSL2 (not on Windows filesystem) for best performance

---

## Project Setup

### 1. Clone the repository
```bash
git clone <repo-url>
cd automotive-website-project
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/autoflow?schema=public"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="<run: openssl rand -base64 32>"
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 4. Run database migrations
```bash
npm run db:migrate
# When prompted for migration name, type: initial_schema
```

### 5. Seed the database
```bash
npm run db:seed
```

Expected output:
```
🌱 Seeding database...
✅ Admin created: admin@autoflow.id
✅ Mechanic created: mekanik@autoflow.id
✅ Customer created: pelanggan@autoflow.id
✅ Vehicle created: B 1234 XYZ
✅ Created 8 inventory items
✅ Created 3 promos
✅ Service record created: <id>

🎉 Seeding completed!
```

### 6. Start the development server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Verify Setup

After starting the dev server, verify each layer:

### Check API is responding
```bash
curl http://localhost:3000/api/promos
# Should return JSON array of 3 promos
```

### Check database
```bash
psql -d autoflow -c "SELECT email, role FROM \"User\";"
```

Expected:
```
           email           |   role   
---------------------------+----------
 admin@autoflow.id         | ADMIN
 mekanik@autoflow.id       | MECHANIC
 pelanggan@autoflow.id     | CUSTOMER
```

### Test login
Navigate to [http://localhost:3000/login](http://localhost:3000/login) and log in with:
- Email: `admin@autoflow.id`
- Password: `admin123456`

You should be redirected to `/admin`.

---

## Development Tools

### Prisma Studio (Database GUI)
```bash
npm run db:studio
# Opens at http://localhost:5555
```

### View generated Prisma client types
```bash
cat node_modules/@prisma/client/index.d.ts | head -100
```

### Reset and re-seed
```bash
npx prisma migrate reset   # ⚠️ Destroys all data
npm run db:seed
```

---

## Common Issues

### `createdb: error: database "autoflow" already exists`
That's fine — the database exists. Just run `npm run db:migrate`.

### `Error: connect ECONNREFUSED 127.0.0.1:5432`
PostgreSQL is not running:
```bash
brew services start postgresql@16    # macOS
sudo systemctl start postgresql      # Linux
```

### `Error: P1001: Can't reach database server`
Check your `DATABASE_URL` in `.env`. Common mistake: wrong password or port.

### `PrismaClientInitializationError: needs to be constructed with options`
Prisma v7 requires an adapter. The `src/lib/prisma.ts` already handles this. If seeding fails, ensure `prisma/seed.ts` also uses the `PrismaPg` adapter (it does after our fix).

### Changes to schema not reflected
```bash
npm run db:generate   # Regenerate Prisma client types
```
