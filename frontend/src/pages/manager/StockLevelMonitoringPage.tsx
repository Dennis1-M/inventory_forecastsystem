import { AlertCircle, Package, TrendingDown, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInventory } from '../../hooks';
import apiService from '../../services/api';

interface Supplier {
  id: number;
  name: string;
}

const StockLevelMonitoringPage = () => {
  const { inventory, loading, error } = useInventory();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [orderQuantity, setOrderQuantity] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await apiService.get('/suppliers');
      setSuppliers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  const handleOrderClick = (item: any, isUrgent: boolean = false) => {
    setSelectedProduct(item);
    // Suggest reorder quantity based on lowStockThreshold or default amount
    const suggestedQty = isUrgent ? 50 : Math.max(20, item.lowStockThreshold || 20);
    setOrderQuantity(suggestedQty.toString());
    // Set expected date to 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setExpectedDate(nextWeek.toISOString().split('T')[0]);
    setShowOrderModal(true);
    setOrderSuccess(false);
  };

  const handleCreateOrder = async () => {
    if (!selectedProduct || !orderQuantity || !selectedSupplier) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setOrderLoading(true);
      await apiService.post('/purchase-orders', {
        supplierId: parseInt(selectedSupplier),
        expectedDate: expectedDate || null,
        items: [{
          productId: selectedProduct.id,
          quantity: parseInt(orderQuantity),
          unitCost: selectedProduct.costPrice || selectedProduct.unitPrice * 0.7
        }]
      });
      
      setOrderSuccess(true);
      setTimeout(() => {
        setShowOrderModal(false);
        setOrderSuccess(false);
        // Refresh page or show success notification
      }, 2000);
    } catch (err) {
      console.error('Failed to create order:', err);
      alert('Failed to create purchase order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.lowStockThreshold || 10} units</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">KES {item.unitPrice?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleOrderClick(item, false)}
                      className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded hover:bg-orange-600 transition-colors"
                    >
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">KES {item.unitPrice?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleOrderClick(item, true)}
                      className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition-colors"
                    >
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

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create Purchase Order</h3>
                  <p className="text-sm text-gray-500">Restock inventory item</p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Success Message */}
            {orderSuccess && (
              <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">✅ Purchase order created successfully!</p>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Product</p>
                <p className="text-lg font-semibold text-gray-900">{selectedProduct?.name}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Current Stock:</span>
                    <span className="ml-2 font-medium text-red-600">{selectedProduct?.quantity} units</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Unit Price:</span>
                    <span className="ml-2 font-medium text-gray-900">KES {selectedProduct?.unitPrice}</span>
                  </div>
                </div>
              </div>

              {/* Supplier Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Estimated Total: KES {(parseInt(orderQuantity || '0') * (selectedProduct?.costPrice || selectedProduct?.unitPrice * 0.7)).toLocaleString()}
                </p>
              </div>

              {/* Expected Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowOrderModal(false)}
                disabled={orderLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={orderLoading || orderSuccess}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {orderLoading ? 'Creating...' : orderSuccess ? 'Created!' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockLevelMonitoringPage;
