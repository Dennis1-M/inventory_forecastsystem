import axiosClient from "@/lib/axiosClient";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axiosClient.get("/api/products"),
        axiosClient.get("/api/categories"),
      ]);
      setProducts(productsRes.data?.data || []);
      setCategories(categoriesRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load products/categories:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter products by category and search
  const filtered = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Products Catalog</h1>

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Category filter */}
            <div className="flex-1">
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          <p className="text-gray-600">Loading products...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${product.currentStock <= product.lowStockThreshold ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {product.currentStock <= product.lowStockThreshold ? "Low Stock" : "In Stock"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{product.category?.name || "Uncategorized"}</p>

                {/* Price and supplier */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
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
                <div className="bg-gray-50 rounded p-2 mb-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Current Stock:</span>
                    <span className={`font-bold ${product.currentStock <= product.lowStockThreshold ? "text-red-600" : "text-green-600"}`}>{product.currentStock}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Reorder Point:</span>
                    <span className="font-bold text-gray-700">{product.reorderPoint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overstock Limit:</span>
                    <span className="font-bold text-gray-700">{product.overStockLimit}</span>
                  </div>
                </div>

                {/* Status indicator */}
                {product.currentStock > product.overStockLimit && (
                  <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                    ⚠️ Overstock: {product.currentStock} units (limit: {product.overStockLimit})
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
