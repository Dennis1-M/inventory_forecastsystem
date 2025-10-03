import React from "react";
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 text-xl font-bold text-blue-600">Inventory App</div>
        <nav className="mt-6">
          <ul>
            <li>
              <Link
                to="/"
                className="block py-2 px-4 hover:bg-blue-100 rounded"
              >
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className="block py-2 px-4 hover:bg-blue-100 rounded"
              >
                📦 Products
              </Link>
            </li>
            <li>
              <Link
                to="/alerts"
                className="block py-2 px-4 hover:bg-blue-100 rounded"
              >
                ⚠️ Alerts
              </Link>
            </li>
            <li>
              <Link
                to="/suppliers"
                className="block py-2 px-4 hover:bg-blue-100 rounded"
              >
                🏭 Suppliers
              </Link>
            </li>
            <li>
              <Link
                to="/sales"
                className="block py-2 px-4 hover:bg-blue-100 rounded"
              >
                💰 Sales
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
