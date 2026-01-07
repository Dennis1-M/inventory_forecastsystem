# Backend-Frontend Endpoint Audit Report

**Generated:** January 6, 2026  
**Status:** ⚠️ MISMATCHES FOUND

---

## Summary

- **Backend Routes:** 19 route files loaded
- **Frontend API Calls:** Multiple endpoint references found
- **Issues:** 5 endpoints called by frontend but **NOT defined** in backend
- **Port Inconsistency:** Found in test file

---

## Backend Routes Registered (in server.js)

```
✅ /api/auth           (authRoutes.js)
✅ /api/admin          (admin.js)
✅ /api/users          (userRoutes.js)
✅ /api/products       (productRoutes.js)
✅ /api/sales          (salesRoutes.js)
✅ /api/sync           (syncRoutes.js)
✅ /api/purchase-orders (purchaseOrderRoutes.js)
✅ /api/alerts         (alertRoutes.js)
✅ /api/inventory      (inventoryRoutes.js)
✅ /api/manager        (manager.js)
✅ /api/forecast       (forecastRoutes.js)
✅ /api/categories     (categoryRoutes.js)
✅ /api/dashboard      (dashboardRoutes.js)
✅ /api/mpesa          (mpesaRoutes.js)
✅ /api/export         (exportRoutes.js)
✅ /api/health-status  (healthRoutes.js)
✅ /api/settings       (settingsRoutes.js)
✅ /api/setup          (setupRoutes.js)
⚠️ /api/forecast/trigger-alerts (forecastTriggerRoutes.js) - NOT REGISTERED IN server.js
```

---

## Complete Backend Endpoint Mapping

### 1. Authentication (`/api/auth`)
```javascript
POST   /api/auth/login                    ✅
POST   /api/auth/register-superuser       ✅
GET    /api/auth/check-superadmin         ✅
GET    /api/auth/verify                   ✅ (protected)
GET    /api/auth/me                       ✅ (protected)
POST   /api/auth/logout                   ✅ (protected)
GET    /api/auth/users                    ✅ (protected, SUPERADMIN|ADMIN)
POST   /api/auth/register                 ✅ (protected, SUPERADMIN|ADMIN)
PUT    /api/auth/users/:id/status         ✅ (protected, SUPERADMIN|ADMIN)
DELETE /api/auth/users/:id                ✅ (protected, SUPERADMIN)
```

### 2. Admin (`/api/admin`)
```javascript
GET    /api/admin/test                    ✅ (no auth - debug endpoint)
GET    /api/admin/users                   ✅ (protected, ADMIN|SUPERADMIN)
GET    /api/admin/stats                   ✅ (referenced in test endpoint)
GET    /api/admin/system-health           ✅ (referenced in test endpoint)
PATCH  /api/admin/users/:id/status        ✅ (referenced in test endpoint)
```

### 3. Users (`/api/users`)
```javascript
POST   /api/users                         ✅ (protected, ADMIN|SUPERADMIN)
GET    /api/users                         ✅ (protected, ADMIN|SUPERADMIN)
GET    /api/users/:id                     ✅ (protected, ADMIN|SUPERADMIN)
PUT    /api/users/:id                     ✅ (protected, ADMIN|SUPERADMIN)
DELETE /api/users/:id                     ✅ (protected, ADMIN|SUPERADMIN)
```

### 4. Products (`/api/products`)
```javascript
GET    /api/products/low-stock            ✅
GET    /api/products                      ✅
GET    /api/products/:id                  ✅
POST   /api/products                      ✅
PUT    /api/products/:id                  ✅
DELETE /api/products/:id                  ✅
```

### 5. Sales (`/api/sales`)
```javascript
GET    /api/sales/forecast                ✅ (protected)
GET    /api/sales                         ✅ (protected)
POST   /api/sales                         ✅ (protected)
GET    /api/sales/:id                     ✅ (protected)
PUT    /api/sales/:id                     ✅ (protected)
DELETE /api/sales/:id                     ✅ (protected)
```

### 6. Sync (`/api/sync`)
```javascript
POST   /api/sync                          ✅ (protected)
```

### 7. Purchase Orders (`/api/purchase-orders`)
```javascript
GET    /api/purchase-orders               ✅ (protected, ADMIN|MANAGER|SUPERADMIN)
POST   /api/purchase-orders               ✅ (protected, ADMIN|MANAGER|SUPERADMIN)
GET    /api/purchase-orders/:id           ✅ (protected, ADMIN|MANAGER|SUPERADMIN)
POST   /api/purchase-orders/:id/receive   ✅ (protected, ADMIN|MANAGER|SUPERADMIN)
```

### 8. Alerts (`/api/alerts`)
```javascript
GET    /api/alerts                        ✅
PUT    /api/alerts/:id/resolve            ✅
```

### 9. Inventory (`/api/inventory`)
```javascript
POST   /api/inventory/cycle-counts        ✅ (protected, MANAGER|ADMIN|SUPERADMIN)
GET    /api/inventory/cycle-counts        ✅ (protected, MANAGER|ADMIN|SUPERADMIN)
GET    /api/inventory/cycle-counts/:id    ✅ (protected, MANAGER|ADMIN|SUPERADMIN)
POST   /api/inventory/receive             ✅ (protected, ADMIN|SUPERADMIN)
POST   /api/inventory/adjust              ✅ (protected, ADMIN|SUPERADMIN)
GET    /api/inventory/movements           ✅ (protected, ADMIN|SUPERADMIN)
GET    /api/inventory/low-stock           ✅ (protected, ADMIN|SUPERADMIN)
GET    /api/inventory/summary             ✅ (protected, ADMIN|SUPERADMIN)
```

### 10. Manager (`/api/manager`)
```javascript
GET    /api/manager/dashboard-stats       ✅
(and more endpoints defined in routes/manager.js)
```

### 11. Forecast (`/api/forecast`)
```javascript
POST   /api/forecast/run                  ✅ (protected)
POST   /api/forecast/save                 ✅ (protected)
GET    /api/forecast/history/:productId   ✅ (protected)
GET    /api/forecast/:productId           ✅ (protected)
```

### 12. Categories (`/api/categories`)
```javascript
GET    /api/categories                    ✅
POST   /api/categories                    ✅
GET    /api/categories/:id                ✅
PUT    /api/categories/:id                ✅
DELETE /api/categories/:id                ✅
```

### 13. Dashboard (`/api/dashboard`)
```javascript
GET    /api/dashboard                     ✅ (protected, SUPERADMIN|ADMIN|MANAGER)
```

### 14. MPESA (`/api/mpesa`)
```javascript
POST   /api/mpesa/pay                     ✅ (protected, STAFF)
```

### 15. Export (`/api/export`)
```javascript
GET    /api/export/sales                  ✅ (protected, ADMIN|SUPERADMIN)
GET    /api/export/inventory              ✅ (protected, ADMIN|SUPERADMIN)
GET    /api/export/products               ✅ (protected, ADMIN|SUPERADMIN)
```

### 16. Health Status (`/api/health-status`)
```javascript
GET    /api/health-status                 ✅ (protected, ADMIN|SUPERADMIN)
```

### 17. Settings (`/api/settings`)
```javascript
GET    /api/settings                      ✅ (protected, ADMIN|SUPERADMIN)
POST   /api/settings                      ✅ (protected, ADMIN|SUPERADMIN)
```

### 18. Setup (`/api/setup`)
```javascript
GET    /api/setup/status                  ✅
POST   /api/setup/run                     ✅
```

### 19. Forecast Trigger (`/api/forecast/trigger-alerts`)
```javascript
POST   /api/forecast/trigger-alerts       ⚠️ DEFINED BUT NOT REGISTERED IN server.js
```

---

## Frontend Endpoint Calls Audit

### ✅ MATCHED - Frontend calls that exist in backend

#### useApi.ts hooks:
```typescript
✅ GET    /products                       (productRoutes.js)
✅ GET    /inventory                      (inventoryRoutes.js)
✅ GET    /alerts                         (alertRoutes.js)
✅ PUT    /alerts/:id/resolve             (alertRoutes.js)
✅ GET    /suppliers                      (from useSuppliers hook)
✅ GET    /users                          (userRoutes.js)
✅ GET    /health-status                  (healthRoutes.js)
✅ GET    /settings                       (settingsRoutes.js)
✅ PUT    /settings                       (settingsRoutes.js)
✅ GET    /forecast                       (forecastRoutes.js)
✅ GET    /sales-analytics                (likely from dashboardRoutes)
```

#### Page components:
```typescript
✅ DELETE /users/:id                      (UserManagementPage.tsx)
✅ POST   /suppliers                      (SuppliersPage.tsx)
✅ PUT    /suppliers/:id                  (SuppliersPage.tsx)
✅ DELETE /suppliers/:id                  (SuppliersPage.tsx)
✅ GET    /health-status                  (SystemHealthPage.tsx)
✅ POST   /settings                       (SettingsPage.tsx)
✅ POST   /auth/login                     (LoginPage.tsx, authApi)
✅ POST   /reports/export                 (ReportsAnalyticsPage.tsx)
✅ GET    /export/sales                   (DataManagementPage.tsx)
```

### ❌ NOT MATCHED - Frontend calls to endpoints that don't exist

| Frontend Call | Location | Issue |
|---------------|----------|-------|
| `GET /notifications` | SystemNotificationsPage.tsx:24 | ❌ No route defined in backend |
| `GET /staff-activities` | StaffOversightPage.tsx:23 | ❌ No route defined in backend |
| `POST /reports/manager-export` | ManagerReportsPage.tsx:16 | ❌ No route defined in backend |
| `GET /activity-logs` | ActivityLogsPage.tsx:26 | ❌ No route defined in backend |
| `PUT /users/:id` | components/admin/EditUserForm.tsx:39 | ⚠️ Should use `/users/:id` from userRoutes, may need verification |

### ⚠️ CRITICAL ISSUE - apiRoutes.js NOT REGISTERED

**Location:** `Backend/routes/apiRoutes.js` exists with suppliers and other endpoints  
**Problem:** This entire route file is NOT loaded in `server.js`  
**Impact:** ALL endpoints in apiRoutes.js are unreachable, including:
- `/api/suppliers` (all CRUD operations)
- Supplier dashboard endpoints
- These routes were defined but never registered in the server initialization

---

## Port Configuration Inconsistencies

### Frontend API Service
**File:** `frontend/src/services/api.ts`
```typescript
const apiService = axios.create({
  baseURL: 'http://localhost:5001/api',  // ✅ Port 5001
});
```

### Backend Server
**File:** `Backend/server.js`
```javascript
const PORT = process.env.PORT || 5001;  // ✅ Port 5001
```

### Test Files
**File:** `Backend/test-api-endpoints.cjs`
```javascript
const API_BASE = 'http://localhost:5001/api'; // ✅ Port 5001 (CORRECT)
```

**Port Status:** ✅ CONSISTENT - All using port 5001

---

## Missing Routes Needing Implementation

### 1. Notifications Endpoint
**Frontend Request:** `GET /api/notifications`  
**Required In:** `Backend/routes/notificationsRoutes.js`
```javascript
// Should return system notifications
router.get('/', getNotifications);
export default router;
```
**Then register in server.js:**
```javascript
await loadRoute("./routes/notificationsRoutes.js", "notifications");
```

### 2. Staff Activities Endpoint
**Frontend Request:** `GET /api/staff-activities`  
**Required In:** `Backend/routes/staffActivitiesRoutes.js` or update `manager.js`
```javascript
router.get('/staff-activities', getStaffActivities);
```
**Then register in server.js:**
```javascript
await loadRoute("./routes/staffActivitiesRoutes.js", "staff-activities");
```

### 3. Manager Reports Export Endpoint
**Frontend Request:** `POST /api/reports/manager-export`  
**Required In:** `Backend/routes/reportsRoutes.js`
```javascript
router.post('/manager-export', managerExportReport);
```

### 4. Activity Logs Endpoint
**Frontend Request:** `GET /api/activity-logs`  
**Required In:** `Backend/routes/activityLogsRoutes.js`
```javascript
router.get('/', getActivityLogs);
```

### 5. ⚠️ Suppliers Routes - DEFINED BUT NOT LOADED
**Status:** Routes ARE defined in `Backend/routes/apiRoutes.js` but this file is NOT registered in `server.js`

**Frontend Requests:** 
- `GET /api/suppliers` ❌
- `POST /api/suppliers` ❌
- `PUT /api/suppliers/:id` ❌
- `DELETE /api/suppliers/:id` ❌

**Current Location:** `Backend/routes/apiRoutes.js` (lines 81-90)
```javascript
router.route("/suppliers")
  .get(protect, getSuppliers)
  .post(protect, admin, createSupplier);

router.route("/suppliers/:id")
  .get(protect, getSupplierById)
  .put(protect, admin, updateSupplier)
  .delete(protect, admin, deleteSupplier);

router.get("/suppliers/:id/dashboard", protect, admin, getSupplierDashboard);
```

**Missing in server.js:** The entire `apiRoutes.js` file is NOT registered!

---

## Other Issues Found

### 1. Forecast Trigger Route Not Registered
**Status:** Route defined but not loaded in server.js
**File:** `Backend/routes/forecastTriggerRoutes.js`
**Fix:** Add to server.js:
```javascript
await loadRoute("./routes/forecastTriggerRoutes.js", "forecast-trigger");
```

### 2. Auth vs Users Routes Duplication
**Issue:** Both `/api/auth/users` and `/api/users` exist with similar CRUD operations
**Current State:**
- `GET /api/auth/users` - User management under auth
- `GET /api/users` - User management under users route

**Recommendation:** Consolidate into single endpoint or clarify usage

---

## Summary of Action Items

| Priority | Item | Status |
|----------|------|--------|
| 🔴 HIGH | Create `/api/suppliers` routes | ❌ Missing |
| 🔴 HIGH | Create `/api/notifications` routes | ❌ Missing |
| 🔴 HIGH | Create `/api/activity-logs` routes | ❌ Missing |
| 🟡 MEDIUM | Create `/api/staff-activities` routes | ❌ Missing |
| 🟡 MEDIUM | Create `/api/reports/manager-export` endpoint | ❌ Missing |
| 🟡 MEDIUM | Register `/api/forecast-trigger` in server.js | ⚠️ Defined but not registered |
| 🟢 LOW | Review auth vs users route duplication | ⚠️ Clarification needed |

---

## Testing Recommendations

1. **Run backend API tests:**
   ```bash
   cd Backend && npm run dev
   node test-api-endpoints.cjs
   ```

2. **Verify all routes load:**
   Check server.js startup logs for `✅` messages

3. **Test missing endpoints once implemented:**
   - Test with valid authentication tokens
   - Test error handling (400, 401, 403, 404, 500)
   - Verify CORS headers

4. **Frontend integration tests:**
   - Test hook functions with mocked endpoints
   - Verify error handling in UI
   - Test loading states

---

**Last Updated:** January 6, 2026
