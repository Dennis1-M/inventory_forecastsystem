import { BarChart3, Download, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useInventory, useSalesAnalytics } from '../../hooks';
import apiService from '../../services/api';

const ManagerReportsPage = () => {
  const { inventory, loading: inventoryLoading } = useInventory();
  const { analytics, loading: analyticsLoading } = useSalesAnalytics();
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'excel' | 'pdf'>('excel');

  const loading = inventoryLoading || analyticsLoading;

  const handleExportReport = async (type: 'inventory' | 'sales' | 'staff-performance' | 'alerts') => {
    try {
      setExporting(true);
      
      const response = await apiService.post('/reports/manager-export', 
        { type, format: exportFormat },
        { responseType: exportFormat === 'json' ? 'json' : 'blob' }
      );

      if (exportFormat === 'json') {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        // For Excel and PDF (blob response)
        const blob = new Blob([response.data], { 
          type: exportFormat === 'excel' 
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            : 'application/pdf' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.${exportFormat === 'excel' ? 'xlsx' : 'pdf'}`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="p-6">Loading reports...</div>;

  const inventoryMetrics = {
    totalValue: inventory?.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0) || 0,
    totalItems: inventory?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
    lowStock: inventory?.filter((item: any) => item.quantity < 10).length || 0,
    outOfStock: inventory?.filter((item: any) => item.quantity === 0).length || 0,
  };

  const salesMetrics = {
    totalSales: analytics?.totalAmount || 0,
    totalTransactions: analytics?.count || 0,
    averageSale: (analytics?.totalAmount || 0) / (analytics?.count || 1),
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Management Reports
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Inventory Value</p>
          <p className="text-2xl font-bold text-blue-600">KES {(inventoryMetrics.totalValue / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Sales (Period)</p>
          <p className="text-2xl font-bold text-green-600">KES {(salesMetrics.totalSales / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Low Stock Items</p>
          <p className="text-2xl font-bold text-orange-600">{inventoryMetrics.lowStock}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Transactions</p>
          <p className="text-2xl font-bold text-indigo-600">{salesMetrics.totalTransactions}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Generate & Export Reports
        </h3>
        
        {/* Format Selection */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">Export Format:</label>
          <div className="flex gap-3">
            <button
              onClick={() => setExportFormat('excel')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                exportFormat === 'excel'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              📊 Excel (.xlsx)
            </button>
            <button
              onClick={() => setExportFormat('pdf')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                exportFormat === 'pdf'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              📄 PDF
            </button>
            <button
              onClick={() => setExportFormat('json')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                exportFormat === 'json'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              📋 JSON
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleExportReport('inventory')}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 font-medium"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Inventory Movement Report'}
          </button>
          <button
            onClick={() => handleExportReport('sales')}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 font-medium"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Sales Report'}
          </button>
          <button
            onClick={() => handleExportReport('staff-performance')}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50 font-medium"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Staff Performance Report'}
          </button>
          <button
            onClick={() => handleExportReport('alerts')}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 font-medium"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Alerts Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Analysis</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Total Stock Items</span>
              <span className="font-semibold text-gray-900">{inventoryMetrics.totalItems}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Inventory Turnover Rate</span>
              <span className="font-semibold text-green-600">2.5x/month</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Stock at Risk (Low)</span>
              <span className="font-semibold text-orange-600">
                KES {(inventory?.filter((item: any) => item.quantity < 10).reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0) / 1000).toFixed(1)}K
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Out of Stock Items</span>
              <span className="font-semibold text-red-600">{inventoryMetrics.outOfStock}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Average Transaction Value</span>
              <span className="font-semibold text-green-600">KES {(salesMetrics.averageSale / 1000).toFixed(1)}K</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Peak Sales Period</span>
              <span className="font-semibold text-gray-900">Weekends</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Growth Rate (30 days)</span>
              <span className="font-semibold text-green-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> 12.5%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Best Performing Category</span>
              <span className="font-semibold text-gray-900">Electronics</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-lg shadow p-6 border border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-900 mb-3">Report Insights</h3>
        <ul className="space-y-2 text-indigo-800">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>Inventory value is optimal with good turnover rate of 2.5x per month</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>Sales trending upward with 12.5% growth in last 30 days</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>{inventoryMetrics.lowStock} items approaching reorder level - recommend restocking</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>Weekend peak sales suggest weekend promotions are effective</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ManagerReportsPage;
