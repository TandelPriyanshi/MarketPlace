import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Package, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RootState } from '@/app/store';
import { setRoutes } from '@/app/slices/deliverySlice';
import { DeliveryRouteTable } from './DeliveryRouteTable';

// Mock data
const mockRoutes = [
  {
    id: 'ORD-1002',
    sellerId: 'SELL-1',
    sellerName: 'Fresh Groceries Co.',
    customerId: 'CUST-2',
    customerName: 'Suresh Store',
    deliveryAddress: '45, MG Road, Bangalore - 560001',
    deliveryStatus: 'picked',
    assignedAt: new Date().toISOString(),
    orderItems: [
      { productName: 'Rice', quantity: 25 },
      { productName: 'Wheat', quantity: 10 },
    ],
  },
  {
    id: 'ORD-1005',
    sellerId: 'SELL-2',
    sellerName: 'Quality Supplies',
    customerId: 'CUST-5',
    customerName: 'Ramesh Traders',
    deliveryAddress: '12, Brigade Road, Bangalore - 560025',
    deliveryStatus: 'out_for_delivery',
    assignedAt: new Date().toISOString(),
    orderItems: [
      { productName: 'Oil', quantity: 5 },
    ],
  },
];

export const DeliveryDashboard = () => {
  const dispatch = useDispatch();
  const { completedDeliveries, pendingDeliveries } = useSelector(
    (state: RootState) => state.delivery
  );

  useEffect(() => {
    // Simulate API call
    dispatch(setRoutes(mockRoutes));
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Delivery Dashboard</h1>
        <p className="text-muted-foreground">Track and manage your deliveries</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedDeliveries + pendingDeliveries}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Assigned today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedDeliveries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDeliveries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>

      <DeliveryRouteTable />
    </div>
  );
};
