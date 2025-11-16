// src/components/ProtectedRoute.tsx
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '@/app/store';
import { UserRole } from '@/app/slices/authSlice';
import { getStoredToken, getStoredUser, getRoleBasedRedirect } from '@/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  roles?: UserRole[];
  fallback?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  roles,
  fallback = '/login',
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const auth = useSelector((state: RootState) => state.auth);
  
  // Check authentication from Redux and localStorage as fallback
  const token = auth.token || getStoredToken();
  const user = auth.user || getStoredUser();
  const isAuthenticated = auth.isAuthenticated || (!!token && !!user);
  
  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallback} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }
  
  // Check role-based access
  if (requiredRole || roles) {
    const userRole = user?.role;
    
    if (requiredRole && userRole !== requiredRole) {
      // Redirect to appropriate dashboard based on user's role
      const redirectPath = getRoleBasedRedirect(userRole as UserRole);
      return <Navigate to={redirectPath} replace />;
    }
    
    if (roles && !roles.includes(userRole as UserRole)) {
      // Redirect to appropriate dashboard based on user's role
      const redirectPath = getRoleBasedRedirect(userRole as UserRole);
      return <Navigate to={redirectPath} replace />;
    }
  }
  
  return <>{children}</>;
};

// Higher-order component for role-based protection
export const withRoleProtection = (
  Component: React.ComponentType<any>,
  requiredRole?: UserRole,
  roles?: UserRole[]
) => {
  return (props: any) => (
    <ProtectedRoute requiredRole={requiredRole} roles={roles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Role-specific protected route components
export const SellerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="seller">
    {children}
  </ProtectedRoute>
);

export const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="customer">
    {children}
  </ProtectedRoute>
);

export const DeliveryRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="delivery_person">
    {children}
  </ProtectedRoute>
);

export const SalesmanRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="salesman">
    {children}
  </ProtectedRoute>
);

// Multi-role protected route for admin/staff access
export const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute roles={['seller', 'delivery_person', 'salesman']}>
    {children}
  </ProtectedRoute>
);
