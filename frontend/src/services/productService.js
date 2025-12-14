import api from "./api";

const BASE = "/api/products";

export const productService = {
  list: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `${BASE}?${qs}` : BASE;
    return api.get(url);
  },
  get: async (id) => api.get(`${BASE}/${id}`),
};

export default productService;
