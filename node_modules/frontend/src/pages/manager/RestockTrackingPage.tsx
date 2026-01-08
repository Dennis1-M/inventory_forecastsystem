import { AlertCircle, CheckCircle, Clock, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import apiService from '../../services/api';

interface RestockOrder {
  id: string;
  productId: number;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  quantityOrdered: number;
  status: 'pending' | 'ordered' | 'received';
  orderDate: string;
  expectedDate: string;
  supplier: string;
}

const RestockTrackingPage = () => {
  const [restockOrders, setRestockOrders] = useState<RestockOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'ordered' | 'received'>('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantityToOrder: '',
  });

  useEffect(() => {
    const fetchRestockOrders = async () => {
      try {
        setLoading(true);
        // Fetch purchase orders to show restock status
        const response = await apiService.get('/purchase-orders');
        const orders = Array.isArray(response.data?.data) ? response.data.data : [];
        
        // Transform to restock orders
        const restockData: RestockOrder[] = orders.map((order: any) => ({
          id: order.id.toString(),
          productId: order.items?.[0]?.productId || 0,
          productName: order.items?.[0]?.product?.name || 'Unknown',
          currentStock: order.items?.[0]?.product?.currentStock || 0,
          reorderLevel: order.items?.[0]?.product?.lowStockThreshold || 0,
          quantityOrdered: order.items?.[0]?.quantityOrdered || 0,
          status: order.status?.toLowerCase() || 'pending',
          orderDate: new Date(order.createdAt).toLocaleDateString(),
          expectedDate: new Date(order.expectedDate || Date.now()).toLocaleDateString(),
          supplier: order.supplier?.name || 'Unknown Supplier',
        }));
        
        setRestockOrders(restockData);
      } catch (err) {
        console.error('Failed to fetch restock orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestockOrders();
  }, []);

  const filteredOrders = filter === 'all'
    ? restockOrders
    : restockOrders.filter(order => order.status === filter);

  const stats = {
    totalOrders: restockOrders.length,
    pending: restockOrders.filter(o => o.status === 'pending').length,
    ordered: restockOrders.filter(o => o.status === 'ordered').length,
    received: restockOrders.filter(o => o.status === 'received').length,
  };

  const handleCreateOrder = async () => {
    // Implementation for creating new restock order
    console.log('Creating restock order:', formData);
    // Reset form
    setFormData({ productId: '', quantityToOrder: '' });
    setShowModal(false);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      // Use the correct backend endpoint for updating purchase order status
      if (newStatus === 'received') {
        // First fetch the full purchase order to get all items
        const poResponse = await apiService.get(`/purchase-orders/${orderId}`);
        const purchaseOrder = poResponse.data;
        
        // Prepare items array with all items to be received
        const items = purchaseOrder.items.map((item: any) => ({
          itemId: item.id,
          quantityReceived: item.quantityOrdered - item.quantityReceived // Receive remaining quantity
        }));
        
        // Send receive request with items
        await apiService.post(`/purchase-orders/${orderId}/receive`, { items });
        
        // Refresh the orders list after successful receive
        const response = await apiService.get('/purchase-orders');
        const orders = Array.isArray(response.data?.data) ? response.data.data : [];
        
        const restockData: RestockOrder[] = orders.map((order: any) => ({
          id: order.id.toString(),
          productId: order.items?.[0]?.productId || 0,
          productName: order.items?.[0]?.product?.name || 'Unknown',
          currentStock: order.items?.[0]?.product?.currentStock || 0,
          reorderLevel: order.items?.[0]?.product?.lowStockThreshold || 0,
          quantityOrdered: order.items?.[0]?.quantityOrdered || 0,
          status: order.status?.toLowerCase() || 'pending',
          orderDate: new Date(order.createdAt).toLocaleDateString(),
          expectedDate: new Date(order.expectedDate || Date.now()).toLocaleDateString(),
          supplier: order.supplier?.name || 'Unknown Supplier',
        }));
        
        setRestockOrders(restockData);
      } else {
        // For other status updates, would need additional backend endpoints
        console.warn('Status update not fully implemented for status:', newStatus);
      }
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'ordered':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <CheckCircle className="h-5 w-5" />;
      case 'ordered':
        return <Clock className="h-5 w-5" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <ShoppingCart className="h-5 w-5" />;
    }
  };

  if (loading) return <div className="p-6 text-center">Loading restock orders...</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Restock Tracking</h2>
          <p className="text-gray-600">Manage and monitor all stock replenishment orders</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
        >
          <ShoppingCart className="h-5 w-5" />
          Create Restock Order
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-700 text-sm font-medium">Total Orders</p>
          <p className="text-3xl font-bold text-blue-900">{stats.totalOrders}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
          <p className="text-amber-700 text-sm font-medium">Pending</p>
          <p className="text-3xl font-bold text-amber-900">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
          <p className="text-cyan-700 text-sm font-medium">Ordered</p>
          <p className="text-3xl font-bold text-cyan-900">{stats.ordered}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-green-700 text-sm font-medium">Received</p>
          <p className="text-3xl font-bold text-green-900">{stats.received}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['all', 'pending', 'ordered', 'received'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-3 font-medium text-sm transition border-b-2 ${
              filter === f
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({
              f === 'all' ? stats.totalOrders :
              f === 'pending' ? stats.pending :
              f === 'ordered' ? stats.ordered : stats.received
            })
          </button>
        ))}
      </div>

      {/* Restock Orders List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Current Stock</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reorder Level</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Qty Ordered</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Supplier</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Expected</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.productName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className={order.currentStock < order.reorderLevel ? 'text-red-600 font-semibold' : ''}>
                        {order.currentStock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.reorderLevel} units</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.quantityOrdered} units</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.supplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.orderDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.expectedDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'ordered')}
                          className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Mark Ordered
                        </button>
                      )}
                      {order.status === 'ordered' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'received')}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          Mark Received
                        </button>
                      )}
                      {order.status === 'received' && (
                        <span className="text-gray-500">Complete</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No restock orders in this category</p>
          </div>
        )}
      </div>

      {/* Modal for creating new order */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-bold mb-4">Create Restock Order</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select product...</option>
                  {/* Products would be fetched and populated here */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={formData.quantityToOrder}
                  onChange={(e) => setFormData({ ...formData, quantityToOrder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter quantity"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrder}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Create Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestockTrackingPage;
