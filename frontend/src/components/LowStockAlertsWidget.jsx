import axiosClient from "@/lib/axiosClient";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export default function LowStockAlertsWidget() {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLowStockProducts();
  }, []);

  async function loadLowStockProducts() {
    try {
      const res = await axiosClient.get("/api/products/low-stock");
      setLowStockProducts(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load low stock products:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-800">Low Stock Alert</h3>
        {lowStockProducts.length > 0 && (
          <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
            {lowStockProducts.length}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-600">Loading...</p>
      ) : lowStockProducts.length === 0 ? (
        <p className="text-sm text-green-700">✓ All products are well stocked!</p>
      ) : (
        <ul className="space-y-2">
          {lowStockProducts.slice(0, 5).map((product) => (
            <li key={product.id} className="p-2 bg-red-50 rounded border border-red-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                </div>
                <span className="text-sm font-bold text-red-600">{product.currentStock}</span>
              </div>
              <p className="text-xs text-gray-700 mt-1">
                Threshold: {product.lowStockThreshold} | Reorder: {product.reorderPoint}
              </p>
            </li>
          ))}
        </ul>
      )}

      {lowStockProducts.length > 5 && (
        <p className="text-xs text-gray-600 mt-3">
          +{lowStockProducts.length - 5} more low stock items
        </p>
      )}
    </div>
  );
}
