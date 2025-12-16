// src/pages/manager/InventoryMovement.tsx
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaFilter, FaHistory, FaSearch, FaSpinner, FaWarehouse } from 'react-icons/fa';
import { managerApi } from '../../services/managerApi';

interface Movement {
  id: number;
  productId: string;
  productName: string;
  type: 'incoming' | 'outgoing' | 'transfer' | 'adjustment';
  quantity: number;
  fromLocation: string;
  toLocation: string;
  staffName: string;
  timestamp: string;
  reason: string;
}

interface Location {
  id: string;
  name: string;
  type: 'warehouse' | 'shelf' | 'bin';
  currentStock: number;
  capacity: number;
}

export default function InventoryMovementPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all',
    location: 'all',
    dateRange: 'today'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch movement history
      const movementsResponse = await managerApi.getWarehouseStatus();
      const mockMovements: Movement[] = [
        { id: 1, productId: 'LP-001', productName: 'Laptop Pro', type: 'outgoing', quantity: -3, fromLocation: 'Zone A-12', toLocation: 'Shipping', staffName: 'John Doe', timestamp: '2024-12-16 10:30', reason: 'Order #456' },
        { id: 2, productId: 'WM-002', productName: 'Wireless Mouse', type: 'incoming', quantity: 50, fromLocation: 'Receiving', toLocation: 'Zone B-23', staffName: 'Jane Smith', timestamp: '2024-12-16 09:15', reason: 'Restock' },
        { id: 3, productId: 'UH-005', productName: 'USB-C Hub', type: 'adjustment', quantity: -5, fromLocation: 'Zone C-08', toLocation: 'Zone C-08', staffName: 'Mike Johnson', timestamp: '2024-12-15 16:45', reason: 'Damaged' },
        { id: 4, productId: '4K-004', productName: '4K Monitor', type: 'transfer', quantity: 2, fromLocation: 'Zone A-15', toLocation: 'Zone B-10', staffName: 'Sarah Williams', timestamp: '2024-12-15 14:20', reason: 'Reorganization' },
        { id: 5, productId: 'MK-003', productName: 'Mechanical Keyboard', type: 'outgoing', quantity: -1, fromLocation: 'Zone B-24', toLocation: 'Shipping', staffName: 'David Brown', timestamp: '2024-12-14 11:10', reason: 'Order #455' },
      ];
      setMovements(mockMovements);
      
      // Fetch warehouse locations
      const locationsResponse = await managerApi.getWarehouseLocations();
      const mockLocations: Location[] = [
        { id: 'A-12', name: 'Zone A-12', type: 'shelf', currentStock: 42, capacity: 100 },
        { id: 'B-23', name: 'Zone B-23', type: 'shelf', currentStock: 85, capacity: 100 },
        { id: 'C-08', name: 'Zone C-08', type: 'bin', currentStock: 195, capacity: 200 },
        { id: 'A-15', name: 'Zone A-15', type: 'shelf', currentStock: 13, capacity: 50 },
        { id: 'B-24', name: 'Zone B-24', type: 'shelf', currentStock: 7, capacity: 50 },
      ];
      setLocations(mockLocations);
      
    } catch (error) {
      console.error('Error fetching movement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'incoming': return 'bg-green-100 text-green-800';
      case 'outgoing': return 'bg-red-100 text-red-800';
      case 'transfer': return 'bg-blue-100 text-blue-800';
      case 'adjustment': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'incoming': return <FaArrowLeft className="text-green-600" />;
      case 'outgoing': return <FaArrowRight className="text-red-600" />;
      case 'transfer': return <FaWarehouse className="text-blue-600" />;
      default: return <FaHistory className="text-yellow-600" />;
    }
  };

  const filteredMovements = movements.filter(movement => {
    const matchesType = filter.type === 'all' || movement.type === filter.type;
    const matchesLocation = filter.location === 'all' || 
      movement.fromLocation.includes(filter.location) || 
      movement.toLocation.includes(filter.location);
    
    // Date filtering (simplified)
    const movementDate = new Date(movement.timestamp);
    const today = new Date();
    if (filter.dateRange === 'today') {
      return movementDate.toDateString() === today.toDateString();
    } else if (filter.dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return movementDate >= weekAgo;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-green-600 text-2xl" />
        <span className="ml-2 text-gray-600">Loading movement data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Movement Tracking</h1>
          <p className="text-gray-600">Monitor stock movements and warehouse activity</p>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          + Record Movement
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Total Movements Today</p>
          <p className="text-2xl font-bold">
            {filteredMovements.filter(m => new Date(m.timestamp).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Incoming Stock</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredMovements.filter(m => m.type === 'incoming').reduce((sum, m) => sum + m.quantity, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Outgoing Stock</p>
          <p className="text-2xl font-bold text-red-600">
            {Math.abs(filteredMovements.filter(m => m.type === 'outgoing').reduce((sum, m) => sum + m.quantity, 0))}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Active Locations</p>
          <p className="text-2xl font-bold">{locations.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search product or ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filter.type}
              onChange={(e) => setFilter({...filter, type: e.target.value})}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Movement Types</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
              <option value="transfer">Transfer</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>
          
          <select
            value={filter.location}
            onChange={(e) => setFilter({...filter, location: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          
          <select
            value={filter.dateRange}
            onChange={(e) => setFilter({...filter, dateRange: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Movement History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Recent Movements</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredMovements.length > 0 ? (
                  filteredMovements.map((movement) => (
                    <div key={movement.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">
                            {getMovementIcon(movement.type)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{movement.productName}</h4>
                              <span className="text-sm text-gray-500">({movement.productId})</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getMovementColor(movement.type)}`}>
                                {movement.type.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">From:</span>
                                <span className="ml-2 font-medium">{movement.fromLocation}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">To:</span>
                                <span className="ml-2 font-medium">{movement.toLocation}</span>
                              </div>
                            </div>
                            
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>Quantity: <span className={`font-bold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                              </span></span>
                              <span>By: {movement.staffName}</span>
                              <span>{new Date(movement.timestamp).toLocaleString()}</span>
                            </div>
                            
                            {movement.reason && (
                              <p className="mt-2 text-sm text-gray-600">
                                Reason: {movement.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No movements found matching your filters
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse Locations Status */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Warehouse Locations</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {locations.map((location) => (
                  <div key={location.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{location.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className="capitalize">{location.type}</span>
                          <span>•</span>
                          <span>ID: {location.id}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        (location.currentStock / location.capacity) * 100 >= 90 ? 'bg-red-100 text-red-800' :
                        (location.currentStock / location.capacity) * 100 >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {Math.round((location.currentStock / location.capacity) * 100)}%
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Stock Level</span>
                        <span>{location.currentStock} / {location.capacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (location.currentStock / location.capacity) * 100 >= 90 ? 'bg-red-600' :
                            (location.currentStock / location.capacity) * 100 >= 70 ? 'bg-yellow-600' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${(location.currentStock / location.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Available: {location.capacity - location.currentStock}</span>
                      <span className={`${
                        location.capacity - location.currentStock <= 10 ? 'text-red-600' :
                        location.capacity - location.currentStock <= 25 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {location.capacity - location.currentStock <= 10 ? 'Low Space' :
                         location.capacity - location.currentStock <= 25 ? 'Moderate Space' :
                         'Good Space'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">Location Status Guide</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span>Above 90% - Nearly Full</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span>70-90% - Monitor Closely</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Below 70% - Good Capacity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}