// src/pages/dashboard/AdminDashboard.tsx - SIMPLIFIED VERSION
import type { JSX } from 'react';
import { FaBox, FaChartBar, FaExclamationTriangle, FaShoppingCart, FaUserPlus, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface DashboardStat {
  title: string;
  value: number | string;
  icon: JSX.Element;
  color: string;
  subtitle?: string;
}

interface RecentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  // Mock data - we'll replace with real API calls later
  const dashboardStats: DashboardStat[] = [
    { title: 'Total Users', value: 156, icon: <FaUsers />, color: 'blue', subtitle: '24 active today' },
    { title: 'Total Products', value: 342, icon: <FaBox />, color: 'green', subtitle: '12 low in stock' },
    { title: 'Total Orders', value: 892, icon: <FaShoppingCart />, color: 'purple', subtitle: '$15,230 revenue' },
    { title: 'Pending Alerts', value: 8, icon: <FaExclamationTriangle />, color: 'yellow', subtitle: 'Requires attention' },
  ];

  const recentUsers: RecentUser[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', isActive: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', isActive: true },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Staff', isActive: false },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'Staff', isActive: true },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', role: 'Staff', isActive: true },
  ];

  const quickActions = [
    { label: 'Add User', icon: <FaUserPlus />, color: 'blue', path: '/admin/users/new' },
    { label: 'Add Product', icon: <FaBox />, color: 'green', path: '/admin/products/new' },
    { label: 'View Orders', icon: <FaShoppingCart />, color: 'purple', path: '/admin/orders' },
    { label: 'Analytics', icon: <FaChartBar />, color: 'yellow', path: '/admin/analytics' },
  ];

  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'superadmin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your system, users, products, and orders from here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                <div className={`text-${stat.color}-600 text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className={`text-${action.color}-600 text-xl mb-2`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
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
                    ● {user.isActive ? 'Active' : 'Inactive'}
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
              <span className="text-sm font-medium text-gray-600">Backend API</span>
              <span className="text-sm font-semibold text-green-600">Online</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full w-full"></div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Database</span>
              <span className="text-sm font-semibold text-green-600">Connected</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full w-full"></div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">System Load</span>
              <span className="text-sm font-semibold text-blue-600">Normal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}