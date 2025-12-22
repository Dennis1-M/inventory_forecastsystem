// SuperAdminDashboard.tsx
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Activity, Database, Package, TrendingUp, Users } from 'lucide-react';


/* =======================
   Types
======================= */

interface SystemHealth {
  database?: boolean;
  api?: boolean;
  uptime?: number;
}

interface DashboardStats {
  totalUsers?: number;
  totalProducts?: number;
  totalSales?: number;
  lowStockItems?: number;
  timestamp?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

/* =======================
   Component
======================= */

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { stats, systemHealth, lastUpdated, error } = useDashboardData();

  const formatTime = (date: Date | null): string => {
    if (!date) return 'Never';
    const now = new Date();
    const dateObj = date instanceof Date ? date : new Date(date);
    const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return dateObj.toLocaleDateString();
  };

  return (
    <DashboardLayout role="SUPERADMIN">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.email || 'Admin'}
          </h1>
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Updated {formatTime(lastUpdated)}
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-2 text-red-600">
            <p>{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} change="+12%" trend="up" icon={Users} />
          <StatCard title="Total Products" value={stats?.totalProducts || 0} change="+5%" trend="up" icon={Package} />
          <StatCard
            title="Total Sales"
            value={stats?.totalSales ? `$${stats.totalSales.toLocaleString()}` : '$0'}
            change="+18%"
            trend="up"
            icon={TrendingUp}
          />
          <StatCard
            title="Low Stock Items"
            value={stats?.lowStockItems || 0}
            change={stats?.lowStockItems ? 'Needs Attention' : 'All Good'}
            trend={stats?.lowStockItems ? 'down' : 'neutral'}
            icon={Package}
          />
        </div>

        {/* System Health */}
        <div className="p-4 border border-border rounded-xl">
          <h2 className="text-lg font-semibold text-foreground mb-2">System Health</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" /> Database
              </span>
              <span className={systemHealth?.database ? 'text-green-600' : 'text-red-600'}>
                {systemHealth?.database ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" /> API Service
              </span>
              <span className={systemHealth?.api ? 'text-green-600' : 'text-red-600'}>
                {systemHealth?.api ? 'Online' : 'Offline'}
              </span>
            </div>
            {systemHealth?.uptime && (
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-gray-600">Uptime</span>
                <span>
                  {Math.floor(systemHealth.uptime / 3600)}h {Math.floor((systemHealth.uptime % 3600) / 60)}m
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

/* =======================
   Sub-components
======================= */

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon: Icon }) => (
  <div className="p-4 border border-border rounded-xl">
    <div className="flex justify-between items-center">
      <Icon className="h-5 w-5 text-blue-500" />
      <span className={`text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
        {change}
      </span>
    </div>
    <p className="text-xl font-bold mt-2">{value}</p>
    <p className="text-sm">{title}</p>
  </div>
);

export default SuperAdminDashboard;
