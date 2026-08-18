import axios from "axios";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://criptpayapi.smspadi.com";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add the token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get 401 and haven't retried yet, and the request is NOT the refresh endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await api.post("/auth/refresh-token");
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - reject
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
