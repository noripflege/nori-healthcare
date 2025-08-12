import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Clock, Database, RefreshCw } from "lucide-react";
import { offlineManager } from "@/lib/offline-manager";

interface ConnectionStatus {
  isOnline: boolean;
  pendingActions: number;
  lastSyncAttempt: number | null;
}

export function OfflineIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    pendingActions: 0,
    lastSyncAttempt: null
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Initial check with real network test
    const checkInitialStatus = async () => {
      const reallyOnline = await offlineManager.checkRealNetworkStatus();
      setStatus({
        isOnline: reallyOnline,
        pendingActions: offlineManager.getConnectionStatus().pendingActions,
        lastSyncAttempt: offlineManager.getConnectionStatus().lastSyncAttempt
      });
    };
    
    checkInitialStatus();

    // Listen for connection changes
    const handleConnectionChange = (event: CustomEvent) => {
      setStatus(offlineManager.getConnectionStatus());
    };

    window.addEventListener('connectionStatus', handleConnectionChange as EventListener);
    window.addEventListener('online', handleConnectionChange as EventListener);
    window.addEventListener('offline', handleConnectionChange as EventListener);

    // Update status every 15 seconds with real network check
    const interval = setInterval(async () => {
      const reallyOnline = await offlineManager.checkRealNetworkStatus();
      setStatus({
        isOnline: reallyOnline,
        pendingActions: offlineManager.getConnectionStatus().pendingActions,
        lastSyncAttempt: offlineManager.getConnectionStatus().lastSyncAttempt
      });
    }, 15000);

    return () => {
      window.removeEventListener('connectionStatus', handleConnectionChange as EventListener);
      window.removeEventListener('online', handleConnectionChange as EventListener);
      window.removeEventListener('offline', handleConnectionChange as EventListener);
      clearInterval(interval);
    };
  }, []);

  const handleForceSync = async () => {
    try {
      await offlineManager.forcSync();
      setStatus(offlineManager.getConnectionStatus());
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  };

  if (status.isOnline && status.pendingActions === 0) {
    return (
      <Badge 
        variant="outline" 
        className="bg-green-50 text-green-700 border-green-200 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <Wifi className="h-3 w-3 mr-1" />
        Online
      </Badge>
    );
  }

  return (
    <div className="space-y-2">
      {/* Main Indicator */}
      <Badge 
        variant={status.isOnline ? "secondary" : "destructive"}
        className={`cursor-pointer ${
          status.isOnline 
            ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
            : "bg-red-50 text-red-700 border-red-200"
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {status.isOnline ? (
          <>
            <Database className="h-3 w-3 mr-1" />
            {status.pendingActions} ausstehend
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </>
        )}
      </Badge>

      {/* Detailed Status */}
      {showDetails && (
        <Alert className={status.isOnline ? "border-yellow-200" : "border-red-200"}>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <AlertDescription>
                <strong>Status:</strong> {status.isOnline ? "Online" : "Offline"}
              </AlertDescription>
              
              {status.pendingActions > 0 && (
                <AlertDescription>
                  <strong>Ausstehende Aktionen:</strong> {status.pendingActions}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    Werden automatisch synchronisiert sobald eine Verbindung besteht
                  </span>
                </AlertDescription>
              )}

              {!status.isOnline && (
                <AlertDescription>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Database className="h-3 w-3" />
                    Alle Daten werden lokal gespeichert
                  </div>
                </AlertDescription>
              )}
            </div>

            {status.isOnline && status.pendingActions > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceSync}
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Sync
              </Button>
            )}
          </div>
        </Alert>
      )}
    </div>
  );
}