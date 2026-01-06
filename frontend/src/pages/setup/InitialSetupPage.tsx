import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { setupService } from '../../services/setup.ts';

const InitialSetupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token, user } = await setupService.performInitialSetup({ name, email, password });
      loginWithToken(token, user);
      navigate('/admin'); // Redirect to admin dashboard after setup
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed. Please try again.');
      console.error('Setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Initial System Setup</h1>
          <p className="text-gray-500 mt-2">Create the Super Administrator account to get started.</p>
        </div>

        {error && (
          <Alert variant="error" title="Setup Failed" message={error} />
        )}

        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              type="text"
              placeholder="e.g., Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button
            label={loading ? 'Creating Account...' : 'Complete Setup'}
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
};

export default InitialSetupPage;
