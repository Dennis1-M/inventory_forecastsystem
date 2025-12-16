// src/pages/dashboard/AdminDashboard.tsx - FIX THIS FILE
import { useEffect, useState } from 'react';
import {
  FaArrowUp,
  FaBox,
  FaChartBar,
  FaDatabase,
  FaExclamationTriangle,
  FaShoppingCart,
  FaSpinner,
  FaUserPlus,
  FaUsers
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
  isActive: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalSales: number;
  monthlySales: number;
  pendingAlerts: number;
  inventoryValue: number;
}

export default function AdminDashboardPage() {
  const { user: currentUser, token, logoutUser } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalSales: 0,
    monthlySales: 0,
    pendingAlerts: 0,
    inventoryValue: 0
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersResponse = await fetch('http://localhost:5001/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (usersResponse.status === 401) {
        logoutUser();
        navigate('/login');
        return;
      }

      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      
      const usersData = await usersResponse.json();
      const usersList = usersData.data || usersData;
      setUsers(usersList);
      setRecentUsers(usersList.slice(0, 5)); // Show 5 most recent users

      // Calculate basic stats
      const activeUsersCount = usersList.filter((u: User) => u.isActive).length;
      
      // Fetch system stats if available
      try {
        const statsResponse = await fetch('http://localhost:5001/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats({
            totalUsers: usersList.length,
            activeUsers: activeUsersCount,
            totalProducts: statsData.data?.products?.total || 0,
            lowStockProducts: statsData.data?.products?.lowStock || 0,
            totalSales: statsData.data?.sales?.total || 0,
            monthlySales: 0, // You can calculate this
            pendingAlerts: statsData.data?.alerts?.active || 0,
            inventoryValue: 0 // You can calculate this
          });
        }
      } catch (statsError) {
        // If stats endpoint fails, use basic stats
        setStats({
          totalUsers: usersList.length,
          activeUsers: activeUsersCount,
          totalProducts: 0,
          lowStockProducts: 0,
          totalSales: 0,
          monthlySales: 0,
          pendingAlerts: 0,
          inventoryValue: 0
        });
      }

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return 'bg-purple-100 text-purple-800';
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'MANAGER': return 'bg-blue-100 text-blue-800';
      case 'STAFF': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-600 text-2xl" />
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {currentUser?.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</h3>
              <p className="text-xs text-green-600 mt-1">
                {stats.activeUsers} active • {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Products</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</h3>
              <p className="text-xs text-red-600 mt-1">
                {stats.lowStockProducts} low stock
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaBox className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Sales Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSales}</h3>
              <p className="text-xs text-green-600 mt-1">
                <FaArrowUp className="inline mr-1" />
                {stats.monthlySales} this month
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaShoppingCart className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Alerts Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Alerts</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingAlerts}</h3>
              <p className="text-xs text-yellow-600 mt-1">
                Requires attention
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaExclamationTriangle className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <FaUserPlus className="text-blue-600 text-xl mb-2" />
              <span className="text-sm font-medium">Add User</span>
            </button>
            <button
              onClick={() => navigate('/admin/products')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <FaBox className="text-green-600 text-xl mb-2" />
              <span className="text-sm font-medium">Add Product</span>
            </button>
            <button
              onClick={() => navigate('/admin/inventory')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <FaDatabase className="text-purple-600 text-xl mb-2" />
              <span className="text-sm font-medium">Inventory</span>
            </button>
            <button
              onClick={() => navigate('/admin/analytics')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <FaChartBar className="text-yellow-600 text-xl mb-2" />
              <span className="text-sm font-medium">Analytics</span>
            </button>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span className={`text-xs ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">API Status</span>
              <span className="text-sm font-semibold text-green-600">Online</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Database</span>
              <span className="text-sm font-semibold text-green-600">Connected</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Server Load</span>
              <span className="text-sm font-semibold text-blue-600">Normal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}