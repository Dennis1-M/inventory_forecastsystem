import React, { useEffect, useState } from "react";
import api from "../api/axios";

function SalesList({ refreshKey }) {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesResponse = await api.get("sales/");
        setSales(salesResponse.data);

        const productResponse = await api.get("products/");
        const productMap = {};
        productResponse.data.forEach((p) => {
          productMap[p.id] = p.name;
        });
        setProducts(productMap);
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };
    fetchData();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`sales/${id}/`);
      setSales(sales.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting sale:", error);
    }
  };

  const handleEditClick = (sale) => {
    setEditingId(sale.id);
    setEditData(sale);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`sales/${editingId}/`, editData);
      setSales(sales.map((s) => (s.id === editingId ? response.data : s)));
      setEditingId(null);
    } catch (error) {
      console.error("Error updating sale:", error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Sales Records</h2>
      {sales.length === 0 ? (
        <p className="text-gray-500">No sales recorded.</p>
      ) : (
        <ul className="space-y-3">
          {sales.map((sale) => (
            <li
              key={sale.id}
              className="p-3 border rounded-lg flex justify-between items-center"
            >
              {editingId === sale.id ? (
                <form
                  onSubmit={handleEditSubmit}
                  className="flex-1 flex gap-2 items-center"
                >
                  <select
                    name="product"
                    value={editData.product}
                    onChange={handleEditChange}
                    className="border p-1 rounded w-32"
                  >
                    {Object.entries(products).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="quantity"
                    value={editData.quantity}
                    onChange={handleEditChange}
                    className="border p-1 rounded w-20"
                  />
                  <input
                    type="date"
                    name="date"
                    value={editData.date}
                    onChange={handleEditChange}
                    className="border p-1 rounded w-32"
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
                    className="bg-gray-400 text-white px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <span>
                    {products[sale.product]} - {sale.quantity} pcs (
                    {new Date(sale.date).toLocaleDateString()})
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(sale)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sale.id)}
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

export default SalesList;

