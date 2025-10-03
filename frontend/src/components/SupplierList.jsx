import React, { useEffect, useState } from "react";
import api from "../api/axios";

function SupplierList({ refreshKey }) {
  const [suppliers, setSuppliers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await api.get("suppliers/");
        setSuppliers(response.data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`suppliers/${id}/`);
      setSuppliers(suppliers.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };

  const handleEditClick = (supplier) => {
    setEditingId(supplier.id);
    setEditData(supplier);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`suppliers/${editingId}/`, editData);
      setSuppliers(
        suppliers.map((s) => (s.id === editingId ? response.data : s))
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating supplier:", error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Suppliers</h2>
      {suppliers.length === 0 ? (
        <p className="text-gray-500">No suppliers available.</p>
      ) : (
        <ul className="space-y-3">
          {suppliers.map((supplier) => (
            <li
              key={supplier.id}
              className="p-3 border rounded-lg flex justify-between items-center"
            >
              {editingId === supplier.id ? (
                <form
                  onSubmit={handleEditSubmit}
                  className="flex gap-2 items-center"
                >
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    className="border p-1 rounded w-32"
                  />
                  <input
                    type="text"
                    name="contact_info"
                    value={editData.contact_info}
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
                  <span>
                    <strong>{supplier.name}</strong> – {supplier.contact_info}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEditClick(supplier)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
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

export default SupplierList;
