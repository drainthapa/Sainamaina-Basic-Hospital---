import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send the httpOnly refresh_token cookie
});

let accessToken = null;
let onUnauthorized = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

/** Registered once by AuthContext so the interceptor can force a logout on hard auth failure. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (!response || response.status !== 401 || config._retried || config.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    config._retried = true;

    try {
      // De-duplicate concurrent refresh attempts (e.g. several requests firing 401 at once)
      if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh').finally(() => {
          refreshPromise = null;
        });
      }
      const refreshResponse = await refreshPromise;
      const newToken = refreshResponse.data.data.accessToken;
      setAccessToken(newToken);
      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config);
    } catch (refreshError) {
      setAccessToken(null);
      if (onUnauthorized) onUnauthorized();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
