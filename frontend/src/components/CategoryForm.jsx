import React, { useState } from "react";
import api from "../api/axios";

function CategoryForm({ onCategoryAdded }) {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("categories/", { name });
      onCategoryAdded(response.data);
      setName("");
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-4 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4">Add Category</h2>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded flex-1"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add
        </button>
      </div>
    </form>
  );
}

export default CategoryForm;
