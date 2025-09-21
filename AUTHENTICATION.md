# Authentication System

This document describes the authentication system implemented for the Eccentric Car Meta admin panel.

## Overview

The authentication system uses JWT (JSON Web Tokens) to secure the admin panel and protect all admin-related API endpoints.

## Features

- **JWT-based authentication** with 24-hour token expiration
- **Password hashing** using bcryptjs
- **Route protection** for admin pages
- **API endpoint protection** for upload and image management
- **Automatic token validation** and refresh
- **Secure logout** functionality

## Default Credentials

When the system starts for the first time, a default admin user is created:

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change these default credentials in production!

## How to Change Password

1. Log in to the admin panel
2. Use the change password API endpoint (future feature)
3. Or manually update the database

## API Endpoints

### Authentication Routes

- `POST /api/auth/login` - Login with username/password
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/change-password` - Change password (requires authentication)

### Protected Routes

All the following routes now require authentication:

- `POST /api/upload/*` - Image upload endpoints
- `GET /api/images/*` - Image management endpoints
- `DELETE /api/images/*` - Image deletion endpoints

### Public Routes

- `POST /api/search` - Search functionality (remains public)
- `GET /api/health` - Health check

## Frontend Implementation

### Login Page

- Located at `/login`
- Clean, responsive design
- Form validation
- Error handling

### Navigation

- Admin button only shows when authenticated
- Login/Logout buttons based on auth state
- Automatic redirect to login when accessing protected routes

### Route Protection

- Admin page (`/admin`) is protected by middleware
- Automatic redirect to login if not authenticated
- Token validation on page load

## Security Features

1. **JWT Tokens**: Secure, stateless authentication
2. **Password Hashing**: bcryptjs with salt rounds
3. **Token Expiration**: 24-hour automatic expiration
4. **Route Protection**: Middleware-based protection
5. **CORS Configuration**: Proper cross-origin setup
6. **Rate Limiting**: Prevents brute force attacks

## Environment Variables

Add to your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Database Schema

The system creates an `admin_users` table:

```sql
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

Run the authentication test:

```bash
node test-auth.js
```

This will test:
- Login functionality
- Token verification
- Protected route access
- Unauthorized access blocking

## Usage

1. Start the backend server
2. Navigate to the frontend
3. Click "Login" in the navigation
4. Use default credentials: `admin` / `admin123`
5. Access the admin panel
6. Upload and manage images securely

## Security Considerations

- Change default credentials immediately
- Use a strong JWT secret in production
- Consider implementing password complexity requirements
- Add rate limiting for login attempts
- Implement session timeout warnings
- Consider adding two-factor authentication for production use
