// frontend/src/pages/dashboards/AdminDashboard.tsx

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BoxesIcon,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface InventoryMovement {
  id: number;
  quantity: number;
  type: string;
  timestamp: string;
  product: { name: string };
}

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  teamMembers: number;
  activeAlerts: number;
  trends?: {
    totalProducts?: number[];
    lowStockItems?: number[];
    teamMembers?: number[];
    activeAlerts?: number[];
  };
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get('/dashboard'); // /api/dashboard mounted in backend
      setStats(res.data.stats);
      setMovements(res.data.recentMovements || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Dashboard fetch failed:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout role="ADMIN">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.email}</h1>
            <p className="text-muted-foreground">Admin Dashboard — Full operational control</p>
          </div>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/admin')} className="btn">Dashboard</button>
          <button onClick={() => navigate('/admin/users')} className="btn">Users</button>
          <button onClick={() => navigate('/admin/inventory')} className="btn">Inventory</button>
          <button onClick={() => navigate('/admin/alerts')} className="btn">Alerts</button>
          <button onClick={() => navigate('/admin/analytics')} className="btn">Analytics</button>
          <button onClick={() => navigate('/admin/settings')} className="btn">Settings</button>
        </div>

        {/* Error Message */}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Default Dashboard Content */}
        {stats && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Products"
                value={stats.totalProducts}
                icon={BoxesIcon}
                trendData={stats.trends?.totalProducts || []}
                onClick={() => navigate('/admin/inventory')}
              />
              <StatCard
                title="Low Stock Items"
                value={stats.lowStockItems}
                icon={AlertTriangle}
                warning
                trendData={stats.trends?.lowStockItems || []}
                onClick={() => navigate('/admin/inventory?filter=low-stock')}
              />
              <StatCard
                title="Team Members"
                value={stats.teamMembers}
                icon={Users}
                trendData={stats.trends?.teamMembers || []}
                onClick={() => navigate('/admin/users')}
              />
              <StatCard
                title="Active Alerts"
                value={stats.activeAlerts}
                icon={AlertTriangle}
                warning
                trendData={stats.trends?.activeAlerts || []}
                onClick={() => navigate('/admin/alerts')}
              />
            </div>

            {/* Recent Movements Table */}
            {movements.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Recent Stock Movements</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Qty</th>
                        <th className="p-2 text-left">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map(m => (
                        <tr key={m.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{m.product.name}</td>
                          <td className="p-2">{m.type}</td>
                          <td className="p-2">{m.quantity}</td>
                          <td className="p-2">{new Date(m.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Inventory Trend Chart */}
            {movements.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Inventory Movement Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={movements.map(m => ({
                      time: new Date(m.timestamp).toLocaleTimeString(),
                      quantity: m.quantity,
                    }))}
                  >
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="quantity" stroke="#4F46E5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* Nested Pages Render Here */}
        <Outlet />
      </div>
    </DashboardLayout>
  );
};

// KPI Card Component
const StatCard = ({
  title,
  value,
  icon: Icon,
  warning,
  trendData = [],
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  warning?: boolean;
  trendData?: number[];
  onClick?: () => void;
}) => {
  const latest = trendData[trendData.length - 1] || 0;
  const previous = trendData[trendData.length - 2] || 0;
  const trendPercent = previous ? Math.round(((latest - previous) / previous) * 100) : 0;
  const trendColor = trendPercent > 0 ? 'text-green-600' : trendPercent < 0 ? 'text-red-600' : 'text-gray-400';
  const TrendIcon = trendPercent > 0 ? ArrowUpRight : trendPercent < 0 ? ArrowDownRight : null;

  const sparklineData = trendData.map((v, i) => ({ x: i, y: v }));

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border bg-card p-4 hover:shadow-lg transition"
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2 ${warning ? 'bg-yellow-100' : 'bg-primary/10'}`}>
          <Icon className={warning ? 'text-yellow-600' : 'text-primary'} />
        </div>
        {TrendIcon && (
          <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span>{Math.abs(trendPercent)}%</span>
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      {sparklineData.length > 1 && (
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={sparklineData}>
            <Line type="monotone" dataKey="y" stroke={warning ? '#d97706' : '#4F46E5'} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AdminDashboard;
