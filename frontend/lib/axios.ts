// frontend/lib/axios.ts

import axios, { InternalAxiosRequestConfig } from "axios";


const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('qr-menu-token');

      if (token && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || (error.response?.status === 403 && error.response?.data?.message?.includes("suspended"))) &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        if (error.response?.status === 403) {
          // Instead of logging them out, we modify the local user payload to be suspended
          const stored = localStorage.getItem('qr-menu-user');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              parsed.is_suspended = true;
              localStorage.setItem('qr-menu-user', JSON.stringify(parsed));
              // Reload page to re-mount context and trigger dashboard lock screen
              window.location.reload();
            } catch (e) {
              // ignore
            }
          }
        } else {
          localStorage.removeItem('qr-menu-token');
          localStorage.removeItem('qr-menu-user');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;