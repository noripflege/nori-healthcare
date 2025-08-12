import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if push notifications are supported
    // Note: iOS Safari requires specific conditions for push notifications
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;
    const hasNotification = 'Notification' in window;
    
    // Additional iOS/Safari detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    // iOS Safari only supports push notifications when added to home screen (PWA mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    
    let supported = hasServiceWorker && hasPushManager && hasNotification;
    
    // For iOS/Safari, require standalone mode for push notifications
    if (isIOS || isSafari) {
      supported = supported && isStandalone;
    }
    
    setIsSupported(supported);

    if (supported) {
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const subscribeToPushNotifications = async () => {
    if (!isSupported) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
      
      let message = "Dieser Browser unterstützt keine Push-Benachrichtigungen.";
      
      if ((isIOS || isSafari) && !isStandalone) {
        message = "Für Push-Benachrichtigungen auf iOS/Safari: App zum Homebildschirm hinzufügen (Teilen → Zum Home-Bildschirm).";
      }
      
      toast({
        title: "Nicht unterstützt",
        description: message,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, register service worker if not already registered
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker nicht unterstützt');
      }

      let registration;
      try {
        registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registriert:', registration);
      } catch (error) {
        console.warn('Service Worker bereits registriert oder Fehler:', error);
        registration = await navigator.serviceWorker.ready;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      
      if (permission !== 'granted') {
        toast({
          title: "Berechtigung verweigert",
          description: "Bitte erlauben Sie Benachrichtigungen in den Browser-Einstellungen und laden Sie die Seite neu.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BNm_vWyUfBW-RLCGdHdmDh4YYXxhRUwyPCE9zTmWlKzXO6KDUj5VkJRpkZ9Z-T_LZn2HhF3nqCKYdXeZU5Nz9ks' // VAPID public key
        )
      });

      console.log('Push subscription created:', subscription);

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          subscription: subscription.toJSON()
        })
      });

      if (response.ok) {
        setIsSubscribed(true);
        
        // Test notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nori Pflegeassistenz', {
            body: 'Push-Benachrichtigungen wurden erfolgreich aktiviert!',
            icon: '/icons/nori-logo-clean.png',
            tag: 'welcome'
          });
        }
        
        toast({
          title: "Benachrichtigungen aktiviert",
          description: "Sie erhalten jetzt Push-Benachrichtigungen für wichtige Updates.",
        });
      } else {
        throw new Error('Fehler beim Aktivieren der Benachrichtigungen');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: "Fehler",
        description: "Push-Benachrichtigungen konnten nicht aktiviert werden. Stellen Sie sicher, dass Benachrichtigungen erlaubt sind.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            endpoint: subscription.endpoint
          })
        });
      }

      setIsSubscribed(false);
      toast({
        title: "Benachrichtigungen deaktiviert",
        description: "Sie erhalten keine Push-Benachrichtigungen mehr.",
      });
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: "Fehler",
        description: "Benachrichtigungen konnten nicht deaktiviert werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!isSubscribed) {
      toast({
        title: "Nicht abonniert",
        description: "Aktivieren Sie zuerst Push-Benachrichtigungen.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Test gesendet",
          description: "Test-Benachrichtigung wurde gesendet.",
        });
      } else {
        throw new Error(result.message || 'Fehler beim Senden der Test-Benachrichtigung');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Fehler",
        description: "Test-Benachrichtigung konnte nicht gesendet werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    // Check if it's iOS/Safari that needs PWA mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    
    let description = "Ihr Browser unterstützt keine Push-Benachrichtigungen.";
    
    if ((isIOS || isSafari) && !isStandalone) {
      description = "Für Push-Benachrichtigungen auf iOS/Safari: App zum Homebildschirm hinzufügen (Safari → Teilen → Zum Home-Bildschirm).";
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push-Benachrichtigungen
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push-Benachrichtigungen
        </CardTitle>
        <CardDescription>
          Erhalten Sie sofortige Benachrichtigungen über Genehmigungen und wichtige Updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {isSubscribed ? "Aktiviert" : "Deaktiviert"}
              </span>
              {isSubscribed ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {isSubscribed 
                ? "Sie erhalten Push-Benachrichtigungen" 
                : "Aktivieren Sie Benachrichtigungen für Updates"
              }
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={isSubscribed ? unsubscribeFromPushNotifications : subscribeToPushNotifications}
            disabled={isLoading}
          />
        </div>

        {isSubscribed && (
          <div className="pt-4 border-t">
            <Button
              onClick={sendTestNotification}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Test-Benachrichtigung senden
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Genehmigungen und Ablehnungen von Pflegeberichten</p>
          <p>• Neue Berichte zur Freigabe (nur Pflegeleitung)</p>
          <p>• Wichtige System-Updates</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}