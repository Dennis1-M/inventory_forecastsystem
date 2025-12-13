import StaffLayout from "@/layouts/StaffLayout";
import axiosClient from "@/lib/axiosClient";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import OptimizedChart from "@/components/OptimizedChart";
import { exportAsCSV } from "@/utils/exportUtils";
import { AlertCircle, CheckCircle, Clock, Package, TrendingUp, Download, Zap, ListTodo, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    itemsRestocked: 0,
    lowStockAlerts: 0,
    performanceScore: 0,
    hoursWorked: 0,
    itemsScanned: 0,
  });
  const [products, setProducts] = useState([]);
  const [activityTrend, setActivityTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock activity data
  const mockActivityTrend = [
    { date: "Dec 1", restocked: 12, scanned: 45, alerts: 3 },
    { date: "Dec 2", restocked: 15, scanned: 52, alerts: 2 },
    { date: "Dec 3", restocked: 18, scanned: 48, alerts: 4 },
    { date: "Dec 4", restocked: 14, scanned: 61, alerts: 1 },
    { date: "Dec 5", restocked: 20, scanned: 55, alerts: 3 },
    { date: "Dec 6", restocked: 16, scanned: 67, alerts: 2 },
    { date: "Dec 7", restocked: 22, scanned: 72, alerts: 1 },
  ];

  useEffect(() => {
    loadStaffData();
  }, []);

  async function loadStaffData() {
    setLoading(true);
    try {
      const [productsRes, lowStockRes] = await Promise.all([
        axiosClient.get("/api/products"),
        axiosClient.get("/api/products/low-stock"),
      ]);

      const allProducts = productsRes.data?.data || [];
      const lowStock = lowStockRes.data?.data || [];

      // Get products that need restocking
      const restockNeeded = allProducts
        .filter(p => p.currentStock <= (p.lowStockThreshold || p.reorderPoint))
        .slice(0, 6);

      setStats({
        tasksCompleted: 24,
        itemsRestocked: 156,
        lowStockAlerts: lowStock.length,
        performanceScore: 92,
        hoursWorked: 40,
        itemsScanned: 487,
      });

      setProducts(restockNeeded);
      setActivityTrend(mockActivityTrend);
    } catch (err) {
      console.error("Failed to load staff data:", err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: "Tasks Completed",
      value: stats.tasksCompleted,
      icon: CheckCircle,
      color: "bg-green-500",
      trend: "+2",
    },
    {
      label: "Items Restocked",
      value: stats.itemsRestocked,
      icon: Package,
      color: "bg-blue-500",
      trend: "+18",
    },
    {
      label: "Items Scanned",
      value: stats.itemsScanned,
      icon: BarChart3,
      color: "bg-purple-500",
      trend: "+45",
    },
    {
      label: "Performance",
      value: `${stats.performanceScore}%`,
      icon: TrendingUp,
      color: "bg-amber-500",
      trend: "+3%",
    },
    {
      label: "Stock Alerts",
      value: stats.lowStockAlerts,
      icon: AlertCircle,
      color: "bg-red-500",
      trend: "-1",
    },
    {
      label: "Hours Worked",
      value: stats.hoursWorked,
      icon: Clock,
      color: "bg-indigo-500",
      trend: "This week",
    },
  ];

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
            <p className="text-gray-600 mt-2">Track daily tasks and activities • {user?.name}</p>
          </div>
          <button
            onClick={() => navigate("/staff/restock")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <Zap className="w-4 h-4" />
            <span>Restock Items</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {loading ? (
            Array(6).fill(0).map((_, i) => <LoadingSkeleton key={i} type="metric" />)
          ) : (
            statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="text-white w-6 h-6" />
                    </div>
                    <span className="text-green-600 text-sm font-semibold">{stat.trend}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Weekly Activity</h2>
              <button
                onClick={() => exportAsCSV(activityTrend, 'weekly_activity.csv')}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                aria-label="Download weekly activity data"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <LoadingSkeleton type="card" />
            ) : (
              <OptimizedChart
                data={activityTrend}
                type="line"
                height={300}
                config={{
                  lines: [
                    { key: 'restocked', stroke: '#10b981', name: 'Items Restocked' },
                    { key: 'scanned', stroke: '#3b82f6', name: 'Items Scanned' }
                  ]
                }}
              />
            )}
          </div>

          {/* Alerts Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Daily Stock Alerts</h2>
              <button
                onClick={() => exportAsCSV(activityTrend, 'daily_alerts.csv')}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                aria-label="Download daily alerts data"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <LoadingSkeleton type="card" />
            ) : (
              <OptimizedChart
                data={activityTrend}
                type="bar"
                height={300}
                config={{
                  bars: [
                    { key: 'alerts', fill: '#ef4444', name: 'Low Stock Alerts' }
                  ]
                }}
              />
            )}
          </div>
        </div>

        {/* Quick Actions & Items Needing Attention */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-semibold">
                Start Restock Task
              </button>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
                Scan Inventory
              </button>
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold">
                Report Issue
              </button>
              <button className="w-full border-2 border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition font-semibold">
                View Tasks
              </button>
            </div>
          </div>

          {/* Items Needing Attention */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Items Needing Attention</h2>
              <button
                onClick={() => products.length > 0 && exportAsCSV(products, 'items_needing_attention.csv')}
                disabled={loading || products.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                aria-label="Download items needing attention"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <LoadingSkeleton type="table" />
            ) : products.length === 0 ? (
              <p className="text-gray-600">No items need restocking.</p>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <div className="flex gap-4 mt-1 text-sm">
                        <span className="text-gray-600">Current: <span className="font-semibold">{product.currentStock}</span></span>
                        <span className="text-gray-600">Reorder: <span className="font-semibold">{product.reorderPoint}</span></span>
                      </div>
                    </div>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition font-semibold ml-4">
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
