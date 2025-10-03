import React, { useEffect, useState } from "react";
import api from "../api/axios";

function SaleRecordList({ refreshKey }) {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await api.get("sales/");
        setSales(response.data);
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };
    fetchSales();
  }, [refreshKey]);

  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <h2 className="text-lg font-semibold mb-3">Sales Records</h2>
      {sales.length === 0 ? (
        <p className="text-gray-500">No sales recorded yet.</p>
      ) : (
        <ul className="space-y-2">
          {sales.map((sale) => (
            <li key={sale.id} className="p-2 border rounded flex justify-between">
  <span>
    <strong>Product:</strong> {sale.product_name || sale.product} |{" "}
    <strong>Qty:</strong> {sale.quantity_sold}
  </span>
  <span className="text-gray-500">{sale.date_sold}</span>
</li>


          ))}
        </ul>
      )}
    </div>
  );
}

export default SaleRecordList;
