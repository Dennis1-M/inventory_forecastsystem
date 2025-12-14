import api from "./api";

const BASE = "/api/forecast";

export const forecastService = {
  list: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `${BASE}?${qs}` : BASE;
    return api.get(url);
  },
  getByProduct: async (productId) => {
    return api.get(`${BASE}/product/${productId}`);
  },
};

export default forecastService;
