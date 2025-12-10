import Sidebar from "@/components/AdminSidebar";
import Topbar from "@/components/Topbar";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={isOpen} />
      <Topbar toggleSidebar={() => setIsOpen((s) => !s)} title="Admin Dashboard" roleLabel="Admin" />

      <main className="pt-20 md:ml-64 p-4 bg-gray-100 min-h-screen">
        {children}
      </main>
    </>
  );
}
