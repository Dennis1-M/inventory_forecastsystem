import { Activity, BarChart3, Package, Settings, TrendingUp, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import { useAuth } from '../../contexts/AuthContext';
import ActivityLogsPage from './ActivityLogsPage';
import InventoryOversightPage from './InventoryOversightPage';
import ProductsPage from './ProductsPage';
import ProfilePage from './ProfilePage';
import ReportsAnalyticsPage from './ReportsAnalyticsPage';
import SalesMonitoringPage from './SalesMonitoringPage';
import SettingsPage from './SettingsPage';
import SystemHealthPage from './SystemHealthPage';
import UserManagementPage from './UserManagementPage';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarItems = [
    { icon: <Activity className="h-5 w-5" />, label: 'Dashboard Overview', id: 'dashboard' },
    { icon: <Users className="h-5 w-5" />, label: 'User Management', id: 'users' },
    { icon: <Package className="h-5 w-5" />, label: 'Products', id: 'products' },
    { icon: <Package className="h-5 w-5" />, label: 'Inventory Oversight', id: 'inventory' },
    { icon: <TrendingUp className="h-5 w-5" />, label: 'Sales Monitoring', id: 'sales' },
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Reports & Analytics', id: 'reports' },
    { icon: <Activity className="h-5 w-5" />, label: 'Activity Logs', id: 'activity' },
    { icon: <Settings className="h-5 w-5" />, label: 'System Health', id: 'health' },
    { icon: <Settings className="h-5 w-5" />, label: 'Settings', id: 'settings' },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title="SmartInventory"
      subtitle="Admin Portal"
      userName="Admin User"
      userRole="ADMIN"
      onLogout={handleLogout}
      onProfileClick={() => setActiveTab('profile')}
    >
      {activeTab === 'dashboard' && (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer" onClick={() => setActiveTab('users')}>
              <Users className="h-6 w-6 text-blue-500 mb-2" />
              <p className="text-gray-600 text-sm">User Management</p>
              <p className="text-xl font-bold text-gray-900">Manage Users</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer" onClick={() => setActiveTab('inventory')}>
              <Package className="h-6 w-6 text-green-500 mb-2" />
              <p className="text-gray-600 text-sm">Inventory Oversight</p>
              <p className="text-xl font-bold text-gray-900">Stock Status</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer" onClick={() => setActiveTab('sales')}>
              <TrendingUp className="h-6 w-6 text-purple-500 mb-2" />
              <p className="text-gray-600 text-sm">Sales Monitoring</p>
              <p className="text-xl font-bold text-gray-900">Track Sales</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer" onClick={() => setActiveTab('reports')}>
              <BarChart3 className="h-6 w-6 text-orange-500 mb-2" />
              <p className="text-gray-600 text-sm">Reports & Analytics</p>
              <p className="text-xl font-bold text-gray-900">Generate Reports</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <p className="text-gray-700">Welcome to the Admin Portal. Use the navigation menu to manage system resources, monitor activities, and generate reports.</p>
          </div>
        </div>
      )}
      {activeTab === 'users' && <UserManagementPage />}
      {activeTab === 'products' && <ProductsPage />}
      {activeTab === 'inventory' && <InventoryOversightPage />}
      {activeTab === 'sales' && <SalesMonitoringPage />}
      {activeTab === 'reports' && <ReportsAnalyticsPage />}
      {activeTab === 'activity' && <ActivityLogsPage />}
      {activeTab === 'health' && <SystemHealthPage />}
      {activeTab === 'settings' && <SettingsPage />}
      {activeTab === 'profile' && <ProfilePage />}
    </DashboardLayout>
  );
};

export default AdminDashboard;
