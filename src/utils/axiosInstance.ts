// utils/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // Your backend URL
  withCredentials: true,               // If sending cookies
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

// 2) Response Interceptor (Optional) - handle 401, etc.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // e.g., redirect to login
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
