// src/pages/LandingPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [superAdminExists, setSuperAdminExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/check-superadmin');
      const data = await response.json();
      setSuperAdminExists(data.exists);
    } catch (error) {
      console.error('Error checking SuperAdmin:', error);
      setSuperAdminExists(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Inventory Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              {superAdminExists ? (
                <Link
                  to="/login"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                >
                  Login
                </Link>
              ) : (
                <Link
                  to="/register-superuser"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Modern Inventory Management
            <span className="text-purple-600"> System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            A comprehensive solution for managing inventory, sales, and users with 
            role-based access control.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {superAdminExists ? (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700"
                >
                  Login to System
                </Link>
                
              </>
            ) : (
              <>
                <Link
                  to="/register-superuser"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700"
                >
                  Setup System
                </Link>
                <button
                  onClick={() => alert('System setup is required first. Please register as Super Admin.')}
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-purple-700 bg-purple-100 hover:bg-purple-200"
                >
                  Learn More
                </button>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-blue-600 font-bold">👑</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Super Admin</h3>
            <p className="text-gray-600">Full system control, user management, and configuration</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <span className="text-green-600 font-bold">🛡️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Admin Access</h3>
            <p className="text-gray-600">Manage users, view reports, and oversee operations</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <span className="text-purple-600 font-bold">📊</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Role-based Dashboard</h3>
            <p className="text-gray-600">Customized dashboard for each user role</p>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-12 bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Initial Setup</p>
              <p className={`font-medium ${superAdminExists ? 'text-green-600' : 'text-yellow-600'}`}>
                {superAdminExists ? '✅ Completed' : '⚠️ Required'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Access Level</p>
              <p className="font-medium text-purple-600">
                {superAdminExists ? 'Multi-User Ready' : 'Setup Mode'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Next Step</p>
              <p className="font-medium">
                {superAdminExists ? 'Login to continue' : 'Register Super Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;