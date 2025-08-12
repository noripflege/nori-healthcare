/**
 * Comprehensive Device Detection System
 * Detects device type, OS, browser and optimizes the app accordingly
 */
import { useState, useEffect } from 'react';

export interface DeviceInfo {
  // Device Type
  deviceType: 'desktop' | 'tablet' | 'mobile';
  
  // Operating System
  os: 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown';
  
  // Browser
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown';
  
  // Platform specific
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  
  // PWA Support
  isPWASupported: boolean;
  isStandalone: boolean;
  canInstallPWA: boolean;
  
  // Features Support
  features: {
    pushNotifications: boolean;
    serviceWorker: boolean;
    webShare: boolean;
    touchSupport: boolean;
    orientationSupport: boolean;
    cameraSupport: boolean;
    audioSupport: boolean;
    geolocationSupport: boolean;
    vibrationSupport: boolean;
  };
  
  // Screen info
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
    orientation: 'portrait' | 'landscape';
  };
}

class DeviceDetector {
  private deviceInfo: DeviceInfo;
  
  constructor() {
    this.deviceInfo = this.detectDevice();
    this.setupDynamicUpdates();
  }
  
  private detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform?.toLowerCase() || '';
    
    // Device Type Detection
    const deviceType = this.detectDeviceType(userAgent);
    
    // OS Detection
    const os = this.detectOS(userAgent, platform);
    
    // Browser Detection
    const browser = this.detectBrowser(userAgent);
    
    // Platform flags
    const isIOS = /ipad|iphone|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = deviceType === 'mobile' || deviceType === 'tablet';
    const isDesktop = deviceType === 'desktop';
    
    // PWA Support
    const isPWASupported = 'serviceWorker' in navigator && 'PushManager' in window;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    const canInstallPWA = isPWASupported && !isStandalone;
    
    // Features Support
    const features = this.detectFeatures(isIOS, isAndroid, browser, isStandalone);
    
    // Screen Info
    const screen = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait') as 'portrait' | 'landscape'
    };
    
    return {
      deviceType,
      os,
      browser,
      isIOS,
      isAndroid,
      isMobile,
      isDesktop,
      isPWASupported,
      isStandalone,
      canInstallPWA,
      features,
      screen
    };
  }
  
  private detectDeviceType(userAgent: string): DeviceInfo['deviceType'] {
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android.*mobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }
  
  private detectOS(userAgent: string, platform: string): DeviceInfo['os'] {
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
    if (/android/i.test(userAgent)) return 'android';
    if (/win/i.test(platform)) return 'windows';
    if (/mac/i.test(platform)) return 'macos';
    if (/linux/i.test(platform)) return 'linux';
    return 'unknown';
  }
  
  private detectBrowser(userAgent: string): DeviceInfo['browser'] {
    if (/edg/i.test(userAgent)) return 'edge';
    if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) return 'chrome';
    if (/firefox/i.test(userAgent)) return 'firefox';
    if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'safari';
    if (/opera/i.test(userAgent)) return 'opera';
    return 'unknown';
  }
  
  private detectFeatures(isIOS: boolean, isAndroid: boolean, browser: DeviceInfo['browser'], isStandalone: boolean): DeviceInfo['features'] {
    // Push Notifications Support
    let pushNotifications = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    
    // iOS/Safari requires PWA mode for push notifications
    if ((isIOS || browser === 'safari') && !isStandalone) {
      pushNotifications = false;
    }
    
    return {
      pushNotifications,
      serviceWorker: 'serviceWorker' in navigator,
      webShare: 'share' in navigator,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      orientationSupport: 'orientation' in window || 'onorientationchange' in window,
      cameraSupport: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      audioSupport: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      geolocationSupport: 'geolocation' in navigator,
      vibrationSupport: 'vibrate' in navigator
    };
  }
  
  private setupDynamicUpdates() {
    // Update screen info on resize/orientation change
    const updateScreenInfo = () => {
      this.deviceInfo.screen = {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1,
        orientation: (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait') as 'portrait' | 'landscape'
      };
      
      // Trigger device info update event
      window.dispatchEvent(new CustomEvent('deviceInfoUpdated', { 
        detail: this.deviceInfo 
      }));
    };
    
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);
    
    // Listen for PWA install events
    window.addEventListener('appinstalled', () => {
      this.deviceInfo.isStandalone = true;
      this.deviceInfo.canInstallPWA = false;
      // Recheck features after PWA install
      this.deviceInfo.features = this.detectFeatures(
        this.deviceInfo.isIOS, 
        this.deviceInfo.isAndroid, 
        this.deviceInfo.browser, 
        true
      );
      
      window.dispatchEvent(new CustomEvent('deviceInfoUpdated', { 
        detail: this.deviceInfo 
      }));
    });
  }
  
  public getDeviceInfo(): DeviceInfo {
    return this.deviceInfo;
  }
  
  public getOptimizedConfig() {
    const info = this.deviceInfo;
    
    return {
      // UI Optimizations
      ui: {
        useTouchFriendlyControls: info.features.touchSupport,
        useBottomNavigation: info.isMobile,
        showPWAInstallPrompt: info.canInstallPWA,
        enableSwipeGestures: info.isMobile && info.features.touchSupport,
        useLargerClickTargets: info.isMobile,
      },
      
      // Feature Availability
      features: {
        enablePushNotifications: info.features.pushNotifications,
        enableWebShare: info.features.webShare,
        enableVibration: info.features.vibrationSupport && info.isMobile,
        enableGeolocation: info.features.geolocationSupport,
        enableCameraCapture: info.features.cameraSupport && info.isMobile,
      },
      
      // Performance Optimizations
      performance: {
        useVirtualization: info.isDesktop,
        limitAnimations: info.deviceType === 'mobile' && info.screen.pixelRatio < 2,
        preloadImages: info.isDesktop,
        enableLazyLoading: info.isMobile,
      },
      
      // Layout Adaptations
      layout: {
        columnCount: info.isDesktop ? 3 : (info.deviceType === 'tablet' ? 2 : 1),
        sidebarPosition: info.isDesktop ? 'left' : 'bottom',
        modalFullscreen: info.isMobile,
        useAccordions: info.isMobile,
      }
    };
  }
  
  public log() {
    console.log('🔍 Device Detection Results:', {
      device: `${this.deviceInfo.deviceType} (${this.deviceInfo.os})`,
      browser: this.deviceInfo.browser,
      screen: `${this.deviceInfo.screen.width}x${this.deviceInfo.screen.height}`,
      pwa: {
        supported: this.deviceInfo.isPWASupported,
        standalone: this.deviceInfo.isStandalone,
        canInstall: this.deviceInfo.canInstallPWA
      },
      features: this.deviceInfo.features
    });
  }
}

// Singleton instance
export const deviceDetector = new DeviceDetector();

// Hook for React components
export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState(deviceDetector.getDeviceInfo());
  
  useEffect(() => {
    const handleDeviceUpdate = (event: CustomEvent) => {
      setDeviceInfo(event.detail);
    };
    
    window.addEventListener('deviceInfoUpdated', handleDeviceUpdate as EventListener);
    
    return () => {
      window.removeEventListener('deviceInfoUpdated', handleDeviceUpdate as EventListener);
    };
  }, []);
  
  return deviceInfo;
}

// Utility functions
export function isMobileDevice(): boolean {
  return deviceDetector.getDeviceInfo().isMobile;
}

export function isIOSDevice(): boolean {
  return deviceDetector.getDeviceInfo().isIOS;
}

export function canUsePushNotifications(): boolean {
  return deviceDetector.getDeviceInfo().features.pushNotifications;
}

export function shouldShowPWAPrompt(): boolean {
  return deviceDetector.getDeviceInfo().canInstallPWA;
}