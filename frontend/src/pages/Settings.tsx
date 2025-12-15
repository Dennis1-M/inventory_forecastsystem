// pages/Settings.tsx
import { useState } from 'react';
import { FaArrowLeft, FaLock, FaTrash, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, deleteAccount, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirm(
      `WARNING: This will permanently delete your account and all associated data.\n\n` +
      `This action cannot be undone. Please type "DELETE" to confirm.`
    )) return;

    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation?.toUpperCase() !== 'DELETE') {
      alert('Account deletion cancelled.');
      return;
    }

    setDeleting(true);
    if (await deleteAccount()) {
      alert('Your account has been deleted successfully.');
      navigate('/');
    }
    setDeleting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your account preferences and security</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                    activeTab === 'profile' 
                      ? 'bg-purple-50 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaUser className="mr-3" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                    activeTab === 'security' 
                      ? 'bg-purple-50 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaLock className="mr-3" />
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('danger')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                    activeTab === 'danger' 
                      ? 'bg-red-50 text-red-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaTrash className="mr-3" />
                  Danger Zone
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-gray-900">{user?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 px-3 py-1 inline-block bg-purple-100 text-purple-800 rounded-full text-sm">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="bg-white rounded-xl shadow p-6 border border-red-200">
                <h2 className="text-lg font-semibold mb-4 text-red-700">Danger Zone</h2>
                
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                  <h3 className="font-medium text-red-800 mb-2">Delete Account</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. This action is permanent and will remove all your data from the system.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete My Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;