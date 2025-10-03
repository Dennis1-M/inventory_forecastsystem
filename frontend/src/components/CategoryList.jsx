import React, { useEffect, useState } from "react";
import api from "../api/axios";

function CategoryList({ refreshKey }) {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("categories/");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`categories/${id}/`);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleEditClick = (category) => {
    setEditingId(category.id);
    setEditData(category);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`categories/${editingId}/`, editData);
      setCategories(
        categories.map((c) => (c.id === editingId ? response.data : c))
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      {categories.length === 0 ? (
        <p className="text-gray-500">No categories available.</p>
      ) : (
        <ul className="space-y-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="p-3 border rounded-lg flex justify-between items-center"
            >
              {editingId === category.id ? (
                <form
                  onSubmit={handleEditSubmit}
                  className="flex gap-2 items-center"
                >
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    className="border p-1 rounded w-40"
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
                  <span>{category.name}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
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

export default CategoryList;
