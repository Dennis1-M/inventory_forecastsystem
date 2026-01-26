import { Database, Download, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import apiService from '../../services/api';

const DataManagementPage = () => {
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setImporting(true);
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('importFile') as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length === 0) {
      setMessage({ type: 'error', text: 'Please select a file to import.' });
      setImporting(false);
      return;
    }
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await apiService.post('/import/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage({ type: 'success', text: res.data.message || 'Import successful!' });
      fileInput.value = '';
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Import failed.' });
    } finally {
      setImporting(false);
    }
  };

  const handleExportData = async (dataType: string) => {
    try {
      setExporting(true);
      setMessage(null);
      
      const response = await apiService.get(`/export/${dataType}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dataType}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setMessage({ type: 'success', text: `${dataType} data exported successfully!` });
    } catch (err) {
      console.error('Error exporting data:', err);
      setMessage({ type: 'error', text: `Failed to export ${dataType} data` });
    } finally {
      setExporting(false);
    }
  };

  const handleClearData = async (dataType: string) => {
    try {
      setClearing(true);
      setMessage(null);
      
      await apiService.delete(`/admin/clear/${dataType}`);
      
      setMessage({ type: 'success', text: `${dataType} data cleared successfully!` });
    } catch (err) {
      console.error('Error clearing data:', err);
      setMessage({ type: 'error', text: `Failed to clear ${dataType} data` });
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Database className="h-6 w-6 mr-2 text-blue-600" />
          Data Management
        </h1>
        <p className="text-gray-600 mt-1">Export, import, and manage system data</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex-shrink-0">
            {message.type === 'success' ? (
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className={`ml-3 font-medium ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Export Data Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Download className="h-5 w-5 mr-2 text-blue-500" />
          Export Data
        </h2>
        <p className="text-sm text-gray-600 mb-4">Download system data in Excel format for backup or analysis</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => handleExportData('products')}
            disabled={exporting}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Database className="h-6 w-6 text-blue-500 mb-2" />
            <h3 className="font-medium text-gray-900">Products</h3>
            <p className="text-xs text-gray-600 mt-1">Export all product data</p>
          </button>

          <button
            onClick={() => handleExportData('sales')}
            disabled={exporting}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Database className="h-6 w-6 text-green-500 mb-2" />
            <h3 className="font-medium text-gray-900">Sales</h3>
            <p className="text-xs text-gray-600 mt-1">Export sales transaction history</p>
          </button>

          <button
            onClick={() => handleExportData('inventory')}
            disabled={exporting}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Database className="h-6 w-6 text-purple-500 mb-2" />
            <h3 className="font-medium text-gray-900">Inventory</h3>
            <p className="text-xs text-gray-600 mt-1">Export current inventory levels</p>
          </button>
        </div>
      </div>

      {/* Import Data Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Upload className="h-5 w-5 mr-2 text-green-500" />
          Import Data
        </h2>
        <form onSubmit={handleImportData} className="flex flex-col items-start gap-4">
          <input
            type="file"
            name="importFile"
            accept=".xlsx,.xls"
            ref={fileInputRef}
            className="block mb-2"
            disabled={importing}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={importing}
          >
            {importing ? 'Importing...' : 'Import Excel File'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">Upload an Excel file with columns: name, sku, category, costPrice, unitPrice</p>
      </div>

      {/* Danger Zone */}
      <div className="bg-white shadow-md rounded-lg p-6 border-2 border-red-200">
        <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
          <Trash2 className="h-5 w-5 mr-2 text-red-500" />
          Danger Zone
        </h2>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">⚠️ Warning</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>These actions are irreversible and will permanently delete data from the system. Use with extreme caution!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Clear All Sales Data</p>
              <p className="text-sm text-gray-600">Remove all sales transactions (products remain)</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all sales data? This action cannot be undone!')) {
                  handleClearData('sales');
                }
              }}
              disabled={clearing}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Sales
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Clear All Forecasts</p>
              <p className="text-sm text-gray-600">Remove all ML forecast data</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all forecast data? This action cannot be undone!')) {
                  handleClearData('forecasts');
                }
              }}
              disabled={clearing}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Forecasts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagementPage;
