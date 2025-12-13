import LoadingSkeleton from "@/components/LoadingSkeleton";
import LowStockAlertsWidget from "@/components/LowStockAlertsWidget";
import OptimizedChart from "@/components/OptimizedChart";
import ProductTabs from "@/components/ProductTabs";
import AdminLayout from "@/layouts/AdminLayout";
import axiosClient from "@/lib/axiosClient";
import { AlertCircle, BarChart3, DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    forecastAccuracy: 0,
    lowStockCount: 0,
    totalRevenue: 0,
  });
  const [salesTrend, setSalesTrend] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
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

      const products = productsRes.data?.data || [];
      const lowStock = lowStockRes.data?.data || [];

      const totalSales = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);

      setStats({
        totalProducts: products.length,
        totalSales: Math.round(totalSales),
        forecastAccuracy: 90,
        lowStockCount: lowStock.length,
        totalRevenue: Math.round(totalSales * 0.35),
      });

      // Mock charts
      setSalesTrend([
        { date: "Dec 1", sales: 45 },
        { date: "Dec 2", sales: 52 },
        { date: "Dec 3", sales: 48 },
      ]);

      setCategoryBreakdown([
        { name: "Electronics", sales: 156, revenue: 18500 },
        { name: "Foods", sales: 245, revenue: 3920 },
      ]);
    } catch (err) {
      console.error(err);
      setStats({ totalProducts: 6, totalSales: 24200, forecastAccuracy: 90, lowStockCount: 2, totalRevenue: 8470 });
    } finally {
      setLoading(false);
    }
  }

  const MetricCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  // Role-based tabs for Manager
  const managerTabs = [
    { label: "Receive Stock", path: "/admin/receive-stock", roles: ["MANAGER"], icon: ShoppingCart },
    { label: "Forecasting", path: "/admin/forecast", roles: ["MANAGER"], icon: TrendingUp },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex gap-2">
            {managerTabs
              .filter(tab => tab.roles.includes(userRole))
              .map(tab => (
                <button
                  key={tab.label}
                  onClick={() => navigate(tab.path)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {loading ? Array(5).fill(0).map((_, i) => <LoadingSkeleton key={i} type="metric" />) :
            <>
              <MetricCard icon={Package} title="Total Products" value={stats.totalProducts} color="text-blue-600" />
              <MetricCard icon={DollarSign} title="Inventory Value" value={`$${(stats.totalSales / 1000).toFixed(1)}K`} color="text-green-600" />
              <MetricCard icon={BarChart3} title="Revenue" value={`$${(stats.totalRevenue / 1000).toFixed(1)}K`} color="text-emerald-600" />
              <MetricCard icon={TrendingUp} title="Forecast Accuracy" value={`${stats.forecastAccuracy}%`} color="text-purple-600" />
              <MetricCard icon={AlertCircle} title="Low Stock" value={stats.lowStockCount} color="text-red-600" />
            </>
          }
        </div>

        {/* Charts and Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <OptimizedChart data={salesTrend} type="line" height={300} />
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
