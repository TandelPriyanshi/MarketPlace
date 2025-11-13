import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { USER_ROLES } from '@/utils/constants';
import { getRoleDashboardPath } from '@/utils/roles';

import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import SellerPage from '@/pages/SellerPage';
import DeliveryPage from '@/pages/DeliveryPage';
import SalesmanPage from '@/pages/SalesmanPage';
import CustomerPage from '@/pages/CustomerPage';
import NotFound from '@/pages/NotFound';

const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated && user ? (
            <Navigate to={getRoleDashboardPath(user.role)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/seller/*"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.SELLER]}>
            <SellerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/delivery/*"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.DELIVERY]}>
            <DeliveryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/salesman/*"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.SALESMAN]}>
            <SalesmanPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/*"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
            <CustomerPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
