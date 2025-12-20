// SuperAdminDashboard.tsx
// Fixed SystemHealth type to match actual usage (database, api, uptime)
// Full file with comments as requested

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  Activity,
  AlertTriangle,
  Database,
  Package,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react';
import { useState } from 'react';

/* =======================
   Types
======================= */

interface Alert {
  id?: string;
  title?: string;
  message?: string;
  severity?: string;
  read?: boolean;
  createdAt?: string | Date;
}

/**
 * FIX: Added missing properties that were being accessed in JSX
 */
interface SystemHealth {
  status?: 'online' | 'offline' | 'checking';
  message?: string;
  lastChecked?: string | Date;
  availableEndpoints?: string[];

  // ✅ Missing fields (causing TS2339)
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
  loading?: boolean;
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

/* =======================
   Component
======================= */

const SuperAdminDashboard = () => {
  const { user } = useAuth();

  const {
    stats,
    systemHealth,
    alerts,
    isLoading,
    error,
    connectionStatus,
    refresh,
    isRefreshing,
    lastUpdated
  } = useDashboardData();

  const [showConnectionTest, setShowConnectionTest] = useState(false);

  /* -----------------------
     Helpers
  ------------------------ */

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

  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connected':
        return { text: 'Connected', color: 'text-green-600', bg: 'bg-green-100' };
      case 'connecting':
        return { text: 'Connecting...', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'disconnected':
        return { text: 'Disconnected', color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { text: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const connection = getConnectionStatus();

  /* -----------------------
     Loading skeleton
  ------------------------ */

  if (isLoading && !stats) {
    return (
      <DashboardLayout role="SUPERADMIN">
        <div className="space-y-8 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* =======================
     Render
  ======================= */

  return (
    <DashboardLayout role="SUPERADMIN">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.email || 'Admin'}
            </h1>

            <div className="flex items-center gap-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${connection.bg} ${connection.color}`}>
                {connection.text}
              </span>

              {lastUpdated && (
                <span className="text-sm text-gray-500">
                  Updated {formatTime(lastUpdated)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConnectionTest(!showConnectionTest)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Test Connection
            </button>

            <button
              onClick={refresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Connection Test */}
        {showConnectionTest && (
          <div className="border rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Backend Connection Test</h3>
              <button onClick={() => setShowConnectionTest(false)}>×</button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`${connection.bg} ${connection.color} px-2 py-1 rounded`}>
                  {connection.text}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Database:</span>
                <span className={systemHealth?.database ? 'text-green-600' : 'text-red-600'}>
                  {systemHealth?.database ? '✓ Connected' : '✗ Disconnected'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
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
            icon={AlertTriangle}
          />
        </div>

        {/* System Health */}
        <div className="border rounded-xl bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">System Health</h2>

          <div className="space-y-4">
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
              <div className="pt-4 border-t text-sm flex justify-between">
                <span className="text-gray-600">Uptime</span>
                <span className="font-medium">
                  {Math.floor(systemHealth.uptime / 3600)}h{' '}
                  {Math.floor((systemHealth.uptime % 3600) / 60)}m
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
  <div className="border rounded-xl bg-white p-6">
    <div className="flex justify-between">
      <Icon className="h-6 w-6 text-blue-600" />
      <span className={`text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
        {change}
      </span>
    </div>
    <p className="text-2xl font-bold mt-4">{value}</p>
    <p className="text-sm text-gray-600">{title}</p>
  </div>
);

export default SuperAdminDashboard;
