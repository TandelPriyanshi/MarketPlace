import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addVisit } from '@/app/slices/salesmanSlice';
import { toast } from 'sonner';
import { logVisit } from '@/api/salesman.api';
import { VisitPayload } from '@/api/salesman.api';

interface StoreVisitFormProps {
  isOpen: boolean;
  onClose: () => void;
  beat: any;
}

export const StoreVisitForm = ({ isOpen, onClose, beat }: StoreVisitFormProps) => {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, watch, setValue } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const visitPayload: VisitPayload = {
        storeId: data.storeId,
        date: new Date().toISOString(),
        checkInTime: new Date().toISOString(),
        checkOutTime: new Date().toISOString(),
        purpose: data.purpose || 'sales',
        outcome: data.orderTaken ? 'successful' : 'follow_up_required',
        notes: data.notes,
        location: {
          latitude: 12.9716, // Default Bangalore coordinates
          longitude: 77.5946,
        },
      };

      const response = await logVisit(visitPayload);
      
      // Update Redux store
      const visitData = {
        id: response.data.id,
        storeId: data.storeId,
        storeName: beat?.stores?.find((s: any) => s.id === data.storeId)?.name || 'Store',
        visitDate: new Date().toISOString(),
        notes: data.notes,
        orderTaken: data.orderTaken,
      };

      dispatch(addVisit(visitData));
      toast.success('Visit logged successfully');
      reset();
      onClose();
    } catch (error) {
      console.error('Error logging visit:', error);
      toast.error('Failed to log visit');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Store Visit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Beat Area</Label>
            <div className="text-sm text-muted-foreground">
              {beat ? beat.areaName || 'No beat selected' : 'No beat selected'}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store">Select Store</Label>
            <Select onValueChange={(value) => setValue('storeId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a store" />
              </SelectTrigger>
              <SelectContent>
                {beat && beat.stores ? beat.stores.map((store: any) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name} - {store.address}
                  </SelectItem>
                )) : (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    No stores available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Visit Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Enter visit details, feedback, requirements..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="orderTaken"
              onCheckedChange={(checked) => setValue('orderTaken', checked)}
            />
            <Label htmlFor="orderTaken" className="cursor-pointer">
              Order taken during this visit
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Log Visit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
