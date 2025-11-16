// src/utils/auth.ts
import { UserRole } from '@/app/slices/authSlice';

// Role-based redirect paths
export const ROLE_REDIRECTS: Record<UserRole, string> = {
  customer: '/customer/dashboard',
  seller: '/seller/dashboard',
  delivery_person: '/delivery/dashboard',
  salesman: '/salesman/dashboard',
};

// Get redirect path based on user role
export const getRoleBasedRedirect = (role: UserRole): string => {
  return ROLE_REDIRECTS[role] || '/login';
};

// Save authentication data to localStorage
export const saveAuthData = (user: any, accessToken: string, refreshToken: string): void => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

// Clear authentication data from localStorage
export const clearAuthData = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

// Get stored token from localStorage
export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

// Get stored refresh token from localStorage
export const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

// Get stored user from localStorage
export const getStoredUser = (): any | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Check if user is authenticated
export const isUserAuthenticated = (): boolean => {
  return !!getStoredToken() && !!getStoredUser();
};

// Get user role from stored data
export const getUserRole = (): UserRole | null => {
  const user = getStoredUser();
  return user?.role || null;
};

// Check if user has specific role
export const hasRole = (requiredRole: UserRole): boolean => {
  const userRole = getUserRole();
  return userRole === requiredRole;
};

// Check if user has any of the specified roles
export const hasAnyRole = (roles: UserRole[]): boolean => {
  const userRole = getUserRole();
  return roles.includes(userRole);
};

// Get login redirect URL based on stored user role
export const getLoginRedirect = (): string => {
  const role = getUserRole();
  return role ? getRoleBasedRedirect(role) : '/login';
};
