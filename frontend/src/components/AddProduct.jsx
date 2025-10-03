import React, { useState, useEffect } from "react";
import api from "../api/axios";

function AddProduct({ onProductAdded }) {
  // replace stock_quantity -> quantity_in_stock; category -> category_id; supplier -> supplier_id
const [formData, setFormData] = useState({
  name: "", description: "", price: "",
  quantity_in_stock: "", category_id: "", supplier_id: "",
});

// ... in <select> elements, name="category_id" and name="supplier_id"


  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, supRes] = await Promise.all([
          api.get("categories/"),
          api.get("suppliers/"),
        ]);
        setCategories(catRes.data);
        setSuppliers(supRes.data);
      } catch (error) {
        console.error("Error fetching categories or suppliers:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("products/", formData);
      onProductAdded(response.data);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        category: "",
        supplier: "",
      });
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-4 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="stock_quantity"
          placeholder="Stock Quantity"
          value={formData.stock_quantity}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        {/* Category dropdown */}
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Supplier dropdown */}
        <select
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Supplier</option>
          {suppliers.map((sup) => (
            <option key={sup.id} value={sup.id}>
              {sup.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Product
      </button>
    </form>
  );
}

export default AddProduct;
