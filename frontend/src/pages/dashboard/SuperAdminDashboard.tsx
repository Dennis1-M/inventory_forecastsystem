import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Install: npm install react-icons
import {
  FaBell,
  FaChartLine,
  FaFilter,
  FaSearch,
  FaSignOutAlt,
  FaSpinner, FaTimes,
  FaUser,
  FaUserPlus, FaUsers, FaUserShield, FaUserTie
} from 'react-icons/fa';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface RegistrationForm {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
}

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  totalManagers: number;
  totalStaff: number;
  activeUsers: number;
}

export default function SuperAdminDashboard() {
  const { user: currentAuthUser, token, logoutUser } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalManagers: 0,
    totalStaff: 0,
    activeUsers: 0
  });

  // Registration form
  const [formData, setFormData] = useState<RegistrationForm>({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [registerError, setRegisterError] = useState<string>('');

  // Fetch users on component mount
  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching users with token...');
      
      const response = await fetch('http://localhost:5001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Users response status:', response.status);
      
      if (response.status === 401) {
        console.log('❌ Token invalid');
        logoutUser();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Users fetch error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      console.log('✅ Users fetched:', data.length, 'users');
      setUsers(data);
      calculateStats(data);
    } catch (error: any) {
      console.error('❌ Error fetching users:', error);
      alert(`Failed to load users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userList: User[]) => {
    const stats = {
      totalUsers: userList.length,
      totalAdmins: userList.filter(u => u.role === 'ADMIN').length,
      totalManagers: userList.filter(u => u.role === 'MANAGER').length,
      totalStaff: userList.filter(u => u.role === 'STAFF').length,
      activeUsers: userList.filter(u => u.isActive).length
    };
    setStats(stats);
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
    console.log('📤 Sending registration request...', formData);
    
    const response = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    console.log('📥 Registration response:', data);

    if (!response.ok) {
      // Check if it's a permission error (403)
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
    console.error('❌ Registration error:', error);
    setRegisterError(error.message);
    alert(`Registration failed: ${error.message}`);
  } finally {
    setRegistering(false);
  }
};

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log(`🗑️ Deleting user ${userId}...`);
      
      const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        alert('✅ User deleted successfully');
        fetchUsers(); // Refresh list
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean, userName: string) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} ${userName}?`)) {
      return;
    }

    try {
      console.log(`🔄 ${action} user ${userId}...`);
      
      const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      if (response.ok) {
        alert(`✅ User ${action}d successfully`);
        fetchUsers(); // Refresh list
      } else {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${action} user`);
      }
    } catch (error: any) {
      console.error(`❌ ${action} error:`, error);
      alert(`${action.charAt(0).toUpperCase() + action.slice(1)} failed: ${error.message}`);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
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
      day: 'numeric'
    });
  };

  // Check if current user is viewing their own profile
 const isCurrentUser = (userId: number): boolean => {
  if (!currentAuthUser?.id) return false;
  
  // Ensure both are numbers for comparison
  const currentUserId = Number(currentAuthUser.id);
  return !isNaN(currentUserId) && currentUserId === userId;
};
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
              
              <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{currentAuthUser?.name}</p>
                  <p className="text-xs text-gray-500">{currentAuthUser?.email}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow">
                  {currentAuthUser?.name?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <FaSignOutAlt />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="text-purple-600">{currentAuthUser?.name}</span>
          </h1>
          <p className="text-gray-600">Manage all users and system settings from your control panel.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: <FaUsers className="text-blue-600" />, color: 'blue' },
            { label: 'Admins', value: stats.totalAdmins, icon: <FaUserShield className="text-red-600" />, color: 'red' },
            { label: 'Managers', value: stats.totalManagers, icon: <FaUserTie className="text-blue-600" />, color: 'blue' },
            { label: 'Staff', value: stats.totalStaff, icon: <FaUser className="text-green-600" />, color: 'green' },
            { label: 'Active Users', value: stats.activeUsers, icon: <FaChartLine className="text-purple-600" />, color: 'purple' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-3xl font-bold text-${stat.color}-600 mt-1`}>{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow mb-8 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <FaFilter className="text-gray-400 shrink-0" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPERADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowRegisterForm(true)}
              className="flex items-center justify-center space-x-2 bg-linear-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow hover:shadow-lg w-full md:w-auto"
            >
              <FaUserPlus />
              <span>Register New User</span>
            </button>
          </div>
        </div>

        {/* Registration Form Modal */}
        {showRegisterForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Register New User</h2>
                  <button
                    onClick={() => {
                      setShowRegisterForm(false);
                      setFormErrors({});
                      setRegisterError('');
                    }}
                    className="text-gray-400 hover:text-gray-600 transition p-1"
                    disabled={registering}
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                {registerError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                    <p className="font-medium">{registerError}</p>
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({...formData, name: e.target.value});
                          if (formErrors.name) setFormErrors({...formErrors, name: ''});
                        }}
                        className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter full name"
                        disabled={registering}
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({...formData, email: e.target.value});
                          if (formErrors.email) setFormErrors({...formErrors, email: ''});
                        }}
                        className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                          formErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter email address"
                        disabled={registering}
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({...formData, password: e.target.value});
                          if (formErrors.password) setFormErrors({...formErrors, password: ''});
                        }}
                        className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                          formErrors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter password (min 6 characters)"
                        disabled={registering}
                      />
                      {formErrors.password && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['ADMIN', 'MANAGER', 'STAFF'] as const).map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setFormData({...formData, role})}
                            className={`px-3 py-3 rounded-lg border text-center transition ${
                              formData.role === role
                                ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                                : 'border-gray-300 hover:border-purple-300 text-gray-700'
                            }`}
                            disabled={registering}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        As Super Admin, you can register Admins, Managers, and Staff
                      </p>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={registering}
                        className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                      <button
                        type="button"
                        onClick={() => {
                          setShowRegisterForm(false);
                          setFormErrors({});
                          setRegisterError('');
                        }}
                        disabled={registering}
                        className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                <p className="text-sm text-gray-600">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                  {filterRole !== 'ALL' && ` (Filtered by: ${filterRole})`}
                </p>
              </div>
              <button
                onClick={fetchUsers}
                className="mt-2 sm:mt-0 text-sm text-purple-600 hover:text-purple-800 flex items-center"
              >
                <FaSearch className="mr-1" size={14} />
                Refresh List
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <FaSpinner className="animate-spin h-12 w-12 text-purple-600 mx-auto" />
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <FaUsers className="mx-auto text-gray-400 h-12 w-12" />
              <p className="mt-4 text-gray-600">No users found</p>
              {searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search or filter
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((userItem) => {
                    const isOwnProfile = isCurrentUser(userItem.id);
                    return (
                      <tr key={userItem.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-linear-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow">
                              {userItem.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {userItem.name}
                                {isOwnProfile && (
                                  <span className="ml-2 text-xs text-purple-600">(You)</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {userItem.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {getRoleIcon(userItem.role)}
                            <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(userItem.role)}`}>
                              {userItem.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${userItem.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              userItem.isActive 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {userItem.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(userItem.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleToggleUserStatus(userItem.id, userItem.isActive, userItem.name)}
                              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                                userItem.isActive
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                              } ${isOwnProfile ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={isOwnProfile}
                              title={isOwnProfile ? "Cannot change your own status" : ""}
                            >
                              {userItem.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            
                            {userItem.role !== 'SUPERADMIN' && !isOwnProfile && (
                              <button
                                onClick={() => handleDeleteUser(userItem.id, userItem.name)}
                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition border border-red-200"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-linear-to-r from-purple-500 to-pink-500 rounded-xl shadow p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Super Admin Privileges</h3>
            <p className="text-sm opacity-90">
              You have complete control over all users, roles, and system settings.
              Use this power responsibly.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-lg mb-3 text-gray-900">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition">
                View Audit Logs
              </button>
              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition">
                System Configuration
              </button>
              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition">
                Generate Reports
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-lg mb-3 text-gray-900">System Status</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="font-medium">{stats.totalUsers}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="font-medium text-green-600">{stats.activeUsers}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Inactive Users</span>
                <span className="font-medium text-red-600">{stats.totalUsers - stats.activeUsers}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Your Session</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Debug Info (Remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono">
            <div className="flex justify-between items-center mb-2">
              <span>🔧 Debug Information</span>
              <button onClick={() => console.log({ users, token: token?.substring(0, 20) + '...' })}>
                Log to Console
              </button>
            </div>
            <p>Token: {token ? '✅ Present' : '❌ Missing'}</p>
            <p>Users Loaded: {users.length}</p>
            <p>Filtered: {filteredUsers.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}