import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, ShoppingCart, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RootState } from '@/app/store';
import { setProducts, setSellers } from '@/app/slices/customerSlice';
import { ProductList } from './ProductList';
import { OrderHistory } from './OrderHistory';
import { ComplaintForm } from './ComplaintForm';
import { formatCurrency } from '@/utils/helpers';

// Mock data
const mockSellers = [
  {
    id: 'SELL-1',
    name: 'Rajesh Wholesalers',
    businessName: 'Fresh Groceries Co.',
    city: 'Bangalore',
    area: 'Jayanagar',
    pincode: '560041',
    rating: 4.5,
  },
];

const mockProducts = [
  {
    id: 'PROD-1',
    sellerId: 'SELL-1',
    sellerName: 'Fresh Groceries Co.',
    name: 'Premium Basmati Rice',
    description: 'High quality aged basmati rice',
    price: 120,
    unit: 'kg',
    stock: 500,
  },
  {
    id: 'PROD-2',
    sellerId: 'SELL-1',
    sellerName: 'Fresh Groceries Co.',
    name: 'Whole Wheat Flour',
    description: 'Fresh stone-ground wheat flour',
    price: 45,
    unit: 'kg',
    stock: 200,
  },
  {
    id: 'PROD-3',
    sellerId: 'SELL-1',
    sellerName: 'Fresh Groceries Co.',
    name: 'Refined Sunflower Oil',
    description: 'Pure sunflower cooking oil',
    price: 180,
    unit: 'l',
    stock: 100,
  },
];

export const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const { cart, orders } = useSelector((state: RootState) => state.customer);

  useEffect(() => {
    // Simulate API calls
    dispatch(setSellers(mockSellers));
    dispatch(setProducts(mockProducts));
  }, [dispatch]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Dashboard</h1>
        <p className="text-muted-foreground">Browse products and place orders</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cart.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {cartTotal > 0 ? formatCurrency(cartTotal) : 'Empty cart'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Sellers</CardTitle>
            <ShoppingBag className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSellers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In your area
            </p>
          </CardContent>
        </Card>
      </div>

      <ProductList />
      <OrderHistory />
      
      <div className="grid gap-6 md:grid-cols-2">
        <ComplaintForm />
        <div>
          {/* Cart summary could go here */}
        </div>
      </div>
    </div>
  );
};
