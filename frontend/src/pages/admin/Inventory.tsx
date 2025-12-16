// src/pages/admin/Inventory.tsx
import React, { useState, useEffect } from 'react';
import { FaBox, FaExclamationTriangle, FaArrowUp, FaArrowDown, FaSync } from 'react-icons/fa';
import { inventoryApi } from '../../services/api';

interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  lastRestocked: string;
  supplier: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getInventory();
      setInventory(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventory(getMockInventory());
    } finally {
      setLoading(false);
    }
  };

  const getMockInventory = (): InventoryItem[] => {
    return [
      { id: 1, productId: 1, productName: 'Laptop Pro', category: 'Electronics', currentStock: 5, minimumStock: 10, lastRestocked: '2024-12-10', supplier: 'TechSupplies Inc.' },
      { id: 2, productId: 2, productName: 'Wireless Mouse', category: 'Accessories', currentStock: 120, minimumStock: 50, lastRestocked: '2024-12-15', supplier: 'Peripherals Co.' },
      { id: 3, productId: 3, productName: 'Mechanical Keyboard', category: 'Accessories', currentStock: 8, minimumStock: 15, lastRestocked: '2024-12-05', supplier: 'KeyTech Ltd.' },
      { id: 4, productId: 4, productName: '4K Monitor', category: 'Electronics', currentStock: 2, minimumStock: 5, lastRestocked: '2024-11-28', supplier: 'DisplayPro' },
      { id: 5, productId: 5, productName: 'USB-C Hub', category: 'Accessories', currentStock: 200, minimumStock: 100, lastRestocked: '2024-12-16', supplier: 'ConnectTech' },
    ];
  };

  const lowStockItems = inventory.filter(item => item.currentStock <= item.minimumStock);
  const displayedInventory = lowStockOnly ? lowStockItems : inventory;

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
    if (current <= minimum) return { color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
    if (current <= minimum * 2) return { color: 'bg-blue-100 text-blue-800', text: 'Adequate' };
    return { color: 'bg-green-100 text-green-800', text: 'In Stock' };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Monitor stock levels and manage inventory</p>
        </div>
        <button
          onClick={fetchInventory}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaSync />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="text-2xl font-bold">{inventory.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
            </div>
            <FaExclamationTriangle className="text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="text-2xl font-bold">
            {inventory.filter(item => item.currentStock === 0).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Need Reorder</p>
          <p className="text-2xl font-bold">
            {inventory.filter(item => item.currentStock <= item.minimumStock).length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span>Show only low stock items</span>
        </label>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Minimum Required
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Restocked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedInventory.map((item) => {
                const status = getStockStatus(item.currentStock, item.minimumStock);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaBox className="text-gray-400 mr-3" />
                        <span className="font-medium">{item.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="font-bold">{item.currentStock}</span>
                        {item.currentStock < item.minimumStock && (
                          <FaArrowDown className="text-red-500 ml-2" />
                        )}
                        {item.currentStock > item.minimumStock * 2 && (
                          <FaArrowUp className="text-green-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{item.minimumStock}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(item.lastRestocked).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                        Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}