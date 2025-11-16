import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sellerApi, DeliveryPerson } from '../../api/seller.api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AssignDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess?: () => void;
}

export const AssignDeliveryModal: React.FC<AssignDeliveryModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onSuccess,
}) => {
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingPersons, setFetchingPersons] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDeliveryPersons();
    }
  }, [isOpen]);

  const fetchDeliveryPersons = async () => {
    try {
      setFetchingPersons(true);
      const response = await sellerApi.getAvailableDeliveryPersons();
      setDeliveryPersons(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch delivery persons');
    } finally {
      setFetchingPersons(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDeliveryPerson) {
      toast.error('Please select a delivery person');
      return;
    }

    try {
      setLoading(true);
      
      await sellerApi.assignDelivery(orderId, {
        deliveryPersonId: selectedDeliveryPerson,
        estimatedDeliveryTime: 60, // Default 60 minutes
        notes: `Assigned delivery person ${selectedDeliveryPerson}`
      });

      toast.success('Delivery person assigned successfully');
      onSuccess?.();
      onClose();
      
      // Reset form
      setSelectedDeliveryPerson('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign delivery person');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setSelectedDeliveryPerson('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Delivery Person</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Order ID</Label>
            <div className="text-sm font-mono text-muted-foreground">{orderId}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-person">Select Delivery Person</Label>
            {fetchingPersons ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading delivery persons...</span>
              </div>
            ) : (
              <Select 
                value={selectedDeliveryPerson} 
                onValueChange={setSelectedDeliveryPerson}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose delivery person" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryPersons.map((person) => (
                    <SelectItem 
                      key={person.id} 
                      value={person.id}
                      disabled={!person.isAvailable}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {person.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {person.phone} • {person.email}
                        </span>
                        {person.currentOrders !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            Current orders: {person.currentOrders}
                          </span>
                        )}
                        {!person.isAvailable && (
                          <span className="text-xs text-red-600">
                            Currently unavailable
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedDeliveryPerson || loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Assign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
