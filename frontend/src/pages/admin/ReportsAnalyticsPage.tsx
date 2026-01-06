import { BarChart3, Download } from 'lucide-react';
import { useState } from 'react';
import { useInventory } from '../../hooks';
import apiService from '../../services/api';

const ReportsAnalyticsPage = () => {
  const { inventory, loading, error } = useInventory();
  const [exporting, setExporting] = useState(false);

  const calculateInventoryMetrics = () => {
    if (!inventory || inventory.length === 0) return { total: 0, lowStock: 0, value: 0, turnover: 0 };
    
    return {
      total: inventory.reduce((sum: number, item: any) => sum + item.quantity, 0),
      lowStock: inventory.filter((item: any) => item.quantity < 10).length,
      value: inventory.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0),
      turnover: (inventory.filter((item: any) => item.quantity > 0).length / (inventory.length || 1)) * 100
    };
  };

  const metrics = calculateInventoryMetrics();

  const handleExportReport = async (type: 'inventory' | 'sales' | 'all') => {
    try {
      setExporting(true);
      const response = await apiService.post('/reports/export', { type });
      
      // Create blob and trigger download
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${type}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="p-6">Loading reports...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading reports: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Inventory Value</p>
          <p className="text-2xl font-bold text-blue-600">KES {(metrics.value / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Stock Turnover %</p>
          <p className="text-2xl font-bold text-indigo-600">{metrics.turnover.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Low Stock Items</p>
          <p className="text-2xl font-bold text-orange-600">{metrics.lowStock}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Items</p>
          <p className="text-2xl font-bold text-green-600">{metrics.total}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Generate & Export Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleExportReport('inventory')}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export Inventory'}
          </button>
          <button
            onClick={() => handleExportReport('sales')}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export Sales'}
          </button>
          <button
            onClick={() => handleExportReport('all')}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export All'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Analytics</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Stock Value at Risk (Low Stock)</span>
            <span className="font-semibold text-orange-600">
              KES {(
                inventory
                  ?.filter((item: any) => item.quantity < 10)
                  .reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0) / 1000
              ).toFixed(1)}K
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Average Item Value</span>
            <span className="font-semibold text-blue-600">
              KES {inventory && inventory.length > 0
                ? (inventory.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0) / inventory.length / 1000).toFixed(1)
                : 0}K
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Products in Stock</span>
            <span className="font-semibold text-green-600">
              {inventory?.filter((item: any) => item.quantity > 0).length || 0}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Out of Stock Items</span>
            <span className="font-semibold text-red-600">
              {inventory?.filter((item: any) => item.quantity === 0).length || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Value</h3>
        {inventory && inventory.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory
                .sort((a: any, b: any) => (b.quantity * b.unitPrice) - (a.quantity * a.unitPrice))
                .slice(0, 10)
                .map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KES {item.unitPrice}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      KES {(item.quantity * item.unitPrice / 1000).toFixed(1)}K
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500">No products available</p>
        )}
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;
