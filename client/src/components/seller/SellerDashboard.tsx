import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RootState } from '@/app/store';
import { setProducts, setOrders, setAnalytics } from '@/app/slices/sellerSlice';
import { formatCurrency } from '@/utils/helpers';
import { ProductTable } from './ProductTable';
import { OrderTable } from './OrderTable';

// Mock data
const mockProducts = [
  {
    id: 'PROD-1',
    name: 'Premium Rice',
    sku: 'SKU-RICE-001',
    description: 'High quality basmati rice',
    price: 120,
    stock: 500,
    unit: 'kg',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'PROD-2',
    name: 'Wheat Flour',
    sku: 'SKU-WHEAT-001',
    description: 'Fresh wheat flour',
    price: 45,
    stock: 200,
    unit: 'kg',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const mockOrders = [
  {
    id: 'ORD-1001',
    customerId: 'CUST-1',
    customerName: 'Ravi Merchant',
    status: 'pending',
    totalAmount: 2500,
    createdAt: new Date().toISOString(),
    items: [],
  },
  {
    id: 'ORD-1002',
    customerId: 'CUST-2',
    customerName: 'Suresh Store',
    status: 'accepted',
    totalAmount: 4800,
    createdAt: new Date().toISOString(),
    items: [],
  },
];

export const SellerDashboard = () => {
  const dispatch = useDispatch();
  const { analytics } = useSelector((state: RootState) => state.seller);

  useEffect(() => {
    // Simulate API calls
    dispatch(setProducts(mockProducts));
    dispatch(setOrders(mockOrders));
    dispatch(setAnalytics({
      totalSales: 125000,
      totalOrders: 45,
      activeProducts: mockProducts.filter(p => p.isActive).length,
    }));
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <p className="text-muted-foreground">Manage your products and orders</p>
      </div>

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
    </div>
  );
};
