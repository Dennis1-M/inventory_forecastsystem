import axiosClient from "@/lib/axiosClient";
import { ArrowDown, ArrowUp, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function InventoryHistoryPage() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, receipt, sale, adjustment

  useEffect(() => {
    loadMovements();
  }, []);

  async function loadMovements() {
    setLoading(true);
    try {
      const res = await axiosClient.get("/api/inventory/movements");
      setMovements(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load movements:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === "all" 
    ? movements 
    : movements.filter((m) => m.movementType?.toLowerCase().includes(filter.toLowerCase()));

  function getIcon(type) {
    if (!type) return <Edit2 className="w-4 h-4" />;
    const lower = type.toLowerCase();
    if (lower.includes("receipt") || lower.includes("adjustment_in")) {
      return <ArrowDown className="w-4 h-4 text-green-600" />;
    }
    if (lower.includes("sale") || lower.includes("adjustment_out")) {
      return <ArrowUp className="w-4 h-4 text-red-600" />;
    }
    return <Edit2 className="w-4 h-4" />;
  }

  function getTypeColor(type) {
    if (!type) return "gray";
    const lower = type.toLowerCase();
    if (lower.includes("receipt")) return "green";
    if (lower.includes("sale")) return "blue";
    if (lower.includes("adjustment_in")) return "green";
    if (lower.includes("adjustment_out")) return "red";
    return "gray";
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Inventory Movement History</h1>

        {/* Filter buttons */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-2 overflow-x-auto">
          {[
            { label: "All", value: "all" },
            { label: "Receipt", value: "receipt" },
            { label: "Sale", value: "sale" },
            { label: "Adjustment", value: "adjustment" },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                filter === btn.value
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Movements table */}
        {loading ? (
          <p className="text-gray-600">Loading movements...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600">No inventory movements found.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left table-auto">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Product</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Supplier</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((movement, idx) => {
                    const color = getTypeColor(movement.movementType);
                    return (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(movement.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium text-gray-900">{movement.product?.name}</div>
                          <div className="text-xs text-gray-500">{movement.product?.sku}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {getIcon(movement.movementType)}
                            <span className={`px-2 py-1 rounded text-xs font-medium bg-${color}-100 text-${color}-700`}>
                              {movement.movementType || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`font-semibold ${movement.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                            {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {movement.supplier?.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                          {movement.notes || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
