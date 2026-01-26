// frontend/src/components/layout/Topbar.tsx
// This component defines the top navigation bar for the application.
// It includes a search bar, notification icon, and user profile section with a dropdown menu.




import { Bell, ChevronDown, LogOut, User } from 'lucide-react';
import React, { useState } from 'react';

interface TopbarProps {
  userName?: string;
  userRole?: string;
  notifications?: number;
  onLogout?: () => void;
  onProfileClick?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  userName = 'User',
  userRole = 'Staff',
  notifications = 0,
  onLogout,
  onProfileClick,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="fixed lg:ml-64 top-0 right-0 left-0 lg:left-64 bg-gradient-to-r from-white to-slate-50 shadow-sm border-b border-slate-200 z-20 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search products, users, reports..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm transition-all"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Notifications */}
          <button className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 h-5 w-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse-slow">
                {notifications}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all"
            >
              <div className="h-9 w-9 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">{userRole}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 animation-fade-in">
                <button 
                  onClick={() => {
                    if (onProfileClick) {
                      onProfileClick();
                      setIsProfileOpen(false);
                    }
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">Profile Settings</span>
                </button>
                {onLogout && (
                  <>
                    <div className="border-t border-slate-200 my-1"></div>
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
