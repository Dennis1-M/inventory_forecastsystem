# User Manual

## AI-Enabled Inventory Forecasting System
### For Small and Medium-Sized Retail Businesses in Kenya

**Version:** 1.0  
**Date:** January 9, 2026  
**Institution:** Dedan Kimathi University of Technology  
**Project:** Final Year BSc Information Technology

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Requirements](#2-system-requirements)
3. [Getting Started](#3-getting-started)
4. [User Roles and Permissions](#4-user-roles-and-permissions)
5. [SuperAdmin Guide](#5-superadmin-guide)
6. [Admin Guide](#6-admin-guide)
7. [Manager Guide](#7-manager-guide)
8. [Staff Guide](#8-staff-guide)
9. [Common Features](#9-common-features)
10. [Troubleshooting](#10-troubleshooting)
11. [Frequently Asked Questions](#11-frequently-asked-questions)
12. [Support](#12-support)

---

## 1. Introduction

### 1.1 What is the System?

The AI-Enabled Inventory Forecasting System is a comprehensive web-based platform designed to help small and medium-sized retail businesses in Kenya manage inventory, track sales, and predict future demand using artificial intelligence.

### 1.2 Key Features

- ✅ **Inventory Management:** Track products, stock levels, and movements
- ✅ **Point of Sale (POS):** Process sales transactions with M-Pesa and cash payments
- ✅ **AI Forecasting:** Predict future demand using machine learning (Linear Regression, XGBoost)
- ✅ **Smart Alerts:** Automatic notifications for low stock, expiring products, and aging inventory
- ✅ **WhatsApp Notifications:** Real-time alerts sent to your phone
- ✅ **Advanced Analytics:** Charts, graphs, and insights for better decision-making
- ✅ **Role-Based Access:** Four user levels with appropriate permissions
- ✅ **Activity Logging:** Complete audit trail of all system actions

### 1.3 Benefits

- 📈 **Reduce Stockouts:** Never run out of popular items
- 💰 **Minimize Waste:** Get alerts before products expire
- 📊 **Data-Driven Decisions:** Use AI predictions instead of guesswork
- ⏰ **Save Time:** Automated alerts and forecasting
- 🔒 **Secure:** Role-based access and encrypted data

---

## 2. System Requirements

### 2.1 Hardware Requirements

**Minimum:**
- Computer or laptop with 4GB RAM
- Smartphone with WhatsApp (for notifications)
- Internet connection (512 kbps minimum)

**Recommended:**
- Computer with 8GB RAM
- Modern smartphone (Android/iOS)
- Broadband internet (2 Mbps+)

### 2.2 Software Requirements

**Web Browsers (latest versions):**
- Google Chrome ✅ (Recommended)
- Mozilla Firefox ✅
- Microsoft Edge ✅
- Safari ✅ (Mac/iOS)

**Mobile Devices:**
- Responsive design works on all screen sizes
- Mobile browser access (Chrome Mobile, Safari Mobile)

### 2.3 Network Requirements

- Stable internet connection
- Access to backend server (provided by administrator)
- WhatsApp installed for notifications (optional but recommended)

---

## 3. Getting Started

### 3.1 Accessing the System

1. **Open your web browser**
2. **Navigate to:** `http://[your-server-address]:5173`
   - Example: `http://localhost:5173` (development)
   - Example: `http://business.com/inventory` (production)
3. **You will see the login page**

### 3.2 First-Time Login

**Credentials provided by administrator:**
- **Email:** Your work email address
- **Password:** Temporary password (change immediately)

**Steps:**
1. Enter your email address
2. Enter temporary password
3. Click **"Login"**
4. You will be prompted to change your password
5. Enter a strong new password (min 8 characters, include numbers and symbols)
6. Click **"Update Password"**

### 3.3 Dashboard Overview

After logging in, you'll see your role-specific dashboard:

**Common Elements:**
- **Sidebar Menu:** Navigate between pages
- **Top Bar:** User profile, notifications, logout
- **Main Content Area:** Page-specific content
- **Stats Cards:** Quick overview of key metrics

---

## 4. User Roles and Permissions

The system has four user roles with different access levels:

### 4.1 SuperAdmin (System Owner)

**Can do everything:**
- ✅ Manage all users (create, edit, delete)
- ✅ Access all system features
- ✅ View all reports and analytics
- ✅ Configure system settings
- ✅ Manage suppliers and categories
- ✅ Override all restrictions

### 4.2 Admin (Store Manager)

**Full operational access:**
- ✅ Manage products and inventory
- ✅ Process purchase orders
- ✅ View forecasts and alerts
- ✅ Generate reports
- ✅ Manage categories and suppliers
- ✅ View activity logs
- ❌ Cannot create/delete users (view only)

### 4.3 Manager (Department Manager)

**Analytical and monitoring access:**
- ✅ View dashboards and analytics
- ✅ See forecasting predictions
- ✅ Monitor alerts
- ✅ Export reports (sales, inventory)
- ✅ View products (read-only)
- ❌ Cannot modify inventory
- ❌ Cannot create purchase orders

### 4.4 Staff (Sales Personnel)

**Point of sale and basic operations:**
- ✅ Process sales transactions (POS)
- ✅ View products and prices
- ✅ Check stock availability
- ✅ View sales history
- ✅ Log shift start/end times
- ❌ Cannot access analytics
- ❌ Cannot modify products

---

## 5. SuperAdmin Guide

### 5.1 User Management

**To Create a New User:**

1. Click **"Users"** in sidebar
2. Click **"+ Add User"** button
3. Fill in user details:
   - Full Name
   - Email Address
   - Phone Number (for WhatsApp)
   - Role (SuperAdmin/Admin/Manager/Staff)
   - Initial Password
4. Click **"Create User"**
5. New user receives login credentials via email

**To Edit a User:**

1. Go to **Users** page
2. Click **"Edit"** icon next to user
3. Modify details
4. Click **"Save Changes"**

**To Delete a User:**

1. Go to **Users** page
2. Click **"Delete"** icon next to user
3. Confirm deletion
4. User account is deactivated (data retained for audit)

### 5.2 System Configuration

**Forecast Settings:**

1. Navigate to **Settings → Forecasting**
2. Configure:
   - Forecast period (7, 14, 30 days)
   - Model selection (Linear Regression, XGBoost)
   - Confidence threshold
3. Click **"Save Settings"**

**Alert Thresholds:**

1. Go to **Settings → Alerts**
2. Set thresholds:
   - Low Stock Alert: e.g., 10 units
   - Expiry Alert: e.g., 30 days before expiry
   - Aging Stock: e.g., 90 days without sale
3. Click **"Save Thresholds"**

**WhatsApp Notifications:**

1. Navigate to **Settings → Notifications**
2. Enter Twilio credentials:
   - Account SID
   - Auth Token
   - WhatsApp Number
3. Test connection
4. Enable notification types (low stock, expiry, critical alerts)

### 5.3 Supplier Management

**To Add a Supplier:**

1. Go to **Suppliers** page
2. Click **"+ Add Supplier"**
3. Enter details:
   - Supplier Name
   - Contact Person
   - Phone Number
   - Email Address
   - Physical Address
   - Payment Terms
4. Click **"Create Supplier"**

---

## 6. Admin Guide

### 6.1 Product Management

**To Add a New Product:**

1. Navigate to **Products** page
2. Click **"+ Add Product"**
3. Fill in product information:
   - **Basic Info:**
     - Product Name
     - SKU/Barcode
     - Category (select from dropdown)
     - Supplier (select from dropdown)
   - **Pricing:**
     - Cost Price (buying price)
     - Selling Price
     - Profit Margin (auto-calculated)
   - **Inventory:**
     - Current Stock
     - Low Stock Threshold
     - Reorder Point
   - **Expiry Tracking:**
     - Expiry Date (for perishables)
   - **Location:**
     - Warehouse/Store Location
4. Click **"Create Product"**

**To Edit a Product:**

1. Find product in **Products** list
2. Click **"Edit"** icon
3. Modify fields
4. Click **"Save Changes"**

### 6.2 Purchase Order Management

**To Create a Purchase Order:**

1. Go to **Purchase Orders** page
2. Click **"+ New Purchase Order"**
3. Select **Supplier**
4. Add products:
   - Click **"Add Product"**
   - Select product from dropdown
   - Enter quantity
   - Enter unit cost
   - Click **"Add"**
5. Repeat for all products
6. Set **Expected Delivery Date**
7. Review total amount
8. Click **"Create Purchase Order"**

**Purchase Order Statuses:**
- **Pending:** Awaiting approval
- **Approved:** Ready to order
- **Ordered:** Sent to supplier
- **Received:** Delivered and verified
- **Cancelled:** Order cancelled

**To Receive a Purchase Order:**

1. Go to **Purchase Orders**
2. Find order with status "Ordered"
3. Click **"Receive"** button
4. Verify received quantities
5. Note any discrepancies
6. Click **"Confirm Receipt"**
7. **Stock levels automatically update**

### 6.3 Alert Management

**Viewing Alerts:**

1. Navigate to **Alerts** page
2. See all active alerts:
   - 🔴 **Low Stock:** Products below threshold
   - ⏰ **Expiring Soon:** Products near expiry
   - 📦 **Aging Stock:** Products not selling
   - ⚠️ **Critical:** Urgent attention needed

**To Resolve an Alert:**

1. Click on alert to view details
2. Take appropriate action:
   - **Low Stock:** Create purchase order
   - **Expiring Soon:** Promote product (discount)
   - **Aging Stock:** Review pricing or remove
3. Click **"Mark as Resolved"**
4. Alert moves to history

**To Create a Purchase Order from Alert:**

1. Click **"Create PO"** button on low stock alert
2. System pre-fills:
   - Product
   - Suggested quantity (based on forecast)
   - Preferred supplier
3. Review and adjust
4. Click **"Create"**

### 6.4 Category Management

**To Create a Category:**

1. Go to **Categories** page
2. Click **"+ Add Category"**
3. Enter:
   - Category Name (e.g., "Beverages", "Dairy", "Snacks")
   - Description (optional)
4. Click **"Create"**

**To Edit/Delete a Category:**

1. Find category in list
2. Click **"Edit"** or **"Delete"**
3. Confirm action

---

## 7. Manager Guide

### 7.1 Viewing Forecasts

**To Access Forecasting:**

1. Navigate to **Forecasting** page
2. Select product from dropdown
3. Choose forecast period:
   - 7 days
   - 14 days
   - 30 days
4. Click **"Generate Forecast"**

**Understanding the Forecast:**

- **Chart:** Visual prediction of demand
- **Predicted Quantity:** Expected sales per day
- **Confidence Interval:** Range of possible outcomes
- **Model Used:** Linear Regression or XGBoost
- **Accuracy:** Historical accuracy percentage

**Using Forecasts for Planning:**

- Compare forecast to current stock
- Plan purchase orders to meet demand
- Identify trends (increasing/decreasing sales)
- Adjust pricing based on predictions

### 7.2 Analytics Dashboard

**Accessing Charts & Graphs:**

1. Navigate to **Charts & Graphs** page
2. Select time period:
   - Last 7 days
   - Last 30 days
   - Last 90 days
   - Last 1 year
3. View analytics:

**Available Charts:**

- **📈 Daily Sales Trend:** Sales over time
- **🥧 Sales by Category:** Pie chart showing distribution
- **💳 Payment Methods:** Cash vs M-Pesa breakdown
- **🏆 Top Products:** Best-selling items by revenue
- **📊 Sales Statistics:**
  - Total Revenue
  - Total Transactions
  - Average Transaction Value
  - Items Sold

**Exporting Reports:**

1. Click **"Export Report"** button
2. Select format:
   - CSV (Excel-compatible)
   - PDF (for presentations)
3. File downloads automatically
4. Open in Excel or print

### 7.3 Inventory Monitoring

**Real-Time Stock Levels:**

1. Go to **Inventory** page
2. View all products with:
   - Current stock
   - Stock status (In Stock, Low, Out of Stock)
   - Last updated timestamp

**Filter and Search:**

- Search by product name or SKU
- Filter by category
- Filter by stock status
- Sort by quantity (ascending/descending)

---

## 8. Staff Guide

### 8.1 Point of Sale (POS)

**Processing a Sale:**

1. Navigate to **POS** page
2. **Add products to cart:**
   - Search product by name or scan barcode
   - Select product from results
   - Enter quantity
   - Click **"Add to Cart"**
3. **Review cart:**
   - Check items and quantities
   - Remove items if needed (click X icon)
4. **Complete transaction:**
   - Select payment method:
     - 💵 **Cash**
     - 📱 **M-Pesa**
   - If M-Pesa: Enter transaction code
   - Review total amount
   - Click **"Complete Sale"**
5. **Receipt:**
   - Print receipt (if printer configured)
   - Or download PDF receipt

### 8.2 Sales History

**Viewing Past Sales:**

1. Go to **Sales History** page
2. See all transactions:
   - Date and time
   - Customer (if recorded)
   - Items sold
   - Total amount
   - Payment method
3. **Search and Filter:**
   - Search by receipt number
   - Filter by date range
   - Filter by payment method

**Viewing Sale Details:**

1. Click on a sale in the list
2. See full breakdown:
   - All items in transaction
   - Quantities and prices
   - Subtotals and totals
   - Payment information
   - Staff member who processed sale

### 8.3 Shift Management

**Starting a Shift:**

1. Click **"Shift Summary"** in sidebar
2. Click **"Start Shift"** button
3. System logs your start time
4. Begin processing sales

**Viewing Shift Summary:**

- Go to **Shift Summary** page
- See real-time statistics:
  - Shift duration
  - Number of transactions
  - Total sales amount
  - Cash collected
  - M-Pesa transactions

**Ending a Shift:**

1. Go to **Shift Summary**
2. Review shift statistics
3. Click **"End Shift"**
4. System logs end time and generates report
5. Print or download shift report for manager

### 8.4 Profile Settings

**Updating Your Profile:**

1. Click **"Profile Settings"** in sidebar
2. Update information:
   - Full Name
   - Email Address
   - Phone Number (for WhatsApp alerts)
3. Click **"Save Changes"**

**Changing Your Password:**

1. Go to **Profile Settings**
2. Scroll to **Change Password** section
3. Enter:
   - Current Password
   - New Password
   - Confirm New Password
4. Click **"Update Password"**
5. You'll be logged out - login with new password

---

## 9. Common Features

### 9.1 Search Functionality

**Global Search:**
- Located in top navigation bar
- Search across:
  - Products
  - Categories
  - Suppliers
  - Sales records
- Type and press Enter

### 9.2 Notifications

**Bell Icon (Top Right):**
- Shows unread notification count
- Click to see:
  - Low stock alerts
  - Expiry warnings
  - System messages
- Mark as read by clicking

**WhatsApp Notifications:**
- Receive critical alerts on your phone
- Configure in Profile Settings
- Types:
  - Low Stock
  - Expiring Products
  - Critical System Alerts

### 9.3 Data Export

**Available for:**
- Sales reports
- Inventory lists
- Product catalogs
- Activity logs

**How to Export:**
1. Navigate to relevant page
2. Click **"Export"** button
3. Choose format (CSV/Excel)
4. File downloads automatically

### 9.4 Help and Support

**In-App Help:**
- Question mark icon (?)  in top bar
- Hover over fields for tooltips
- Context-sensitive help text

**Getting Support:**
- Email: support@business.com
- Phone: +254XXXXXXXXX
- In-person: Visit IT department

---

## 10. Troubleshooting

### 10.1 Login Issues

**Problem: "Invalid credentials"**
- ✅ Check email spelling (case-sensitive)
- ✅ Verify password (check Caps Lock)
- ✅ Use "Forgot Password" link to reset

**Problem: "Account locked"**
- ❌ Too many failed login attempts
- 📞 Contact administrator to unlock

### 10.2 Performance Issues

**Problem: Page loading slowly**
- ✅ Check internet connection
- ✅ Clear browser cache (Ctrl+Shift+Delete)
- ✅ Close unnecessary browser tabs
- ✅ Try different browser

**Problem: System timeout**
- ⏰ Session expired after inactivity
- 🔄 Refresh page and login again

### 10.3 POS Issues

**Problem: Product not found**
- ✅ Check spelling
- ✅ Search by SKU/barcode
- ✅ Verify product exists in system
- 📞 Contact admin if missing

**Problem: "Insufficient stock"**
- ❌ Not enough inventory for sale
- 📊 Check current stock level
- 📦 Wait for purchase order delivery
- 🔄 Or reduce sale quantity

### 10.4 Data Sync Issues

**Problem: Changes not saving**
- 📡 Check internet connection
- 🔄 Refresh page
- 💾 Try saving again
- 📞 Contact support if persists

**Problem: Outdated data showing**
- 🔄 Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- 🧹 Clear browser cache
- 🚪 Logout and login again

### 10.5 WhatsApp Notifications Not Working

**Problem: Not receiving alerts**
- ✅ Verify phone number in profile
- ✅ Check WhatsApp is installed
- ✅ Ensure notifications enabled in profile settings
- 📞 Contact admin to verify Twilio configuration

---

## 11. Frequently Asked Questions

### 11.1 General Questions

**Q: Can I use the system on my mobile phone?**  
A: Yes! The system is fully responsive and works on all mobile devices. Just open your mobile browser and navigate to the system URL.

**Q: Is my data secure?**  
A: Yes. All data is encrypted, passwords are hashed, and access is role-based. The system complies with Kenya Data Protection Act, 2019.

**Q: Can I work offline?**  
A: No, an internet connection is required. This ensures real-time data synchronization across all users.

**Q: How accurate are the forecasts?**  
A: Our ML models achieve 85%+ accuracy based on formal testing. Accuracy improves with more historical data.

### 11.2 Product Management

**Q: How do I handle products without expiry dates?**  
A: Leave the expiry date field blank. The system only tracks expiry for perishables.

**Q: Can I import products from Excel?**  
A: Yes (coming soon). Contact admin for bulk import template.

**Q: What happens when stock reaches zero?**  
A: Product marked "Out of Stock". Automatic low stock alert sent. POS blocks sales until restocked.

### 11.3 Sales and POS

**Q: Can I process a sale on credit?**  
A: Not currently. System supports Cash and M-Pesa only. Credit sales coming in future update.

**Q: How do I handle returns/refunds?**  
A: Contact manager or admin. They can reverse the transaction and restore stock.

**Q: Can I give discounts?**  
A: Yes (coming soon). Current version uses fixed prices only.

### 11.4 Forecasting

**Q: How often are forecasts updated?**  
A: Forecasts regenerate daily at midnight. You can manually trigger updates anytime.

**Q: Why are some forecasts marked "Low Confidence"?**  
A: Insufficient historical data (less than 30 days). Forecasts improve over time.

**Q: Which model is better: Linear Regression or XGBoost?**  
A: XGBoost generally performs better for complex patterns. System auto-selects based on data characteristics.

---

## 12. Support

### 12.1 Contact Information

**Technical Support:**  
📧 Email: support@business.com  
📞 Phone: +254XXXXXXXXX  
⏰ Hours: Monday-Friday, 8:00 AM - 5:00 PM EAT

**Administrator:**  
📧 Email: admin@business.com  
📞 Phone: +254XXXXXXXXX

**Emergency After-Hours:**  
📞 Phone: +254XXXXXXXXX (Critical issues only)

### 12.2 Reporting Bugs

**If you encounter a bug:**

1. Note the exact error message
2. Record steps to reproduce
3. Take a screenshot
4. Email to: bugs@business.com
5. Include:
   - Your name and role
   - Date and time
   - Browser and device
   - Description of issue

### 12.3 Feature Requests

**Have an idea for improvement?**

📝 Email: feedback@business.com  
💡 Include detailed description and use case

### 12.4 Training

**Need additional training?**

- 🎓 Contact HR to schedule session
- 📹 Video tutorials available at: [training portal URL]
- 📖 PDF version of this manual: [download link]

---

## Appendix A: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + /` | Open search |
| `Ctrl + S` | Save (on edit forms) |
| `Esc` | Close dialog/modal |
| `Ctrl + P` | Print receipt (POS) |
| `F5` | Refresh page |
| `Ctrl + F5` | Hard refresh (clear cache) |

---

## Appendix B: System Status Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green | System operational |
| 🟡 Yellow | Warning/attention needed |
| 🔴 Red | Critical issue/error |
| 🔵 Blue | Information |
| ⚪ Gray | Inactive/disabled |

---

## Appendix C: Glossary

**AI (Artificial Intelligence):** Computer systems that perform tasks requiring human intelligence, like forecasting.

**Barcode/SKU:** Unique identifier for products (Stock Keeping Unit).

**Forecast:** Prediction of future demand based on historical data.

**Low Stock Threshold:** Minimum quantity before alert is triggered.

**MAE (Mean Absolute Error):** Measure of forecast accuracy (lower is better).

**POS (Point of Sale):** System for processing customer transactions.

**Reorder Point:** Stock level at which new order should be placed.

**Shift:** Work period for staff member (start time to end time).

**XGBoost:** Advanced machine learning algorithm for forecasting.

---

## Document Information

**Title:** User Manual - AI-Enabled Inventory Forecasting System  
**Version:** 1.0  
**Date:** January 9, 2026  
**Author:** [Your Name]  
**Institution:** Dedan Kimathi University of Technology  
**Project:** Final Year BSc Information Technology

**Revision History:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-09 | Initial release | [Your Name] |

---

**End of User Manual**
