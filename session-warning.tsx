import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle } from "lucide-react";
import { sessionManager } from "@/lib/session-manager";

export function SessionWarning() {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    sessionManager.setCallbacks({
      onWarning: (seconds) => {
        setTimeLeft(seconds);
        setShowWarning(true);
      },
      onLogout: () => {
        setShowWarning(false);
        // Logout is handled by sessionManager
      },
      onAutosave: () => {
        // Trigger autosave for current form data
        const event = new CustomEvent('autosave');
        window.dispatchEvent(event);
      }
    });

    return () => {
      sessionManager.cleanup();
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStayActive = () => {
    setShowWarning(false);
    setTimeLeft(null);
    sessionManager.resetSession();
  };

  if (!showWarning || timeLeft === null) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <Alert variant="destructive" className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-3">
            <div>
              <strong>Automatischer Logout in:</strong>
              <div className="text-xl font-mono font-bold text-red-600 mt-1">
                {formatTime(timeLeft)}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Sie werden aus Sicherheitsgründen automatisch abgemeldet.
            </div>

            <Button 
              onClick={handleStayActive}
              className="w-full"
              variant="outline"
            >
              <Clock className="h-4 w-4 mr-2" />
              Weiter arbeiten
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Small persistent indicator in header/footer
export function SessionIndicator() {
  const [timeUntilWarning, setTimeUntilWarning] = useState<number>(18 * 60); // 18 minutes until warning
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      // This is a simplified version - in reality, you'd track actual session time
      setTimeUntilWarning(prev => {
        const newTime = prev - 60;
        setIsVisible(newTime <= 5 * 60); // Show when 5 minutes or less
        return Math.max(0, newTime);
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return null;
  }

  const formatMinutes = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} Min`;
  };

  return (
    <div className="text-xs text-muted-foreground flex items-center gap-1">
      <Clock className="h-3 w-3" />
      Auto-Logout in: {formatMinutes(timeUntilWarning)}
    </div>
  );
}