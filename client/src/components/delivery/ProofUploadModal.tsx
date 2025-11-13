import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadProof } from '@/app/slices/deliverySlice';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface ProofUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: string;
}

export const ProofUploadModal = ({ isOpen, onClose, routeId }: ProofUploadModalProps) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    // In real app, upload to server/cloud storage
    // For now, use a mock URL
    const mockUrl = `https://storage.example.com/proof/${Date.now()}-${file.name}`;
    
    dispatch(uploadProof({ routeId, proofUrl: mockUrl }));
    toast.success('Proof uploaded successfully');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Delivery Proof</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Route ID</Label>
            <div className="text-sm font-mono text-muted-foreground">{routeId}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof">Upload Image/Signature</Label>
            <Input
              id="proof"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Upload a photo of the delivery or customer signature
            </p>
          </div>

          {preview && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-muted/30">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
