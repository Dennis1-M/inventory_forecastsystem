import React, { useState } from "react";
import api from "../api/axios";

function ProductForm({ onProductAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock_quantity: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("products/", formData);
      onProductAdded(); // refresh parent list
      setFormData({ name: "", price: "", stock_quantity: "" }); // reset form
      console.log("Product created:", response.data);
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Add Product</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 rounded w-32"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="border p-2 rounded w-24"
          required
        />
        <input
          type="number"
          name="stock_quantity"
          placeholder="Stock"
          value={formData.stock_quantity}
          onChange={handleChange}
          className="border p-2 rounded w-20"
          required
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
        >
          Add
        </button>
      </form>
    </div>
  );
}

export default ProductForm;
