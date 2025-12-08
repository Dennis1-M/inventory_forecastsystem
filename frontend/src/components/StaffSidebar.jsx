import { History, LayoutDashboard, LineChart, LogOut, Package, Settings, ShoppingCart } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function StaffSidebar({ isOpen = false }) {
  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/staff/dashboard" },
    { name: "Products", icon: Package, path: "/staff/products" },
    { name: "Sales", icon: ShoppingCart, path: "/staff/sales" },
    { name: "Forecast", icon: LineChart, path: "/staff/forecast" },
    { name: "Forecast History", icon: History, path: "/staff/history" },
    { name: "Settings", icon: Settings, path: "/staff/settings" },
  ];

  return (
    <aside
      className={
        (isOpen ? "translate-x-0" : "-translate-x-64") +
        " bg-white shadow-lg h-screen fixed top-0 left-0 w-64 p-5 flex flex-col z-50 transition-transform md:translate-x-0"
      }
    >
      <h2 className="text-2xl font-bold mb-6">Staff Panel</h2>

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

      <button className="mt-auto flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg">
        <LogOut className="w-5 h-5" /> <span>Logout</span>
      </button>
    </aside>
  );
}
