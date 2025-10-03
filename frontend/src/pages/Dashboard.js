import React, { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get("products/").then((res) => setProducts(res.data));
    api.get("alerts/").then((res) => setAlerts(res.data));
  }, []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">📊 Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-sm text-gray-500">Total Products</h2>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-sm text-gray-500">Active Alerts</h2>
          <p className="text-2xl font-bold text-red-600">{alerts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-sm text-gray-500">Suppliers</h2>
          <p className="text-2xl font-bold">--</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">📦 Products</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Expiry</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.category_name}</td>
                <td className="p-2">{p.stock}</td>
                <td className="p-2">{p.expiry_date || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alerts List */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">⚠️ Alerts</h2>
        {alerts.length === 0 ? (
          <p className="text-gray-500">No alerts at the moment 🎉</p>
        ) : (
          <ul>
            {alerts.map((a) => (
              <li
                key={a.id}
                className="mb-2 p-2 border rounded bg-red-100 text-red-700"
              >
                <strong>{a.product_name}</strong>: {a.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
