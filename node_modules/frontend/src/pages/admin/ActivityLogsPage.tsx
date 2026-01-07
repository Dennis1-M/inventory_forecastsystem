import { Activity, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import apiService from '../../services/api';

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  status: 'success' | 'failed';
  userEmail?: string;
}

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'login' | 'create' | 'update' | 'delete'>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/activity-logs');
        const logData = response.data?.data || response.data || [];
        setLogs(Array.isArray(logData) ? logData : []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch activity logs:', err);
        setError('Failed to load activity logs');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.action.includes(filter.toUpperCase()));

  const getActionColor = (action: string) => {
    if (action.includes('LOGIN')) return 'text-blue-600';
    if (action.includes('CREATE')) return 'text-green-600';
    if (action.includes('UPDATE')) return 'text-orange-600';
    if (action.includes('DELETE')) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusBadge = (status: string) => {
    return status === 'success'
      ? <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Success</span>
      : <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Failed</span>;
  };

  if (loading) return <div className="p-6">Loading activity logs...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Activity & Audit Logs
        </h2>
        <div className="flex gap-2">
          {(['all', 'login', 'create', 'update', 'delete'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && !logs.length && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
          {error} - Showing sample data
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredLogs.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.userEmail || `User ${log.userId}`}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getActionColor(log.action)}`}>
                    {log.action.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{log.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(log.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No activity logs found for the selected filter</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Log Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-blue-600 text-sm">Total Logs</p>
            <p className="text-2xl font-bold text-blue-900">{logs.length}</p>
          </div>
          <div>
            <p className="text-green-600 text-sm">Successful Actions</p>
            <p className="text-2xl font-bold text-green-900">{logs.filter(l => l.status === 'success').length}</p>
          </div>
          <div>
            <p className="text-red-600 text-sm">Failed Actions</p>
            <p className="text-2xl font-bold text-red-900">{logs.filter(l => l.status === 'failed').length}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Unique Users</p>
            <p className="text-2xl font-bold text-gray-900">{new Set(logs.map(l => l.userId)).size}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsPage;
