import axios from 'axios';

// Base API URL from environment variable or fallback to proxy / local backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for unified error formatting
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract server message or network error
    const customError = {
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'An unexpected error occurred while communicating with the server.',
      status: error.response?.status || 500,
      originalError: error,
    };
    return Promise.reject(customError);
  }
);

export default axiosInstance;
