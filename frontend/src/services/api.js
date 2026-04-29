import axios from 'axios';

// Use environment variable for API URL, with fallback for development
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://discus-web-app-2-0.onrender.com/api');

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enable sending cookies with requests
});

// Add request interceptor to send token as fallback if cookies don't work
api.interceptors.request.use((config) => {
  // First try cookies (automatic with withCredentials: true)
  // If that doesn't work, try Authorization header as fallback
  const token = localStorage.getItem('authToken');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to store token in localStorage as fallback
api.interceptors.response.use(
  (response) => {
    // If we got a token in response, store it
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (email, password, fullName) =>
    api.post('/auth/register', { email, password, fullName }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  adminRegister: (email, password, fullName, adminSecret) =>
    api.post('/auth/admin/register', { email, password, fullName, adminSecret }),
  adminLogin: (email, password) =>
    api.post('/auth/admin/login', { email, password }),
  logout: () =>
    api.post('/auth/logout'),
  verify: () =>
    api.get('/auth/verify'),
};

export const productAPI = {
  getAll: (categoryId, search) =>
    api.get('/products', { params: { category_id: categoryId, search } }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const productTypeAPI = {
  getAll: () => api.get('/product-types'),
  create: (data) => api.post('/product-types', data),
  update: (id, data) => api.put(`/product-types/${id}`, data),
  delete: (id) => api.delete(`/product-types/${id}`),
};

export const supplierAPI = {
  getAll: (search, status) =>
    api.get('/suppliers', { params: { search, status } }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getById: (id) => api.get(`/orders/${id}`),
  getUserOrders: () => api.get('/orders/user/orders'),
  getAll: () => api.get('/orders'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteImage: (publicId) =>
    api.delete('/upload/delete', { data: { publicId } }),
};

export const heroAPI = {
  getAll: () => api.get('/hero'),
  create: (data) => api.post('/hero', data),
  update: (id, data) => api.put(`/hero/${id}`, data),
  delete: (id) => api.delete(`/hero/${id}`),
};

export default api;
