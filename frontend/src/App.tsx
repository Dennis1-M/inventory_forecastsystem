import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import RegisterSuperuser from "./pages/RegisterSuperuser";

import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import NotAuthorized from "./pages/NotAuthorized";

import StaffDashboard from "./pages/dashboard/StaffDashboard";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>
          
          <Route path="/not-authorized" element={<NotAuthorized />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/register-superuser" element={<RegisterSuperuser />} />
          <Route path="/login" element={<Login />} />

          {/* Protected dashboards */}
          <Route
            path="/superadmin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager-dashboard"
            element={
              <ProtectedRoute allowedRoles={["MANAGER", "ADMIN", "SUPERADMIN"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-dashboard"
            element={
              <ProtectedRoute allowedRoles={["STAFF", "MANAGER", "ADMIN", "SUPERADMIN"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
