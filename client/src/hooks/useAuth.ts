// src/hooks/useAuth.ts
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/app/store';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser,
  clearError 
} from '@/app/slices/authSlice';
import { UserRole } from '@/app/slices/authSlice';
import { 
  getRoleBasedRedirect, 
  saveAuthData, 
  clearAuthData,
  getStoredToken,
  getStoredUser
} from '@/utils/auth';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await dispatch(loginUser({ email, password }) as any).unwrap();
      
      // Auto-redirect based on role
      const redirectPath = getRoleBasedRedirect(result.user.role);
      navigate(redirectPath, { replace: true });
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch, navigate]);

  // Register function
  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    address?: string;
  }) => {
    try {
      const result = await dispatch(registerUser(userData) as any).unwrap();
      
      // Auto-redirect based on role
      const redirectPath = getRoleBasedRedirect(result.user.role);
      navigate(redirectPath, { replace: true });
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch, navigate]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser() as any).unwrap();
    } catch (error) {
      // Even if logout API fails, clear local data
      clearAuthData();
      dispatch({ type: 'auth/logout' });
    }
    
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);

  // Get current user
  const fetchUser = useCallback(async () => {
    try {
      const result = await dispatch(getCurrentUser() as any).unwrap();
      return result;
    } catch (error) {
      // If we can't get user data, they're not authenticated
      logout();
      throw error;
    }
  }, [dispatch, logout]);

  // Check authentication status on mount
  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    
    if (token && user && !auth.isAuthenticated) {
      // We have stored data but Redux says not authenticated
      dispatch(fetchUser() as any);
    }
  }, [auth.isAuthenticated, dispatch, fetchUser]);

  // Clear any authentication errors
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Check if user has specific role
  const hasRole = useCallback((role: UserRole) => {
    return auth.user?.role === role;
  }, [auth.user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: UserRole[]) => {
    return auth.user?.role ? roles.includes(auth.user.role) : false;
  }, [auth.user]);

  // Get role-based redirect path
  const getRedirectPath = useCallback(() => {
    if (!auth.user?.role) return '/login';
    return getRoleBasedRedirect(auth.user.role);
  }, [auth.user]);

  // Initialize auth from localStorage
  const initializeAuth = useCallback(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    
    if (token && user) {
      dispatch({
        type: 'auth/setCredentials',
        payload: {
          user,
          token,
          refreshToken: getStoredToken() || ''
        }
      });
      return true;
    }
    return false;
  }, [dispatch]);

  return {
    // State
    user: auth.user,
    token: auth.token,
    refreshToken: auth.refreshToken,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    
    // Actions
    login,
    register,
    logout,
    fetchUser,
    clearError: clearAuthError,
    
    // Utilities
    hasRole,
    hasAnyRole,
    getRedirectPath,
    initializeAuth,
    
    // Role checks
    isSeller: hasRole('seller'),
    isCustomer: hasRole('customer'),
    isDelivery: hasRole('delivery_person'),
    isSalesman: hasRole('salesman'),
    isStaff: hasAnyRole(['seller', 'delivery_person', 'salesman']),
  };
};
