import { useState } from "react";

export default function AddProductForm({ onAdded }) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { name, sku, category, price: parseFloat(price || 0), stock: parseInt(stock || 0, 10) };
      const res = await axiosClient.post("/api/products", payload);
      setName("");
      setSku("");
      setCategory("");
      setPrice("");
      setStock("");
      if (onAdded) onAdded(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-sm text-gray-600">Product name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full p-2 border rounded" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm text-gray-600">SKU</label>
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1 w-full p-2 border rounded" />
        </div>
        <div>
          <label className="text-sm text-gray-600">Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full p-2 border rounded" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm text-gray-600">Price</label>
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full p-2 border rounded" />
        </div>
        <div>
          <label className="text-sm text-gray-600">Stock</label>
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="mt-1 w-full p-2 border rounded" />
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div>
        <button disabled={loading} type="submit" className="w-full py-2 rounded bg-purple-600 text-white font-medium">
          {loading ? "Adding..." : "Add product"}
        </button>
      </div>
    </form>
  );
}
