// frontend/src/hooks/useAnalytics.ts
// frontend/src/hooks/useAnalytics.ts
// Custom hooks to fetch various analytics data from the backend API
// Uses React Query for data fetching, caching, and state management
// Each hook corresponds to a specific analytics endpoint
// Includes a utility function to download analytics reports as JSON files




import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useInventoryHealth = () => {
  return useQuery({
    queryKey: ['analytics', 'inventory-health'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/inventory-health');
      return data.data;
    }
  });
};

export const useStockOutRisk = () => {
  return useQuery({
    queryKey: ['analytics', 'stock-out-risk'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/stock-out-risk');
      return data.data;
    }
  });
};

export const useABCAnalysis = () => {
  return useQuery({
    queryKey: ['analytics', 'abc-analysis'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/abc-analysis');
      return data.data;
    }
  });
};

export const useDeadStock = () => {
  return useQuery({
    queryKey: ['analytics', 'dead-stock'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/dead-stock');
      return data.data;
    }
  });
};

export const useInventoryTurnover = () => {
  return useQuery({
    queryKey: ['analytics', 'inventory-turnover'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/inventory-turnover');
      return data.data;
    }
  });
};

export const useSupplierPerformance = () => {
  return useQuery({
    queryKey: ['analytics', 'supplier-performance'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/supplier-performance');
      return data.data;
    }
  });
};

export const useForecastPerformance = (days = 30) => {
  return useQuery({
    queryKey: ['analytics', 'forecast-performance', days],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/forecast-performance?days=${days}`);
      return data.data;
    }
  });
};

export const useReorderOptimization = () => {
  return useQuery({
    queryKey: ['analytics', 'reorder-optimization'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/reorder-optimization');
      return data.data;
    }
  });
};

export const useSeasonalTrends = () => {
  return useQuery({
    queryKey: ['analytics', 'seasonal-trends'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/seasonal-trends');
      return data.data;
    }
  });
};

export const useCostOptimization = () => {
  return useQuery({
    queryKey: ['analytics', 'cost-optimization'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/cost-optimization');
      return data.data;
    }
  });
};

export const useSupplyChainRisk = () => {
  return useQuery({
    queryKey: ['analytics', 'supply-chain-risk'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/supply-chain-risk');
      return data.data;
    }
  });
};

export const useSmartAlerts = () => {
  return useQuery({
    queryKey: ['analytics', 'smart-alerts'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/smart-alerts');
      return data.data;
    }
  });
};

export const useScenarioPlanning = () => {
  return useQuery({
    queryKey: ['analytics', 'scenario-planning'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/scenario-planning');
      return data.data;
    }
  });
};

export const useDemandCorrelation = () => {
  return useQuery({
    queryKey: ['analytics', 'demand-correlation'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/demand-correlation');
      return data.data;
    }
  });
};

export const useExecutiveSummary = () => {
  return useQuery({
    queryKey: ['analytics', 'executive-summary'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/executive-summary');
      return data.data;
    }
  });
};

export const downloadAnalyticsReport = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5001/api/analytics/download-report', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download report');
    }
    
    const data = await response.json();
    
    // Create a blob and download
    const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return data;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};
