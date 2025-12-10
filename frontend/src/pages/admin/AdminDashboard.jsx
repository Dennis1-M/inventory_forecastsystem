import LowStockAlertsWidget from "@/components/LowStockAlertsWidget";
import ProductTabs from "@/components/ProductTabs";
import AdminLayout from "@/layouts/AdminLayout";
import axiosClient from "@/lib/axiosClient";
import { AlertCircle, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    forecastAccuracy: 0,
    lowStockCount: 0,
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
      
      // Calculate total sales (mock calculation)
      const totalSales = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);

      setStats({
        totalProducts: products.length,
        totalSales: Math.round(totalSales),
        forecastAccuracy: 92,
        lowStockCount: lowStock.length,
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Welcome back! Here's your inventory overview.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Package}
            title="Total Products"
            value={stats.totalProducts}
            color="text-blue-600"
            subtitle="In catalog"
          />
          <MetricCard
            icon={ShoppingCart}
            title="Total Inventory Value"
            value={`$${(stats.totalSales / 1000).toFixed(1)}K`}
            color="text-green-600"
            subtitle="Across all products"
          />
          <MetricCard
            icon={TrendingUp}
            title="Forecast Accuracy"
            value={`${stats.forecastAccuracy}%`}
            color="text-purple-600"
            subtitle="Last 7 days"
          />
          <MetricCard
            icon={AlertCircle}
            title="Low Stock Items"
            value={stats.lowStockCount}
            color="text-red-600"
            subtitle="Require attention"
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Trend */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sales Trend vs Forecast</h3>
              <p className="text-sm text-gray-600">Last 7 days comparison</p>
            </div>
            {loading ? (
              <p className="text-gray-500">Loading chart...</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} name="Actual Sales" />
                  <Line type="monotone" dataKey="forecast" stroke="#a855f7" strokeWidth={2} name="Forecast" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Low Stock Alerts */}
          <LowStockAlertsWidget />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales by Category</h3>
            <p className="text-sm text-gray-600">Revenue breakdown</p>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" fill="#3b82f6" name="Units Sold" />
                <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Products Section */}
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
