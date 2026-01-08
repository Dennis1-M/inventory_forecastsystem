import { useEffect, useState } from 'react';
import apiService from '../services/api';

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await apiService.get('/products');
      // Extract the data array from the response
      const productsData = response.data?.data || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, refetch: fetchProducts };
};

export const useInventory = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      const response = await apiService.get('/inventory');
      // Extract the data array from the response
      const inventoryData = response.data?.data || response.data || [];
      setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      setError(null);
    } catch (err) {
      setError('Failed to load inventory');
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return { inventory, loading, error, refetch: fetchInventory };
};

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const response = await apiService.get('/alerts');
      setAlerts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const resolveAlert = async (id: string) => {
    try {
      await apiService.put(`/alerts/${id}/resolve`);
      fetchAlerts();
    } catch (err) {
      setError('Failed to resolve alert');
    }
  };

  return { alerts, loading, error, resolveAlert, refetch: fetchAlerts };
};

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    try {
      const response = await apiService.get('/suppliers');
      setSuppliers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return { suppliers, loading, error, refetch: fetchSuppliers };
};

export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await apiService.get('/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
};

export const useSystemHealth = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const response = await apiService.get('/health-status');
      setHealth(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load system health');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refetch every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { health, loading, error, refetch: fetchHealth };
};

export const useSettings = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const response = await apiService.get('/settings');
      setSettings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load settings');
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: any) => {
    try {
      await apiService.put('/settings', newSettings);
      fetchSettings();
    } catch (err) {
      setError('Failed to update settings');
    }
  };

  return { settings, loading, error, updateSettings, refetch: fetchSettings };
};

export const useForecast = () => {
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/forecast');
      setForecast(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load forecast');
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  return { forecast, loading, error, refetch: fetchForecast };
};

export const useSalesAnalytics = (dateRange?: string) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const params = dateRange ? { period: dateRange } : {};
        const response = await apiService.get('/dashboard/sales-analytics', { params });
        setAnalytics(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load analytics');
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  return { analytics, loading, error };
};
