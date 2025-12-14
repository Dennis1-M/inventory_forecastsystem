import axiosClient, { getCached } from "../lib/axiosClient";

export const api = {
  get: async (url, config = {}) => {
    // use cached GET when available
    if (!config.skipCache) {
      const cached = await getCached(url, config);
      if (cached) return cached.data || cached;
    }
    const res = await axiosClient.get(url, config);
    return res.data;
  },
  post: async (url, payload, config = {}) => {
    const res = await axiosClient.post(url, payload, config);
    return res.data;
  },
  put: async (url, payload, config = {}) => {
    const res = await axiosClient.put(url, payload, config);
    return res.data;
  },
  del: async (url, config = {}) => {
    const res = await axiosClient.delete(url, config);
    return res.data;
  },
};

export default api;
