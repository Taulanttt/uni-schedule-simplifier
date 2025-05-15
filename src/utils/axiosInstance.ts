// utils/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: import.meta.env.VITE_API_URL + "/api", // Your backend URL
  baseURL:"http://localhost:5000/api",
  withCredentials: true, // If sending cookies
});

// 1) Request Interceptor - attach token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2) Response Interceptor - handle 401 "Invalid or expired token"
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 from the backend with { error: "Invalid or expired token" },
    // we remove the token from localStorage and redirect user to /login
    if (
      error?.response?.status === 401 &&
      error?.response?.data?.error === "Invalid or expired token"
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
