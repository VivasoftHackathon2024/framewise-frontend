import axios from 'axios';

// Create axios instance with default config
const authenticatedAxios = axios.create();

// Add a request interceptor
authenticatedAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default authenticatedAxios;