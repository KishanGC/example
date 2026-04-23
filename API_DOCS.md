# 📡 API Documentation — Leftovers to Life

Base URL: `http://localhost:5000`

---

## 🔐 Authentication

All protected routes require the JWT token in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

Token is returned on login and register.

---

## 👤 Auth Routes

### POST `/api/auth/register`
Create a new account.

**Request Body:**
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "min6chars",
  "role": "donor",
  "phone": "+91 9876543210",
  "organization": "Ravi Restaurant",
  "address": "Connaught Place, Delhi"
}
```

**Response `201`:**
```json
{
  "_id": "...",
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "role": "donor",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST `/api/auth/login`
Authenticate user.

**Request Body:**
```json
{
  "email": "ravi@example.com",
  "password": "min6chars"
}
```

**Response `200`:**
```json
{
  "_id": "...",
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "role": "donor",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🍱 Donation Routes

### GET `/api/donations` — Public
Get all donations. Supports query params:
- `?status=available` — Filter by status
- `?foodType=cooked` — Filter by food type

**Response `200`:** Array of donation objects with populated `donor` and `acceptedBy`.

---

### GET `/api/donations/my` — Protected (Donor)
Get the logged-in donor's donations.

---

### GET `/api/donations/analytics` — Protected
Get platform analytics.

**Response `200`:**
```json
{
  "total": 100,
  "available": 40,
  "accepted": 20,
  "completed": 35,
  "organic": 15,
  "totalDonors": 50,
  "totalNGOs": 12,
  "wasteReducedKg": 175
}
```

---

### POST `/api/donations` — Protected (Donor)
Create a new donation.

**Request Body:**
```json
{
  "foodType": "cooked",
  "quantity": "20 portions",
  "description": "Dal rice and sabzi",
  "address": "123 MG Road, Delhi",
  "location": { "lat": 28.6330, "lng": 77.2198 },
  "expiresAt": "2025-12-31T18:00:00Z",
  "isOrganic": false
}
```

`foodType` enum: `cooked | packaged | raw | organic_waste | mixed`

---

### PUT `/api/donations/:id/accept` — Protected (NGO)
NGO accepts a donation.

---

### PUT `/api/donations/:id/reject` — Protected (NGO)
NGO rejects a donation.

---

### PUT `/api/donations/:id/complete` — Protected
Mark donation as completed after pickup.

---

## 👥 User Routes

### GET `/api/users/me` — Protected
Get the current user's profile.

---

### PUT `/api/users/me` — Protected
Update current user's profile.

**Request Body (all optional):**
```json
{
  "name": "Updated Name",
  "phone": "+91 9000000000",
  "address": "New Address",
  "organization": "New Org Name",
  "location": { "lat": 28.7, "lng": 77.1 }
}
```

---

### GET `/api/users` — Protected (Admin only)
Get all users.

---

## 🏢 NGO Routes

### GET `/api/ngos` — Protected
Get all registered NGOs.

### GET `/api/ngos/nearest?lat=28.6&lng=77.2` — Protected
Get nearest NGOs to given coordinates.

### POST `/api/ngos` — Protected (NGO role)
Create or update an NGO profile.

---

## 📦 Data Models

### User
```
_id, name, email, password (hashed), role (donor|ngo|admin),
phone, address, organization, location {lat, lng}, isVerified,
createdAt, updatedAt
```

### Donation
```
_id, donor (ref: User), acceptedBy (ref: User),
foodType (cooked|packaged|raw|organic_waste|mixed),
quantity, description, address, location {lat, lng},
expiresAt, status (available|accepted|completed|expired|rejected),
isOrganic, images[], createdAt, updatedAt
```

---

## 🔢 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🧪 Demo Accounts (after running seed)

| Role | Email | Password |
|------|-------|---------|
| Admin | admin@demo.com | demo1234 |
| Donor | donor@demo.com | demo1234 |
| NGO | ngo@demo.com | demo1234 |
