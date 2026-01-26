import { Building2, Database, Settings, Shield, TrendingUp, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import { useAuth } from '../../contexts/AuthContext';
import ActivityLogsPage from '../admin/ActivityLogsPage';
import ProfilePage from '../admin/ProfilePage';
import ReportsAnalyticsPage from '../admin/ReportsAnalyticsPage';
import SystemHealthPage from '../admin/SystemHealthPage';
import UserManagementPage from '../admin/UserManagementPage';
import BusinessConfigPage from './BusinessConfigPage.tsx';
import DataManagementPage from './DataManagementPage.tsx';
import SystemSettingsPage from './SystemSettingsPage.tsx';

const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarItems = [
    { icon: <Shield className="h-5 w-5" />, label: 'Dashboard Overview', id: 'dashboard' },
    { icon: <Building2 className="h-5 w-5" />, label: 'Business Configuration', id: 'business' },
    { icon: <Users className="h-5 w-5" />, label: 'User Management', id: 'users' },
    { icon: <Settings className="h-5 w-5" />, label: 'System Settings', id: 'settings' },
    { icon: <Database className="h-5 w-5" />, label: 'Data Management', id: 'data' },
    { icon: <TrendingUp className="h-5 w-5" />, label: 'System Health', id: 'health' },
    { icon: <Shield className="h-5 w-5" />, label: 'Activity Logs', id: 'activity' },
    { icon: <TrendingUp className="h-5 w-5" />, label: 'Reports & Analytics', id: 'reports' },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title="SmartInventory"
      subtitle="SuperAdmin Portal"
      userName={user?.name || 'SuperAdmin'}
      userRole="SUPERADMIN"
      onLogout={handleLogout}
      onProfileClick={() => setActiveTab('profile')}
    >
      {activeTab === 'dashboard' && (
        <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">SuperAdmin Dashboard</h2>
          
          {/* Welcome Message */}
          <div className="mb-6 p-4 bg-white rounded-lg shadow border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👋 Welcome, SuperAdmin!</h3>
            <p className="text-gray-700">
              You have full system access. Use the navigation menu to configure business settings, 
              manage users, monitor system health, and control all aspects of the application.
            </p>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div 
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer border-t-4 border-purple-500"
              onClick={() => setActiveTab('business')}
            >
              <Building2 className="h-8 w-8 text-purple-500 mb-2" />
              <p className="text-gray-600 text-sm">Business Configuration</p>
              <p className="text-lg font-bold text-gray-900">Setup Business</p>
              <p className="text-xs text-gray-500 mt-1">Configure company info & settings</p>
            </div>

            <div 
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer border-t-4 border-blue-500"
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-8 w-8 text-blue-500 mb-2" />
              <p className="text-gray-600 text-sm">User Management</p>
              <p className="text-lg font-bold text-gray-900">Manage Users</p>
              <p className="text-xs text-gray-500 mt-1">Create & manage all user roles</p>
            </div>

            <div 
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer border-t-4 border-green-500"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-gray-600 text-sm">System Settings</p>
              <p className="text-lg font-bold text-gray-900">Configure System</p>
              <p className="text-xs text-gray-500 mt-1">Alerts, thresholds & preferences</p>
            </div>

            <div 
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer border-t-4 border-orange-500"
              onClick={() => setActiveTab('health')}
            >
              <TrendingUp className="h-8 w-8 text-orange-500 mb-2" />
              <p className="text-gray-600 text-sm">System Health</p>
              <p className="text-lg font-bold text-gray-900">Monitor Status</p>
              <p className="text-xs text-gray-500 mt-1">API, database & performance</p>
            </div>
          </div>

          {/* System Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
                <Users className="h-10 w-10 text-blue-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">All roles across system</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">System Status</p>
                  <p className="text-2xl font-bold text-green-600">Operational</p>
                </div>
                <Shield className="h-10 w-10 text-green-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">All services running</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Database</p>
                  <p className="text-2xl font-bold text-purple-600">Healthy</p>
                </div>
                <Database className="h-10 w-10 text-purple-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">PostgreSQL connected</p>
            </div>
          </div>

          {/* Admin Privileges Notice */}
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-900">SuperAdmin Privileges</p>
                <ul className="text-xs text-purple-700 mt-2 space-y-1">
                  <li>✅ Create, edit, and delete users of all roles (including Admins)</li>
                  <li>✅ Configure business information and company settings</li>
                  <li>✅ Manage system-wide settings (stock thresholds, alerts, notifications)</li>
                  <li>✅ View and export complete activity logs and audit trails</li>
                  <li>✅ Monitor system health and performance metrics</li>
                  <li>✅ Perform database backups and data management operations</li>
                  <li>✅ Access all reports and analytics across the organization</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'business' && <BusinessConfigPage />}
      {activeTab === 'users' && <UserManagementPage />}
      {activeTab === 'settings' && <SystemSettingsPage />}
      {activeTab === 'data' && <DataManagementPage />}
      {activeTab === 'health' && <SystemHealthPage />}
      {activeTab === 'activity' && <ActivityLogsPage />}
      {activeTab === 'reports' && <ReportsAnalyticsPage />}
      {activeTab === 'profile' && <ProfilePage />}
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
