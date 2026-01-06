import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardLayoutProps {
  sidebarItems: Array<{
    icon: React.ReactNode;
    label: string;
    id: string;
  }>;
  activeTab: string;
  onTabChange: (id: string) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  userName?: string;
  userRole?: string;
  notifications?: number;
  onLogout?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebarItems,
  activeTab,
  onTabChange,
  title,
  subtitle,
  children,
  userName,
  userRole,
  notifications,
  onLogout,
}) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={onTabChange}
        title={title}
        subtitle={subtitle}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 pt-20 lg:pt-16">
        {/* Topbar */}
        <Topbar userName={userName} userRole={userRole} notifications={notifications} onLogout={onLogout} />

        {/* Content Area */}
        <div className="overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
};
