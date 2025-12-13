# Frontend Setup & Development Guide

## Quick Start

### Prerequisites
- Node.js 16+ installed
- Backend API running on `http://localhost:5001`

### Installation

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173` (or `5174` if port is busy).

---

## Key Features

### 🎯 Role-Based Dashboards

#### **Admin Dashboard** (`/admin/dashboard`)
- Complete inventory overview
- Sales vs forecast comparison
- Low stock alerts widget
- Product inventory management
- **Forecasting Analytics** (`/admin/forecast`) - Advanced demand analytics

#### **Manager Dashboard** (`/manager/dashboard`)
- Inventory value tracking
- Stock turnover analytics
- Urgent stock actions
- Inventory movement trends
- Stock level management

#### **Staff Dashboard** (`/staff/dashboard`)
- Daily task tracking
- Restock recommendations
- Performance metrics
- Quick action buttons
- Items needing attention

### 📊 Products Page (`/products`)
- Product catalog with filtering
- **Demand forecasts** for each product
- Stock level indicators
- Trend analysis (up/down arrows)
- Smart reorder alerts

---

## Component Usage

### Display Forecasting Charts
```jsx
import ForecastChart from "@/components/ForecastChart";

<ForecastChart 
  data={forecastData}
  type="line"
  title="Sales Forecast"
  height={300}
/>
```

### Show Stock Status
```jsx
import StockStatus from "@/components/StockStatus";

<StockStatus product={productObject} />
```

### Display Alerts
```jsx
import AlertsPanel from "@/components/AlertsPanel";

<AlertsPanel alerts={alertsArray} />
```

### Create Stat Cards
```jsx
import StatCard from "@/components/StatCard";

<StatCard 
  label="Total Products"
  value={256}
  icon={Package}
  color="blue"
  trend="+12%"
  trendDirection="up"
/>
```

---

## Utility Functions

### Using Forecast Utilities
```jsx
import {
  calculateAccuracyMetrics,
  getStockStatus,
  calculateTrend,
  formatCurrency,
  daysOfInventory,
  getTrendDirection,
  getRestockUrgency
} from "@/lib/forecastUtils";

// Calculate accuracy metrics
const metrics = calculateAccuracyMetrics([100, 105, 98], [102, 103, 100]);
// Returns: { mae: "1.67", rmse: "1.89", mape: "1.61" }

// Get stock status
const status = getStockStatus(45, 50, 60, 200);
// Returns: { status: "LOW_STOCK", label: "Low Stock", color: "yellow" }

// Calculate trend
const trend = calculateTrend(150, 125);
// Returns: "20.0"

// Format currency
formatCurrency(1500); // "$1,500.00"

// Days of inventory
daysOfInventory(100, 10); // 10 days

// Restock urgency (0-100)
getRestockUrgency(50, 75, 100, 5); // Urgency score
```

---

## State Management

### Using Auth Store (Zustand)
```jsx
import { useAuth } from "@/store/auth";

const { user, token, role, login, logout } = useAuth();
```

### API Calls with Axios
```jsx
import axiosClient from "@/lib/axiosClient";

// GET request with auto-auth
const response = await axiosClient.get("/api/products");

// POST request
const result = await axiosClient.post("/api/products", { 
  name: "New Product",
  price: 99.99 
});
```

---

## Environment Variables

Create `.env` file in frontend directory:

```env
VITE_API_URL=http://localhost:5001
```

---

## File Structure Overview

```
frontend/
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ManagerDashboard.jsx
│   │   │   └── ForecastingAnalyticsPage.jsx
│   │   ├── staff/
│   │   │   └── StaffDashboard.jsx
│   │   ├── ProductListPage.jsx
│   │   ├── Login.jsx
│   │   └── ... (other pages)
│   ├── components/
│   │   ├── ForecastChart.jsx
│   │   ├── StockStatus.jsx
│   │   ├── AlertsPanel.jsx
│   │   ├── StatCard.jsx
│   │   ├── AdminSidebar.jsx
│   │   ├── StaffSidebar.jsx
│   │   └── ... (other components)
│   ├── layouts/
│   │   ├── AdminLayout.jsx
│   │   └── StaffLayout.jsx
│   ├── lib/
│   │   ├── axiosClient.js
│   │   └── forecastUtils.js
│   ├── store/
│   │   └── auth.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── package.json
```

---

## Styling & Design

### Tailwind CSS Classes
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Color utilities: `bg-green-500`, `text-red-600`, `border-blue-200`
- Spacing: `p-6`, `mb-4`, `gap-4`
- Effects: `shadow`, `hover:shadow-lg`, `transition`

### Color Scheme
- **Primary**: Purple (`#a855f7`)
- **Success**: Green (`#10b981`)
- **Warning**: Yellow/Orange (`#f59e0b`)
- **Danger**: Red (`#ef4444`)
- **Info**: Blue (`#3b82f6`)

---

## Common Tasks

### Add New Dashboard Page
1. Create file in `pages/` directory
2. Use `AdminLayout` or `StaffLayout` wrapper
3. Add route in `App.jsx`
4. Update sidebar navigation

### Add New Chart
1. Use `ForecastChart` component or Recharts directly
2. Import chart types from `recharts`
3. Pass data array with required fields

### Display Product Info
1. Use `StockStatus` component for stock levels
2. Use forecast data from mock or API
3. Display trend indicators with icons

### Add New Alert
1. Create alert object with `{ id, type, title, message, icon }`
2. Pass to `AlertsPanel` component
3. Types: `critical`, `warning`, `info`, `success`

---

## Testing

Run tests with:
```bash
npm test
```

---

## Troubleshooting

### API Connection Issues
- Ensure backend is running on `http://localhost:5001`
- Check `.env` file for correct `VITE_API_URL`
- Check browser console for CORS errors

### Chart Not Displaying
- Verify data array has correct format
- Check ResponsiveContainer has parent with defined width
- Ensure dataKey names match data object keys

### Components Not Showing
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Check import paths use `@/` alias correctly
- Verify component is exported as default

### Auth Issues
- Check localStorage for token storage
- Verify login credentials in backend
- Check token expiration (7 days default)

---

## Performance Optimization

- Lazy load pages with React.lazy()
- Memoize components with React.memo()
- Use useCallback for event handlers
- Implement pagination for large product lists
- Debounce search inputs

---

## Building for Production

```bash
npm run build
```

Creates optimized production build in `dist/` directory.

Preview production build:
```bash
npm run preview
```

---

## Next Steps

1. **Connect Real API**: Replace mock data with actual API calls
2. **Add Notifications**: Implement toast/notification system
3. **Export Reports**: Add PDF/CSV export functionality
4. **Real-time Updates**: Use WebSockets for live data
5. **Dark Mode**: Implement dark theme toggle
6. **Multi-language**: Add i18n support

---

## Support

For issues or questions, check:
- Component documentation in source files
- Utility function descriptions in `forecastUtils.js`
- API endpoint structure in backend
- Tailwind CSS documentation at `tailwindcss.com`
