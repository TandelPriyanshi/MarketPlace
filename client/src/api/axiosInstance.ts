// src/api/axiosInstance.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authApi } from './auth.api';

// Create base axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track ongoing refresh requests to prevent multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

// Process queued requests after token refresh
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  
  failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    (config as any).metadata = { startTime: new Date() };
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Add response timestamp for debugging
    if ((response.config as any).metadata) {
      (response.config as any).metadata.endTime = new Date();
      (response.config as any).metadata.duration = 
        (response.config as any).metadata.endTime - (response.config as any).metadata.startTime;
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we're already refreshing, add this request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            (originalRequest.headers as any).Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      // Mark request as retried
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh the token
        const response = await authApi.refreshToken(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = response;
        
        // Update localStorage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Process queued requests with new token
        processQueue(null, accessToken);
        
        // Retry the original request with new token
        if (originalRequest.headers) {
          (originalRequest.headers as any).Authorization = `Bearer ${accessToken}`;
        }
        
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, logout user and redirect to login
        processQueue(refreshError, null);
        
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other HTTP errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('Bad Request:', data);
          break;
        case 403:
          console.error('Forbidden:', data);
          // Optional: Show permission denied message
          break;
        case 404:
          console.error('Not Found:', data);
          break;
        case 422:
          console.error('Validation Error:', data);
          break;
        case 500:
          console.error('Server Error:', data);
          // Optional: Show server error message
          break;
        default:
          console.error(`HTTP Error ${status}:`, data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Utility functions for common HTTP methods
export const api = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  },

  // File upload request
  upload: async <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> => {
    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    };
    
    const response = await axiosInstance.post<T>(url, formData, uploadConfig);
    return response.data;
  },

  // Download request
  download: async (url: string, config?: AxiosRequestConfig): Promise<Blob> => {
    const downloadConfig: AxiosRequestConfig = {
      ...config,
      responseType: 'blob',
    };
    
    const response = await axiosInstance.get(url, downloadConfig);
    return response.data;
  },
};

// Export the axios instance for custom requests
export default axiosInstance;

// Export types for TypeScript support
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

// Request metadata type for debugging
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: Date;
      endTime?: Date;
      duration?: number;
    };
  }
}
