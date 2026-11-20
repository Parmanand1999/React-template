import useAuthStore from "@/store/useAuthStore";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 150000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Cache-Control": "no-cache",
  },
});

// Queue variables to handle concurrent API requests during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Attach accessToken dynamically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add 'Bearer ' if your backend expects it
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Silent refresh with request queuing
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Suppress warnings if offline
    if (!navigator.onLine) {
      console.warn("Offline detected → suppressing toast");
      return Promise.reject(error);
    }

    // Handle Network Timeout
    if (error.code === "ECONNABORTED") {
      toast.error("Network is slow. Request timed out.");
      return Promise.reject(error);
    }

    // Handle Server Down or Missing Response
    if (!error.response) {
      toast.error(
        "We’re unable to process your request at the moment. Please try again later."
      );
      return Promise.reject(error);
    }

    // Exclude authentication endpoints from refresh handling
    const isAuthRequest =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/login-with-mobile") ||
      originalRequest?.url?.includes("/auth/verify-otp") ||
      originalRequest?.url?.includes("/auth/refreshToken") ||
      originalRequest?.url?.includes("/auth/forgot-password") ||
      originalRequest?.url?.includes("/auth/reset-password");

    // Handle Token Expiration (401 Unauthorized)
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        // Call Refresh Token API
        const res = await axios.post(`${BASE_URL}/api/v1/auth/refreshToken`, {
          refreshToken,
        });

        const { data } = res.data;

        // Update Zustand Store (Persist middleware will automatically update localStorage)
        const currentUser = useAuthStore.getState().user;
        useAuthStore.getState().login({
          userDetails: currentUser,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });

        // Resolve all requests waiting in the queue
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest); // Retry the current request
      } catch (refreshError) {
        // Reject all queued requests and logout
        processQueue(refreshError, null);
        useAuthStore.getState().logout();

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
