# AutoFlow API Reference

Complete reference for all API endpoints in the AutoFlow system.

---

## Base URL

- **Development:** `http://localhost:3000`
- **Production:** `https://<your-domain>`

## Authentication

AutoFlow uses NextAuth.js v5 with JWT strategy. After login, a session cookie (`next-auth.session-token`) is set automatically by the browser.

Protected endpoints check the session via `auth()` from `@/lib/auth`.

---

## Endpoints

---

### `GET /api/promos`

List active promotional offers.

**Auth required:** No (public)

**Response `200`:**
```json
[
  {
    "id": "cmnj435ig000cng9ancc0d3hn",
    "title": "Ganti Oli Gratis Filter",
    "image": null,
    "description": "Setiap penggantian oli mesin, gratis penggantian filter oli.",
    "discount": 20,
    "validUntil": "2026-04-30T00:00:00.000Z",
    "isActive": true,
    "createdAt": "2026-04-03T16:22:06.761Z",
    "updatedAt": "2026-04-03T16:22:06.761Z"
  }
]
```

**Filters applied:** `isActive: true` AND `validUntil >= now()`

---

### `POST /api/register`

Register a new customer account.

**Auth required:** No (public)

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "08123456789"
}
```

**Response `201`:**
```json
{
  "id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER"
}
```

**Error `400`:** Email already registered or validation failed.

---

### `GET /api/vehicles`

Get vehicles belonging to the currently authenticated user.

**Auth required:** Yes (any role)

**Response `200`:**
```json
[
  {
    "id": "...",
    "licensePlate": "B 1234 XYZ",
    "brand": "Toyota",
    "model": "Avanza",
    "year": 2020,
    "color": "Putih",
    "engineCC": 1500,
    "notes": null
  }
]
```

---

### `POST /api/vehicles`

Add a new vehicle for the current user.

**Auth required:** Yes (any role)

**Request body:**
```json
{
  "licensePlate": "B 5678 ABC",
  "brand": "Honda",
  "model": "Jazz",
  "year": 2022,
  "color": "Hitam",
  "engineCC": 1300
}
```

**Response `201`:** Created vehicle object.

**Error `400`:** License plate already registered.

---

### `GET /api/vehicles/all`

Get all vehicles in the system (admin/mechanic use).

**Auth required:** Yes (ADMIN or MECHANIC)

**Response `200`:** Array of vehicles with nested `user` object (name, email).

---

### `GET /api/inventory`

List all inventory items.

**Auth required:** Yes (any authenticated role)

**Response `200`:**
```json
[
  {
    "id": "...",
    "itemCode": "OIL-001",
    "name": "Oli Mesin Shell Helix Ultra 5W-40",
    "category": "OIL",
    "stockQuantity": 50,
    "minimumThreshold": 10,
    "price": "120000",
    "unit": "ltr",
    "description": null
  }
]
```

> Note: `price` is returned as a string (Prisma Decimal serialization).

---

### `POST /api/inventory`

Create a new inventory item.

**Auth required:** Yes (ADMIN or MECHANIC)

**Request body:**
```json
{
  "itemCode": "OIL-003",
  "name": "Oli Mesin Motul 5100",
  "category": "OIL",
  "stockQuantity": 20,
  "minimumThreshold": 5,
  "price": 95000,
  "unit": "ltr"
}
```

**Response `201`:** Created inventory object.

---

### `PATCH /api/inventory/[id]`

Update an inventory item (stock, price, threshold).

**Auth required:** Yes (ADMIN or MECHANIC)

**Request body (all fields optional):**
```json
{
  "stockQuantity": 100,
  "price": 130000,
  "minimumThreshold": 15,
  "name": "Updated Name"
}
```

**Response `200`:** Updated inventory object.

---

### `DELETE /api/inventory/[id]`

Delete an inventory item.

**Auth required:** Yes (ADMIN only)

**Response `200`:** `{ "success": true }`

**Error `403`:** Only ADMIN can delete items.

---

### `GET /api/services`

List all service records.

**Auth required:** Yes (ADMIN or MECHANIC)

**Response `200`:** Array of service records with nested `vehicle` (+ `user`), `mechanic`, and `serviceItems` (+ `inventory`).

---

### `POST /api/services`

Create a new service record. Atomically deducts stock for each part used.

**Auth required:** Yes (ADMIN or MECHANIC)

**Request body:**
```json
{
  "vehicleId": "...",
  "date": "2026-04-03T00:00:00.000Z",
  "mileage": 50000,
  "description": "Ganti oli + filter",
  "notes": "Kondisi mesin baik",
  "mechanicId": "...",
  "totalCost": 525000,
  "parts": [
    { "inventoryId": "...", "quantity": 4, "unitPrice": 120000 },
    { "inventoryId": "...", "quantity": 1, "unitPrice": 45000 }
  ]
}
```

**Response `201`:** Created service record object.

**Error `500`:** Insufficient stock for a part (stock validation is done inside a transaction).

---

### `GET /api/services/[id]`

Get a single service record by ID.

**Auth required:** Yes (ADMIN or MECHANIC)

**Response `200`:** Full service record with nested relations.

**Error `404`:** Service not found.

---

### `PATCH /api/services/[id]`

Update the status of a service record.

**Auth required:** Yes (ADMIN or MECHANIC)

**Request body:**
```json
{
  "status": "IN_PROGRESS"
}
```

Valid status values: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

**Response `200`:** Updated service record object.

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Human-readable error message"
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request / validation error |
| `401` | Not authenticated |
| `403` | Forbidden (insufficient role) |
| `404` | Resource not found |
| `500` | Internal server error |
