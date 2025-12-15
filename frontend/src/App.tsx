import { BrowserRouter, Route, Routes } from "react-router-dom";
import DebugPanel from "./components/DebugPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext"; // Import useAuth
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import RegisterSuperuser from "./pages/RegisterSuperuser";

import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import NotAuthorized from "./pages/NotAuthorized";

import StaffDashboard from "./pages/dashboard/StaffDashboard";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";

// In your App.tsx, add this route temporarily:
import TestLogin from "./pages/TestLogin"; // Add this import

// In your Routes, add:


function AppContent() {
  const { isInitialized } = useAuth();
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/not-authorized" element={<NotAuthorized />} />
      <Route path="/test-login" element={<TestLogin />} /> {/* Temporary test route */}
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
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
        {/* Add DebugPanel in development */}
        {process.env.NODE_ENV === 'development' && <DebugPanel />}
      </BrowserRouter>
    </AuthProvider>
  );
}