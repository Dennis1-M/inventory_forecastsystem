import StaffSidebar from "@/components/StaffSidebar";
import Topbar from "@/components/Topbar";
import { useState } from "react";

export default function StaffLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <StaffSidebar isOpen={isOpen} />
      <Topbar toggleSidebar={() => setIsOpen((s) => !s)} title="Staff Dashboard" roleLabel="Staff" />

      <main className="pt-20 md:ml-64 p-4 bg-gray-100 min-h-screen">
        {children}
      </main>
    </>
  );
}
