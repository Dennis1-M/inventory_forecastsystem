// frontend/src/lib/api.ts
// API utility functions to interact with the backend
// Uses Axios for HTTP requests
// Configures base URL and headers for authentication
// Provides functions for common API operations (GET, POST, PUT, DELETE)
// for various resources like users, products, orders, etc.
// Each function returns the Axios promise for further handling in the calling code




import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
};

export const userApi = {
  getUsers: () => api.get('/users'),
  getUser: (id: string) => api.get(`/users/${id}`),
  createUser: (data: any) => api.post('/users', data),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};
