// src/pages/admin/Sales.tsx
import { useEffect, useState } from 'react';
import { FaCalendar, FaChartLine, FaDollarSign, FaShoppingCart } from 'react-icons/fa';
import { salesApi } from '../../services/api';

interface Sale {
  id: number;
  orderId: string;
  customerName: string;
  totalAmount: number;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  items: number;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
  });
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchSalesData();
  }, [timeRange]);

  const fetchSalesData = async () => {
    try {
      const [salesData, statsData] = await Promise.all([
        salesApi.getAllSales(),
        salesApi.getSalesStats()
      ]);
      
      setSales(Array.isArray(salesData) ? salesData.slice(0, 10) : salesData.data?.slice(0, 10) || []);
      
      if (statsData) {
        setStats({
          totalRevenue: statsData.totalRevenue || 0,
          totalOrders: statsData.totalOrders || 0,
          avgOrderValue: statsData.avgOrderValue || 0,
          pendingOrders: statsData.pendingOrders || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setSales(getMockSales());
      setStats({
        totalRevenue: 45230,
        totalOrders: 2341,
        avgOrderValue: 89.5,
        pendingOrders: 12,
      });
    }
  };

  const getMockSales = (): Sale[] => {
    return [
      { id: 1, orderId: 'ORD-001', customerName: 'John Smith', totalAmount: 299.99, status: 'completed', date: '2024-12-16', items: 3 },
      { id: 2, orderId: 'ORD-002', customerName: 'Emma Wilson', totalAmount: 149.50, status: 'pending', date: '2024-12-15', items: 2 },
      { id: 3, orderId: 'ORD-003', customerName: 'Robert Brown', totalAmount: 899.99, status: 'completed', date: '2024-12-14', items: 1 },
      { id: 4, orderId: 'ORD-004', customerName: 'Lisa Taylor', totalAmount: 45.99, status: 'completed', date: '2024-12-14', items: 1 },
      { id: 5, orderId: 'ORD-005', customerName: 'Mike Davis', totalAmount: 234.75, status: 'cancelled', date: '2024-12-13', items: 4 },
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600">Track orders, revenue, and sales performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">${stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaDollarSign className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalOrders}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaShoppingCart className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <h3 className="text-2xl font-bold mt-1">${stats.avgOrderValue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaChartLine className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <h3 className="text-2xl font-bold mt-1">{stats.pendingOrders}</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaCalendar className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{sale.orderId}</td>
                  <td className="px-6 py-4">{sale.customerName}</td>
                  <td className="px-6 py-4">{new Date(sale.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{sale.items}</td>
                  <td className="px-6 py-4 font-bold">${sale.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(sale.status)}`}>
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Revenue Trend ({timeRange})</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
          <p className="text-gray-500">Revenue chart will be displayed here</p>
        </div>
      </div>
    </div>
  );
}