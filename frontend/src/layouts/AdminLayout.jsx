import Sidebar from "@/components/AdminSidebar";
import Topbar from "@/components/Topbar";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Topbar toggleSidebar={() => setIsOpen((s) => !s)} title="Admin Dashboard" roleLabel="Admin" />

        <main className="flex-1 p-4 md:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
