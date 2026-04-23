import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/* Attach JWT token from storage on every request */
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('ltl_user');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch { /* ignore */ }
  }
  return config;
});

/* Response interceptor — only redirect to login if user was authenticated */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const wasLoggedIn = !!localStorage.getItem('ltl_user');
      if (wasLoggedIn) {
        localStorage.removeItem('ltl_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
