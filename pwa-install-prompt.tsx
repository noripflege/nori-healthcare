import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Smartphone } from "lucide-react";

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

export function PWAInstallPrompt({ onInstall, onDismiss }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if already dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      if (dismissedTime > oneDayAgo) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      onInstall?.();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstall]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`PWA install prompt outcome: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('PWA install failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    onDismiss?.();
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border border-blue-200 bg-blue-50 shadow-lg md:left-auto md:right-4 md:w-96">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-blue-900 text-sm">
              Nori als App installieren
            </h3>
            <p className="text-blue-700 text-xs mt-1 leading-relaxed">
              Installieren Sie Nori auf Ihrem Gerät für schnelleren Zugriff und bessere Performance.
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Installieren
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 h-8 px-3 text-xs"
              >
                Später
              </Button>
            </div>
          </div>
          
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-6 w-6 p-0 text-blue-400 hover:text-blue-600 hover:bg-blue-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook to check if app is installed
export function useIsPWAInstalled() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }, []);

  return isInstalled;
}