import { AlertCircle, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import apiService from '../../services/api';

interface StaffActivity {
  id: string;
  staffName: string;
  action: string;
  details: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'issues';
}

const StaffOversightPage = () => {
  const [activities, setActivities] = useState<StaffActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sales' | 'stock' | 'issues'>('all');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/staff-activities');
        setActivities(response.data || []);
      } catch (err) {
        console.error('Failed to fetch staff activities:', err);
        // Mock data for demonstration
        setActivities([
          {
            id: '1',
            staffName: 'John Doe',
            action: 'Sales Entry',
            details: 'Entered 5 sales transactions',
            timestamp: new Date(Date.now() - 1000000).toISOString(),
            status: 'completed'
          },
          {
            id: '2',
            staffName: 'Jane Smith',
            action: 'Stock Update',
            details: 'Updated inventory for Widget A - 50 units in',
            timestamp: new Date(Date.now() - 500000).toISOString(),
            status: 'completed'
          },
          {
            id: '3',
            staffName: 'Bob Johnson',
            action: 'Sales Entry',
            details: 'Entered 2 sales - Discrepancy flagged',
            timestamp: new Date(Date.now() - 200000).toISOString(),
            status: 'issues'
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.action.toLowerCase().includes(filter));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-blue-100 text-blue-700';
      case 'issues':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    totalEntries: activities.length,
    completedEntries: activities.filter(a => a.status === 'completed').length,
    pendingEntries: activities.filter(a => a.status === 'pending').length,
    issuesFound: activities.filter(a => a.status === 'issues').length,
  };

  if (loading) return <div className="p-6">Loading staff activities...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Entries</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <p className="text-green-700 text-sm font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-900">{stats.completedEntries}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-200">
          <p className="text-blue-700 text-sm font-medium">Pending Review</p>
          <p className="text-2xl font-bold text-blue-900">{stats.pendingEntries}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
          <p className="text-red-700 text-sm font-medium">Issues Found</p>
          <p className="text-2xl font-bold text-red-900">{stats.issuesFound}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'sales', 'stock', 'issues'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Activity Log
          </h3>
        </div>
        {filteredActivities.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.staffName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">{activity.action}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{activity.details}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No staff activities found for the selected filter</p>
          </div>
        )}
      </div>

      {stats.issuesFound > 0 && (
        <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Items Requiring Review ({stats.issuesFound})
          </h3>
          <p className="text-red-700 mb-4">The following entries have discrepancies or issues that need manager review:</p>
          <div className="space-y-2">
            {activities
              .filter(a => a.status === 'issues')
              .map(activity => (
                <div key={activity.id} className="p-3 bg-white rounded border border-red-300">
                  <p className="font-semibold text-gray-900">{activity.staffName} - {activity.action}</p>
                  <p className="text-sm text-gray-700">{activity.details}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOversightPage;
