# Manager Portal Implementation

## Overview
A comprehensive manager dashboard that enables managers to effectively oversee inventory, staff, and forecasting operations.

## Manager Responsibilities & Features

### 1. **Manage Users (Staff Management)**
- **Tab**: Staff Oversight
- **Features**:
  - View all staff members and their activity
  - Monitor staff performance and tasks
  - Filter activities by type (sales, stock, issues)
  - Track completed, pending, and problematic entries
  - View total entries and issues found

### 2. **Order Stock in Low Stock & Register Restocking**
- **Tab**: Low Stock Orders & Restock Tracking
- **Features**:
  - View all products with stock below reorder level
  - Quick "Order Stock" button for low stock items
  - Create new restock purchase orders
  - Track order status (Pending → Ordered → Received)
  - Monitor expected delivery dates
  - View supplier information
  - Update order status as stock arrives

### 3. **Trigger Forecast Model**
- **Tab**: Forecast Model
- **Features**:
  - View last forecast run time
  - See next scheduled forecast time
  - Trigger manual forecast runs instantly
  - Access demand forecasting page for detailed analysis
  - View forecast results and predictions

### 4. **View Analytics for Decision Making**
- **Tab**: Sales Analytics
- **Features**:
  - View sales trends and patterns
  - Analyze sales by category
  - Monitor daily/weekly/monthly performance
  - Key performance indicators (KPIs)
  - Inventory value analysis
  - Order accuracy metrics

### 5. **View Low Stock Alerts & Forecast Notifications**
- **Section**: Dashboard Overview
- **Features**:
  - Real-time low stock alerts (top 5 critical items)
  - Active system alerts with product details
  - Forecast model notifications
  - New notifications from ML model reports
  - One-click access to full alerts page

## Dashboard Sections

### Overview Tab (Default)
- **Key Performance Indicators**:
  - Total Staff Count
  - Low Stock Items (with count)
  - Pending Tasks/Alerts
  - Total Sales Value

- **Quick Actions Panel**:
  - Manage Staff
  - Stock Levels
  - Trigger Forecast
  - Analytics

- **Low Stock Alert Section**:
  - Shows top 5 items needing immediate action
  - Current stock levels
  - Direct "Order Stock" buttons

- **Active Alerts Section**:
  - Shows unresolved alerts
  - Quick access to alerts page

- **Forecast Status**:
  - Last run time
  - Next scheduled run
  - Button to trigger immediate forecast

- **System Notifications**:
  - Latest forecast model reports
  - Key notifications from the system

## Sidebar Navigation
1. Dashboard Overview
2. Staff Management
3. Inventory Management
4. Low Stock Orders
5. Restock Tracking
6. Sales Analytics
7. Forecast Model
8. Alerts
9. Reports

## Backend API Integration
The manager dashboard integrates with:
- `/manager/dashboard-stats` - Dashboard statistics
- `/alerts` - Alert management
- `/notifications` - System notifications
- `/inventory` - Stock monitoring
- `/purchase-orders` - Restock order management
- `/staff-activities` - Staff oversight
- `/analytics` - Sales analytics data
- `/forecast` - Forecast model endpoints

## User Experience Flow
1. Manager logs in → Dashboard Overview
2. Reviews KPIs and current status
3. Identifies low stock items from alert section
4. Clicks "Order Stock" → Restock Tracking page
5. Creates purchase orders with suppliers
6. Monitors staff activities via Staff Oversight
7. Views sales analytics for insights
8. Triggers forecast model for demand prediction
9. Reviews all alerts and takes action
10. Generates reports for stakeholders

## Technical Implementation
- **Frontend**: React + TypeScript
- **UI Components**: Tailwind CSS with shadcn-ui
- **State Management**: React hooks
- **API Integration**: apiService for backend calls
- **Icons**: Lucide React icons
- **Responsive Design**: Mobile, tablet, desktop support
