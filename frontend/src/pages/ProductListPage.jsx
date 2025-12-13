import axiosClient from "@/lib/axiosClient";
import { debounce } from "@/lib/helpers";
import { AlertTriangle, Download, Search, TrendingDown, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { downloadCSV } from "@/lib/helpers";

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock forecast data for each product
  const mockForecasts = {
    1: { trend: 8.5, nextWeek: 145, accuracy: 94 },
    2: { trend: -2.3, nextWeek: 87, accuracy: 91 },
    3: { trend: 5.2, nextWeek: 156, accuracy: 93 },
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axiosClient.get("/api/products"),
        axiosClient.get("/api/categories"),
      ]);
      setProducts(productsRes.data?.data || []);
      setCategories(categoriesRes.data?.data || []);
    } catch (err) {
      setError("Failed to load products. Please try again.");
      console.error("Failed to load products/categories:", err);
    } finally {
      setLoading(false);
    }
  }

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchQuery(value);
      }, 300),
    []
  );

  // Filter products by category and search
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const getForecast = useCallback(
    (productId) => mockForecasts[productId] || { trend: 0, nextWeek: 0, accuracy: 85 },
    []
  );

  // Export to CSV
  const handleExport = useCallback(() => {
    const headers = ["Name", "SKU", "Category", "Current Stock", "Reorder Point", "Unit Price", "Next Week Forecast"];
    const data = filtered.map((product) => ({
      Name: product.name,
      SKU: product.sku,
      Category: product.category?.name || "Uncategorized",
      "Current Stock": product.currentStock,
      "Reorder Point": product.reorderPoint,
      "Unit Price": product.unitPrice?.toFixed(2) || "N/A",
      "Next Week Forecast": getForecast(product.id).nextWeek,
    }));
    downloadCSV(data, headers, `products_${new Date().toISOString().split("T")[0]}.csv`);
  }, [filtered, getForecast]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-semibold">{error}</p>
              <button
                onClick={loadData}
                className="mt-3 text-red-700 hover:text-red-900 font-semibold underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products Catalog</h1>
            <p className="text-gray-600 mt-2">View inventory, forecasts, and demand predictions</p>
          </div>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0 || loading}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            aria-label="Export products to CSV"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Search and category filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Search products"
                />
              </div>
            </div>

            {/* Category filter */}
            <div className="flex-1">
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products grid */}
        {loading ? (
          <LoadingSkeleton count={6} type="card" />
        ) : filtered.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((product) => {
              const forecast = getForecast(product.id);
              const isLowStock = product.currentStock <= product.lowStockThreshold;
              const isOverstock = product.currentStock > product.overStockLimit;
              const trendPositive = forecast.trend > 0;

              return (
                <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                  {/* Header with status */}
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          isLowStock
                            ? "bg-red-100 text-red-700"
                            : isOverstock
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isLowStock ? "⚠️ Low Stock" : isOverstock ? "📦 Overstock" : "✓ In Stock"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{product.category?.name || "Uncategorized"}</p>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    {/* Price and supplier */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Unit Price</p>
                        <p className="font-semibold text-gray-800">${product.unitPrice?.toFixed(2) ?? "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Supplier</p>
                        <p className="font-semibold text-gray-800">{product.supplier?.name || "-"}</p>
                      </div>
                    </div>

                    {/* Stock levels */}
                    <div className="bg-gray-50 rounded p-3 mb-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Stock:</span>
                          <span
                            className={`font-bold ${
                              product.currentStock <= product.lowStockThreshold
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {product.currentStock}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reorder Point:</span>
                          <span className="font-bold text-gray-700">{product.reorderPoint}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition ${
                              product.currentStock <= product.lowStockThreshold
                                ? "bg-red-500"
                                : product.currentStock > product.overStockLimit
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (product.currentStock / (product.overStockLimit || 100)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Forecast & Demand Prediction */}
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">Demand Forecast</p>
                        {trendPositive ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Next Week Demand:</span>
                          <span className="font-bold">{forecast.nextWeek} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trend:</span>
                          <span
                            className={`font-bold ${
                              trendPositive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {trendPositive ? "+" : ""}
                            {forecast.trend}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Forecast Accuracy:</span>
                          <span className="font-bold text-blue-700">{forecast.accuracy}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Alert if overstock or low stock */}
                    {isOverstock && (
                      <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded mb-3 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                          Overstock detected: {product.currentStock} units (limit: {product.overStockLimit})
                        </span>
                      </div>
                    )}

                    {isLowStock && !isOverstock && (
                      <div className="text-xs text-red-700 bg-red-50 p-2 rounded mb-3 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Urgent: Reorder soon to meet predicted demand of {forecast.nextWeek} units</span>
                      </div>
                    )}

                    {/* Action Button */}
                    {isLowStock && (
                      <button
                        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                        aria-label={`Order stock for ${product.name}`}
                      >
                        Order Stock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
