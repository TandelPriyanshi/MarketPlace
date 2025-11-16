import React, { useState } from 'react';
import { MapPin, Upload, CheckCircle, RefreshCw, Package } from 'lucide-react';
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
import { formatDate } from '@/utils/helpers';
import { updateDeliveryStatus, startDelivery, completeDelivery, Delivery } from '../../api/delivery.api';
import { ProofUploadModal } from './ProofUploadModal';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DeliveryRouteTableProps {
  deliveries: Delivery[];
  onDeliveryUpdate: () => Promise<void> | void;
}

export const DeliveryRouteTable: React.FC<DeliveryRouteTableProps> = ({
  deliveries,
  onDeliveryUpdate,
}) => {
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'picked_up':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Delivery['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-3 w-3" />;
      case 'failed':
        return <RefreshCw className="h-3 w-3" />;
      case 'in_transit':
        return <MapPin className="h-3 w-3" />;
      case 'picked_up':
        return <Package className="h-3 w-3" />;
      default:
        return <RefreshCw className="h-3 w-3" />;
    }
  };

  const handleStatusChange = async (deliveryId: string, status: string) => {
    try {
      setUpdating(deliveryId);
      await updateDeliveryStatus(deliveryId, { 
        status: status as Delivery['status'],
        notes: `Status updated to ${status.replace('_', ' ')}`
      });
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      onDeliveryUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleStartDelivery = async (deliveryId: string) => {
    try {
      setUpdating(deliveryId);
      await startDelivery(deliveryId, {
        notes: 'Delivery started'
      });
      toast.success('Delivery started');
      onDeliveryUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to start delivery');
    } finally {
      setUpdating(null);
    }
  };

  const handleCompleteDelivery = async (deliveryId: string) => {
    try {
      setUpdating(deliveryId);
      await completeDelivery(deliveryId, {
        notes: 'Delivery completed successfully'
      });
      toast.success('Delivery completed');
      onDeliveryUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete delivery');
    } finally {
      setUpdating(null);
    }
  };

  const handleUploadProof = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setProofModalOpen(true);
  };

  const getAvailableStatuses = (currentStatus: Delivery['status']) => {
    switch (currentStatus) {
      case 'assigned':
        return ['picked_up'];
      case 'picked_up':
        return ['in_transit'];
      case 'in_transit':
        return ['delivered', 'failed'];
      case 'delivered':
      case 'failed':
        return [];
      default:
        return ['picked_up', 'in_transit', 'delivered', 'failed'];
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Delivery Routes</h2>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No deliveries assigned yet.
                </TableCell>
              </TableRow>
            ) : (
              deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-mono text-sm">{delivery.orderNumber}</TableCell>
                  <TableCell className="font-medium">{delivery.customerName}</TableCell>
                  <TableCell className="max-w-xs truncate">{delivery.customerAddress}</TableCell>
                  <TableCell>{formatDate(delivery.assignedAt)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(delivery.status)}>
                      {getStatusIcon(delivery.status)}
                      <span className="ml-1 capitalize">
                        {delivery.status.replace('_', ' ')}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {delivery.status === 'assigned' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartDelivery(delivery.id)}
                          disabled={updating === delivery.id}
                        >
                          {updating === delivery.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Package className="h-3 w-3" />
                          )}
                          Start
                        </Button>
                      )}

                      {delivery.status === 'in_transit' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteDelivery(delivery.id)}
                          disabled={updating === delivery.id}
                        >
                          {updating === delivery.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          Complete
                        </Button>
                      )}

                      {getAvailableStatuses(delivery.status).length > 0 && (
                        <Select
                          value={delivery.status}
                          onValueChange={(value) => handleStatusChange(delivery.id, value)}
                          disabled={updating === delivery.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableStatuses(delivery.status).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace('_', ' ').toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {delivery.status === 'delivered' && !delivery.proofOfDelivery && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUploadProof(delivery.id)}
                          className="gap-1"
                        >
                          <Upload className="h-3 w-3" />
                          Proof
                        </Button>
                      )}

                      {delivery.proofOfDelivery && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Proof
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedDeliveryId && (
        <ProofUploadModal
          isOpen={proofModalOpen}
          onClose={() => { 
            setProofModalOpen(false); 
            setSelectedDeliveryId(null); 
          }}
          deliveryId={selectedDeliveryId}
          onSuccess={() => {
            onDeliveryUpdate();
            setProofModalOpen(false);
            setSelectedDeliveryId(null);
          }}
        />
      )}
    </div>
  );
};
