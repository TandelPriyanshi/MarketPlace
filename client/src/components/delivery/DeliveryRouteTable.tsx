import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Upload, CheckCircle } from 'lucide-react';
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
import { formatDate, getStatusColor } from '@/utils/helpers';
import { RootState } from '@/app/store';
import { updateDeliveryStatus } from '@/app/slices/deliverySlice';
import { ProofUploadModal } from './ProofUploadModal';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DELIVERY_STATUS } from '@/utils/constants';

export const DeliveryRouteTable = () => {
  const dispatch = useDispatch();
  const { routes } = useSelector((state: RootState) => state.delivery);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const handleStatusChange = (routeId: string, status: string) => {
    dispatch(updateDeliveryStatus({ routeId, status }));
    toast.success(`Status updated to ${status.replace(/_/g, ' ')}`);
  };

  const handleUploadProof = (routeId: string) => {
    setSelectedRouteId(routeId);
    setProofModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Delivery Routes</h2>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No deliveries assigned yet.
                </TableCell>
              </TableRow>
            ) : (
              routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-mono text-sm">{route.id}</TableCell>
                  <TableCell>{route.sellerName}</TableCell>
                  <TableCell className="font-medium">{route.customerName}</TableCell>
                  <TableCell className="max-w-xs truncate">{route.deliveryAddress}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(route.deliveryStatus)}>
                      {route.deliveryStatus.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {route.deliveryStatus !== 'delivered' && (
                        <Select
                          value={route.deliveryStatus}
                          onValueChange={(value) => handleStatusChange(route.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={DELIVERY_STATUS.PICKED}>Picked</SelectItem>
                            <SelectItem value={DELIVERY_STATUS.OUT_FOR_DELIVERY}>
                              Out for Delivery
                            </SelectItem>
                            <SelectItem value={DELIVERY_STATUS.DELIVERED}>Delivered</SelectItem>
                            <SelectItem value={DELIVERY_STATUS.RETURNED}>Returned</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {route.deliveryStatus === 'delivered' && !route.proofImageUrl && (
                        <Button
                          size="sm"
                          onClick={() => handleUploadProof(route.id)}
                          className="gap-1"
                        >
                          <Upload className="h-3 w-3" />
                          Upload Proof
                        </Button>
                      )}
                      {route.proofImageUrl && (
                        <Badge className="bg-accent/10 text-accent border-accent/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Proof Uploaded
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

      {selectedRouteId && (
        <ProofUploadModal
          isOpen={proofModalOpen}
          onClose={() => { setProofModalOpen(false); setSelectedRouteId(null); }}
          routeId={selectedRouteId}
        />
      )}
    </div>
  );
};
