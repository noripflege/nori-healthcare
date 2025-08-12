import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, Brain, Loader2, CheckCircle, Clock } from "lucide-react";
import { offlineAudioManager } from "@/lib/offline-audio-manager";

interface AudioStatus {
  pending: number;
  total: number;
  isProcessing: boolean;
}

export function AudioProcessingIndicator() {
  const [status, setStatus] = useState<AudioStatus>({
    pending: 0,
    total: 0,
    isProcessing: false
  });
  const [recentlyProcessed, setRecentlyProcessed] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Update status regularly
    const updateStatus = () => {
      setStatus(offlineAudioManager.getAudioStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    // Listen for processed audio
    const handleAudioProcessed = (event: CustomEvent) => {
      const { audioId } = event.detail;
      setRecentlyProcessed(prev => [audioId, ...prev.slice(0, 4)]); // Keep last 5
      updateStatus();
      
      // Clear recent notification after 10 seconds
      setTimeout(() => {
        setRecentlyProcessed(prev => prev.filter(id => id !== audioId));
      }, 10000);
    };

    // Listen for connection changes
    const handleConnectionChange = () => {
      updateStatus();
    };

    window.addEventListener('audioProcessed', handleAudioProcessed as EventListener);
    window.addEventListener('connectionStatus', handleConnectionChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('audioProcessed', handleAudioProcessed as EventListener);
      window.removeEventListener('connectionStatus', handleConnectionChange);
    };
  }, []);

  // Don't show if no audio to process
  if (status.pending === 0 && recentlyProcessed.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Main Indicator */}
      <Badge 
        variant="secondary"
        className={`cursor-pointer transition-colors ${
          status.isProcessing 
            ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse" 
            : status.pending > 0
            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
            : "bg-green-50 text-green-700 border-green-200"
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {status.isProcessing ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            KI verarbeitet...
          </>
        ) : status.pending > 0 ? (
          <>
            <Clock className="h-3 w-3 mr-1" />
            {status.pending} Audio warten
          </>
        ) : (
          <>
            <CheckCircle className="h-3 w-3 mr-1" />
            Alles verarbeitet
          </>
        )}
      </Badge>

      {/* Recent Processing Notifications */}
      {recentlyProcessed.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <Brain className="h-4 w-4" />
          <AlertDescription>
            <div className="text-sm">
              <strong>KI-Verarbeitung abgeschlossen!</strong>
              <br />
              Ihre Spracheingaben wurden automatisch in die Pflegeeinträge übernommen.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Status */}
      {showDetails && status.pending > 0 && (
        <Alert className="border-blue-200">
          <Mic className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div>
                <strong>Audio-Verarbeitung:</strong>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {status.pending} Aufnahmen warten auf KI-Verarbeitung
                <br />
                {status.isProcessing 
                  ? "Wird gerade automatisch verarbeitet..." 
                  : "Wird verarbeitet sobald Internet verfügbar ist"
                }
              </div>

              <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                💡 <strong>Hinweis:</strong> Ihre Spracheingaben werden automatisch im Hintergrund verarbeitet. 
                Die Pflegeeinträge werden automatisch mit den erkannten Informationen befüllt.
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Small indicator for entry cards that have pending audio
export function EntryAudioStatus({ entryId }: { entryId: string }) {
  const [hasPendingAudio, setHasPendingAudio] = useState(false);
  const [wasProcessed, setWasProcessed] = useState(false);

  useEffect(() => {
    // Check if this entry has pending audio
    const checkStatus = () => {
      const status = offlineAudioManager.getAudioStatus();
      // This is a simplified check - in a real implementation, 
      // you'd track which entries have pending audio
      setHasPendingAudio(status.pending > 0);
    };

    checkStatus();

    // Listen for processing completion
    const handleAudioProcessed = (event: CustomEvent) => {
      if (event.detail.entryId === entryId) {
        setHasPendingAudio(false);
        setWasProcessed(true);
        setTimeout(() => setWasProcessed(false), 5000); // Clear after 5 seconds
      }
    };

    window.addEventListener('audioProcessed', handleAudioProcessed as EventListener);
    
    return () => {
      window.removeEventListener('audioProcessed', handleAudioProcessed as EventListener);
    };
  }, [entryId]);

  if (wasProcessed) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Brain className="h-3 w-3 mr-1" />
        KI verarbeitet
      </Badge>
    );
  }

  if (hasPendingAudio) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        Audio wartet
      </Badge>
    );
  }

  return null;
}