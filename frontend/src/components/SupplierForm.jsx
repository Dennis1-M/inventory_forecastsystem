import React, { useState } from "react";
import api from "../api/axios";

function SupplierForm({ onSupplierAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    contact_info: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("suppliers/", formData);
      onSupplierAdded(response.data);
      setFormData({ name: "", contact_info: "" });
    } catch (error) {
      console.error("Error adding supplier:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-4 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4">Add Supplier</h2>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Supplier Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="contact_info"
          placeholder="Contact Info"
          value={formData.contact_info}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Add Supplier
      </button>
    </form>
  );
}

export default SupplierForm;
