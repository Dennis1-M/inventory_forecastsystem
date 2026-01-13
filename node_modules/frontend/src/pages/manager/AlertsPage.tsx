import { CheckCircle, Clock, Search, ShoppingCart, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Badge, Button, Card, CardBody, CardHeader, ConfirmModal, EmptyState, Loading, Table } from '../../components/ui';
import { useAlerts } from '../../hooks';
import apiService from '../../services/api';

const AlertsPage: React.FC = () => {
  const { alerts, loading, error, resolveAlert, refetch } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'reorder' | 'clearance' | null>(null);
  const [actionData, setActionData] = useState({ quantity: 0, supplierId: 0 });
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRY_SOON' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch suppliers when needed
  const fetchSuppliers = async () => {
    try {
      const response = await apiService.get('/suppliers');
      setSuppliers(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  // Filter and search alerts
  const filteredAlerts = (alerts || []).filter((alert: any) => {
    // Filter by type
    let typeMatch = true;
    if (filterType === 'pending') {
      typeMatch = !alert.isResolved;
    } else if (filterType !== 'all') {
      typeMatch = alert.type === filterType;
    }

    // Search by product name or message
    const searchLower = searchQuery.toLowerCase();
    const searchMatch = !searchQuery || 
      alert.product?.name?.toLowerCase().includes(searchLower) ||
      alert.message?.toLowerCase().includes(searchLower);

    return typeMatch && searchMatch;
  });

  const getUrgencyBadge = (type: string) => {
    // Map alert type to urgency
    if (type === 'OUT_OF_STOCK') {
      return <Badge label="Critical" variant="danger" size="sm" />;
    } else if (type === 'LOW_STOCK') {
      return <Badge label="High" variant="warning" size="sm" />;
    } else if (type === 'EXPIRY_SOON') {
      return <Badge label="Medium" variant="primary" size="sm" />;
    } else {
      return <Badge label="Normal" variant="primary" size="sm" />;
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === 'LOW_STOCK') {
      return <Badge label="Low Stock" variant="warning" size="sm" />;
    } else if (type === 'OUT_OF_STOCK') {
      return <Badge label="Out of Stock" variant="danger" size="sm" />;
    } else if (type === 'EXPIRY_SOON') {
      return <Badge label="Expiry Soon" variant="danger" size="sm" />;
    } else {
      return <Badge label={type || 'Alert'} variant="primary" size="sm" />;
    }
  };

  const handleResolve = () => {
    if (selectedAlert && resolveAlert) {
      resolveAlert(selectedAlert.id);
      setShowResolveModal(false);
      setSelectedAlert(null);
      refetch?.();
    }
  };

  const handleActionClick = async (alert: any, type: 'reorder' | 'clearance') => {
    setSelectedAlert(alert);
    setActionType(type);
    
    if (type === 'reorder') {
      await fetchSuppliers();
      // Set suggested quantity based on alert type
      const suggestedQty = alert.type === 'OUT_OF_STOCK' ? 100 : 50;
      setActionData({ 
        quantity: suggestedQty,
        supplierId: alert.product?.supplierId || 0 
      });
    }
    
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedAlert) return;

    try {
      if (actionType === 'reorder') {
        // Create purchase order
        const orderData = {
          supplierId: actionData.supplierId,
          expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          items: [{
            productId: selectedAlert.productId,
            quantity: actionData.quantity,
            unitCost: selectedAlert.product?.costPrice || 0
          }]
        };
        
        await apiService.post('/purchase-orders', orderData);
        alert(`Purchase order created for ${actionData.quantity} units! Alert will be automatically resolved.`);
      } else if (actionType === 'clearance') {
        // Mark for clearance (could trigger a discount or removal)
        await apiService.post(`/inventory/${selectedAlert.productId}/clearance`, {
          reason: 'Expiring soon'
        });
        alert('Product marked for clearance!');
        
        // Manually resolve clearance alerts
        if (resolveAlert) {
          resolveAlert(selectedAlert.id);
        }
      }
      
      setShowActionModal(false);
      setSelectedAlert(null);
      // Refresh alerts list to reflect auto-resolved alerts
      refetch?.();
    } catch (err) {
      console.error('Action failed:', err);
      alert('Action failed. Please try again.');
    }
  };

  const tableColumns = [
    { key: 'type', label: 'Alert Type', width: '20%' },
    { key: 'productName', label: 'Product', width: '25%' },
    { key: 'urgency', label: 'Urgency', width: '15%' },
    { key: 'createdAt', label: 'Created', width: '20%' },
    { key: 'actions', label: 'Actions', width: '20%' },
  ];

  const tableData = filteredAlerts.map((alert: any) => ({
    type: getTypeBadge(alert.type),
    productName: alert.product?.name || 'Unknown Product',
    urgency: getUrgencyBadge(alert.type),
    createdAt: alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'N/A',
    actions: alert.isResolved ? (
      <Badge label="Resolved" variant="success" size="sm" />
    ) : (
      <div className="flex items-center gap-2">
        {/* Action button based on alert type */}
        {(alert.type === 'LOW_STOCK' || alert.type === 'OUT_OF_STOCK') && (
          <Button
            label="Order"
            variant="primary"
            size="sm"
            icon={<ShoppingCart className="h-4 w-4" />}
            onClick={() => handleActionClick(alert, 'reorder')}
          />
        )}
        {alert.type === 'EXPIRY_SOON' && (
          <Button
            label="Clearance"
            variant="warning"
            size="sm"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => handleActionClick(alert, 'clearance')}
          />
        )}
        <Button
          label="Resolve"
          variant="success"
          size="sm"
          icon={<CheckCircle className="h-4 w-4" />}
          onClick={() => {
            setSelectedAlert(alert);
            setShowResolveModal(true);
          }}
        />
      </div>
    ),
  }));

  const stats = {
    totalAlerts: alerts?.length || 0,
    criticalCount: (alerts || []).filter((a: any) => a.type === 'OUT_OF_STOCK').length,
    pendingCount: (alerts || []).filter((a: any) => !a.isResolved).length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Alerts Management</h2>
          <p className="text-gray-600 mt-2">Monitor and resolve system alerts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Alerts</p>
              <p className="text-2xl font-bold">{stats.totalAlerts}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card className="mb-8">
        <CardHeader title="Filter & Search Alerts" />
        <CardBody>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRY_SOON'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === filter
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? 'All' : 
                   filter === 'pending' ? 'Pending' :
                   filter === 'LOW_STOCK' ? 'Low Stock' :
                   filter === 'OUT_OF_STOCK' ? 'Out of Stock' :
                   'Expiry Soon'}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader
          title="Active Alerts"
          subtitle="Review and manage all system alerts"
          action={
            <Button
              label="Refresh"
              variant="secondary"
              icon={<Clock className="h-4 w-4" />}
              size="sm"
              onClick={() => refetch?.()}
            />
          }
        />
        <CardBody>
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Error loading alerts: {error}</p>
            </div>
          ) : tableData.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No Alerts"
              description="All systems are operating normally. No alerts to display."
            />
          ) : (
            <Table columns={tableColumns} data={tableData} />
          )}
        </CardBody>
      </Card>

      {/* Resolve Modal */}
      <ConfirmModal
        isOpen={showResolveModal}
        title="Resolve Alert"
        message={`Are you sure you want to resolve this alert for "${selectedAlert?.product?.name || 'this product'}"?`}
        confirmLabel="Resolve"
        cancelLabel="Cancel"
        variant="success"
        onConfirm={handleResolve}
        onCancel={() => {
          setShowResolveModal(false);
          setSelectedAlert(null);
        }}
      />

      {/* Action Modal - Reorder or Clearance */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {actionType === 'reorder' ? '🛒 Create Purchase Order' : '🗑️ Mark for Clearance'}
            </h3>
            
            {actionType === 'reorder' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product: {selectedAlert?.product?.name}
                  </label>
                  <p className="text-sm text-gray-500">
                    Current Stock: {selectedAlert?.product?.currentStock || 0} units
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <select
                    value={actionData.supplierId}
                    onChange={(e) => setActionData({ ...actionData, supplierId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={0}>Select supplier...</option>
                    {suppliers.map((supplier: any) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity to Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={actionData.quantity}
                    onChange={(e) => setActionData({ ...actionData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Estimated Cost: KES {((selectedAlert?.product?.costPrice || 0) * actionData.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-700">
                  Mark <strong>{selectedAlert?.product?.name}</strong> for clearance sale?
                </p>
                <p className="text-sm text-gray-500">
                  This will flag the product for discount pricing to clear expiring stock.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAction}
                disabled={actionType === 'reorder' && (!actionData.supplierId || !actionData.quantity)}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {actionType === 'reorder' ? 'Create Order' : 'Mark for Clearance'}
              </button>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedAlert(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;