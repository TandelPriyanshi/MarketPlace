import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createSalesOrder } from '@/api/salesman.api';
import { SalesOrderPayload, OrderItem } from '@/api/salesman.api';

interface SalesOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  beat: any;
}

export const SalesOrderForm = ({ isOpen, onClose, beat }: SalesOrderFormProps) => {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { productId: '', quantity: 1, unitPrice: 0, discount: 0 }
  ]);

  const addItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1, unitPrice: 0, discount: 0 }]);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setOrderItems(updatedItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
      const discount = (itemTotal * (item.discount || 0)) / 100;
      return total + itemTotal - discount;
    }, 0);
  };

  const onSubmit = async (data: any) => {
    try {
      const validItems = orderItems.filter(item => item.productId && item.quantity > 0);
      
      if (validItems.length === 0) {
        toast.error('Please add at least one item to the order');
        return;
      }

      const orderPayload: SalesOrderPayload = {
        storeId: data.storeId,
        items: validItems,
        discount: 0, // Calculate discount if needed
        tax: 0, // Calculate tax if needed
        paymentMethod: data.paymentMethod,
        deliveryDate: data.expectedDeliveryDate,
        notes: data.notes,
      };

      const response = await createSalesOrder(orderPayload);
      
      toast.success('Sales order created successfully');
      reset();
      setOrderItems([{ productId: '', quantity: 1, unitPrice: 0, discount: 0 }]);
      onClose();
    } catch (error) {
      console.error('Error creating sales order:', error);
      toast.error('Failed to create sales order');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Sales Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select onValueChange={(value) => setValue('paymentMethod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Order Items</Label>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {orderItems.map((item, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Item {index + 1}</CardTitle>
                    {orderItems.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">Product ID</Label>
                      <Input
                        placeholder="Product ID"
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Discount %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="Discount"
                        value={item.discount}
                        onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Textarea
              id="deliveryAddress"
              placeholder="Enter delivery address"
              {...register('deliveryAddress')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
              <Input
                id="expectedDeliveryDate"
                type="date"
                {...register('expectedDeliveryDate')}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Amount</Label>
              <div className="text-2xl font-bold">₹{calculateTotal().toFixed(2)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes for this order"
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
