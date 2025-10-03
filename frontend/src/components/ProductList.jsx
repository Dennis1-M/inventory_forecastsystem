import React, { useEffect, useState } from "react";
import api from "../api/axios";

function ProductList({ refreshKey }) {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("products/");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`products/${id}/`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditData(product);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`products/${editingId}/`, editData);
      setProducts(
        products.map((p) => (p.id === editingId ? response.data : p))
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Products</h2>
      {products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="p-3 border rounded-lg flex justify-between items-center"
            >
              {editingId === product.id ? (
                <form
                  onSubmit={handleEditSubmit}
                  className="flex-1 flex gap-2 items-center"
                >
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    className="border p-1 rounded w-24"
                  />
                  <input
                    type="number"
                    name="price"
                    value={editData.price}
                    onChange={handleEditChange}
                    className="border p-1 rounded w-20"
                  />
                  <input
                    type="number"
                    name="stock_quantity"
                    value={editData.stock_quantity}
                    onChange={handleEditChange}
                    className="border p-1 rounded w-20"
                  />
                 <button
  type="submit"
  className="bg-blue-500 text-white px-2 py-1 rounded"
>
  Save
</button>
<button
  type="button"
  onClick={() => setEditingId(null)}
  className="bg-gray-500 text-white px-2 py-1 rounded"
>
  Cancel
</button>
</form>
) : (
  <>
    <span>
      {product.name} – {product.price} KES (Stock: {product.stock_quantity})
    </span>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => handleEditClick(product)}
        className="bg-yellow-500 text-white px-2 py-1 rounded"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => handleDelete(product.id)}
        className="bg-red-500 text-white px-2 py-1 rounded"
      >
        Delete
      </button>
    </div>
  </>
)}
</li>
))}
</ul>
)}
</div>
);
}

export default ProductList;
