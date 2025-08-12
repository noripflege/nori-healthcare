import { CareEntry, Resident, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Pill, FileText, X } from "lucide-react";
import { generatePDF } from "@/lib/pdf-generator";
import { EntryAudioStatus } from "@/components/audio-processing-indicator";

interface EntryCardProps {
  entry: CareEntry & {
    resident?: Resident;
    author?: User;
    approver?: User;
    rejectionComments?: string | null;
  };
  onViewDetails: (entryId: string) => void;
  onApprove?: (entryId: string) => void;
  onReject?: (entryId: string) => void;
  showApprovalActions?: boolean;
}

const statusConfig = {
  draft: { label: "Entwurf", className: "bg-gray-100 text-gray-800" },
  pending: { label: "Zur Freigabe", className: "bg-orange-100 text-orange-800" },
  final: { label: "Final", className: "bg-green-100 text-green-800" },
  rejected: { label: "Abgelehnt", className: "bg-red-100 text-red-800" },
};

export default function EntryCard({ 
  entry, 
  onViewDetails, 
  onApprove, 
  onReject,
  showApprovalActions = false 
}: EntryCardProps) {
  const initials = entry.resident?.name
    ?.split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase() || '??';

  const status = statusConfig[entry.status as keyof typeof statusConfig] || statusConfig.draft;

  const handleViewPDF = () => {
    if (entry.resident && entry.approver) {
      generatePDF(entry, entry.resident, entry.approver);
    }
  };

  return (
    <Card className={`shadow-soft ${entry.status === 'final' ? 'border-l-4 border-green-500' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium text-sm">{initials}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{entry.resident?.name}</h3>
              <p className="text-sm text-gray-500">
                {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('de-DE') : ''} • {entry.author?.name}
                {entry.status === 'final' && entry.approver && (
                  <> • Freigegeben von {entry.approver.name}</>
                )}
              </p>
              {entry.draftJson && entry.status === 'draft' && (
                <div className="mt-1">
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    KI-Entwurf – von Pflegekraft geprüft
                  </Badge>
                </div>
              )}
              {entry.status === 'rejected' && entry.rejectionComments && (
                <div className="mt-1">
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-red-50 text-red-700 border-red-200"
                  >
                    Ablehnung: {String(entry.rejectionComments).substring(0, 50)}...
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge className={status.className}>
              {status.label}
            </Badge>
            <EntryAudioStatus entryId={entry.id} />
          </div>
        </div>
        
        {/* Entry Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Heart className="w-4 h-4 text-red-500 mr-2" />
            Vitalwerte: {entry.content && typeof entry.content === 'object' && (entry.content as any)?.vitalSigns ? 'Erfasst' : 'Nicht erfasst'}
          </div>
          <div className="flex items-center text-gray-600">
            <Pill className="w-4 h-4 text-blue-500 mr-2" />
            Medikation: {entry.content && typeof entry.content === 'object' && (entry.content as any)?.medication?.length ? 'Vollständig' : 'Nicht erfasst'}
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          {/* First row: Details button */}
          <div className="flex">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onViewDetails(entry.id)}
            >
              Details
            </Button>
          </div>
          
          {/* Second row: Approval actions */}
          {showApprovalActions && entry.status === 'pending' && onApprove && (
            <div className="flex space-x-3">
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm"
                onClick={() => onApprove(entry.id)}
              >
                Freigeben
              </Button>
              {onReject && (
                <Button
                  variant="destructive"
                  className="flex-1 text-sm"
                  onClick={() => onReject(entry.id)}
                >
                  <X className="w-4 h-4 mr-1" />
                  Ablehnen
                </Button>
              )}
            </div>
          )}
          
          {entry.status === 'final' && (
            <Button
              className="flex-1"
              onClick={handleViewPDF}
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF anzeigen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
