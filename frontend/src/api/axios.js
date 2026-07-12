// =====================================================================
// Central Axios instance
// - Reads the API base URL from an environment variable so it can be
//   pointed at a different host in production without code changes.
// - Automatically attaches the admin JWT (if present) to every request.
// - Redirects to /admin/login automatically on a 401 response.
// =====================================================================
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_username');
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
