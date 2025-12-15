// components/AccountDropdown.tsx
import { useState } from 'react';
import {
    FaChevronDown, FaCog,
    FaSignOutAlt, FaTrash,
    FaUser,
    FaUser as FaUserIcon,
    FaUserShield, FaUserTie
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AccountDropdownProps {
  userName: string;
  userEmail: string;
  userRole: string;
}

const AccountDropdown: React.FC<AccountDropdownProps> = ({ 
  userName, 
  userEmail, 
  userRole 
}) => {
  const { logoutUser, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const getRoleIcon = () => {
    switch (userRole) {
      case 'SUPERADMIN': return <FaUserShield className="text-purple-500" />;
      case 'ADMIN': return <FaUserShield className="text-red-500" />;
      case 'MANAGER': return <FaUserTie className="text-blue-500" />;
      case 'STAFF': return <FaUserIcon className="text-green-500" />;
      default: return <FaUser />;
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'SUPERADMIN': return 'text-purple-700 bg-purple-100';
      case 'ADMIN': return 'text-red-700 bg-red-100';
      case 'MANAGER': return 'text-blue-700 bg-blue-100';
      case 'STAFF': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logoutUser();
      navigate('/login');
    }
    setIsOpen(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      `WARNING: This will permanently delete your account (${userEmail}).\n\n` +
      `This action cannot be undone. Are you absolutely sure?`
    );
    
    if (confirmed) {
      if (await deleteAccount()) {
        alert('Your account has been deleted successfully.');
        navigate('/');
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        <div className="h-8 w-8 rounded-full bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-gray-500">{userRole}</p>
        </div>
        <FaChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4 pb-4 border-b">
                <div className="h-12 w-12 rounded-full bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{userName}</p>
                  <p className="text-sm text-gray-500 truncate">{userEmail}</p>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor()}`}>
                    <span className="flex items-center">
                      {getRoleIcon()}
                      <span className="ml-1">{userRole}</span>
                    </span>
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center"
                >
                  <FaCog className="mr-3 text-gray-500" />
                  Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center"
                >
                  <FaSignOutAlt className="mr-3 text-gray-500" />
                  Logout
                </button>

                <div className="border-t pt-2 mt-2">
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center"
                  >
                    <FaTrash className="mr-3" />
                    Delete Account
                  </button>
                </div>
              </div>

              {/* Warning for SuperAdmin */}
              {userRole === 'SUPERADMIN' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    ⚠️ As SuperAdmin, account deletion requires at least one other SuperAdmin in the system.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountDropdown;