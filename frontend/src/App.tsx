// App.tsx
// NOTE:
// - BrowserRouter is PROVIDED in main.tsx (DO NOT add it here)
// - QueryClientProvider is PROVIDED in main.tsx
// - AuthProvider is PROVIDED in main.tsx
// This file must ONLY define routes and UI-level providers

import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import api from "@/lib/axiosClient";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import SuperAdminSetupPage from "./pages/SuperAdminSetupPage";
import Unauthorized from "./pages/Unauthorized";

// Admin sub-pages
import AlertsPage from "./pages/admin/AlertsPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import InventoryPage from "./pages/admin/InventoryPage";
import SettingsPage from "./pages/admin/SettingsPage";
import UsersPage from "./pages/admin/UsersPage";

// Dashboards
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import ManagerDashboard from "./pages/dashboards/ManagerDashboard";

// Manager pages
import CycleCountHistoryPage from './pages/manager/CycleCountHistoryPage';
import CycleCountPage from './pages/manager/CycleCountPage';
import GrossMarginPage from './pages/manager/GrossMarginPage';
import PurchaseOrdersPage from './pages/manager/PurchaseOrdersPage';

import StaffDashboard from "./pages/dashboards/StaffDashboard";
import SuperAdminDashboard from "./pages/dashboards/SuperAdminDashboard";

// POS Page

import type { Product } from "@/types/pos";

// ------------------ Staff Dashboard Wrapper ------------------
const StaffDashboardWrapper = () => {
  const { user } = useAuth();

  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data;
    },
  });

  // Loading guard
  if (!user || isLoading) return <div>Loading...</div>;

  // Role guard (extra safety)
  if (user.role !== "STAFF") return <div>Access Denied</div>;

  return <StaffDashboard user={user} products={products} />;
};

// ------------------ App ------------------
const App = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <Routes>
        {/* ---------------- Public Routes ---------------- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SuperAdminSetupPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} /> {/* new route */}

        {/* ---------------- SuperAdmin Routes ---------------- */}
        <Route
          path="/superadmin/*"
          element={
            <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/users"
          element={
            <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* ---------------- Admin Routes ---------------- */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
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

        {/* ---------------- Manager Routes ---------------- */}
        <Route
          path="/manager/*"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/purchase-orders"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <PurchaseOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/cycle-counts/history"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <CycleCountHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/cycle-counts"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <CycleCountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/cycle-counts/history"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <CycleCountHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/cycle-counts/:id"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <CycleCountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/reports/gross-margin"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <GrossMarginPage />
            </ProtectedRoute>
          }
        />

        {/* ---------------- Staff Routes ---------------- */}
        <Route
          path="/staff/*"
          element={
            <ProtectedRoute allowedRoles={["STAFF"]}>
              <StaffDashboardWrapper />
            </ProtectedRoute>
          }
        />

        {/* ---------------- Staff POS ---------------- */}
        <Route
          path="/staff/pos"
          element={
            <ProtectedRoute allowedRoles={["STAFF"]}>
              <POSPage />
            </ProtectedRoute>
          }
        />

        {/* ---------------- Catch-all ---------------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
};

export default App;
