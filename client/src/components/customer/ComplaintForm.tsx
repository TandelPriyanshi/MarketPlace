import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { addComplaint } from '@/app/slices/customerSlice';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

export const ComplaintForm = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset } = useForm();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const onSubmit = (data: any) => {
    const complaintData = {
      id: `COMP-${Date.now()}`,
      orderId: data.orderId,
      subject: data.subject,
      description: data.description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      imageUrl: file ? `https://storage.example.com/complaints/${file.name}` : undefined,
    };

    dispatch(addComplaint(complaintData));
    toast.success('Complaint submitted successfully');
    reset();
    setFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raise a Complaint</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderId">Order ID</Label>
            <Input
              id="orderId"
              {...register('orderId', { required: true })}
              placeholder="ORD-1234"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              {...register('subject', { required: true })}
              placeholder="Brief description of the issue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description', { required: true })}
              placeholder="Provide detailed information about your complaint..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Attach Image (Optional)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full gap-2">
            <Upload className="h-4 w-4" />
            Submit Complaint
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
