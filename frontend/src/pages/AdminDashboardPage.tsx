// src/pages/AdminDashboardPage.tsx - REAL DATA ONLY
import { useEffect, useState } from 'react';
import {
    FaBox,
    FaCheck,
    FaEdit,
    FaExclamationTriangle,
    FaEye,
    FaFilter,
    FaSearch,
    FaShieldAlt,
    FaShoppingCart,
    FaSpinner,
    FaTimes,
    FaTrash,
    FaUserCheck,
    FaUserPlus,
    FaUsers,
    FaUserShield,
    FaUserSlash,
    FaUserTie
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUser?: {
    id: number;
    name: string;
    email: string;
  };
}

interface SystemStats {
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  products: {
    total: number;
    lowStock: number;
    lowStockProducts: Array<{
      id: number;
      name: string;
      sku: string;
      currentStock: number;
      lowStockThreshold: number;
    }>;
  };
  sales: {
    total: number;
  };
  alerts: {
    total: number;
    active: number;
  };
}

interface DashboardData {
  users: User[];
  stats: SystemStats | null;
  loading: boolean;
  error: string | null;
}

export default function AdminDashboardPage() {
  const { user: currentUser, token, logoutUser } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    users: [],
    stats: null,
    loading: true,
    error: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch users and stats in parallel
      const [usersResponse, statsResponse] = await Promise.all([
        fetch('http://localhost:5001/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5001/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Handle authentication errors
      if (usersResponse.status === 401 || statsResponse.status === 401) {
        logoutUser();
        navigate('/login');
        return;
      }

      // Parse responses
      const usersData = await usersResponse.json();
      const statsData = await statsResponse.json();

      // Validate responses
      if (!usersResponse.ok) {
        throw new Error(usersData.message || 'Failed to fetch users');
      }

      if (!statsResponse.ok) {
        console.warn('Stats endpoint returned error, using partial data:', statsData.message);
      }

      // Update state with real data
      setDashboardData({
        users: usersData.data || usersData || [],
        stats: statsResponse.ok ? statsData.data : null,
        loading: false,
        error: null
      });

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load dashboard data'
      }));
      showNotification('error', error.message || 'Failed to load dashboard data');
    }
  };

  // Handle user status toggle
  const handleToggleUserStatus = async (userId: number, currentIsActive: boolean) => {
    if (!confirm(`Are you sure you want to ${currentIsActive ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentIsActive })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user status');
      }

      // Update local state
      setDashboardData(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === userId ? { ...user, isActive: !currentIsActive } : user
        )
      }));

      showNotification('success', `User ${currentIsActive ? 'deactivated' : 'activated'} successfully!`);
      
    } catch (error: any) {
      console.error('Error updating user status:', error);
      showNotification('error', error.message || 'Failed to update user status');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      // Update local state
      setDashboardData(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== userId)
      }));

      showNotification('success', `User "${userName}" deleted successfully!`);
      
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showNotification('error', error.message || 'Failed to delete user');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = dashboardData.users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'ACTIVE' && user.isActive) || 
      (filterStatus === 'INACTIVE' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get recent users (last 5)
  const recentUsers = [...dashboardData.users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Helper functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'ADMIN': return 'bg-red-100 text-red-800 border border-red-200';
      case 'MANAGER': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'STAFF': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return <FaUserShield className="text-purple-600" />;
      case 'ADMIN': return <FaShieldAlt className="text-red-600" />;
      case 'MANAGER': return <FaUserTie className="text-blue-600" />;
      case 'STAFF': return <FaUsers className="text-green-600" />;
      default: return <FaUsers />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Loading state
  if (dashboardData.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-600 text-2xl" />
        <span className="ml-2 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  // Error state
  if (dashboardData.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center text-red-800 mb-2">
          <FaExclamationTriangle className="mr-2" />
          <h3 className="font-semibold">Error Loading Dashboard</h3>
        </div>
        <p className="text-red-700 mb-4">{dashboardData.error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg border shadow-lg z-50 max-w-md ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex justify-between items-start">
            <div className="font-medium">{notification.message}</div>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {currentUser?.name}!
        </h1>
        <p className="text-gray-600">
          Dashboard last updated: {new Date().toLocaleTimeString()}
        </p>
        <div className="mt-2 text-sm text-gray-500">
          System Time: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid - REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData.stats?.users?.total || dashboardData.users.length}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-green-600">
                  <FaUserCheck className="inline mr-1" />
                  {dashboardData.users.filter(u => u.isActive).length} active
                </span>
                <span className="text-xs text-gray-500">
                  ({dashboardData.stats?.users?.byRole?.ADMIN || 0} admins)
                </span>
              </div>
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
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData.stats?.products?.total || 0}
              </h3>
              {dashboardData.stats?.products?.lowStock && dashboardData.stats.products.lowStock > 0 ? (
                <p className="text-xs text-red-600 mt-1">
                  <FaExclamationTriangle className="inline mr-1" />
                  {dashboardData.stats.products.lowStock} low stock
                </p>
              ) : (
                <p className="text-xs text-green-600 mt-1">
                  <FaCheck className="inline mr-1" />
                  Stock levels good
                </p>
              )}
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
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData.stats?.sales?.total || 0}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                All-time transactions
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
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData.stats?.alerts?.active || 0}
              </h3>
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

      {/* User Management Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-600">
              Total: {dashboardData.users.length} users • Showing: {filteredUsers.length} filtered
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              onClick={() => navigate('/admin/users/new')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              disabled={isProcessing}
            >
              <FaUserPlus className="mr-2" />
              Add New User
            </button>
            <button
              onClick={fetchDashboardData}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={isProcessing}
            >
              <FaSpinner className={`mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPERADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="STAFF">Staff</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FaFilter className="mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Users Table - REAL DATA */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Created</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-gray-500">
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.createdByUser && (
                            <p className="text-xs text-gray-400">
                              Created by: {user.createdByUser.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {user.isActive ? (
                          <>
                            <FaUserCheck className="mr-1" /> Active
                          </>
                        ) : (
                          <>
                            <FaUserSlash className="mr-1" /> Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                          disabled={isProcessing}
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                          className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Edit User"
                          disabled={isProcessing}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          className={`p-2 rounded ${
                            user.isActive
                              ? 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                          disabled={isProcessing}
                        >
                          {user.isActive ? <FaUserSlash /> : <FaUserCheck />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete User"
                          disabled={isProcessing || user.id === currentUser?.id}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Role Distribution - REAL DATA */}
        {dashboardData.stats?.users?.byRole && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(dashboardData.stats.users.byRole).map(([role, count]) => (
                <div key={role} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{role}</p>
                      <h4 className="text-xl font-bold text-gray-900">{count}</h4>
                    </div>
                    <div className="p-2 rounded-full bg-white">
                      {getRoleIcon(role)}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(count / dashboardData.stats.users.total) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {((count / dashboardData.stats.users.total) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Low Stock Products - REAL DATA */}
      {dashboardData.stats?.products?.lowStockProducts && 
       dashboardData.stats.products.lowStockProducts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Products</h3>
            <button
              onClick={() => navigate('/admin/inventory')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View Inventory
            </button>
          </div>
          <div className="space-y-3">
            {dashboardData.stats.products.lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    product.currentStock <= product.lowStockThreshold / 2 
                      ? 'text-red-600' 
                      : 'text-yellow-600'
                  }`}>
                    {product.currentStock} units
                  </p>
                  <p className="text-xs text-gray-500">
                    Threshold: {product.lowStockThreshold}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Data Freshness</span>
              <span className="text-sm font-semibold text-green-600">Live</span>
            </div>
            <p className="text-sm text-gray-500">
              All data is fetched directly from the database in real-time
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">API Status</span>
              <span className="text-sm font-semibold text-green-600">Connected</span>
            </div>
            <p className="text-sm text-gray-500">
              Backend: localhost:5001 • Users: {dashboardData.users.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}