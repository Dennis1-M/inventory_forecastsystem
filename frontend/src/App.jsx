import CreateUser from "@/pages/admin/CreateUser";
import ViewUsers from "@/pages/admin/ViewUsers";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagerDashboard from "./pages/admin/ManagerDashboard";
import ForecastingAnalyticsPage from "./pages/admin/ForecastingAnalyticsPage";
import AuthLogin from "./pages/AuthLogin";
import AuthRegisterSuperAdmin from "./pages/AuthRegisterSuperAdmin";
import RegisterUser from "./pages/RegisterUser";
import UserManagement from "./pages/UserManagement";
import StaffDashboard from "./pages/staff/StaffDashboard";
import LandingPage from "./pages/LandingPage";
import ProductListPage from "./pages/ProductListPage";
import ManagerReceiveStockPage from "./pages/ManagerReceiveStockPage";
import StaffRestockPage from "./pages/StaffRestockPage";
import InventoryHistoryPage from "./pages/InventoryHistoryPage";
import ErrorBoundary from "./components/ErrorBoundary";
import PrivateRoute from "./components/PrivateRoute";






export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<AuthLogin />} />
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/auth/register-superadmin" element={<AuthRegisterSuperAdmin />} />
          <Route path="/auth/register-user" element={<PrivateRoute requiredRole={["SUPERADMIN", "ADMIN"]}><RegisterUser /></PrivateRoute>} />
          
          {/* Protected Routes - All Users */}
          <Route path="/products" element={<PrivateRoute><ProductListPage /></PrivateRoute>} />
          <Route path="/inventory/history" element={<PrivateRoute><InventoryHistoryPage /></PrivateRoute>} />
          
          {/* Protected Routes - SuperAdmin & Admin Only */}
          <Route path="/admin/create-user" element={<PrivateRoute requiredRole={["SUPERADMIN", "ADMIN"]}><RegisterUser /></PrivateRoute>} />
          <Route path="/admin/dashboard" element={<PrivateRoute requiredRole={["SUPERADMIN", "ADMIN"]}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute requiredRole="SUPERADMIN"><UserManagement /></PrivateRoute>} />
          <Route path="/admin/receive-stock" element={<PrivateRoute requiredRole={["SUPERADMIN", "ADMIN"]}><ManagerReceiveStockPage /></PrivateRoute>} />
          <Route path="/admin/forecast" element={<PrivateRoute requiredRole={["SUPERADMIN", "ADMIN"]}><ForecastingAnalyticsPage /></PrivateRoute>} />
          
          {/* Protected Routes - Manager Only */}
          <Route path="/manager/dashboard" element={<PrivateRoute requiredRole="MANAGER"><ManagerDashboard /></PrivateRoute>} />
          
          {/* Protected Routes - Staff Only */}
          <Route path="/staff/dashboard" element={<PrivateRoute requiredRole="STAFF"><StaffDashboard /></PrivateRoute>} />
          <Route path="/staff/restock" element={<PrivateRoute requiredRole="STAFF"><StaffRestockPage /></PrivateRoute>} />
          
          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
