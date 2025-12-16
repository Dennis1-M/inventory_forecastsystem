// layouts/StaffDashboard.tsx
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle,
  ClipboardCheck,
  Clock,
  Package,
  RefreshCw,
  Search
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks');

  // Staff-specific tasks
  const dailyTasks = [
    { id: 1, title: 'Receive new inventory shipment', time: '9:00 AM', status: 'pending', priority: 'high' },
    { id: 2, title: 'Scan and update stock levels', time: '10:00 AM', status: 'in-progress', priority: 'medium' },
    { id: 3, title: 'Check expiry dates for perishables', time: '11:00 AM', status: 'pending', priority: 'high' },
    { id: 4, title: 'Organize warehouse shelves', time: '2:00 PM', status: 'pending', priority: 'low' },
    { id: 5, title: 'Prepare items for shipment', time: '3:00 PM', status: 'pending', priority: 'medium' },
  ];

  const quickActions = [
    { id: 1, title: 'Scan New Items', icon: Package, color: 'bg-blue-100 text-blue-600' },
    { id: 2, title: 'Check Low Stock', icon: AlertTriangle, color: 'bg-amber-100 text-amber-600' },
    { id: 3, title: 'Update Inventory', icon: RefreshCw, color: 'bg-green-100 text-green-600' },
    { id: 4, title: 'View Tasks', icon: ClipboardCheck, color: 'bg-purple-100 text-purple-600' },
  ];

  const inventoryAlerts = [
    { id: 1, item: 'Batteries AA', message: 'Stock below minimum level', type: 'warning' },
    { id: 2, item: 'Coffee Filters', message: 'Expiring in 7 days', type: 'alert' },
    { id: 3, item: 'Shipping Boxes', message: 'Need reorder soon', type: 'info' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">AI Inventory System</h1>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                STAFF
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-500 cursor-pointer hover:text-gray-700" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Staff Member'}</p>
                  <p className="text-xs text-gray-500">Warehouse Staff</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {user?.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-xl p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Team Member'}!</h2>
          <p className="opacity-90">Here's your daily overview and tasks for today.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tasks & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className={`p-3 rounded-full ${action.color} mb-2`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{action.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Tasks */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Today's Tasks</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'tasks' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    All Tasks
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'completed' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {dailyTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${task.status === 'completed' ? 'bg-green-100' : task.status === 'in-progress' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {task.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : task.status === 'in-progress' ? (
                          <Clock className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm text-gray-500">{task.time}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                            {task.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      {task.status === 'completed' ? 'View' : 'Start'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Alerts */}
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Items Scanned Today</p>
                    <p className="text-2xl font-bold text-gray-900">247</p>
                  </div>
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Tasks Completed</p>
                    <p className="text-2xl font-bold text-gray-900">12/18</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Accuracy Rate</p>
                    <p className="text-2xl font-bold text-gray-900">98.7%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </div>

            {/* Inventory Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory Alerts</h3>
              <div className="space-y-4">
                {inventoryAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${alert.type === 'warning' ? 'bg-red-100' : alert.type === 'alert' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                        <AlertTriangle className={`h-5 w-5 ${alert.type === 'warning' ? 'text-red-600' : alert.type === 'alert' ? 'text-amber-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{alert.item}</h4>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Take action →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-900">Scanned 50 boxes of electronics</p>
                    <p className="text-xs text-gray-500">10 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-900">Updated inventory for Section A</p>
                    <p className="text-xs text-gray-500">45 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-900">Reported damaged goods</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - AI Assistant */}
        <div className="mt-8 bg-linear-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Inventory Assistant</h3>
              <p className="text-gray-600">Need help with inventory tasks? Ask the AI assistant for guidance.</p>
            </div>
            <button className="px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity">
              Ask Assistant
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;