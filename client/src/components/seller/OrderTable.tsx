import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, XCircle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getStatusColor } from '@/utils/helpers';
import { RootState } from '@/app/store';
import { updateOrderStatus } from '@/app/slices/sellerSlice';
import { AssignDeliveryModal } from './AssignDeliveryModal';
import { toast } from 'sonner';

export const OrderTable = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state: RootState) => state.seller);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleAccept = (orderId: string) => {
    dispatch(updateOrderStatus({ orderId, status: 'accepted' }));
    toast.success('Order accepted successfully');
  };

  const handleReject = (orderId: string) => {
    if (confirm('Are you sure you want to reject this order?')) {
      dispatch(updateOrderStatus({ orderId, status: 'rejected' }));
      toast.success('Order rejected');
    }
  };

  const handleAssignDelivery = (orderId: string) => {
    setSelectedOrderId(orderId);
    setAssignModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Orders</h2>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.id}</TableCell>
                  <TableCell className="font-medium">{order.customerName}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {order.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAccept(order.id)}
                            className="gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(order.id)}
                            className="gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </Button>
                        </>
                      )}
                      {(order.status === 'accepted' || order.status === 'packed') && (
                        <Button
                          size="sm"
                          onClick={() => handleAssignDelivery(order.id)}
                          className="gap-1"
                        >
                          <Truck className="h-3 w-3" />
                          Assign Delivery
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedOrderId && (
        <AssignDeliveryModal
          isOpen={assignModalOpen}
          onClose={() => { setAssignModalOpen(false); setSelectedOrderId(null); }}
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
};
