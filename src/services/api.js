// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/accounts/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') ;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  return await api.post('auth/login/', credentials);
};

export const getUserProfile = async () => {
  return await api.get('users/me/');
};

export const refreshToken = async (refresh) => {
  return await api.post('auth/token/refresh/', { refresh });
};

export default api;