import { useEffect } from 'react';
import {
  FaBell,
  FaBox,
  FaClipboardList,
  FaClock,
  FaShoppingCart,
  FaSignOutAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function StaffDashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('👷 Staff Dashboard loaded for:', user?.email);
  }, [user]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Staff Dashboard</h1>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                STAFF
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <FaBell size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Hello, <span className="text-green-600">{user?.name}</span>
          </h1>
          <p className="text-gray-600">Your daily tasks and activities</p>
        </div>

        {/* Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <FaBox className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Inventory Tasks</p>
                <p className="text-sm text-gray-500">5 pending</p>
              </div>
            </div>
            <button className="w-full mt-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
              View Tasks
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <FaShoppingCart className="text-green-600" />
              </div>
              <div>
                <p className="font-medium">Sales Today</p>
                <p className="text-sm text-gray-500">KES 12,450</p>
              </div>
            </div>
            <button className="w-full mt-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
              Process Sales
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <FaClipboardList className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Reports Due</p>
                <p className="text-sm text-gray-500">2 reports</p>
              </div>
            </div>
            <button className="w-full mt-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
              Submit Reports
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FaClock className="text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">Morning Inventory Check</p>
                  <p className="text-sm text-gray-500">8:00 AM - 9:00 AM</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FaClock className="text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">Sales Counter Duty</p>
                  <p className="text-sm text-gray-500">9:00 AM - 1:00 PM</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">In Progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}