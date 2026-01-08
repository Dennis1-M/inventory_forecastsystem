import { AlertCircle, BarChart3, Bell, Lightbulb, Package, ShoppingCart, TrendingDown, TrendingUp, Users, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import { Card } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import ProfilePage from '../admin/ProfilePage';
import AdvancedAnalyticsDashboard from './AdvancedAnalyticsDashboard';
import AlertsPage from './AlertsPage';
import AnalyticsPage from './AnalyticsPage';
import ForecastingPage from './ForecastingPage';
import InventoryPage from './InventoryPage';
import ManagerReportsPage from './ManagerReportsPage';
import RestockTrackingPage from './RestockTrackingPage';
import SalesAnalyticsPage from './SalesAnalyticsPage';
import StaffOversightPage from './StaffOversightPage';
import StockLevelMonitoringPage from './StockLevelMonitoringPage';
import SuppliersPage from './SuppliersPage';
import SystemNotificationsPage from './SystemNotificationsPage';

const ManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch dashboard stats
        const statsRes = await apiService.get('/manager/dashboard-stats');
        setDashboardData(statsRes.data?.data || statsRes.data);
        
        // Fetch alerts
        const alertsRes = await apiService.get('/alerts');
        setAlerts(Array.isArray(alertsRes.data?.data) ? alertsRes.data.data.filter((a: any) => !a.isResolved).slice(0, 5) : []);
        
        // Fetch notifications
        const notifRes = await apiService.get('/notifications');
        setNotifications(Array.isArray(notifRes.data?.data) ? notifRes.data.data.slice(0, 5) : []);
        
        // Fetch low stock items
        const invRes = await apiService.get('/inventory');
        const items = Array.isArray(invRes.data?.data) ? invRes.data.data : [];
        setLowStockItems(items.filter((item: any) => item.quantity < 20).slice(0, 5));
        setInventory(items);
        
        // Fetch sales for advanced analytics
        const salesRes = await apiService.get('/sales');
        setSales(Array.isArray(salesRes.data?.data) ? salesRes.data.data : []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarItems = [
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Dashboard Overview', id: 'overview' },
    { icon: <Users className="h-5 w-5" />, label: 'Staff Management', id: 'staff-oversight' },
    { icon: <Package className="h-5 w-5" />, label: 'Inventory Management', id: 'inventory' },
    { icon: <AlertCircle className="h-5 w-5" />, label: 'Low Stock Orders', id: 'stock-monitoring' },
    { icon: <ShoppingCart className="h-5 w-5" />, label: 'Restock Tracking', id: 'restock' },
    { icon: <TrendingUp className="h-5 w-5" />, label: '📊 Sales Analytics (NEW)', id: 'sales-analytics' },
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Charts & Graphs', id: 'analytics' },
    { icon: <Lightbulb className="h-5 w-5" />, label: '✨ Advanced Analytics (15 Features)', id: 'advanced' },
    { icon: <Zap className="h-5 w-5" />, label: 'Forecast Model', id: 'forecasting' },
    { icon: <Bell className="h-5 w-5" />, label: 'Alerts', id: 'alerts' },
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Reports', id: 'reports' },
  ];

  if (loading && activeTab === 'overview') {
    return (
      <DashboardLayout
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title="SmartInventory"
        subtitle="Manager Portal"
        userName={user?.name || 'Manager'}
        userRole="MANAGER"
        onLogout={handleLogout}
        onProfileClick={() => setActiveTab('profile')}
      >
        <div className="p-6 text-center">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title="SmartInventory"
      subtitle="Manager Portal"
      userName={user?.name || 'Manager'}
      userRole="MANAGER"
      onLogout={handleLogout}
      onProfileClick={() => setActiveTab('profile')}
    >
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Manager Dashboard</h2>
            <p className="text-gray-600">Manage inventory, staff, forecasts, and monitor alerts</p>
          </div>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Total Staff</p>
                  <p className="text-2xl font-bold">{dashboardData?.totalStaff || 0}</p>
                </div>
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Low Stock Items</p>
                  <p className="text-2xl font-bold text-amber-600">{dashboardData?.lowStockItems || 0}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Pending Tasks</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardData?.pendingTasks || 0}</p>
                </div>
                <Bell className="h-8 w-8 text-red-600" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Total Sales Value</p>
                  <p className="text-2xl font-bold text-green-600">Ksh {dashboardData?.totalSales?.toLocaleString() || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Low Stock Items - Need Ordering */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Low Stock Items - Action Required
                </h3>
                <button
                  onClick={() => setActiveTab('stock-monitoring')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.productName || item.name || 'Product'}</p>
                        <p className="text-sm text-gray-600">Current: {item.quantity || 0} units</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('restock')}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
                      >
                        Order Stock
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500">No low stock items</p>
                )}
              </div>
            </div>

            {/* Alerts Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-600" />
                  Active Alerts
                </h3>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {alerts.length > 0 ? (
                  alerts.map((alert: any, idx: number) => (
                    <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-semibold text-red-900">{alert.message || alert.type}</p>
                      <p className="text-xs text-red-700 mt-1">{alert.productName || 'Product'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500">No active alerts</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-200 p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => setActiveTab('staff-oversight')}
                className="p-4 bg-white rounded-lg hover:shadow-md transition text-left border border-indigo-200"
              >
                <Users className="h-6 w-6 text-indigo-600 mb-2" />
                <p className="font-medium text-gray-900 text-sm">Manage Staff</p>
                <p className="text-xs text-gray-500 mt-1">View & manage team members</p>
              </button>
              <button
                onClick={() => setActiveTab('stock-monitoring')}
                className="p-4 bg-white rounded-lg hover:shadow-md transition text-left border border-amber-200"
              >
                <AlertCircle className="h-6 w-6 text-amber-600 mb-2" />
                <p className="font-medium text-gray-900 text-sm">Stock Levels</p>
                <p className="text-xs text-gray-500 mt-1">Monitor & order low stock</p>
              </button>
              <button
                onClick={() => setActiveTab('forecasting')}
                className="p-4 bg-white rounded-lg hover:shadow-md transition text-left border border-purple-200"
              >
                <Zap className="h-6 w-6 text-purple-600 mb-2" />
                <p className="font-medium text-gray-900 text-sm">Trigger Forecast</p>
                <p className="text-xs text-gray-500 mt-1">Run ML forecast model</p>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className="p-4 bg-white rounded-lg hover:shadow-md transition text-left border border-green-200"
              >
                <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
                <p className="font-medium text-gray-900 text-sm">Analytics</p>
                <p className="text-xs text-gray-500 mt-1">Decision making insights</p>
              </button>
            </div>
          </div>

          {/* Forecast & Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Forecast Model Status
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="font-semibold text-gray-900">Last Run: 2 hours ago</p>
                  <p className="text-sm text-gray-600">Next scheduled: In 2 hours</p>
                  <button
                    onClick={() => setActiveTab('forecasting')}
                    className="mt-3 w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700"
                  >
                    Trigger Forecast Now
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                System Notifications
              </h3>
              <div className="space-y-2">
                {notifications.length > 0 ? (
                  notifications.map((notif: any, idx: number) => (
                    <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                      <p className="font-semibold text-blue-900">{notif.type || 'Notification'}</p>
                      <p className="text-blue-700 mt-1">{notif.message || notif.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500">No new notifications</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'staff-oversight' && <StaffOversightPage />}
      {activeTab === 'inventory' && <InventoryPage />}
      {activeTab === 'stock-monitoring' && <StockLevelMonitoringPage />}
      {activeTab === 'restock' && <RestockTrackingPage />}
      {activeTab === 'sales-analytics' && <SalesAnalyticsPage />}
      {activeTab === 'analytics' && <AnalyticsPage />}
      {activeTab === 'advanced' && <AdvancedAnalyticsDashboard inventory={inventory} sales={sales} />}
      {activeTab === 'forecasting' && <ForecastingPage />}
      {activeTab === 'suppliers' && <SuppliersPage />}
      {activeTab === 'notifications' && <SystemNotificationsPage />}
      {activeTab === 'reports' && <ManagerReportsPage />}
      {activeTab === 'alerts' && <AlertsPage />}
      {activeTab === 'profile' && <ProfilePage />}
    </DashboardLayout>
  );
};

export default ManagerDashboard;
