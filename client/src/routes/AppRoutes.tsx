import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { USER_ROLES } from '@/utils/constants';
import { getRoleDashboardPath } from '@/utils/roles';

import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import SellerPage, { SellerDashboard, ProductTable } from '@/pages/SellerPage';
import DeliveryPage, { DeliveryDashboard, DeliveryRoutesPage, DeliveryDeliveriesPage } from '@/pages/DeliveryPage';
import SalesmanPage, { SalesmanDashboard, SalesmanBeatsPage, SalesmanAttendancePage, SalesmanVisitsPage, SalesmanOrdersPage, SalesmanPerformancePage } from '@/pages/SalesmanPage';
import CustomerPage, { CustomerDashboard, OrderHistory, CustomerProductsPage, CustomerComplaintsPage } from '@/pages/CustomerPage';
import { OrderTable } from '@/components/seller/OrderTable';
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
      >
        <Route index element={<SellerDashboard />} />
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="products" element={<ProductTable />} />
        <Route path="orders" element={<OrderTable />} />
      </Route>

      <Route
        path="/delivery/*"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.DELIVERY]}>
            <DeliveryPage />
          </ProtectedRoute>
        }
      >
        <Route index element={<DeliveryDashboard />} />
        <Route path="dashboard" element={<DeliveryDashboard />} />
        <Route path="routes" element={<DeliveryRoutesPage />} />
        <Route path="deliveries" element={<DeliveryDeliveriesPage />} />
      </Route>

      <Route
        path="/salesman/*"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.SALESMAN]}>
            <SalesmanPage />
          </ProtectedRoute>
        }
      >
        <Route index element={<SalesmanDashboard />} />
        <Route path="dashboard" element={<SalesmanDashboard />} />
        <Route path="beats" element={<SalesmanBeatsPage />} />
        <Route path="attendance" element={<SalesmanAttendancePage />} />
        <Route path="visits" element={<SalesmanVisitsPage />} />
        <Route path="orders" element={<SalesmanOrdersPage />} />
        <Route path="performance" element={<SalesmanPerformancePage />} />
      </Route>

      <Route
        path="/customer/*"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
            <CustomerPage />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="products" element={<CustomerProductsPage />} />
        <Route path="orders" element={<OrderHistory />} />
        <Route path="complaints" element={<CustomerComplaintsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
