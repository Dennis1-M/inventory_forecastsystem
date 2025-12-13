import AdminLayout from "@/layouts/AdminLayout";
import axiosClient from "@/lib/axiosClient";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import OptimizedChart from "@/components/OptimizedChart";
import { exportAsCSV } from "@/utils/exportUtils";
import { AlertCircle, Package, TrendingDown, TrendingUp, Download, Zap, BarChart3, Activity, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  
  const [stats, setStats] = useState({
    totalInventoryValue: 0,
    lowStockItems: 0,
    totalProducts: 0,
    stockTurnsPerMonth: 0,
    overStockItems: 0,
    reorderNeeded: 0,
  });
  const [products, setProducts] = useState([]);
  const [inventoryTrend, setInventoryTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock inventory trend data
  const mockInventoryTrend = [
    { date: "Dec 1", received: 120, sold: 95, waste: 5 },
    { date: "Dec 2", received: 85, sold: 110, waste: 3 },
    { date: "Dec 3", received: 140, sold: 102, waste: 4 },
    { date: "Dec 4", received: 95, sold: 125, waste: 2 },
    { date: "Dec 5", received: 160, sold: 118, waste: 6 },
    { date: "Dec 6", received: 110, sold: 130, waste: 3 },
    { date: "Dec 7", received: 130, sold: 115, waste: 5 },
  ];

  useEffect(() => {
    loadManagerData();
  }, []);

  async function loadManagerData() {
    setLoading(true);
    try {
      const [productsRes, lowStockRes] = await Promise.all([
        axiosClient.get("/api/products"),
        axiosClient.get("/api/products/low-stock"),
      ]);

      const allProducts = productsRes.data?.data || [];
      const lowStock = lowStockRes.data?.data || [];

      // Calculate inventory value
      const totalValue = allProducts.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);

      // Sort products by stock urgency
      const urgentProducts = allProducts
        .filter(p => p.currentStock <= (p.lowStockThreshold || p.reorderPoint))
        .sort((a, b) => a.currentStock - b.currentStock)
        .slice(0, 8);

      setStats({
        totalInventoryValue: totalValue,
        lowStockItems: lowStock.length,
        totalProducts: allProducts.length,
        stockTurnsPerMonth: 4.2, // Mock value
        overStockItems: allProducts.filter(p => p.currentStock > p.overStockLimit).length,
        reorderNeeded: lowStock.length,
      });

      setProducts(urgentProducts);
      setInventoryTrend(mockInventoryTrend);
    } catch (err) {
      console.error("Failed to load manager data:", err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: "Inventory Value",
      value: `$${stats.totalInventoryValue.toLocaleString()}`,
      icon: Package,
      color: "bg-blue-500",
      trend: "+2.4%",
    },
    {
      label: "Low Stock Items",
      value: stats.lowStockItems,
      icon: AlertCircle,
      color: "bg-red-500",
      trend: "-1.2%",
    },
    {
      label: "Overstock Items",
      value: stats.overStockItems,
      icon: BarChart3,
      color: "bg-yellow-500",
      trend: "+0.8%",
    },
    {
      label: "Stock Turns/Month",
      value: stats.stockTurnsPerMonth.toFixed(1),
      icon: TrendingUp,
      color: "bg-green-500",
      trend: "+3.1%",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="text-gray-600 mt-2">Inventory Management & Stock Control • {user?.name}</p>
          </div>
          <button
            onClick={() => navigate("/admin/receive-stock")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            <Zap className="w-4 h-4" />
            <span>Receive Stock</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => <LoadingSkeleton key={i} type="metric" />)
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
          {/* Inventory Movement Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Inventory Movement</h2>
              <button
                onClick={() => exportAsCSV(inventoryTrend, 'inventory_movement.csv')}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                aria-label="Download inventory movement data"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <LoadingSkeleton type="card" />
            ) : (
              <OptimizedChart
                data={inventoryTrend}
                type="line"
                height={300}
                config={{
                  lines: [
                    { key: 'received', stroke: '#3b82f6', name: 'Received' },
                    { key: 'sold', stroke: '#10b981', name: 'Sold' },
                    { key: 'waste', stroke: '#ef4444', name: 'Waste' }
                  ]
                }}
              />
            )}
          </div>

          {/* Stock Levels Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Stock Turnover Rate</h2>
              <button
                onClick={() => exportAsCSV(inventoryTrend.slice(0, 5), 'stock_turnover.csv')}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                aria-label="Download stock turnover data"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <LoadingSkeleton type="card" />
            ) : (
              <OptimizedChart
                data={inventoryTrend.slice(0, 5)}
                type="bar"
                height={300}
                config={{
                  bars: [
                    { key: 'received', fill: '#8b5cf6', name: 'Received' },
                    { key: 'sold', fill: '#06b6d4', name: 'Sold' }
                  ]
                }}
              />
            )}
          </div>
        </div>

        {/* Urgent Stock Actions Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Urgent Stock Actions</h2>
            <div className="flex gap-2">
              <button
                onClick={() => products.length > 0 && exportAsCSV(products, 'urgent_stock_items.csv')}
                disabled={loading || products.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                aria-label="Download urgent stock items"
              >
                <Download className="w-4 h-4" />
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                View All Products
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton type="table" />
          ) : products.length === 0 ? (
            <p className="text-gray-600">No urgent stock items.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Product</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Current Stock</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Reorder Point</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900">{product.currentStock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700">{product.reorderPoint}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            product.currentStock <= 0
                              ? "bg-red-100 text-red-700"
                              : product.currentStock <= product.lowStockThreshold
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {product.currentStock <= 0
                            ? "Out of Stock"
                            : product.currentStock <= product.lowStockThreshold
                            ? "Low Stock"
                            : "In Stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-purple-600 hover:text-purple-800 font-semibold transition">
                          Order Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
