// src/api/auth.api.ts
import { api } from './index';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'customer' | 'seller' | 'delivery_person' | 'salesman';
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'customer' | 'seller' | 'delivery_person' | 'salesman';
      phone?: string;
      address?: string;
      created_at: string;
      updatedAt: string;
    };
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

export interface CurrentUserResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'seller' | 'delivery_person' | 'salesman';
    phone?: string;
    address?: string;
    created_at: string;
    updatedAt: string;
  };
}

// Auth API functions
export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response;
  },

  // Register new user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response;
  },

  // Get current user
  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await api.get<CurrentUserResponse>('/auth/me');
    return response;
  },

  // Logout user
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/logout');
    return response;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    });
    return response;
  },

  // Change password
  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.put<{ success: boolean; message: string }>('/auth/change-password', passwords);
    return response;
  },

  // Update profile
  updateProfile: async (userData: Partial<RegisterData>): Promise<CurrentUserResponse> => {
    const response = await api.put<CurrentUserResponse>('/auth/profile', userData);
    return response;
  },
};
