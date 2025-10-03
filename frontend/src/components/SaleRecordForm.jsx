import React, { useState } from "react";
import api from "../api/axios";

function SaleRecordForm({ onSaleAdded }) {
  const [formData, setFormData] = useState({ product: "", quantity_sold: "" });


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("sales/", formData);
      setFormData({ product: "", quantity_sold: "" });
      if (onSaleAdded) onSaleAdded(); // 🔥 refresh product + sales lists
    } catch (error) {
      console.error("Error recording sale:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Record Sale</h2>
      <input
        type="text"
        name="product"
        placeholder="Product ID"
        value={formData.product}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="number"
        name="quantity_sold"
        placeholder="Quantity"
        value={formData.quantity_sold}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-2"
      />
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Record Sale
      </button>
    </form>
  );
}

export default SaleRecordForm;
