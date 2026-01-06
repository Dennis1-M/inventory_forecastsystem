import { AlertCircle, BarChart3, Bell, Package, Settings, TrendingUp, Users, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import { Card } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import AlertsPage from './AlertsPage';
import AnalyticsPage from './AnalyticsPage';
import ForecastingPage from './ForecastingPage';
import InventoryPage from './InventoryPage';
import ManagerReportsPage from './ManagerReportsPage';
import StaffOversightPage from './StaffOversightPage';
import StockLevelMonitoringPage from './StockLevelMonitoringPage';
import SuppliersPage from './SuppliersPage';
import SystemNotificationsPage from './SystemNotificationsPage';

const ManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarItems = [
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Dashboard Overview', id: 'overview' },
    { icon: <Package className="h-5 w-5" />, label: 'Inventory Management', id: 'inventory' },
    { icon: <AlertCircle className="h-5 w-5" />, label: 'Stock Monitoring', id: 'stock-monitoring' },
    { icon: <TrendingUp className="h-5 w-5" />, label: 'Sales Data Review', id: 'analytics' },
    { icon: <Zap className="h-5 w-5" />, label: 'Demand Forecasting', id: 'forecasting' },
    { icon: <Users className="h-5 w-5" />, label: 'Suppliers', id: 'suppliers' },
    { icon: <Users className="h-5 w-5" />, label: 'Staff Oversight', id: 'staff-oversight' },
    { icon: <Bell className="h-5 w-5" />, label: 'System Notifications', id: 'notifications' },
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Reports', id: 'reports' },
    { icon: <Settings className="h-5 w-5" />, label: 'Alerts', id: 'alerts' },
  ];

  const kpis = [
    { label: 'Total Sales', value: 'Ksh 125,000', icon: BarChart3, color: 'text-green-600' },
    { label: 'Stock Level', value: '1,250 units', icon: Package, color: 'text-blue-600' },
    { label: 'Low Stock Items', value: '8 items', icon: AlertCircle, color: 'text-amber-600' },
    { label: 'Pending Orders', value: '5 orders', icon: Users, color: 'text-indigo-600' },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title="SmartInventory"
      subtitle="Manager Portal"
      userName="Manager User"
      userRole="MANAGER"
      onLogout={handleLogout}
    >
      {activeTab === 'overview' && (
        <div>
          <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => (
              <Card key={index}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-2">{kpi.label}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                  </div>
                  <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">Quick Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: 'Inventory Management', id: 'inventory', icon: Package },
                { title: 'Stock Monitoring', id: 'stock-monitoring', icon: AlertCircle },
                { title: 'Sales Analytics', id: 'analytics', icon: TrendingUp },
                { title: 'Demand Forecast', id: 'forecasting', icon: Zap },
                { title: 'Staff Oversight', id: 'staff-oversight', icon: Users },
                { title: 'Reports & Analytics', id: 'reports', icon: BarChart3 },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="p-3 bg-white rounded-lg hover:shadow-md transition text-left"
                >
                  <item.icon className="h-5 w-5 text-indigo-600 mb-2" />
                  <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeTab === 'inventory' && <InventoryPage />}
      {activeTab === 'stock-monitoring' && <StockLevelMonitoringPage />}
      {activeTab === 'analytics' && <AnalyticsPage />}
      {activeTab === 'forecasting' && <ForecastingPage />}
      {activeTab === 'suppliers' && <SuppliersPage />}
      {activeTab === 'staff-oversight' && <StaffOversightPage />}
      {activeTab === 'notifications' && <SystemNotificationsPage />}
      {activeTab === 'reports' && <ManagerReportsPage />}
      {activeTab === 'alerts' && <AlertsPage />}
    </DashboardLayout>
  );
};

export default ManagerDashboard;
