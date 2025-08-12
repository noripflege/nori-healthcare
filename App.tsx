import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Residents from "@/pages/residents";
import Recording from "@/pages/recording";
import EntryEditor from "@/pages/entry-editor";
import Review from "@/pages/review";
import Settings from "@/pages/settings";
import AuditLog from "@/pages/audit-log";
import SuperAdmin from "@/pages/super-admin";
import TenantConfig from "@/pages/tenant-config";
import UserManagement from "@/pages/user-management";

import BottomNavigation from "@/components/bottom-navigation";
import NotFound from "@/pages/not-found";
import TermsOfService from "@/pages/terms-of-service";
import Impressum from "@/pages/impressum";
import PrivacyPolicy from "@/pages/privacy-policy";
import UserManual from "@/pages/user-manual";
import AdminManual from "@/pages/admin-manual";
import { OfflineIndicator } from "@/components/offline-indicator";
import { SessionWarning, SessionIndicator } from "@/components/session-warning";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { AudioProcessingIndicator } from "@/components/audio-processing-indicator";
import { HelpButton } from "@/components/help-button";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { deviceDetector, useDeviceInfo } from "@/lib/device-detector";
import { performCrossBrowserCheck } from "@/lib/cross-browser-check";
// Using the existing logo from public folder

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/residents">
        <ProtectedRoute>
          <Residents />
        </ProtectedRoute>
      </Route>
      <Route path="/recording">
        <ProtectedRoute>
          <Recording />
        </ProtectedRoute>
      </Route>
      <Route path="/entries/new">
        <ProtectedRoute>
          <EntryEditor />
        </ProtectedRoute>
      </Route>
      <Route path="/entries/:id">
        <ProtectedRoute>
          <EntryEditor />
        </ProtectedRoute>
      </Route>
      <Route path="/review">
        <ProtectedRoute>
          <Review />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      <Route path="/audit-log">
        <ProtectedRoute>
          <AuditLog />
        </ProtectedRoute>
      </Route>
      <Route path="/super-admin">
        <ProtectedRoute>
          <SuperAdmin />
        </ProtectedRoute>
      </Route>
      <Route path="/tenant-config/:tenantId">
        <ProtectedRoute>
          <TenantConfig />
        </ProtectedRoute>
      </Route>
      <Route path="/user-management">
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      </Route>

      {/* Legal Pages */}
      <Route path="/impressum" component={Impressum} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/user-manual" component={UserManual} />
      <Route path="/admin-manual" component={AdminManual} />
      <Route path="/login" component={Login} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Nori Header Component
function NoriHeader() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  // Fetch tenant data for nursing home name
  const { data: tenant } = useQuery({
    queryKey: ['/api/tenants', user?.tenantId],
    queryFn: async () => {
      if (!user?.tenantId) return null;
      const response = await fetch(`/api/tenants/${user.tenantId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.tenantId,
  });

  if (location === '/login') return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <img 
          src="/icons/nori-logo-clean.png" 
          alt="Nori Logo" 
          className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
        />
        <span className="nori-logo text-lg sm:text-xl font-bold truncate">Nori</span>
      </div>
      {user && (
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="text-xs sm:text-sm text-muted-foreground text-right min-w-0 max-w-[140px] sm:max-w-[220px]">
            <div className="text-sm sm:text-base font-medium truncate">{user.name}</div>
            {tenant && (
              <div className="text-xs sm:text-sm text-gray-500 truncate">
                {tenant.name}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <OfflineIndicator />
            <AudioProcessingIndicator />
            <SessionIndicator />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="ml-1 sm:ml-2 h-6 w-6 sm:h-8 sm:w-8 p-0 sm:px-3 bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm"
              title="Abmelden"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

// Device-aware app initialization
function DeviceAwareApp() {
  const deviceInfo = useDeviceInfo();
  
  useEffect(() => {
    // Initialize device detection and compatibility check
    deviceDetector.log();
    performCrossBrowserCheck();
    
    // Apply device-specific optimizations
    const config = deviceDetector.getOptimizedConfig();
    
    // Store device config globally for components to use
    (window as any).__noriDeviceConfig = config;
    (window as any).__noriDeviceInfo = deviceInfo;
    
    // Apply CSS classes based on device
    const body = document.body;
    body.classList.add(`device-${deviceInfo.deviceType}`);
    body.classList.add(`os-${deviceInfo.os}`);
    body.classList.add(`browser-${deviceInfo.browser}`);
    
    if (deviceInfo.isMobile) {
      body.classList.add('mobile-device');
    }
    
    if (deviceInfo.isStandalone) {
      body.classList.add('pwa-standalone');
    }
    
    // Configure viewport for mobile devices
    if (deviceInfo.isMobile) {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover'
        );
      }
    }
    
  }, [deviceInfo]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <SessionWarning />
      <NoriHeader />
      <Router />
      <BottomNavigation />
      <HelpButton />
      <PWAInstallPrompt />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DeviceAwareApp />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
