import CreateUser from "@/pages/admin/CreateUser";

import ViewUsers from "@/pages/admin/ViewUsers";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminDashboard from "./pages/admin/AdminDashboard";

import Login from "./pages/Login";

import StaffDashboard from "./pages/staff/StaffDashboard";

export default function App() {
  return (
    <BrowserRouter>
    
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/admin/create-user" element={<CreateUser />} />
        
        <Route path="/login" element={<Login />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/staff/dashboard" element={<StaffDashboard />} />

        <Route path="*" element={<Navigate to="/login" replace />} />

        <Route path="/admin/users" element={<ViewUsers />} />

      </Routes>

    </BrowserRouter>
  );
}
