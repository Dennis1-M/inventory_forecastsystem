import LoadingSkeleton from "@/components/LoadingSkeleton";
import LowStockAlertsWidget from "@/components/LowStockAlertsWidget";
import OptimizedChart from "@/components/OptimizedChart";
import ProductTabs from "@/components/ProductTabs";
import AdminLayout from "@/layouts/AdminLayout";
import axiosClient from "@/lib/axiosClient";
import { exportAsCSV } from "@/utils/exportUtils";
import { AlertCircle, BarChart3, DollarSign, Download, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    forecastAccuracy: 0,
    lowStockCount: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [salesTrend, setSalesTrend] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockSalesTrend = [
    { date: "Dec 1", sales: 45, forecast: 42 },
    { date: "Dec 2", sales: 52, forecast: 50 },
    { date: "Dec 3", sales: 48, forecast: 46 },
    { date: "Dec 4", sales: 61, forecast: 58 },
    { date: "Dec 5", sales: 55, forecast: 53 },
    { date: "Dec 6", sales: 67, forecast: 65 },
    { date: "Dec 7", sales: 72, forecast: 70 },
  ];

  const mockCategoryBreakdown = [
    { name: "Electronics", sales: 156, revenue: 18500 },
    { name: "Foods", sales: 245, revenue: 3920 },
    { name: "Clothing", sales: 89, revenue: 1780 },
  ];

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
        forecastAccuracy: 92,
        lowStockCount: lowStock.length,
        totalRevenue: Math.round(totalSales * 0.35),
        totalUsers: 8,
      });

      setSalesTrend(mockSalesTrend);
      setCategoryBreakdown(mockCategoryBreakdown);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setStats({
        totalProducts: 6,
        totalSales: 24200,
        forecastAccuracy: 92,
        lowStockCount: 2,
        totalRevenue: 8470,
        totalUsers: 8,
      });
      setSalesTrend(mockSalesTrend);
      setCategoryBreakdown(mockCategoryBreakdown);
    } finally {
      setLoading(false);
    }
  }

  const MetricCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  // Role-based tabs/buttons
  const roleTabs = [
    { label: "Manage Users", path: "/admin/users", roles: ["SUPERADMIN"], icon: Users },
    { label: "Forecasting", path: "/admin/forecast", roles: ["SUPERADMIN", "ADMIN"], icon: TrendingUp },
    { label: "Receive Stock", path: "/admin/receive-stock", roles: ["SUPERADMIN", "ADMIN"], icon: ShoppingCart },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Welcome back, {user?.name}!</p>
          </div>
          {/* Dynamic Role Buttons */}
          <div className="flex gap-2">
            {roleTabs
              .filter((tab) => tab.roles.includes(userRole))
              .map((tab) => (
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {loading
            ? Array(6)
                .fill(0)
                .map((_, i) => <LoadingSkeleton key={i} type="metric" />)
            : [
                <MetricCard key="totalProducts" icon={Package} title="Total Products" value={stats.totalProducts} color="text-blue-600" subtitle="In catalog" />,
                <MetricCard key="inventoryValue" icon={DollarSign} title="Inventory Value" value={`$${(stats.totalSales / 1000).toFixed(1)}K`} color="text-green-600" subtitle="Current stock" />,
                <MetricCard key="revenue" icon={BarChart3} title="Revenue (Est.)" value={`$${(stats.totalRevenue / 1000).toFixed(1)}K`} color="text-emerald-600" subtitle="This month" />,
                <MetricCard key="forecastAccuracy" icon={TrendingUp} title="Forecast Accuracy" value={`${stats.forecastAccuracy}%`} color="text-purple-600" subtitle="Last 7 days" />,
                <MetricCard key="lowStock" icon={AlertCircle} title="Low Stock" value={stats.lowStockCount} color="text-red-600" subtitle="Needs attention" />,
                <MetricCard key="users" icon={Users} title="Team Members" value={stats.totalUsers} color="text-indigo-600" subtitle="Total users" />,
              ]}
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Trend */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sales Trend vs Forecast</h3>
                <p className="text-sm text-gray-600">Last 7 days comparison</p>
              </div>
              <button
                onClick={() => exportAsCSV(salesTrend, "sales_trend.csv")}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </button>
            </div>
            {loading ? <LoadingSkeleton type="card" /> : <OptimizedChart data={salesTrend} type="line" height={300} />}
          </div>

          {/* Low Stock Alerts */}
          <LowStockAlertsWidget />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sales by Category</h3>
              <p className="text-sm text-gray-600">Revenue breakdown</p>
            </div>
            <button
              onClick={() => exportAsCSV(categoryBreakdown, "category_breakdown.csv")}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>
          {loading ? <LoadingSkeleton type="card" /> : <OptimizedChart data={categoryBreakdown} type="bar" height={300} />}
        </div>

        {/* Product Inventory */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Product Inventory</h2>
            <p className="text-sm text-gray-600 mt-1">Browse and manage all products by category</p>
          </div>
          <ProductTabs />
        </div>
      </div>
    </AdminLayout>
  );
}
