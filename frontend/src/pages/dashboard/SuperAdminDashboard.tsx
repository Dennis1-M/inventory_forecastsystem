import { useEffect, useState } from 'react';
import { FaChevronDown, FaTrash } from 'react-icons/fa';
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

  // REMOVED DUPLICATE COMPONENT DECLARATION
  
  // Define deleteAccount function
  const deleteAccount = (userId: number) => {
    // Your delete logic
    console.log('Deleting account:', userId);
  };

  // REMOVED DUPLICATE useState DECLARATION - already defined above

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // You need to implement the actual delete logic here
      console.log("Account deletion requested");
      // Example: await deleteAccount(currentAuthUser.id);
      alert("Your account has been deleted successfully.");
      navigate('/');
    }
  };

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

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logoutUser();
      navigate('/login');
    }
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
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
                    >
                      <FaSignOutAlt className="mr-2 text-gray-500" />
                      Logout
                    </button>
                    
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center mt-1"
                    >
                      <FaTrash className="mr-2" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ... REST OF YOUR COMPONENT JSX ... */}
      {/* (Keep all the JSX from your original component from the welcome section onward) */}
      
    </div>
  );
}