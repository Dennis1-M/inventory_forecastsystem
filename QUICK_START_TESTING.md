# Quick Start - Authentication Testing

## System Endpoints

**Backend:** `http://localhost:5001`
**Frontend:** `http://localhost:5174`

## Step 1: Clear Everything (Fresh Start)

1. Open browser DevTools (F12)
2. Go to **Application** → **Local Storage**
3. Select `http://localhost:5174`
4. Click **Clear All**

## Step 2: First-Time SuperAdmin Registration

1. Go to `http://localhost:5174`
2. System automatically redirects to `/auth/register-superadmin`
3. Fill in:
   - **Full Name:** John Doe
   - **Email:** john@company.com
   - **Password:** Password123
   - **Confirm Password:** Password123
4. Click **"Create SuperAdmin Account"**
5. ✅ Automatically logged in → redirected to `/admin/dashboard`

## Step 3: Create Admin Account

1. Click **"Register User"** in sidebar
2. Fill in:
   - **Full Name:** Sarah Admin
   - **Email:** sarah@company.com
   - **Role:** ADMIN
   - **Password:** Admin123
   - **Confirm Password:** Admin123
3. Click **"Register User"**
4. ✅ See success message
5. New admin credentials saved to list on right panel

## Step 4: Create Manager Account

1. Still on `/auth/register-user` page
2. Fill in:
   - **Full Name:** Mike Manager
   - **Email:** mike@company.com
   - **Role:** MANAGER
   - **Password:** Manager123
   - **Confirm Password:** Manager123
3. Click **"Register User"**
4. ✅ See success message

## Step 5: Create Staff Account

1. Still on page
2. Fill in:
   - **Full Name:** Emma Staff
   - **Email:** emma@company.com
   - **Role:** STAFF
   - **Password:** Staff123
   - **Confirm Password:** Staff123
3. Click **"Register User"**
4. ✅ See success message

## Step 6: View All Users (SuperAdmin Only)

1. Click **"All Users"** in sidebar
2. Go to `/admin/users`
3. ✅ See table with:
   - John Doe (SUPERADMIN)
   - Sarah Admin (ADMIN)
   - Mike Manager (MANAGER)
   - Emma Staff (STAFF)
4. Can search by name/email
5. Can filter by role

## Step 7: Test Login as Each Role

### Login as Admin
1. Click **"Logout"** button
2. Enter credentials:
   - Email: sarah@company.com
   - Password: Admin123
3. Click **"Sign In"**
4. ✅ Redirected to `/admin/dashboard`
5. Can access: Dashboard, Products, Users, Register User
6. ❌ Cannot see: `/manager/dashboard`, `/staff/dashboard`

### Login as Manager
1. Logout
2. Enter credentials:
   - Email: mike@company.com
   - Password: Manager123
3. Click **"Sign In"**
4. ✅ Redirected to `/manager/dashboard`
5. Can only access manager-specific pages
6. ❌ Cannot access admin pages

### Login as Staff
1. Logout
2. Enter credentials:
   - Email: emma@company.com
   - Password: Staff123
3. Click **"Sign In"**
4. ✅ Redirected to `/staff/dashboard`
5. Can only access staff pages
6. ❌ Cannot access admin/manager pages

## Step 8: Test Admin Can Create Manager/Staff (But Not Admin)

1. Login as Sarah (Admin)
2. Go to `/auth/register-user`
3. Try to create new user as ADMIN role
4. ❌ **Role dropdown won't show ADMIN option** (only MANAGER, STAFF)
5. Create manager/staff accounts work fine
6. ✅ Feature working correctly

## Step 9: Test Role Restrictions

1. Login as Manager (Mike)
2. Try to access `/admin/dashboard` directly
3. ❌ Redirected to `/` (home page)
4. Try to access `/staff/dashboard`
5. ❌ Also redirected to `/`
6. Can only access `/manager/dashboard` ✅

## Key Credentials to Remember

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| SuperAdmin | john@company.com | Password123 | Full system access |
| Admin | sarah@company.com | Admin123 | Admin + register users |
| Manager | mike@company.com | Manager123 | Inventory management |
| Staff | emma@company.com | Staff123 | Basic operations |

## Testing Edge Cases

### Test 1: Duplicate Email Prevention
1. Try to register user with same email as existing user
2. ❌ Should show: "Email already exists"

### Test 2: Weak Password
1. Try password "123" (less than 6 chars)
2. ❌ Should show: "Password must be at least 6 characters"

### Test 3: Password Mismatch
1. Enter password "Test123" in first field
2. Enter "Test124" in confirm field
3. Click submit
4. ❌ Should show: "Passwords do not match"

### Test 4: Session Persistence
1. Logged in as SuperAdmin
2. Refresh page (F5)
3. **Note:** Currently clears session (for security)
4. Redirects to login

### Test 5: Invalid Token Handling
1. Go to DevTools → Local Storage
2. Edit token value to: "invalid.token.here"
3. Refresh page
4. ❌ Should redirect to login with error

## File Structure

```
Frontend Pages:
├── /src/pages/
│   ├── AuthLogin.jsx .................... Login page (new)
│   ├── AuthRegisterSuperAdmin.jsx ....... SuperAdmin registration (new)
│   ├── RegisterUser.jsx ................. User registration (new)
│   ├── UserManagement.jsx ............... User list/management (new)
│   ├── ProductListPage.jsx .............. Product catalog
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── ManagerDashboard.jsx
│       └── ForecastingAnalyticsPage.jsx

Routes:
├── /login ............................ Login
├── /auth/register-superadmin ......... SuperAdmin registration
├── /auth/register-user ............... User registration
├── /admin/users ...................... User management
├── /admin/dashboard .................. Admin dashboard
├── /manager/dashboard ................ Manager dashboard
├── /staff/dashboard .................. Staff dashboard
└── /products ......................... Product catalog

Components:
├── AuthLogin.jsx (modern UI)
├── PrivateRoute.jsx (route guard)
├── AdminSidebar.jsx (navigation)
└── Topbar.jsx (header)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Infinite redirect loop | Check localStorage is cleared, try in incognito mode |
| "Cannot find module" error | Check all imports in App.jsx are correct |
| Role dropdown shows ADMIN when logged as Admin | Check availableRoles logic in RegisterUser.jsx |
| Users don't appear in management page | Try logging out and back in |
| 401 Unauthorized on API calls | Token expired, need to re-login |

## What To Tell Users

**For SuperAdmin:**
> "Register yourself first. Once done, you can create Admin accounts. Admins will handle creating Managers and Staff."

**For Admin:**
> "You can create Manager and Staff accounts, but not other Admins. Only SuperAdmin can do that."

**For Manager:**
> "Your role is inventory management. You cannot create user accounts."

**For Staff:**
> "You have basic access for daily operations. Contact Manager for account issues."

---

**Last Updated:** December 13, 2025
**Status:** ✅ Production Ready
