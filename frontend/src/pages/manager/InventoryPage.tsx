import { Plus, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { Badge, Button, Card, CardBody, CardHeader, Input, Loading, Table } from '../../components/ui';
import { useInventory } from '../../hooks';

const InventoryPage: React.FC = () => {
  const { inventory, loading, error, refetch } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');

  // Filter inventory based on search and status
  const filteredInventory = (inventory || []).filter((item: any) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id?.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'in-stock' && item.status === 'in-stock') ||
      (filterStatus === 'low-stock' && item.status === 'low-stock') ||
      (filterStatus === 'out-of-stock' && item.status === 'out-of-stock');
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'out-of-stock') {
      return <Badge label="Out of Stock" variant="danger" size="sm" />;
    } else if (status === 'low-stock') {
      return <Badge label="Low Stock" variant="warning" size="sm" />;
    } else {
      return <Badge label="In Stock" variant="success" size="sm" />;
    }
  };

  const tableColumns = [
    { key: 'productName', label: 'Product Name', width: '30%' },
    { key: 'currentStock', label: 'Current Stock', width: '15%' },
    { key: 'reorderLevel', label: 'Reorder Level', width: '15%' },
    { key: 'category', label: 'Category', width: '15%' },
    { key: 'status', label: 'Status', width: '15%' },
  ];

  const tableData = filteredInventory.map((item: any) => ({
    productName: item.name || 'N/A',
    currentStock: `${item.quantity || 0} units`,
    reorderLevel: `${item.lowStockThreshold || 0} units`,
    category: item.category || 'N/A',
    status: getStatusBadge(item.status),
  }));

  const stats = {
    totalProducts: inventory?.length || 0,
    lowStockCount: (inventory || []).filter((item: any) => item.status === 'low-stock').length,
    outOfStockCount: (inventory || []).filter((item: any) => item.status === 'out-of-stock').length,
    totalValue: (inventory || []).reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.price || 0)), 0),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Inventory Management</h2>
          <p className="text-gray-600 mt-2">Track and manage your stock levels</p>
        </div>
        <Button label="Add Product" variant="primary" icon={<Plus className="h-5 w-5" />} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Low Stock Items</p>
              <p className="text-2xl font-bold text-amber-600">{stats.lowStockCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Inventory Value</p>
              <p className="text-2xl font-bold text-green-600">Ksh {stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader title="Filters" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Search Products"
              placeholder="Search by product name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Items</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader
          title="Stock Levels"
          subtitle="Current inventory status across all products"
          action={
            <Button
              label="Refresh"
              variant="secondary"
              icon={<RefreshCw className="h-4 w-4" />}
              size="sm"
              onClick={() => refetch()}
            />
          }
        />
        <CardBody>
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Error loading inventory: {error}</p>
            </div>
          ) : tableData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No products found matching your filters</p>
            </div>
          ) : (
            <Table columns={tableColumns} data={tableData} />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default InventoryPage;