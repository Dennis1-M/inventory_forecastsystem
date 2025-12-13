import { Outlet } from "react-router-dom";
import Topbar from "../components/Topbar";

const ManagerLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <h2 className="p-4 font-bold">Manager Panel</h2>
        <nav className="p-4 space-y-2">
          <a href="/manager">Dashboard</a>
          <a href="/manager/receive-stock">Receive Stock</a>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1">
        <Topbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
