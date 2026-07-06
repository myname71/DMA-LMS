# JWT Authentication Setup Guide

## Overview
Your DMA-LMS now has **JWT-based authentication** with **MySQL + Prisma** integration, completely independent of `db_state.json`.

## What Was Added

### 1. **JWT Utilities** (`lib/jwtAuth.ts`)
- `signToken()` - Create JWT tokens
- `verifyToken()` - Validate and decode tokens
- `hashPassword()` - Hash passwords with bcryptjs
- `comparePassword()` - Verify passwords
- `generateAuthTokens()` - Generate complete auth tokens

### 2. **Auth Middleware** (`middleware/jwtAuthMiddleware.ts`)
- `authMiddleware` - Verify JWT from cookies or Authorization headers
- `roleMiddleware()` - Role-based access control
- Role hierarchy: `student < instructor < admin < super_admin`
- Helper functions: `adminMiddleware`, `instructorMiddleware`, `superAdminMiddleware`

### 3. **Auth Controller** (`controllers/authController.ts`)
**Functions:**
- `register()` - Register new users to MySQL
- `login()` - Authenticate with email/password
- `logout()` - Clear JWT cookie
- `me()` - Get current authenticated user
- `refreshToken()` - Refresh expired tokens
- `changePassword()` - Change user password

**Key Features:**
- ✅ MySQL-only (no db_state dependency)
- ✅ HTTP-only cookies (XSS protection)
- ✅ Password hashing with bcryptjs
- ✅ Account suspension checks
- ✅ Approval workflow for instructors

### 4. **Auth Routes** (`routes/authRoutes.ts`)
```
POST   /auth/register          - Public
POST   /auth/login             - Public
POST   /auth/logout            - Protected
GET    /auth/me                - Protected
POST   /auth/refresh           - Protected
POST   /auth/change-password   - Protected
```

### 5. **Server Integration** (`server.ts`)
- Routes mounted at `/auth` prefix
- Backward compatible with existing API

---

## Testing the Authentication

### Prerequisites
1. **MySQL is running** and configured in `.env`
2. **JWT_SECRET is set** in `.env`:
   ```bash
   JWT_SECRET=your-long-random-secret-key-here
   ```
   Generate one:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

3. **Start the server:**
   ```bash
   npm install    # Install dependencies (if not done)
   npm run dev    # Start development server
   ```

---

## API Testing Examples

### 1️⃣ **Register a New User**
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "student"
  }'
```

**Response:**
```json
{
  "status": "success",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "isApproved": true,
    "joinedAt": "2026-07-06T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

✅ **Token is stored in HTTP-only cookie automatically**

---

### 2️⃣ **Login with Email & Password**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "status": "success",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "suspended": false,
    "isApproved": true
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 3️⃣ **Get Current User (Protected)**
```bash
curl -X GET http://localhost:5000/auth/me \
  -H "Cookie: dma_token=YOUR_JWT_TOKEN_HERE"
```

OR with Authorization header:
```bash
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Response:**
```json
{
  "status": "success",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "suspended": false,
    "isApproved": true
  }
}
```

---

### 4️⃣ **Refresh Token (Protected)**
```bash
curl -X POST http://localhost:5000/auth/refresh \
  -H "Cookie: dma_token=YOUR_JWT_TOKEN_HERE"
```

**Response:**
```json
{
  "status": "success",
  "message": "Token refreshed",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 5️⃣ **Change Password (Protected)**
```bash
curl -X POST http://localhost:5000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Cookie: dma_token=YOUR_JWT_TOKEN_HERE" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

---

### 6️⃣ **Logout (Protected)**
```bash
curl -X POST http://localhost:5000/auth/logout \
  -H "Cookie: dma_token=YOUR_JWT_TOKEN_HERE"
```

**Response:**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

Cookie is cleared automatically.

---

## Error Responses

### 400 - Bad Request
```json
{
  "error": "name and email are required"
}
```

### 401 - Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 - Forbidden
```json
{
  "error": "Account pending approval. Contact your administrator."
}
```

### 409 - Conflict
```json
{
  "error": "Email already registered"
}
```

### 503 - Service Unavailable
```json
{
  "error": "Database not available. Please check your MySQL connection."
}
```

---

## Key Security Features

✅ **HTTP-Only Cookies** - Prevents XSS attacks  
✅ **Password Hashing** - bcryptjs with 10 salt rounds  
✅ **JWT Expiration** - 7-day tokens  
✅ **Role-Based Access** - Hierarchical permissions  
✅ **MySQL Storage** - Persistent, secure database  
✅ **Account Approval Workflow** - Instructors require admin approval  
✅ **Suspension Checks** - Prevent suspended users from logging in  
✅ **Token Refresh** - Rotate tokens without re-login  

---

## Environment Variables Required

```bash
# .env file
NODE_ENV=development
PORT=5000
JWT_SECRET=your-long-random-secret-key-here
MYSQL_DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE

# Email (optional, for notifications)
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
SMTP_HOST=smtp.example.com
SMTP_PORT=465
EMAIL_FROM_NAME=DMA Academy

# Google Gemini (optional, for AI tutor)
GEMINI_API_KEY=your-gemini-api-key
```

---

## Database Schema

Your existing `appUser` table should have these columns:
- `id` (INT, PRIMARY KEY)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR, hashed)
- `role` (VARCHAR: student/instructor/admin/super_admin)
- `isApproved` (BOOLEAN)
- `suspended` (BOOLEAN)
- `avatar` (VARCHAR, nullable)
- `joinedAt` (DATETIME)
- And other fields as needed

---

## Troubleshooting

### "Database not available" Error
✅ Check MySQL connection in `.env`
✅ Verify `MYSQL_DATABASE_URL` format
✅ Ensure MySQL service is running

### "Invalid or expired token"
✅ Token may have expired (7-day limit)
✅ Use `/auth/refresh` to get a new token
✅ Check cookie is being sent with requests

### "Account pending approval"
✅ Instructor accounts require admin approval
✅ Admin logs in to approve instructors at `/api/admin/approve-instructor`

### "Account suspended"
✅ User account has been suspended by admin
✅ Admin can unsuspend at `/api/admin/users/:id/suspend`

---

## Next Steps

1. ✅ **Run the server:** `npm run dev`
2. ✅ **Test all endpoints** using the examples above
3. ✅ **Integrate with frontend** - Update login/signup forms to use `/auth/*` endpoints
4. ✅ **Monitor logs** - Check console for any errors
5. ✅ **Deploy** - When ready, deploy to production with proper `.env` config

---

## Support

For issues or questions:
- Check server logs: `npm run dev`
- Verify MySQL is running
- Ensure JWT_SECRET is set
- Check `.env` configuration

**Happy authenticating! 🎓**
