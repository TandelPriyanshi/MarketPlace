import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { uploadProof } from '../../api/delivery.api';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';

interface ProofUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryId: string;
  onSuccess?: () => void;
}

export const ProofUploadModal: React.FC<ProofUploadModalProps> = ({
  isOpen,
  onClose,
  deliveryId,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);

      // Determine proof type based on file
      const proofType: 'photo' | 'signature' = file.type.includes('image') ? 'photo' : 'signature';

      await uploadProof(deliveryId, {
        proofType,
        file,
        notes: notes || undefined,
      });

      toast.success('Proof uploaded successfully');
      onSuccess?.();
      onClose();
      
      // Reset form
      setFile(null);
      setPreview('');
      setNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload proof');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      onClose();
      // Reset form
      setFile(null);
      setPreview('');
      setNotes('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Delivery Proof</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Delivery ID</Label>
            <div className="text-sm font-mono text-muted-foreground">{deliveryId}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof">Upload Image/Signature</Label>
            <Input
              id="proof"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Upload a photo of the delivery or customer signature
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about the delivery..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={uploading}
              rows={3}
            />
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
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
