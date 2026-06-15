import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

// Get base URL from environment or default to local backend api URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Check if error is due to expired or missing token (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // If running in browser environment, remove local token and redirect if not on login page
      if (typeof window !== "undefined") {
        Cookies.remove("token");
        // We can do a router redirect here if needed, or dispatch a custom event
        if (!window.location.pathname.includes("/auth/login")) {
          window.location.href = `/auth/login?expired=true&redirect=${encodeURIComponent(
            window.location.pathname + window.location.search
          )}`;
          // Return pending promise to prevent the error from bubbling up while redirecting
          return new Promise(() => {});
        }
      }
    }
    
    return Promise.reject(error);
  }
);
export default apiClient;
