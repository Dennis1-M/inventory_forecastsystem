import LoadingSkeleton from "@/components/LoadingSkeleton";
import LowStockAlertsWidget from "@/components/LowStockAlertsWidget";
import OptimizedChart from "@/components/OptimizedChart";
import ProductTabs from "@/components/ProductTabs";
import AdminLayout from "@/layouts/AdminLayout";
import axiosClient from "@/lib/axiosClient";
import { useEffect, useState } from "react";

export default function StaffDashboard() {
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  const [stats, setStats] = useState({ totalProducts: 0, lowStockCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [productsRes, lowStockRes] = await Promise.all([
        axiosClient.get("/api/products"),
        axiosClient.get("/api/products/low-stock"),
      ]);

      setStats({
        totalProducts: productsRes.data?.data.length || 0,
        lowStockCount: lowStockRes.data?.data.length || 0,
      });
    } catch (err) {
      console.error(err);
      setStats({ totalProducts: 6, lowStockCount: 2 });
    } finally {
      setLoading(false);
    }
  }

  const MetricCard = ({ title, value, color }) => (
    <div className={`bg-white p-6 rounded-xl shadow hover:shadow-lg transition ${color}`}>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">Welcome back, {user?.name}!</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            Array(2).fill(0).map((_, i) => <LoadingSkeleton key={i} type="metric" />)
          ) : (
            <>
              <MetricCard title="Total Products" value={stats.totalProducts} color="text-blue-600" />
              <MetricCard title="Low Stock" value={stats.lowStockCount} color="text-red-600" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <OptimizedChart data={[]} type="line" height={300} />
          </div>
          <LowStockAlertsWidget />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Product Inventory</h2>
          <ProductTabs />
        </div>
      </div>
    </AdminLayout>
  );
}
