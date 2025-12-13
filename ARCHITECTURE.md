# Smart Inventory Forecast System - Complete Architecture Overview

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React + Vite)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              ROUTING LAYER (React Router)                     │   │
│  │                                                                │   │
│  │  /               → LandingPage                                │   │
│  │  /login          → Login (Multi-role)                         │   │
│  │  /products       → ProductListPage (with Forecasts)           │   │
│  │  /admin/*        → AdminDashboard, ForecastingAnalytics       │   │
│  │  /manager/*      → ManagerDashboard                           │   │
│  │  /staff/*        → StaffDashboard                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              STATE MANAGEMENT (Zustand)                       │   │
│  │  • auth.js: user, token, role, login/logout                  │   │
│  │  • Local storage persistence                                 │   │
│  │  • JWT token management                                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │           COMPONENT LIBRARY (Reusable)                        │   │
│  │                                                                │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐        │   │
│  │  │ForecastChart│ │StockStatus  │ │AlertsPanel      │        │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘        │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐        │   │
│  │  │StatCard     │ │Sidebars     │ │ProductCards     │        │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘        │   │
│  │                                                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │        DATA VISUALIZATION (Recharts + Framer Motion)          │   │
│  │  • LineCharts: Sales vs Forecast Trends                      │   │
│  │  • AreaCharts: Seasonality Patterns                          │   │
│  │  • BarCharts: Category Breakdown                             │   │
│  │  • Composite: Multi-metric Analysis                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │         UTILITIES & HELPERS (forecastUtils.js)                │   │
│  │  • calculateAccuracyMetrics()      MAE, RMSE, MAPE          │   │
│  │  • getStockStatus()                IN_STOCK, LOW_STOCK        │   │
│  │  • getRestockUrgency()             Urgency Score (0-100)     │   │
│  │  • getTrendDirection()             UPWARD, DOWNWARD, STABLE  │   │
│  │  • getReorderQuantity()            Optimal reorder amount    │   │
│  │  • detectSeasonality()             Pattern detection         │   │
│  │  • And 9 more...                                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │         API CLIENT (Axios with Interceptors)                  │   │
│  │  • Base URL: http://localhost:5001                           │   │
│  │  • Auto JWT injection on every request                       │   │
│  │  • 401 error handling → Auto logout                          │   │
│  │  • Request/Response logging                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                      ↓
                    ┌─────────────────────────────────┐
                    │        API GATEWAY (Express)     │
                    │    Port: 5001                   │
                    └─────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                AUTHENTICATION LAYER                           │   │
│  │  • JWT Strategy (7 days expiration)                          │   │
│  │  • Role-based middleware (ADMIN, MANAGER, STAFF, SUPERADMIN) │   │
│  │  • bcryptjs password hashing                                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              API ROUTES & CONTROLLERS                         │   │
│  │                                                                │   │
│  │  /api/auth/         → authController                         │   │
│  │  /api/products/     → productController                      │   │
│  │  /api/inventory/    → inventoryController                    │   │
│  │  /api/sales/        → saleController                         │   │
│  │  /api/categories/   → categoryController                     │   │
│  │  /api/alerts/       → alertController                        │   │
│  │  /api/forecasts/    → forecastingController                  │   │
│  │  /api/users/        → userController                         │   │
│  │                                                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              BACKGROUND JOBS (Node-Cron)                     │   │
│  │                                                                │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │ alertCron.js  - Daily (00:00)                       │    │   │
│  │  │ • Check stock levels                                │    │   │
│  │  │ • Create OUT_OF_STOCK alerts                        │    │   │
│  │  │ • Create LOW_STOCK alerts                           │    │   │
│  │  │ • Create OVERSTOCK alerts                           │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                                                                │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │ inventoryCron.js - Regular intervals                │    │   │
│  │  │ • Generate inventory alerts                          │    │   │
│  │  │ • Track inventory changes                            │    │   │
│  │  │ • Update stock statistics                            │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                                                                │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │ forecastCron.js - Daily                             │    │   │
│  │  │ • Trigger Python forecast service                   │    │   │
│  │  │ • Update predictions in database                    │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                                                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                DATABASE MODELS (Prisma)                       │   │
│  │                                                                │   │
│  │  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐         │   │
│  │  │User      │ │Product  │ │Inventory │ │SaleRecord│         │   │
│  │  └──────────┘ └─────────┘ └──────────┘ └──────────┘         │   │
│  │                                                                │   │
│  │  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐         │   │
│  │  │Category  │ │Supplier │ │Alert     │ │Forecast  │         │   │
│  │  └──────────┘ └─────────┘ └──────────┘ └──────────┘         │   │
│  │                                                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                      ↓
                    ┌─────────────────────────────────┐
                    │   DATABASE (PostgreSQL)          │
                    │   Port: 5432                    │
                    │   Database: Inventory           │
                    └─────────────────────────────────┘
                                      ↓
                    ┌─────────────────────────────────┐
                    │   ML SERVICE (Python FastAPI)    │
                    │   Port: 5002                    │
                    │   • Demand forecasting          │
                    │   • Time series analysis        │
                    │   • Trend detection             │
                    └─────────────────────────────────┘
```

---

## 🎯 Data Flow Diagram

```
USER INTERACTION (Frontend)
         ↓
┌─────────────────────────────────────────┐
│  React Component Renders                │
│  • useEffect(() => {                    │
│    loadData() → API Call                │
│  }, [])                                 │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Axios HTTP Request                     │
│  • GET /api/products                    │
│  • Auto-inject JWT token in header      │
│  • 5s timeout, auto-retry on 401        │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Express Route Handler                  │
│  • Verify JWT token                     │
│  • Check user role/permissions          │
│  • Execute controller logic              │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Database Query (Prisma ORM)            │
│  • Find all products                    │
│  • Include relations (category, etc)    │
│  • Apply filters/pagination             │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Response JSON                          │
│  • { data: [...], success: true }       │
│  • HTTP 200 status                      │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Frontend State Update (Zustand)        │
│  • setProducts(response.data)           │
│  • setLoading(false)                    │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Component Re-render                    │
│  • Map products to JSX                  │
│  • Display cards with forecast info     │
│  • Attach event handlers                │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  User Sees Updated UI                   │
│  • Product list with forecasts          │
│  • Interactive charts                   │
│  • Action buttons ready                 │
└─────────────────────────────────────────┘
```

---

## 📊 Dashboard Information Architecture

```
ADMIN DASHBOARD (/admin/dashboard)
├── Header
│   ├── Title: "Admin Dashboard"
│   └── Subtitle: "Welcome back! Here's your inventory overview."
├── Metrics (4 columns)
│   ├── Total Products
│   ├── Total Inventory Value
│   ├── Forecast Accuracy
│   └── Low Stock Items
├── Analytics Section
│   ├── Sales Trend Chart (3 columns)
│   │   └── Line chart: Actual vs Forecast
│   └── Low Stock Alerts (1 column)
│       └── List of urgent items
├── Category Breakdown
│   └── Bar chart: Sales by category
└── Product Inventory Tabs
    ├── Tab 1: Electronics
    ├── Tab 2: Foods
    └── Tab 3: Other

MANAGER DASHBOARD (/manager/dashboard)
├── Header
│   ├── Title: "Manager Dashboard"
│   └── Subtitle: "Inventory Management & Stock Control"
├── Metrics (4 columns)
│   ├── Inventory Value
│   ├── Low Stock Items
│   ├── Total Products
│   └── Stock Turns/Month
├── Charts (2 columns)
│   ├── Inventory Movement Line Chart
│   └── Stock Turnover Bar Chart
└── Urgent Stock Actions Table
    ├── Product Name
    ├── Current Stock
    ├── Reorder Point
    ├── Status
    └── Order Stock Button

STAFF DASHBOARD (/staff/dashboard)
├── Header
│   ├── Title: "Staff Dashboard"
│   └── Subtitle: "Track your daily tasks and inventory activities"
├── Metrics (4 columns)
│   ├── Tasks Completed
│   ├── Items Restocked
│   ├── Stock Alerts
│   └── Performance Score
├── Charts (2 columns)
│   ├── Weekly Activity Line Chart
│   └── Daily Alerts Bar Chart
└── Quick Actions (3 columns)
    ├── Column 1: Quick Action Buttons
    │   ├── Start Restock Task
    │   ├── Scan Inventory
    │   ├── Report Issue
    │   └── View Tasks
    └── Columns 2-3: Items Needing Attention
        ├── Product Name
        ├── Current/Reorder Stock
        └── Restock Button

FORECASTING ANALYTICS (/admin/forecast)
├── Header
│   ├── Title: "Forecasting Analytics"
│   └── Subtitle: "Demand prediction & trend analysis powered by AI"
├── Model Performance Metrics (4 columns)
│   ├── MAE: 4.2
│   ├── RMSE: 6.8
│   ├── MAPE: 2.3%
│   └── Model Accuracy: 95.7%
├── Forecast Chart (Full width)
│   └── Composite: Actual vs Predicted with bounds
├── Product & Trends (3 columns)
│   ├── Column 1: Product Selection Buttons
│   └── Columns 2-3: Category Trend Bar Chart
├── Analysis Section (2 columns)
│   ├── Seasonality Area Chart
│   └── Forecast Error Scatter Plot
└── AI Insights (Full width, 4 subsections)
    ├── Increasing Demand Alert
    ├── Declining Demand Alert
    ├── Seasonal Peak Warning
    └── Forecast Confidence Badge

PRODUCTS PAGE (/products)
├── Header
│   ├── Title: "Products Catalog"
│   └── Subtitle: "View inventory, forecasts, and demand predictions"
├── Filters
│   ├── Search Box (by name or SKU)
│   └── Category Dropdown
├── Product Grid (3 columns)
│   └── Product Card (for each product)
│       ├── Status Badge (In Stock, Low Stock, Overstock)
│       ├── Product Info (name, SKU, category, price, supplier)
│       ├── Stock Level Section
│       │   ├── Current Stock Count
│       │   ├── Reorder Point
│       │   └── Progress Bar
│       ├── Demand Forecast Section
│       │   ├── Next Week Demand (units)
│       │   ├── Trend (% with icon)
│       │   └── Forecast Accuracy (%)
│       └── Alerts & Actions
│           ├── Overstock Warning (if applicable)
│           ├── Low Stock Warning (if applicable)
│           └── Order Stock Button
```

---

## 🔐 Authentication & Authorization Flow

```
LOGIN PROCESS
═════════════

1. User navigates to /login
2. System checks if SuperAdmin exists
   ├─ NO → Show SuperAdmin registration form
   └─ YES → Show role selection
3. User selects role (SUPERADMIN, ADMIN, MANAGER, STAFF)
4. User enters email & password
5. POST /api/auth/login
6. Backend:
   ├─ Verify email exists
   ├─ Compare password hash
   ├─ Generate JWT token (valid 7 days)
   └─ Return user object + token
7. Frontend:
   ├─ Store token in localStorage
   ├─ Store role in localStorage
   ├─ Update Zustand auth store
   └─ Redirect to role-specific dashboard
        ├─ ADMIN/SUPERADMIN → /admin/dashboard
        ├─ MANAGER → /manager/dashboard
        └─ STAFF → /staff/dashboard

PROTECTED ROUTES
════════════════
Every API request:
  ├─ Axios interceptor adds: Authorization: Bearer {token}
  ├─ Backend middleware verifies JWT
  ├─ If valid:
  │   ├─ Check user role against route
  │   └─ Execute controller action
  └─ If invalid/expired:
      ├─ Return 401 Unauthorized
      ├─ Frontend interceptor catches
      ├─ Clear localStorage
      └─ Redirect to /login

ROLE PERMISSIONS
════════════════
SUPERADMIN:
  • All permissions
  • Full system access
  • User management

ADMIN:
  • View all dashboards
  • Manage products
  • Manage categories
  • View forecasts
  • Create users

MANAGER:
  • Manager dashboard
  • Inventory management
  • Stock receiving
  • Analytics

STAFF:
  • Staff dashboard
  • Restock tasks
  • View products
  • Performance tracking
```

---

## 📈 Forecast Model Workflow

```
FORECAST PIPELINE
═════════════════

1. Daily Cron Job Triggered (forecastCron.js)
   └─ Time: Configurable (default: 00:00)

2. Backend Calls Python Service
   ├─ Endpoint: http://localhost:5002/forecast
   ├─ Payload: historical sales data (last 30+ days)
   └─ Authentication: Internal network

3. Python ML Service (FastAPI)
   ├─ Load historical data
   ├─ Time series preprocessing
   ├─ Feature engineering
   ├─ Model training/inference
   └─ Generate predictions

4. Model Outputs
   ├─ forecast[] - Next 7-14 days predictions
   ├─ confidence_bounds[] - Upper/lower bounds
   ├─ trend - Direction & magnitude
   ├─ seasonality - Pattern detection
   └─ metrics:
       ├─ MAE, RMSE, MAPE
       └─ Model Accuracy

5. Backend Stores Predictions
   ├─ Update Forecast table
   ├─ Update Product.nextWeekForecast
   ├─ Store metrics
   └─ Log forecast run

6. Frontend Displays Predictions
   ├─ Charts update automatically
   ├─ Product cards show demand
   ├─ Alerts generated for anomalies
   └─ Manager can take actions

7. Actions Triggered by Forecasts
   ├─ If demand ↑ → Increase stock
   ├─ If demand ↓ → Reduce stock
   ├─ If low stock + high demand → Urgent alert
   ├─ If high stock + low demand → Overstock alert
   └─ All via alertCron.js
```

---

## 📦 Component Dependency Graph

```
App.jsx
├── BrowserRouter (React Router)
│   └── Routes
│       ├── / → LandingPage
│       ├── /login → Login
│       ├── /admin/dashboard → AdminLayout
│       │   └── AdminDashboard
│       │       ├── StatCard × 4
│       │       ├── LineChart (Recharts)
│       │       ├── LowStockAlertsWidget
│       │       └── ProductTabs
│       ├── /admin/forecast → AdminLayout
│       │   └── ForecastingAnalyticsPage
│       │       ├── StatCard × 4
│       │       ├── ComposedChart
│       │       ├── BarChart
│       │       ├── AreaChart
│       │       ├── ScatterChart
│       │       ├── ForecastChart
│       │       └── AlertsPanel (custom)
│       ├── /manager/dashboard → AdminLayout
│       │   └── ManagerDashboard
│       │       ├── StatCard × 4
│       │       ├── LineChart
│       │       ├── BarChart
│       │       └── Table
│       ├── /staff/dashboard → StaffLayout
│       │   └── StaffDashboard
│       │       ├── StatCard × 4
│       │       ├── LineChart
│       │       ├── BarChart
│       │       └── Items Needing Attention (List)
│       └── /products → ProductListPage
│           ├── Search & Filter
│           ├── Grid
│           │   └── ProductCard × many
│           │       ├── StockStatus
│           │       ├── ForecastChart
│           │       └── Alerts
│           └── Recharts Charts

Layouts
├── AdminLayout
│   ├── AdminSidebar
│   │   ├── NavLink × 10
│   │   └── Logout Button
│   └── Topbar
│       ├── Menu Toggle
│       ├── Title
│       └── User Info
└── StaffLayout
    ├── StaffSidebar
    └── Topbar

Stores (Zustand)
└── auth.js
    ├── user
    ├── token
    ├── role
    ├── error
    ├── login()
    ├── logout()
    ├── initFromStorage()
    └── Persist to localStorage

Services
└── axiosClient.js
    ├── Request Interceptor (add JWT)
    └── Response Interceptor (handle 401)

Utilities
└── forecastUtils.js
    ├── calculateAccuracyMetrics()
    ├── getStockStatus()
    ├── getTrendDirection()
    ├── getRestockUrgency()
    ├── recommendSafetyStock()
    └── 10 more...
```

---

## 🎨 Styling Architecture

```
TAILWIND CSS CONFIGURATION
═══════════════════════════

Colors
├── Primary: Purple-600 (#a855f7)
│   └── Used for: Buttons, Links, Primary actions
├── Success: Green-500 (#10b981)
│   └── Used for: Positive trends, In stock
├── Warning: Yellow-500 (#eab308)
│   └── Used for: Low stock, Caution
├── Danger: Red-500 (#ef4444)
│   └── Used for: Out of stock, Errors
├── Info: Blue-500 (#3b82f6)
│   └── Used for: Charts, Information
└── Neutral: Gray-600 (#4b5563)
    └── Used for: Text, Borders

Spacing System
├── p-4 / p-6 → Padding inside cards
├── m-4 / m-6 → Margin outside elements
├── gap-4 / gap-6 → Spacing in grids/flexes
└── mt-4, mb-6, etc → Specific direction spacing

Responsive Breakpoints
├── Mobile-first approach
├── md: 768px (tablets)
├── lg: 1024px (desktops)
└── Examples:
    ├── grid-cols-1 md:grid-cols-2 lg:grid-cols-4
    ├── text-xl md:text-2xl lg:text-3xl
    └── p-4 md:p-6 lg:p-8

Effects & Interactions
├── shadow → Default drop shadow
├── hover:shadow-lg → Enlarged shadow on hover
├── transition → Smooth CSS transitions
├── rounded-lg → Border radius
├── opacity-50 → Transparency
└── duration-300 → Animation duration
```

---

## 🚀 Performance Optimization Strategies

```
FRONTEND OPTIMIZATION
═════════════════════

1. Code Splitting
   ├── Lazy load pages with React.lazy()
   ├── Suspend with <Suspense>
   └── Reduce initial bundle size

2. Component Optimization
   ├── React.memo() for expensive components
   ├── useCallback() for event handlers
   ├── useMemo() for computed values
   └── Avoid unnecessary re-renders

3. Data Fetching
   ├── Load only visible data
   ├── Implement pagination
   ├── Cache API responses
   └── Debounce search inputs

4. Asset Optimization
   ├── Compress images
   ├── Use CSS variables
   ├── Minify CSS/JS
   └── Tree-shake unused code

5. Chart Optimization
   ├── Limit data points to 100
   ├── Responsive container sizing
   ├── Lazy load chart libraries
   └── Debounce resize events

DATABASE OPTIMIZATION
═════════════════════

1. Indexing
   ├── userId, productId, categoryId
   ├── createdAt for date queries
   └── status fields

2. Query Optimization
   ├── Use .select() for specific fields
   ├── Include only needed relations
   ├── Paginate large result sets
   └── Use findUnique when possible

3. Caching
   ├── Redis for frequently accessed data
   ├── In-memory cache for lookups
   └── Set TTL for stale data

NETWORK OPTIMIZATION
════════════════════

1. API Design
   ├── Gzip compression
   ├── JSON API format
   ├── Pagination headers
   └── ETag support

2. Request Optimization
   ├── Batch multiple requests
   ├── HTTP/2 multiplexing
   ├── Connection pooling
   └── Request timeout handling

3. Caching Strategy
   ├── Browser cache headers
   ├── Service worker for offline
   ├── Cache-Control directives
   └── ETags for validation
```

---

This comprehensive architecture ensures:
✅ **Scalability** - Handle growing data
✅ **Performance** - Fast load times
✅ **Security** - Protected endpoints
✅ **Maintainability** - Clean code structure
✅ **User Experience** - Responsive design
