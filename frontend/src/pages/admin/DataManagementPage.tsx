
import { api } from '../../lib/api';

const DataManagementPage = () => {
  const handleExport = async (exportType: string) => {
    try {
      const response = await api.get(`/export/${exportType}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${exportType}-export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Error exporting ${exportType} data:`, error);
      alert(`Failed to export ${exportType} data.`);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Data Management</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Export Data</h2>
        <p className="text-gray-600 mb-6">
          Export various data from the system in CSV format.
        </p>

        <div className="space-y-4">
          {/* Sales Data Export */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Sales Data</h3>
              <p className="text-sm text-gray-500">
                Export a complete history of all sales transactions.
              </p>
            </div>
            <button
              onClick={() => handleExport('sales')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Export CSV
            </button>
          </div>

          {/* Inventory Data Export */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Inventory Data</h3>
              <p className="text-sm text-gray-500">
                Export current stock levels for all products.
              </p>
            </div>
            <button
              onClick={() => handleExport('inventory')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Export CSV
            </button>
          </div>

          {/* Product List Export */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Product List</h3>
              <p className="text-sm text-gray-500">
                Export a list of all products in the system.
              </p>
            </div>
            <button
              onClick={() => handleExport('products')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagementPage;