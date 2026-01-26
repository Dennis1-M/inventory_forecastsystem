import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call the actual login function from AuthContext (now with JWT)
      await login(email, password);
      
      // Get user from localStorage to determine redirect
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const role = user.role || 'STAFF';
        
        // Redirect based on actual user role
        if (role === 'SUPERADMIN') {
          navigate('/superadmin');
        } else if (role === 'ADMIN') {
          navigate('/admin');
        } else if (role === 'MANAGER') {
          navigate('/manager');
        } else {
          navigate('/staff');
        }
      } else {
        navigate('/staff'); // Default redirect
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Gradient Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-8 right-0 w-96 h-96 bg-white opacity-5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Gradient */}
          <div className="h-2 bg-gradient-to-r from-indigo-600 to-blue-600"></div>

          {/* Content */}
          <div className="p-8 md:p-10">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                SI
              </div>
              <h1 className="text-3xl font-bold text-gray-900">SmartInventory</h1>
              <p className="text-gray-500 text-sm mt-2 font-medium">Inventory Management System</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <span className="text-red-600 font-bold text-xl">⚠️</span>
                <div>
                  <p className="text-red-800 font-semibold text-sm">Login Failed</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50"
                  id="email"
                  type="email"
                  placeholder="staff@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1.5">Use email containing 'staff', 'manager', or 'admin' for testing</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50"
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                label={loading ? 'Signing in...' : 'Sign In'}
                variant="primary"
                className="w-full py-3 font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-lg"
                type="submit"
                disabled={loading}
              />
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="#" className="text-indigo-600 font-semibold hover:text-indigo-700">
                  Contact Administrator
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center">
          <p className="text-white text-sm opacity-75">Secure login with JWT authentication</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
