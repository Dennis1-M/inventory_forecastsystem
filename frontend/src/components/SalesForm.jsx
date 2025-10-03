import React, { useState, useEffect } from "react";
import api from "../api/axios";

function SalesForm({ onSaleAdded }) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" });


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
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("sales/", formData);
      setFormData({ product: "", quantity: "", date: "" });
      onSaleAdded();
    } catch (error) {
      console.error("Error adding sale:", error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3">Add Sale Record</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          name="product"
          value={formData.product}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Sale
        </button>
      </form>
    </div>
  );
}

export default SalesForm;
