import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import SuperAdminSetupPage from "./pages/SuperAdminSetupPage";

// Admin sub-pages
import AlertsPage from './pages/admin/AlertsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import InventoryPage from './pages/admin/InventoryPage';
import SettingsPage from './pages/admin/SettingsPage';
import UsersPage from './pages/admin/UsersPage';


import ManagerAlertsPage from './pages/manager/AlertsPage';
import ManagerAnalyticsPage from './pages/manager/AnalyticsPage';
import ManagerInventoryPage from './pages/manager/InventoryPage';


// Dashboards
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import ManagerDashboard from "./pages/dashboards/ManagerDashboard";
import StaffDashboard from "./pages/dashboards/StaffDashboard";
import SuperAdminDashboard from "./pages/dashboards/SuperAdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/setup" element={<SuperAdminSetupPage />} />

           {/* SuperAdmin Routes */}
<Route
  path="/superadmin"
  element={
    <ProtectedRoute allowedRoles={['SUPERADMIN']}>
      <SuperAdminDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/superadmin/users"
  element={
    <ProtectedRoute allowedRoles={['SUPERADMIN']}>
      <UsersPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/superadmin/*"
  element={
    <ProtectedRoute allowedRoles={['SUPERADMIN']}>
      <SuperAdminDashboard />
    </ProtectedRoute>
  }
/>
            {/* Admin Routes */}
           <Route
  path="/admin/*"
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminDashboard />
    </ProtectedRoute>
  }
>
  <Route path="users" element={<UsersPage />} />
  <Route path="inventory" element={<InventoryPage />} />
  <Route path="alerts" element={<AlertsPage />} />
  <Route path="analytics" element={<AnalyticsPage />} />
  <Route path="settings" element={<SettingsPage />} />
</Route>


      {/* Manager Routes */}
<Route
  path="/manager/*"
  element={
    <ProtectedRoute allowedRoles={['MANAGER']}>
      <ManagerDashboard />
    </ProtectedRoute>
  }
>
  <Route path="inventory" element={<ManagerInventoryPage />} />
  <Route path="alerts" element={<ManagerAlertsPage />} />
  <Route path="analytics" element={<ManagerAnalyticsPage />} />
</Route>

            {/* Staff Routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['STAFF']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/*"
              element={
                <ProtectedRoute allowedRoles={['STAFF']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
