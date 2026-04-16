import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Request interceptor: Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: Handle global errors like 401 Unauthorized
let isRedirecting = false;
api.interceptors.response.use(
  (response) => {
    isRedirecting = false; // Reset lock on success
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401 && !isRedirecting) {
      isRedirecting = true;
      // Clear ALL auth data and redirect to login if session expires
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
