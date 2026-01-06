import { AlertCircle, TrendingDown } from 'lucide-react';
import { useInventory } from '../../hooks';

const StockLevelMonitoringPage = () => {
  const { inventory, loading, error } = useInventory();

  if (loading) return <div className="p-6">Loading stock levels...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading stock: {error}</div>;

  const lowStockItems = inventory?.filter((item: any) => item.quantity > 0 && item.quantity < 10) || [];
  const outOfStockItems = inventory?.filter((item: any) => item.quantity === 0) || [];
  const healthyStockItems = inventory?.filter((item: any) => item.quantity >= 10) || [];

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium">Healthy Stock</p>
              <p className="text-2xl font-bold text-green-900">{healthyStockItems.length}</p>
            </div>
            <div className="h-12 w-12 bg-green-200 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-green-600 rotate-180" />
            </div>
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 text-sm font-medium">Low Stock Alert</p>
              <p className="text-2xl font-bold text-orange-900">{lowStockItems.length}</p>
            </div>
            <div className="h-12 w-12 bg-orange-200 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium">Out of Stock</p>
              <p className="text-2xl font-bold text-red-900">{outOfStockItems.length}</p>
            </div>
            <div className="h-12 w-12 bg-red-200 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
            <h3 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Low Stock Items (Below 10 units)
            </h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lowStockItems.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-orange-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-semibold">{item.quantity} units</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">10 units</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">KES {item.unitPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded hover:bg-orange-600">
                      Reorder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {outOfStockItems.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
            <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Out of Stock Items
            </h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Stocked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {outOfStockItems.slice(0, 10).map((item: any, index: number) => (
                <tr key={index} className="hover:bg-red-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">N/A</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">KES {item.unitPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600">
                      Urgent Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Movement Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Total Inventory Value (Low Stock)</span>
            <span className="font-semibold text-orange-600">
              KES {(lowStockItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0) / 1000).toFixed(1)}K
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Average Days Until Stockout</span>
            <span className="font-semibold text-gray-900">5-7 days</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Recommended Reorder Quantity</span>
            <span className="font-semibold text-green-600">Auto-calculated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockLevelMonitoringPage;
