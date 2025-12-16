// layouts/AdminDashboard.tsx (similar for other roles)
import { useAuth } from '../context/AuthContext';

const StaffDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin-specific header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                ADMIN
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Controls</h2>
          <p className="text-gray-600 mb-6">
            Welcome to the Admin Dashboard. You have user management permissions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin-specific features */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
              <p className="text-sm text-gray-600">Manage staff and managers</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Content Moderation</h3>
              <p className="text-sm text-gray-600">Review and approve content</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Reports</h3>
              <p className="text-sm text-gray-600">View system reports</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;