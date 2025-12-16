// src/pages/admin/Alerts.tsx
import { useEffect, useState } from 'react';
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

interface Alert {
  id: number;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = () => {
    // Mock data - replace with API call
    const mockAlerts: Alert[] = [
      { id: 1, type: 'error', title: 'Server Error', message: 'API server responded with 500 error', timestamp: '2024-12-16 10:30', read: false, priority: 'high' },
      { id: 2, type: 'warning', title: 'Low Inventory', message: '5 products are below minimum stock level', timestamp: '2024-12-16 09:15', read: false, priority: 'medium' },
      { id: 3, type: 'info', title: 'System Update', message: 'Scheduled maintenance this weekend', timestamp: '2024-12-15 14:20', read: true, priority: 'low' },
      { id: 4, type: 'success', title: 'Backup Complete', message: 'Database backup completed successfully', timestamp: '2024-12-15 03:00', read: true, priority: 'low' },
      { id: 5, type: 'warning', title: 'High Traffic', message: 'Unusual spike in website traffic detected', timestamp: '2024-12-14 18:45', read: false, priority: 'medium' },
    ];
    setAlerts(mockAlerts);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <FaExclamationTriangle className="text-red-500" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'info': return <FaInfoCircle className="text-blue-500" />;
      case 'success': return <FaCheckCircle className="text-green-500" />;
      default: return <FaBell className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : filter === 'unread' 
      ? alerts.filter(a => !a.read)
      : alerts.filter(a => a.type === filter);

  const markAsRead = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Alerts</h1>
          <p className="text-gray-600">Monitor and manage system notifications</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Mark All as Read
          </button>
          <button
            onClick={fetchAlerts}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold">{alerts.length}</p>
            </div>
            <FaBell className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-red-600">
                {alerts.filter(a => !a.read).length}
              </p>
            </div>
            <FaExclamationTriangle className="text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold">
                {alerts.filter(a => a.priority === 'high').length}
              </p>
            </div>
            <span className="text-red-500 font-bold">!</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Warnings</p>
              <p className="text-2xl font-bold">
                {alerts.filter(a => a.type === 'warning').length}
              </p>
            </div>
            <FaExclamationTriangle className="text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-3 py-1 rounded ${filter === 'error' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Errors
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-3 py-1 rounded ${filter === 'warning' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Warnings
          </button>
          <button
            onClick={() => setFilter('info')}
            className={`px-3 py-1 rounded ${filter === 'info' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Info
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white p-4 rounded-lg shadow-sm border ${alert.read ? 'border-gray-200' : 'border-l-4 border-l-blue-500'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="mt-1">{getTypeIcon(alert.type)}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{alert.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(alert.priority)}`}>
                      {alert.priority.toUpperCase()}
                    </span>
                    {!alert.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-sm text-gray-500 mt-2">{alert.timestamp}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {!alert.read && (
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}