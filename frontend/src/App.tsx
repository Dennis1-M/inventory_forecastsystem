// App.tsx - FIXED VERSION
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdminDashboardLayout from './layouts/AdminDashboard';
import ManagerDashboard from './layouts/ManagerDashboard';
import StaffDashboard from './layouts/StaffDashboard';
import AdminDashboardPage from './pages/dashboard/AdminDashboard';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

// Import admin pages
import AlertsPage from './pages/admin/Alerts';
import AnalyticsPage from './pages/admin/Analytics';
import InventoryPage from './pages/admin/Inventory';
import ProductsPage from './pages/admin/products';
import SalesPage from './pages/admin/sales';
import SettingsPage from './pages/admin/Settings';
import UsersPage from './pages/admin/users';

// Import manager pages  
import ManagerDashboardPage from './pages/manager/Dashboard';
import InventoryMovementPage from './pages/manager/InventoryMovement';
import StockRequestPage from './pages/manager/StockRequest';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Super Admin Route (Uses its own layout from SuperAdminDashboard) */}
          <Route path="/superadmin/*" element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes with Layout Wrapper */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <AdminDashboardLayout>
                <Routes>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="sales" element={<SalesPage />} />
                  <Route path="alerts" element={<AlertsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Routes>
              </AdminDashboardLayout>
            </ProtectedRoute>
          } />
          
          // Update the manager route
<Route path="/manager/*" element={
  <ProtectedRoute allowedRoles={['MANAGER']}>
    <ManagerDashboard>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboardPage />} />
        <Route path="stock/request" element={<StockRequestPage />} />
        <Route path="inventory/movement" element={<InventoryMovementPage />} />
        <Route path="team" element={<div>Team Management</div>} />
        <Route path="orders" element={<div>Orders Management</div>} />
        <Route path="inventory" element={<div>Inventory Management</div>} />
        <Route path="reports" element={<div>Reports</div>} />
        <Route path="tasks" element={<div>Task Management</div>} />
        
      </Routes>
    </ManagerDashboard>
  </ProtectedRoute>
} />
          
          {/* Staff Route */}
          <Route path="/staff/*" element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;