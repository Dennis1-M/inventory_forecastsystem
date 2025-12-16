// src/layouts/AdminDashboard.tsx - FIXED WITH TYPE-ONLY IMPORTS
import type { ReactNode } from 'react'; // Type-only import
import { useState } from 'react';
import {
  FaBars,
  FaBell,
  FaBox,
  FaChartBar,
  FaCog,
  FaDatabase,
  FaExclamationTriangle,
  FaShoppingCart,
  FaSignOutAlt,
  FaTachometerAlt,
  FaTimes,
  FaUserCircle,
  FaUsers
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  children: ReactNode;
  title?: string;
}

export default function AdminDashboard({ children, title = 'Admin Dashboard' }: AdminDashboardProps) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logoutUser();
      navigate('/login');
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaTachometerAlt />, exact: true },
    { path: '/admin/users', label: 'User Management', icon: <FaUsers /> },
    { path: '/admin/products', label: 'Products', icon: <FaBox /> },
    { path: '/admin/inventory', label: 'Inventory', icon: <FaDatabase /> },
    { path: '/admin/sales', label: 'Sales', icon: <FaShoppingCart /> },
    { path: '/admin/alerts', label: 'Alerts', icon: <FaExclamationTriangle /> },
    { path: '/admin/analytics', label: 'Analytics', icon: <FaChartBar /> },
    { path: '/admin/settings', label: 'Settings', icon: <FaCog /> },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FaUserCircle className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{user?.name}</h2>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Sidebar menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                  isActive(item.path, item.exact)
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                >
                  {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
                <h1 className="ml-4 text-lg font-semibold text-gray-900">{title}</h1>
              </div>

              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-600 hover:text-gray-900 transition">
                  <FaBell size={20} />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}