import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user, token, logoutUser } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF' as 'MANAGER' | 'STAFF' // Admin can only register MANAGER or STAFF
  });

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.status === 401) {
        logoutUser();
        navigate('/login');
        return;
      }

      const data = await response.json();
      // Filter to only show MANAGER and STAFF users (Admin can't see other Admins or SuperAdmins)
      const filteredUsers = data.filter((u: any) => 
        u.role === 'MANAGER' || u.role === 'STAFF'
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        throw new Error(data.message || 'Registration failed');
      }

      alert(`${formData.role} registered successfully!`);
      setFormData({ name: '', email: '', password: '', role: 'STAFF' });
      setShowRegisterForm(false);
      fetchUsers();
      
    } catch (error: any) {
      alert(`Registration failed: ${error.message}`);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Similar structure to SuperAdmin but with limited options */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <p className="text-sm">Welcome, {user?.name} (Admin)</p>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">You can register Managers and Staff members</p>
        </div>

        {/* Registration button - only shows MANAGER/STAFF options */}
        <div className="mb-8">
          <button
            onClick={() => setShowRegisterForm(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg"
          >
            Register New User (Manager/Staff)
          </button>
        </div>

        {/* Users table showing only MANAGERS and STAFF */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Managed Users</h2>
            <p className="text-sm text-gray-600">Managers and Staff registered by you</p>
          </div>
          
          {/* Table content similar to SuperAdmin but filtered */}
        </div>
      </div>
    </div>
  );
}