# Testing & Verification Instructions

This document provides step-by-step instructions on how to test the authentication system, verify API security, and seed the database.

---

## 1. Database Setup & Seeding

Ensure your PostgreSQL instance is running and your `DATABASE_URL` is set inside `server/.env`.

1. **Run migrations**:
   ```bash
   cd server
   npx prisma migrate dev --name init
   ```
2. **Seed the database**:
   ```bash
   npm run prisma:seed
   ```
   This generates three default test accounts:
   * **Admin User**: `admin@platform.com` (Password: `Password123!`)
   * **Manager User**: `manager@platform.com` (Password: `Password123!`)
   * **Employee User**: `employee@platform.com` (Password: `Password123!`)

---

## 2. Testing via REST Client (curl / Postman)

You can verify the backend endpoints independently using curl or Postman:

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@company.com",
    "password": "Password123!",
    "role": "Manager",
    "phone": "+1234567890",
    "department": "Engineering",
    "designation": "Manager"
  }'
```

### Log In
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@platform.com",
    "password": "Password123!"
  }'
```
*Note: Make sure to extract the `token` from the returned JSON response.*

### Get Current User Profile (Authenticated)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_extracted_jwt_token>"
```

### Update User Profile (Authenticated)
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <your_extracted_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Superuser",
    "phone": "+1999999999",
    "department": "IT Operations"
  }'
```

### Log Out
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer <your_extracted_jwt_token>"
```

---

## 3. UI Verification Flows

1. **Landing Page**: Navigate to `http://localhost:5173`. Scroll down to view Features, Pricing Roadmaps, Testimonials, and Footer.
2. **Registration Flow**:
   * Click **Get Started** or **Sign Up** from the Landing Page.
   * Fill out the form. Try submitting with missing fields or mismatched passwords to observe reactive validation errors.
   * On successful registration, you will be automatically logged in and redirected to `/dashboard`.
3. **Login Flow**:
   * Navigate to `/login`.
   * Submit with invalid credentials to test the toast notifications and API error messages.
   * Log in with one of the seeded accounts (e.g. `admin@platform.com`, `Password123!`).
4. **Dashboard View**:
   * Verify that the header welcome card correctly displays your Full Name, Role, and Department.
   * Look for the active navigation links matching your specific role in the Sidebar.
5. **Profile Editing**:
   * Click **Profile** in the Sidebar.
   * Modify your Full Name or Phone Number and click **Save Changes**.
   * Observe the top-right success toast and watch the Sidebar update in real-time.
