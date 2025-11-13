import { useState } from 'react';
import { useDispatch } from 'react-redux';
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
import { assignDelivery } from '@/app/slices/sellerSlice';
import { toast } from 'sonner';

interface AssignDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

// Mock delivery persons
const deliveryPersons = [
  { id: 'DP001', name: 'Rajesh Kumar', zone: 'North Zone' },
  { id: 'DP002', name: 'Amit Singh', zone: 'South Zone' },
  { id: 'DP003', name: 'Priya Sharma', zone: 'East Zone' },
  { id: 'DP004', name: 'Vikram Patel', zone: 'West Zone' },
];

export const AssignDeliveryModal = ({ isOpen, onClose, orderId }: AssignDeliveryModalProps) => {
  const dispatch = useDispatch();
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');

  const handleAssign = () => {
    if (!selectedDeliveryPerson) {
      toast.error('Please select a delivery person');
      return;
    }

    dispatch(assignDelivery({ orderId, deliveryPersonId: selectedDeliveryPerson }));
    toast.success('Delivery person assigned successfully');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
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
            <Select value={selectedDeliveryPerson} onValueChange={setSelectedDeliveryPerson}>
              <SelectTrigger>
                <SelectValue placeholder="Choose delivery person" />
              </SelectTrigger>
              <SelectContent>
                {deliveryPersons.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name} - {person.zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleAssign}>
              Assign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
