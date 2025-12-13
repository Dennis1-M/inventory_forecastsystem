import CreateUser from "@/pages/admin/CreateUser";

import ViewUsers from "@/pages/admin/ViewUsers";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminDashboard from "./pages/admin/AdminDashboard";

import ManagerDashboard from "./pages/admin/ManagerDashboard";

import ForecastingAnalyticsPage from "./pages/admin/ForecastingAnalyticsPage";

import Login from "./pages/Login";


import StaffDashboard from "./pages/staff/StaffDashboard";

import LandingPage from "./pages/LandingPage";

import Register from "./pages/Register";

import ProductListPage from "./pages/ProductListPage";

import ManagerReceiveStockPage from "./pages/ManagerReceiveStockPage";

import StaffRestockPage from "./pages/StaffRestockPage";

import InventoryHistoryPage from "./pages/InventoryHistoryPage";

import ErrorBoundary from "./components/ErrorBoundary";






export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/inventory/history" element={<InventoryHistoryPage />} />
        <Route path="/admin/create-user" element={<CreateUser />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ViewUsers />} />
        <Route path="/admin/receive-stock" element={<ManagerReceiveStockPage />} />
        <Route path="/admin/forecast" element={<ForecastingAnalyticsPage />} />
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/restock" element={<StaffRestockPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
