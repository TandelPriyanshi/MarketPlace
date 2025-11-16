import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RootState } from '@/app/store';
import { fetchSellerDashboard, fetchSellerProducts, fetchSellerOrders } from '@/app/slices/sellerSlice';
import { formatCurrency } from '@/utils/helpers';
import { ProductTable } from './ProductTable';
import { OrderTable } from './OrderTable';

export const SellerDashboard = () => {
  const dispatch = useDispatch();
  const { analytics, isLoading, error } = useSelector((state: RootState) => state.seller);

  useEffect(() => {
    // Fetch dashboard data, products, and orders
    dispatch(fetchSellerDashboard() as any);
    dispatch(fetchSellerProducts({}) as any);
    dispatch(fetchSellerOrders({}) as any);
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <p className="text-muted-foreground">Manage your products and orders</p>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <p>Loading dashboard data...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-red-600">
          <p>Error: {error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalSales)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +8 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently in catalog
            </p>
          </CardContent>
        </Card>
      </div>

      <ProductTable />
      <OrderTable />
        </>
      )}
    </div>
  );
};
