import React, { useState, useEffect } from 'react';
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
import { formatCurrency, formatDate } from '@/utils/helpers';
import { getSellerOrders, updateOrderStatus } from '../../api/order.api';
import { Order, OrderStatus } from '../../api/order.api';
import { AssignDeliveryModal } from './AssignDeliveryModal';
import { toast } from 'sonner';

export const OrderTable = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 10,
  });
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getSellerOrders({
        page: pagination.page,
        limit: pagination.limit,
      });
      setOrders(response.orders);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
    } catch (error: any) {
      toast.error('Failed to fetch orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, { status: OrderStatus.CONFIRMED });
      toast.success('Order accepted successfully');
      fetchOrders();
    } catch (error: any) {
      toast.error('Failed to accept order: ' + error.message);
    }
  };

  const handleReject = async (orderId: string) => {
    if (confirm('Are you sure you want to reject this order?')) {
      try {
        await updateOrderStatus(orderId, { status: OrderStatus.CANCELLED });
        toast.success('Order rejected');
        fetchOrders();
      } catch (error: any) {
        toast.error('Failed to reject order: ' + error.message);
      }
    }
  };

  const handleAssignDelivery = (orderId: string) => {
    setSelectedOrderId(orderId);
    setAssignModalOpen(true);
  };

  const getStatusColor = (status: OrderStatus): string => {
    const colors = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [OrderStatus.PROCESSING]: 'bg-purple-100 text-purple-800',
      [OrderStatus.SHIPPED]: 'bg-indigo-100 text-indigo-800',
      [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [OrderStatus.RETURN_REQUESTED]: 'bg-orange-100 text-orange-800',
      [OrderStatus.RETURN_APPROVED]: 'bg-teal-100 text-teal-800',
      [OrderStatus.RETURN_REJECTED]: 'bg-gray-100 text-gray-800',
      [OrderStatus.RETURN_COMPLETED]: 'bg-cyan-100 text-cyan-800',
      [OrderStatus.COMPLETED]: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.id}</TableCell>
                  <TableCell className="font-medium">
                    {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'N/A'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {order.items?.map(item => `${item.quantity}x ${item.product?.name || item.productName}`).join(', ')}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {order.status === OrderStatus.PENDING && (
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
                      {order.status === OrderStatus.CONFIRMED && (
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AssignDeliveryModal
        isOpen={assignModalOpen}
        onClose={() => { 
          setAssignModalOpen(false); 
          setSelectedOrderId(null); 
          fetchOrders();
        }}
        orderId={selectedOrderId}
      />
    </div>
  );
};
