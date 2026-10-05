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

// Public auth endpoints. A 401 from these is a real answer ("Invalid email or
// password"), not an expired session, so refreshing makes no sense here - and
// refreshing would replace that answer with the refresh call's own error.
const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh-token",
];

const isPublicAuthRequest = (url?: string) =>
  !!url && PUBLIC_AUTH_PATHS.some((path) => url.includes(path));

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only try to refresh an expired session: a 401 on a protected endpoint,
    // not yet retried, and only when we actually hold a token to refresh.
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isPublicAuthRequest(originalRequest?.url) &&
      localStorage.getItem("accessToken")
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await api.post("/auth/refresh-token");

        // Retry the original request
        return api(originalRequest);
      } catch {
        // Refresh failed. Surface the ORIGINAL error, not the refresh error -
        // otherwise every failure reads "Unauthenticated." and hides the cause.
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
