import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { XCircle } from 'lucide-react';

interface RejectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  entryId: string;
  residentName?: string;
}

export function RejectionDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  entryId, 
  residentName 
}: RejectionDialogProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rejectionReason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(rejectionReason.trim());
      setRejectionReason('');
      onClose();
    } catch (error) {
      console.error('Error rejecting entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRejectionReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Pflegebericht ablehnen
          </DialogTitle>
          <DialogDescription>
            {residentName 
              ? `Pflegebericht für ${residentName} ablehnen`
              : 'Pflegebericht ablehnen'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">
              Grund für die Ablehnung *
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Bitte geben Sie einen detaillierten Grund für die Ablehnung an..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Dieser Kommentar wird der Pflegekraft angezeigt, damit sie den Bericht entsprechend überarbeiten kann.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!rejectionReason.trim() || isSubmitting}
          >
            {isSubmitting ? 'Wird abgelehnt...' : 'Bericht ablehnen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}