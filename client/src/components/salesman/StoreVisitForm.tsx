import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface StoreVisitFormProps {
  isOpen: boolean;
  onClose: () => void;
  beat: any;
}

export const StoreVisitForm = ({ isOpen, onClose, beat }: StoreVisitFormProps) => {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, watch, setValue } = useForm();

  const onSubmit = (data: any) => {
    const visitData = {
      id: `VISIT-${Date.now()}`,
      storeId: data.storeId,
      storeName: beat.stores.find((s: any) => s.id === data.storeId)?.name || 'Store',
      visitDate: new Date().toISOString(),
      notes: data.notes,
      orderTaken: data.orderTaken,
    };

    dispatch(addVisit(visitData));
    toast.success('Visit logged successfully');
    reset();
    onClose();
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
            <div className="text-sm text-muted-foreground">{beat.areaName}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store">Select Store</Label>
            <Select onValueChange={(value) => setValue('storeId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a store" />
              </SelectTrigger>
              <SelectContent>
                {beat.stores.map((store: any) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name} - {store.address}
                  </SelectItem>
                ))}
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
