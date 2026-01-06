import apiService from './api';

export const setupService = {
  checkInitialSetup: async (): Promise<{ setupNeeded: boolean }> => {
    const response = await apiService.get('/setup/status');
    return response.data;
  },

  performInitialSetup: async (data: any) => {
    const response = await apiService.post('/setup/run', data);
    return response.data;
  },
};
