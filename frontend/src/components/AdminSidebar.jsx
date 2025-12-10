import {
    History,
    LayoutDashboard,
    LineChart,
    LogOut,
    Package,
    Settings,
    ShoppingCart,
    Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function Sidebar({ isOpen = false }) {
  const { logout } = useAuth();

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Products", icon: Package, path: "/products" },
    { name: "Receive Stock", icon: ShoppingCart, path: "/admin/receive-stock" },
    { name: "Inventory History", icon: History, path: "/inventory/history" },
    { name: "Sales", icon: ShoppingCart, path: "/admin/sales" },
    { name: "Forecast", icon: LineChart, path: "/admin/forecast" },
    { name: "Forecast History", icon: History, path: "/admin/history" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Register User", icon: Users, path: "/register" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <aside
      className={
        (isOpen ? "translate-x-0" : "-translate-x-64") +
        " bg-white shadow-lg h-screen fixed top-0 left-0 w-64 p-5 flex flex-col z-50 transition-transform md:translate-x-0"
      }
    >
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                "flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 " +
                (isActive ? "bg-gray-200 font-semibold" : "")
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* LOGOUT BUTTON FIXED */}
      <button
        onClick={logout}
        aria-label="Logout"
        className="mt-auto flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </aside>
  );
}
