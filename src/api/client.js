import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const ACCESS_KEY = 'tc_access_token';
const REFRESH_KEY = 'tc_refresh_token';

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access, refresh) => {
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    Accept: 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    // Don't try to refresh on the auth endpoints themselves
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/register');

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint && tokenStore.getRefresh()) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refresh = tokenStore.getRefresh();
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, { refresh });
        const newAccess = data?.data?.access || data?.access;
        const newRefresh = data?.data?.refresh || data?.refresh || refresh;
        tokenStore.setTokens(newAccess, newRefresh);
        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStore.clear();
        window.dispatchEvent(new CustomEvent('tc:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Normalizes the varied error shapes from apps.common.exceptions.custom_exception_handler
export function extractErrorMessage(error) {
  const data = error?.response?.data;
  if (!data) return error?.message || 'Something went wrong. Please try again.';
  if (data.error) {
    const details = data.error.details;
    if (typeof details === 'string') return details;
    if (details && typeof details === 'object') {
      const firstKey = Object.keys(details)[0];
      const firstVal = details[firstKey];
      if (Array.isArray(firstVal)) return `${firstKey}: ${firstVal[0]}`;
      if (typeof firstVal === 'string') return firstVal;
    }
    return data.error.message || 'Request failed.';
  }
  if (data.message) return data.message;
  if (data.detail) return data.detail;
  return 'Something went wrong. Please try again.';
}

export default client;
