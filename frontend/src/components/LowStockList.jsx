import React, { useEffect, useState } from "react";
import api from "../api/axios";

function LowStockList({ refreshKey, threshold = 5 }) {
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const response = await api.get("products/");
        const low = response.data.filter(
          (p) => p.stock_quantity <= threshold
        );
        setLowStock(low);
      } catch (error) {
        console.error("Error fetching products for low stock:", error);
      }
    };
    fetchLowStock();
  }, [refreshKey, threshold]);

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Low Stock Alerts</h2>
      {lowStock.length === 0 ? (
        <p className="text-gray-500">All products sufficiently stocked.</p>
      ) : (
        <ul className="space-y-2">
          {lowStock.map((p) => (
            <li
              key={p.id}
              className="p-3 border rounded-lg bg-yellow-50 text-yellow-700 font-medium"
            >
              ⚠️ {p.name} — Only {p.stock_quantity} left
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LowStockList;

