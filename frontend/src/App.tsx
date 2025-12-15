import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import RegisterSuperuser from "./pages/RegisterSuperuser";
import Settings from "./pages/Settings";

// Import all dashboards
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import StaffDashboard from "./pages/dashboard/StaffDashboard";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";

import NotAuthorized from "./pages/NotAuthorized";

// Create a simple inline loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
);

// Create a simple inline ProtectedRoute component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user?.role || !allowedRoles.includes(user.role)) {
        return <Navigate to="/not-authorized" replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
  }
  
  return <>{children}</>;
};

// Add this import at the top if needed
import { Navigate } from "react-router-dom";

function AppContent() {
  const [superAdminExists, setSuperAdminExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/check-superadmin');
      const data = await response.json();
      setSuperAdminExists(data.exists);
    } catch (error) {
      console.error('Error checking SuperAdmin:', error);
      setSuperAdminExists(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/not-authorized" element={<NotAuthorized />} />
      
      {/* SuperAdmin registration - only show if no SuperAdmin exists */}
      {!superAdminExists && (
        <Route path="/register-superuser" element={<RegisterSuperuser />} />
      )}
      
      {/* Login - always available */}
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
      
      {/* Protected settings page for all authenticated users */}
      <Route
  path="/settings"
  element={
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  }
    />
      {/* Catch-all redirect */}
      <Route path="*" element={
        superAdminExists ? <Login /> : <RegisterSuperuser />
      } />
    </Routes>
      


  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}