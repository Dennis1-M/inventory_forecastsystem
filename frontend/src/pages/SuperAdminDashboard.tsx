import { useEffect, useState } from 'react';
import {
  FaBell,
  FaChevronDown,
  FaCog,
  FaDatabase,
  FaDownload,
  FaEdit,
  FaEnvelope,
  FaEye,
  FaFilter,
  FaGlobe,
  FaKey,
  FaLock,
  FaSearch,
  FaServer,
  FaSignOutAlt,
  FaSpinner,
  FaTimes,
  FaTrash,
  FaUser,
  FaUserCheck,
  FaUserPlus,
  FaUserShield,
  FaUserSlash,
  FaUserTie,
  FaUsers
} from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


// PLEASE CHECK THIS INSTALLATIONS !!!!
// Install these packages if needed:
// npm install react-icons chart.js react-chartjs-2
// npm install date-fns

interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
  isActive: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  lastLogin?: string;
}

interface SystemStats {
  totalUsers: number;
  totalAdmins: number;
  totalManagers: number;
  totalStaff: number;
  activeUsers: number;
  activeSessions: number;
  storageUsed: string;
  serverUptime: string;
}

interface ActivityLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

interface SystemSetting {
  key: string;
  value: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
}

export default function SuperAdminDashboard() {
  const { user: currentAuthUser, token, logoutUser } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // DUMMY STATS TO BE ACTIVATED !!!

  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalManagers: 0,
    totalStaff: 0,
    activeUsers: 0,
    activeSessions: 0,
    storageUsed: '4.2 GB',
    serverUptime: '99.8%'
  });


   // ACTIVITY LOGS PANNEL
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: 1,
      userId: 1,
      userName: 'Super Admin',
      action: 'USER_CREATED',
      details: 'Created new admin user: John Doe',
      ipAddress: '192.168.1.1',
      timestamp: new Date().toISOString(),
    },
  ]);

  // SETTINGS PANEL

  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([
    { key: 'SITE_NAME', value: 'My Admin Portal', label: 'Site Name', type: 'text' },
    { key: 'MAINTENANCE_MODE', value: 'false', label: 'Maintenance Mode', type: 'boolean' },
    { key: 'REQUIRE_2FA', value: 'true', label: 'Require 2FA', type: 'boolean' },
    { key: 'PASSWORD_MIN_LENGTH', value: '8', label: 'Minimum Password Length', type: 'number' },
    { key: 'SESSION_TIMEOUT', value: '30', label: 'Session Timeout (minutes)', type: 'number' },
  ]);

  // Registration form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN' as 'ADMIN' | 'MANAGER' | 'STAFF',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [registerError, setRegisterError] = useState('');

  // Fetch users on component mount
  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchActivityLogs();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        logoutUser();
        navigate('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.data || data);
      calculateStats(data.data || data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    // Simulate API call
    setTimeout(() => {
      setActivityLogs([
        ...activityLogs,
        {
          id: 2,
          userId: 1,
          userName: 'Super Admin',
          action: 'SETTINGS_UPDATED',
          details: 'Updated system settings',
          ipAddress: '192.168.1.1',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    }, 1000);
  };

  const calculateStats = (userList: User[]) => {
    const newStats = {
      totalUsers: userList.length,
      totalAdmins: userList.filter(u => u.role === 'ADMIN').length,
      totalManagers: userList.filter(u => u.role === 'MANAGER').length,
      totalStaff: userList.filter(u => u.role === 'STAFF').length,
      activeUsers: userList.filter(u => u.isActive).length,
      activeSessions: 12, // This would come from API
      storageUsed: '4.2 GB',
      serverUptime: '99.8%'
    };
    setStats(newStats);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    
    // Validation
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setRegistering(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(`Permission denied: ${data.message}`);
        }
        throw new Error(data.message || 'Registration failed');
      }

      alert(`✅ ${formData.role} registered successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN'
      });
      setFormErrors({});
      setShowRegisterForm(false);
      setRegisterError('');
      
      // Refresh user list
      fetchUsers();
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setRegisterError(error.message);
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('✅ User deleted successfully');
        fetchUsers();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };



  const handleToggleUserStatus = async (userId: number, currentIsActive: boolean) => {
  const newStatus = !currentIsActive;
  
  if (window.confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this user?`)) {
    try {
      setIsLoading(true);

      // DEBUG: Log what we're sending
      console.log('DEBUG - Sending update request:', {
        userId,
        currentIsActive,
        newStatus,
        endpoint: `http://localhost:5001/api/users/${userId}`
      });
       

      const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: newStatus  // Try changing this to 'status' if it doesn't work
          // OR try: status: newStatus ? 'ACTIVE' : 'INACTIVE'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update user status`);
      }

      const updatedUser = await response.json();
      
      // Update the user in the state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, isActive: newStatus } : user
        )
      );
      
      // Show success message
      setNotification({
        type: 'success',
        message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      });
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
    } catch (error: any) {
      console.error('Toggle status error:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to update user status',
      });
    } finally {
      setIsLoading(false);
    }
  }
};

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logoutUser();
      navigate('/login');
    }
  };

  const handleToggleMaintenance = () => {
    const currentValue = systemSettings.find(s => s.key === 'MAINTENANCE_MODE')?.value;
    const newValue = currentValue === 'true' ? 'false' : 'true';
    
    setSystemSettings(settings =>
      settings.map(s =>
        s.key === 'MAINTENANCE_MODE' ? { ...s, value: newValue } : s
      )
    );
    
    alert(`Maintenance mode ${newValue === 'true' ? 'enabled' : 'disabled'}`);
  };

  const handleExportData = (type: string) => {
    alert(`Exporting ${type} data...`);
    // Implementation for data export
  };

  const handleImpersonate = (userId: number) => {
    if (confirm('Impersonate this user?')) {
      alert(`Impersonating user ${userId}`);
      // Implementation for impersonation
    }
  };

  const handleUpdateSetting = (key: string, value: string) => {
    setSystemSettings(settings =>
      settings.map(s =>
        s.key === key ? { ...s, value } : s
      )
    );
    // Here you would typically make an API call to save the setting
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter(userItem => {
    const matchesSearch = 
      userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || userItem.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'ADMIN': return 'bg-red-100 text-red-800 border border-red-200';
      case 'MANAGER': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'STAFF': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return <FaUserShield className="text-purple-500" />;
      case 'ADMIN': return <FaUserShield className="text-red-500" />;
      case 'MANAGER': return <FaUserTie className="text-blue-500" />;
      case 'STAFF': return <FaUser className="text-green-500" />;
      default: return <FaUser />;
    }
  };

  // Format date
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

  // Check if current user is viewing their own profile
  const isCurrentUser = (userId: number): boolean => {
    if (!currentAuthUser?.id) return false;
    const currentUserId = Number(currentAuthUser.id);
    return !isNaN(currentUserId) && currentUserId === userId;
  };

  // Render different tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return renderUsersTab();
      case 'activity':
        return renderActivityTab();
      case 'settings':
        return renderSettingsTab();
      case 'system':
        return renderSystemTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</h3>
              <p className="text-xs text-green-600 mt-1">{stats.activeUsers} active</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeSessions}</h3>
              <p className="text-xs text-gray-500 mt-1">Live connections</p>
            </div>

            <div className="p-3 bg-green-100 rounded-full">
              <FaUserCheck className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Server Uptime</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.serverUptime}</h3>
              <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaServer className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.storageUsed}</h3>
              <p className="text-xs text-gray-500 mt-1">Database storage</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaDatabase className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowRegisterForm(true)}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <FaUserPlus className="text-blue-600 text-xl mb-2" />
            <span className="text-sm font-medium">Add User</span>
          </button>
          <button
            onClick={handleToggleMaintenance}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <FaCog className="text-yellow-600 text-xl mb-2" />
            <span className="text-sm font-medium">Toggle Maintenance</span>
          </button>
          <button
            onClick={() => handleExportData('users')}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <FaDownload className="text-green-600 text-xl mb-2" />
            <span className="text-sm font-medium">Export Data</span>
          </button>
          <button
            onClick={() => navigate('/backup')}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <FaDatabase className="text-purple-600 text-xl mb-2" />
            <span className="text-sm font-medium">Backup Now</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button
            onClick={() => setActiveTab('activity')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {activityLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${log.action.includes('CREATE') ? 'bg-green-100' : log.action.includes('DELETE') ? 'bg-red-100' : 'bg-blue-100'}`}>
                  {log.action.includes('CREATE') ? <FaUserPlus className="text-green-600" /> :
                   log.action.includes('DELETE') ? <FaTrash className="text-red-600" /> :
                   <FaEdit className="text-blue-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{log.details}</p>
                  <p className="text-xs text-gray-500">{log.userName} • {formatDate(log.timestamp)}</p>
                </div>
              </div>
              <span className="text-xs font-mono text-gray-400">{log.ipAddress}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* User Management Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          <button
            onClick={() => setShowRegisterForm(true)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FaUserPlus className="mr-2" />
            Add New User
          </button>
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
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FaFilter className="mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
          </div>
        ) : (
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-2">{user.role}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleImpersonate(user.id)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Impersonate"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <FaUserSlash /> : <FaUserCheck />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                          disabled={isCurrentUser(user.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Activity Logs</h2>
        <button
          onClick={() => handleExportData('logs')}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <FaDownload className="mr-2" />
          Export Logs
        </button>
      </div>
      
      <div className="space-y-4">
        {activityLogs.map((log) => (
          <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{log.details}</p>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center">
                    <FaUser className="mr-1" />
                    {log.userName}
                  </span>
                  <span>{formatDate(log.timestamp)}</span>
                  <span className="font-mono">{log.ipAddress}</span>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded ${log.action.includes('CREATE') ? 'bg-green-100 text-green-800' : log.action.includes('DELETE') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {log.action.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">System Settings</h2>
      
      <div className="space-y-6">
        {systemSettings.map((setting) => (
          <div key={setting.key} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {setting.label}
              </label>
              <p className="text-xs text-gray-500">Key: {setting.key}</p>
            </div>
            
            <div className="mt-2 md:mt-0">
              {setting.type === 'boolean' ? (
                <button
                  onClick={() => handleUpdateSetting(setting.key, setting.value === 'true' ? 'false' : 'true')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${setting.value === 'true' ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${setting.value === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              ) : (
                <input
                  type={setting.type === 'number' ? 'number' : 'text'}
                  value={setting.value}
                  onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Security Settings Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center">
              <FaLock className="text-gray-600 mr-3" />
              <div>
                <p className="font-medium">Password Policy</p>
                <p className="text-sm text-gray-500">Configure password rules</p>
              </div>
            </div>
            <FaChevronDown className="text-gray-400" />
          </button>
          
          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center">
              <FaKey className="text-gray-600 mr-3" />
              <div>
                <p className="font-medium">API Keys</p>
                <p className="text-sm text-gray-500">Manage API access</p>
              </div>
            </div>
            <FaChevronDown className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      {/* System Health */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">CPU Usage</span>
              <span className="text-sm font-semibold text-green-600">24%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '24%' }}></div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Memory</span>
              <span className="text-sm font-semibold text-blue-600">68%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Disk Space</span>
              <span className="text-sm font-semibold text-yellow-600">82%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Backup & Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Management</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <FaDatabase className="mr-2" />
              Create Manual Backup
            </button>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Last Backup</p>
              <p className="text-sm text-gray-500">2 hours ago • 2.1 GB</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Tools</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <FaTrash className="text-gray-600 mr-3" />
                <span>Clear Cache</span>
              </div>
              <FaChevronDown className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <FaEnvelope className="text-gray-600 mr-3" />
                <span>Email Queue</span>
              </div>
              <FaChevronDown className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <FaGlobe className="text-gray-600 mr-3" />
                <span>Server Logs</span>
              </div>
              <FaChevronDown className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Super Admin Dashboard</h1>
              </div>
              <div className="hidden md:block">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                  SUPER ADMIN
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition">
                <FaBell size={20} />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100">
                  <FaUser className="text-gray-500" />
                  <span>Account</span>
                  <FaChevronDown className="text-xs" />
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 invisible group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{currentAuthUser?.name}</p>
                      <p className="text-xs text-gray-500">{currentAuthUser?.email}</p>
                    </div>
                    
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
                    >
                      <FaCog className="mr-2 text-gray-500" />
                      Settings
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
                    >
                      <FaSignOutAlt className="mr-2 text-gray-500" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

         {/* Notification Alert - ADD THIS */}
    {notification && (
    <div className={`fixed top-4 right-4 p-4 rounded-lg border shadow-lg z-50 max-w-md ${
      notification.type === 'success' 
        ? 'bg-green-50 border-green-200 text-green-800' 
        : notification.type === 'error'
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-blue-50 border-blue-200 text-blue-800'
    }`}>
      <div className="flex justify-between items-start">
        <div className="font-medium">{notification.message}</div>
        <button
          onClick={() => setNotification(null)}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  )}


        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {currentAuthUser?.name}!
          </h1>
          <p className="text-gray-600">
            Manage your system, users, and monitor activities from your control panel.
          </p>
        </div>

        {/* Dashboard Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'users', 'activity', 'settings', 'system'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </main>

      {/* Registration Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Register New User</h3>
              <button
                onClick={() => setShowRegisterForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleRegister} className="p-6 space-y-4">
              {registerError && (
                <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
                  {registerError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ADMIN">Administrator</option>
                  <option value="MANAGER">Manager</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {registering ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Registering...
                    </>
                  ) : (
                    'Register User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}