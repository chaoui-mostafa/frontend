import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getMe: () => API.get('/auth/me'),
  // OAuth endpoints
  oauthLogin: (provider, data) => API.post(`/auth/${provider}`, data),
  refreshToken: (data) => API.post('/auth/refresh', data),

  // Password management
  requestPasswordReset: (data) => API.post('/auth/password/reset-request', data),
  resetPassword: (data) => API.post('/auth/password/reset', data),
  changePassword: (data) => API.post('/auth/password/change', data),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => API.get('/analytics/dashboard'),
  getTrends: (period) => API.get(`/analytics/trends?period=${period}`),
};
// Sales API
export const salesAPI = {
  getAll: (params = {}) => API.get('/sales', { params }),
  create: (saleData) => API.post('/sales', saleData),
  update: (id, saleData) => API.put(`/sales/${id}`, saleData),
  delete: (id) => API.delete(`/sales/${id}`),
};

// Customers API
export const customersAPI = {
  getAll: (params = {}) => API.get('/customers', { params }),
  create: (customerData) => API.post('/customers', customerData),
  update: (id, customerData) => API.put(`/customers/${id}`, customerData),
};

export default API;
