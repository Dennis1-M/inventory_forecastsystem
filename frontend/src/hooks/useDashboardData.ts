import { useAuth } from '@/contexts/AuthContext';

import { inventoryAPI, testBackendConnection } from '@/lib/api';
import { useCallback, useEffect, useRef, useState } from 'react';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalSales: number;
  totalInventory: number;
  lowStockItems: number;
  alertsCount: number;
  timestamp: string;
}

interface SystemHealth {
  status: 'online' | 'offline' | 'checking';
  message: string;
  lastChecked: string;
  availableEndpoints: string[];
  database?: 'online' | 'offline';
  api?: 'online' | 'offline';
  uptime?: number;
}

interface Alert {
  id?: string;
  title?: string;
  message?: string;
  severity?: string;
  createdAt?: string;
}

interface DashboardData {
  stats: DashboardStats | null;
  systemHealth: SystemHealth | null;
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  connectionStatus:
    | 'connected'
    | 'connecting'
    | 'disconnected'
    | 'error'
    | 'auth_required';
}

export const useDashboardData = (autoRefresh = true) => {
  const { isAuthenticated, user } = useAuth();

  const [data, setData] = useState<DashboardData>({
    stats: null,
    systemHealth: null,
    alerts: [],
    isLoading: true,
    error: null,
    lastUpdated: null,
    connectionStatus: 'connecting',
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasFetched = useRef(false);

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        connectionStatus: 'auth_required',
        error: 'Authentication required. Please login first.',
      }));
      return;
    }

    setIsRefreshing(true);

    try {
      const connection = await testBackendConnection();

      if (!connection.success) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          connectionStatus: connection.requiresLogin
            ? 'auth_required'
            : 'disconnected',
          error: connection.error || 'Unable to connect to backend server',
        }));
        return;
      }

      const systemHealth: SystemHealth = {
        status: 'online',
        message: 'Backend connected successfully',
        lastChecked: new Date().toISOString(),
        availableEndpoints: [],
        api: 'online',
        database: 'online',
        uptime: Math.floor(performance.now() / 1000),
      };

      const stats: DashboardStats = {
        totalUsers: 0,
        totalProducts: 0,
        totalSales: 0,
        totalInventory: 0,
        lowStockItems: 0,
        alertsCount: 0,
        timestamp: new Date().toISOString(),
      };

      const alerts: Alert[] = [];
      const availableEndpoints: string[] = [];

      await Promise.allSettled([
        inventoryAPI.getAdminStats()
          .then(res => {
            availableEndpoints.push('admin_dashboard');
            if (res) {
              stats.totalUsers = res.totalUsers ?? stats.totalUsers;
              stats.totalProducts = res.totalProducts ?? stats.totalProducts;
              stats.totalSales = res.totalSales ?? stats.totalSales;
              stats.totalInventory = res.totalInventory ?? stats.totalInventory;
              stats.lowStockItems = res.lowStockItems ?? stats.lowStockItems;
            }
          })
          .catch(() => {
            // console.log('Admin dashboard not available'); 
          }),

        inventoryAPI.getAdminStats()
          .then(() => availableEndpoints.push('admin_stats'))
          .catch(() => {
            // console.log('Admin stats not available'); 
          }),

        inventoryAPI.getUsers()
          .then(users => {
            availableEndpoints.push('users');
            if (users && !stats.totalUsers) {
              stats.totalUsers =
                users.length ?? users.total ?? users.data?.length ?? 0;
            }
          })
          .catch(() => {
            // console.log('Users endpoint failed'); 
          }),

        inventoryAPI.getProducts()
          .then(products => {
            availableEndpoints.push('products');
            if (products && !stats.totalProducts) {
              stats.totalProducts =
                products.length ?? products.total ?? products.data?.length ?? 0;
            }
          })
          .catch(() => {
            // console.log('Products endpoint failed'); 
          }),

        inventoryAPI.getInventorySummary()
          .then(summary => {
            availableEndpoints.push('inventory');
            stats.totalInventory = summary.totalInventory || 0;
            stats.lowStockItems = summary.lowStockItems || 0;
            stats.totalProducts = summary.totalProducts || 0;
          })
          .catch(() => {
            // console.log('Inventory summary not available'); 
          }),

        inventoryAPI.getAlerts()
          .then(alertsData => {
            availableEndpoints.push('alerts');
            if (Array.isArray(alertsData)) {
              alerts.push(...alertsData.slice(0, 5));
              stats.alertsCount = alertsData.length;
            }
          })
          .catch(() => {
            // console.log('Alerts endpoint failed'); 
          }),
      ]);

      systemHealth.availableEndpoints = availableEndpoints;

      setData({
        stats,
        systemHealth,
        alerts,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        connectionStatus: 'connected',
      });
    } catch (err: any) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: err?.message || 'Unexpected dashboard error',
        connectionStatus: 'error',
        lastUpdated: new Date(),
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!hasFetched.current && isAuthenticated) {
      hasFetched.current = true;
      fetchDashboardData();
    } else if (!isAuthenticated) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        connectionStatus: 'auth_required',
        error: 'Please login to access the dashboard',
      }));
    }
  }, [isAuthenticated, fetchDashboardData]);

  useEffect(() => {
    if (!autoRefresh || data.connectionStatus !== 'connected') return;
    const id = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, data.connectionStatus, fetchDashboardData]);

  return {
    ...data,
    isRefreshing,
    refresh: fetchDashboardData,
  };
};
