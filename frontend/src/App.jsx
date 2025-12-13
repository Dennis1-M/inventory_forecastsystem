import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import PrivateRoute from "./components/PrivateRoute";

/* Layouts */
import AdminLayout from "./layouts/AdminLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import StaffLayout from "./layouts/StaffLayout";

/* Pages */
import AuthLogin from "./pages/AuthLogin";
import AuthRegisterSuperAdmin from "./pages/AuthRegisterSuperAdmin";
import LandingPage from "./pages/LandingPage";
import RegisterUser from "./pages/RegisterUser";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ForecastingAnalyticsPage from "./pages/admin/ForecastingAnalyticsPage";
import UserManagement from "./pages/admin/ViewUsers";

import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerReceiveStockPage from "./pages/ManagerReceiveStockPage";

import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffRestockPage from "./pages/StaffRestockPage";

import InventoryHistoryPage from "./pages/InventoryHistoryPage";
import ProductListPage from "./pages/ProductListPage";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>

          {/* ---------- PUBLIC ---------- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthLogin />} />
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route
            path="/auth/register-superadmin"
            element={<AuthRegisterSuperAdmin />}
          />

          {/* ---------- SHARED (ALL LOGGED USERS) ---------- */}
          <Route element={<PrivateRoute />}>
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/inventory/history" element={<InventoryHistoryPage />} />
          </Route>

          {/* ---------- ADMIN PANEL ---------- */}
          <Route element={<PrivateRoute requiredRole={["SUPERADMIN", "ADMIN"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="forecast" element={<ForecastingAnalyticsPage />} />
              <Route path="create-user" element={<RegisterUser />} />
            </Route>
          </Route>

          {/* SUPERADMIN ONLY */}
          <Route element={<PrivateRoute requiredRole="SUPERADMIN" />}>
            <Route path="/admin/users" element={<UserManagement />} />
          </Route>

          {/* ---------- MANAGER PANEL ---------- */}
          <Route element={<PrivateRoute requiredRole="MANAGER" />}>
            <Route path="/manager" element={<ManagerLayout />}>
              <Route index element={<ManagerDashboard />} />
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="receive-stock" element={<ManagerReceiveStockPage />} />
            </Route>
          </Route>

          {/* ---------- STAFF PANEL ---------- */}
          <Route element={<PrivateRoute requiredRole="STAFF" />}>
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="restock" element={<StaffRestockPage />} />
            </Route>
          </Route>

          {/* ---------- FALLBACK ---------- */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
