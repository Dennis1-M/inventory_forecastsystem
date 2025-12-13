# Authentication System Setup Guide

## Overview

The Inventory Forecast System now has a complete role-based authentication system with a 4-level hierarchy:

```
SuperAdmin (👑)
  ├── Admin (⚙️)
  │   ├── Manager (📦)
  │   └── Staff (👷)
```

## Authentication Flow

### 1. First-Time Setup (SuperAdmin Registration)

**URL:** `/auth/register-superadmin`

The system checks if a SuperAdmin exists:
- If **NO SuperAdmin exists**: Users are directed to the SuperAdmin registration page
- If **SuperAdmin exists**: Users are directed to login

**What SuperAdmin can do:**
- Register Admin accounts
- Register Manager accounts
- Register Staff accounts
- Access full system administration dashboard
- View all users in the system

### 2. Login

**URL:** `/login` or `/auth/login`

Demo credentials:
- **Email:** admin@example.com
- **Password:** admin123

Login redirects based on role:
- SuperAdmin → `/admin/dashboard`
- Admin → `/admin/dashboard`
- Manager → `/manager/dashboard`
- Staff → `/staff/dashboard`

### 3. User Registration (SuperAdmin/Admin Only)

**URL:** `/auth/register-user` or `/admin/create-user`

**SuperAdmin can register:**
- Admin accounts
- Manager accounts
- Staff accounts

**Admin can register:**
- Manager accounts
- Staff accounts

**Features:**
- Real-time success feedback
- Session-based user registration list
- Email uniqueness validation
- Password strength requirements (6+ characters)
- Role-based descriptions

### 4. User Management (SuperAdmin Only)

**URL:** `/admin/users`

SuperAdmin can:
- View all registered users
- Search users by name/email
- Filter by role
- See user creation dates
- See who created each user
- View user status (Active/Inactive)

## API Endpoints

All endpoints are protected with JWT authentication (except login and check-superadmin).

### Authentication Endpoints

```
POST /api/auth/login
Request: { email, password }
Response: { token, user: { id, name, email, role } }

GET /api/auth/check-superadmin
Response: { exists: boolean }

POST /api/auth/register-superadmin
Request: { name, email, password }
Response: { token, user, message }

POST /api/auth/register
Headers: { Authorization: Bearer <token> }
Request: { name, email, password, role }
Response: { user, message }

GET /api/auth/me
Headers: { Authorization: Bearer <token> }
Response: { user: { id, name, email, role } }

GET /api/users
Headers: { Authorization: Bearer <token> }
Response: { data: [users] }
```

## Frontend Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/auth/login` - Login page (alternate)
- `/auth/register-superadmin` - SuperAdmin registration

### Protected Routes (All authenticated users)
- `/products` - Product catalog
- `/inventory/history` - Inventory history

### Admin Routes (SuperAdmin & Admin)
- `/admin/dashboard` - Main dashboard
- `/admin/create-user` - Register new user
- `/auth/register-user` - Register new user
- `/admin/users` - User management
- `/admin/receive-stock` - Stock receipt
- `/admin/forecast` - Forecasting analytics

### Manager Routes
- `/manager/dashboard` - Manager dashboard

### Staff Routes
- `/staff/dashboard` - Staff dashboard
- `/staff/restock` - Restocking page

## Database Schema

### User Model
```prisma
model User {
  id                  Int
  name                String
  email               String (unique)
  password            String (hashed with bcrypt)
  role                Role (SUPERADMIN | ADMIN | MANAGER | STAFF)
  createdBy           Int? (reference to User who created this user)
  isActive            Boolean (default: true)
  createdAt           DateTime
  updatedAt           DateTime
  
  relationships:
  - createdByUser: User (who created this user)
  - registeredUsers: User[] (users created by this user)
  - sales: Sale[]
  - inventoryMovements: InventoryMovement[]
}
```

## Security Features

1. **JWT Tokens**
   - Expiration: 7 days
   - Stored in localStorage
   - Validated on every protected route

2. **Password Hashing**
   - Bcrypt with salt rounds: 10
   - Never stored in plain text

3. **Role-Based Access Control (RBAC)**
   - Each route checks user role
   - Users can only see appropriate dashboards
   - SuperAdmin acts as system administrator

4. **Authorization Checks**
   - SuperAdmin can create any role
   - Admins can only create Manager/Staff
   - Managers/Staff cannot create users

5. **Email Uniqueness**
   - Prevents duplicate email registration
   - Database constraint at schema level

## Frontend Components

### AuthLogin.jsx
- Modern login UI with email/password
- Password visibility toggle
- Demo credentials display
- Shows warning if SuperAdmin doesn't exist
- Redirects to register-superadmin if needed

### AuthRegisterSuperAdmin.jsx
- First-time setup for system
- Password confirmation
- Only available if no SuperAdmin exists
- Auto-redirects if SuperAdmin found

### RegisterUser.jsx
- Create new team members
- Role selection with descriptions
- Real-time success feedback
- Session-based registration history
- Only accessible to SuperAdmin/Admin

### UserManagement.jsx
- SuperAdmin-only user viewing
- Search and filter capabilities
- User status indicators
- Role badges with icons
- Account creation tracking

### PrivateRoute.jsx
- Route protection component
- Accepts single role or array of roles
- Redirects to login if no token
- Redirects to home if insufficient permission

## Common Tasks

### Register First SuperAdmin
1. Go to `/auth/register-superadmin`
2. Enter name, email, password
3. Click "Create SuperAdmin Account"
4. You're automatically logged in and redirected to dashboard

### Login as SuperAdmin
1. Go to `/login`
2. Enter credentials
3. Click "Sign In"
4. Redirected to `/admin/dashboard`

### Create Admin Account (as SuperAdmin)
1. Go to `/auth/register-user`
2. Select "ADMIN" role
3. Enter admin details
4. Click "Register User"
5. New admin can now login

### Create Manager/Staff Account (as Admin)
1. Go to `/auth/register-user`
2. Select "MANAGER" or "STAFF" role
3. Enter user details
4. Click "Register User"

### View All Users (as SuperAdmin)
1. Go to `/admin/users`
2. Use search and filters
3. See all registered users and their details

## Testing Workflow

1. **Clear localStorage** (simulates first-time setup)
   - Open browser DevTools → Application → localStorage
   - Clear all items

2. **Register SuperAdmin**
   - Navigate to `http://localhost:5174`
   - System detects no SuperAdmin, redirects to register
   - Register with: name, email, password
   - Automatically logged in

3. **Create Admin**
   - Go to `/auth/register-user`
   - Register admin with role: ADMIN
   - Share admin credentials

4. **Login as Admin**
   - Logout (clears localStorage)
   - Login with admin credentials
   - Redirected to `/admin/dashboard`

5. **Create Manager/Staff**
   - Go to `/auth/register-user`
   - Create manager/staff accounts
   - Share credentials

6. **Test Role-Based Access**
   - Logout, login as manager
   - Should only access manager dashboard
   - Cannot access admin routes

## Environment Variables

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="supersecretkey123"
JWT_EXPIRES_IN="7d"
PORT=5001
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5001
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Email already exists" | Use different email or check if user already registered |
| "You must be logged in" | Token expired, need to login again |
| "Invalid role" | Only use: ADMIN, MANAGER, STAFF |
| "Admin can only register MANAGER or STAFF" | Only SuperAdmin can create Admin accounts |
| Cannot access admin dashboard as Manager | Correct behavior - managers use `/manager/dashboard` |
| Redirects to login on every page reload | Clear console errors, check token in localStorage |

## Files Created/Modified

### New Files
- `frontend/src/pages/AuthLogin.jsx` - Login page
- `frontend/src/pages/AuthRegisterSuperAdmin.jsx` - SuperAdmin registration
- `frontend/src/pages/RegisterUser.jsx` - User registration
- `frontend/src/pages/UserManagement.jsx` - User management dashboard

### Modified Files
- `frontend/src/App.jsx` - Updated routes for new pages
- `frontend/src/components/PrivateRoute.jsx` - Updated to support role arrays
- `frontend/src/store/auth.js` - Added SUPERADMIN redirect, store user info
- `Backend/controllers/authController.js` - Already has all needed endpoints
- `Backend/routes/authRoutes.js` - Already configured for new flows

## Next Steps

1. Test the complete authentication flow
2. Customize branding/colors as needed
3. Add password reset functionality
4. Add user profile pages
5. Implement 2FA (optional)
6. Add audit logging for user actions
