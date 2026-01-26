// frontend/src/components/layout/Sidebar.tsx
// Sidebar component with navigation links and logout functionality
// Uses React, React Router, and a custom Auth context.



import { LogOut } from 'lucide-react';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export interface SidebarLink {
  to: string;
  label: string;
}

export interface SidebarProps {
  links: SidebarLink[];
  title?: string;
  subtitle?: string;
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC<SidebarProps> = ({ links, title = "Smart Inventory", subtitle }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>(links[0]?.to || '');

  const handleLogout = () => {
    if (auth?.logout) {
      auth.logout();
    }
  };

  const onTabChange = (to: string) => {
    setActiveTab(to);
    navigate(to);
  };

  return (
    <>
      {/* Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 flex-col z-40 shadow-sm">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-200 bg-white shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              SI
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{title}</h2>
          </div>
          {subtitle && <p className="text-xs text-slate-500 ml-12">{subtitle}</p>}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <button
              key={link.to}
              onClick={() => onTabChange(link.to)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                activeTab === link.to
                  ? 'bg-white text-indigo-600 shadow-sm border-l-4 border-indigo-600 pl-3'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs'
              }`}
            >
              {/* Remove item.icon since SidebarLink doesn't have icon */}
              <span className="font-medium">{link.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Button - shown in Topbar */}
    </>
  );
};

export { Sidebar };

