import axios from "axios";

const DEFAULT_API = typeof window === 'undefined'
  ? process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api'
  : (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api');

console.log('API baseURL loaded:', DEFAULT_API);


export const api = axios.create({
  baseURL: DEFAULT_API,
  timeout: 8_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ssc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ssc_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
