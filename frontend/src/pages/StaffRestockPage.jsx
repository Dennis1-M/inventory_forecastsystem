import axiosClient from "@/lib/axiosClient";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function StaffRestockPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityRestocked, setQuantityRestocked] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await axiosClient.get("/api/products");
      setProducts(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedProduct || !quantityRestocked) {
      setMessage({ type: "error", text: "Please select a product and quantity." });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      // Call inventory adjust endpoint (restocking = adjustment in)
      await axiosClient.post("/api/inventory/adjust", {
        productId: selectedProduct,
        quantity: parseInt(quantityRestocked, 10),
        movementType: "ADJUSTMENT_IN",
        notes: notes || "Shelf restocking",
      });

      setMessage({ type: "success", text: "Shelf restocking recorded successfully!" });
      setSelectedProduct(null);
      setQuantityRestocked("");
      setNotes("");
      await loadProducts(); // Refresh
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to record shelf restocking.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const selected = products.find((p) => p.id === selectedProduct);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Restock Shelves</h1>
        <p className="text-gray-600 mb-6">Record quantities moved to shelves for different products.</p>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
              <select
                value={selectedProduct || ""}
                onChange={(e) => setSelectedProduct(e.target.value ? Number(e.target.value) : null)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* Current stock info */}
            {selected && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900">
                    <strong>Current inventory:</strong> {selected.currentStock} units
                  </p>
                  <p className="text-sm text-blue-900">
                    <strong>Unit price:</strong> ${selected.unitPrice?.toFixed(2) ?? "N/A"}
                  </p>
                </div>
              </div>
            )}

            {/* Quantity restocked */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Restocked on Shelves
              </label>
              <input
                type="number"
                min="1"
                value={quantityRestocked}
                onChange={(e) => setQuantityRestocked(e.target.value)}
                required
                placeholder="Enter quantity..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this restocking..."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {submitting ? "Recording..." : "Record Shelf Restocking"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
