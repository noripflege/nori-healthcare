// Cross-browser compatibility checker for Nori App
// Ensures ALL features work on Chrome, Safari iOS, Android, iPad, PC Desktop

export interface BrowserCompatibility {
  audioRecording: boolean;
  mediaRecorder: boolean;
  webAudio: boolean;
  touchSupport: boolean;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browserName: string;
  supportedFormats: string[];
  warnings: string[];
}

export function checkBrowserCompatibility(): BrowserCompatibility {
  const userAgent = navigator.userAgent.toLowerCase();
  const warnings: string[] = [];
  
  // Device detection
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?=.*tablet)|tablet/i.test(userAgent);
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
  
  // Browser detection
  let browserName = 'unknown';
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) browserName = 'chrome';
  else if (userAgent.includes('safari') && !userAgent.includes('chrome')) browserName = 'safari';
  else if (userAgent.includes('firefox')) browserName = 'firefox';
  else if (userAgent.includes('edg')) browserName = 'edge';
  
  // Core feature checks
  const audioRecording = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const mediaRecorder = typeof MediaRecorder !== 'undefined';
  const webAudio = typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined';
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Format support detection
  const supportedFormats: string[] = [];
  if (typeof MediaRecorder !== 'undefined') {
    // Test common formats
    const formats = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/mp4',
      'audio/wav',
      'audio/ogg;codecs=opus'
    ];
    
    formats.forEach(format => {
      try {
        if (MediaRecorder.isTypeSupported(format)) {
          supportedFormats.push(format);
        }
      } catch (e) {
        // Ignore errors for format checking
      }
    });
  }
  
  // Generate warnings for potential issues
  if (!audioRecording) {
    warnings.push('Mikrofon-Zugriff nicht verfügbar. HTTPS erforderlich.');
  }
  
  if (!mediaRecorder) {
    warnings.push('Audio-Aufnahme nicht unterstützt in diesem Browser.');
  }
  
  if (browserName === 'safari' && deviceType === 'mobile') {
    warnings.push('iOS Safari: Nach Aufnahme kurz warten bevor neue Aufnahme.');
  }
  
  if (supportedFormats.length === 0) {
    warnings.push('Keine unterstützten Audio-Formate gefunden.');
  }
  
  // Android specific checks
  if (userAgent.includes('android')) {
    const androidVersion = userAgent.match(/android\s([0-9\.]*)/i)?.[1];
    if (androidVersion && parseFloat(androidVersion) < 7) {
      warnings.push('Android Version zu alt. Mindestens Android 7 empfohlen.');
    }
  }
  
  // iOS specific checks  
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    const iosVersion = userAgent.match(/os\s([0-9\_]*)/i)?.[1];
    if (iosVersion) {
      const version = parseFloat(iosVersion.replace('_', '.'));
      if (version < 14) {
        warnings.push('iOS Version zu alt. Mindestens iOS 14 empfohlen.');
      }
    }
  }
  
  return {
    audioRecording,
    mediaRecorder,
    webAudio,
    touchSupport,
    deviceType,
    browserName,
    supportedFormats,
    warnings
  };
}

export function getOptimalAudioFormat(): { mimeType: string; extension: string } {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Safari (iOS/macOS) works best with MP4/AAC
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return {
      mimeType: 'audio/mp4;codecs=mp4a.40.2',
      extension: '.m4a'
    };
  }
  
  // Chrome/Firefox/Edge work well with WebM
  return {
    mimeType: 'audio/webm;codecs=opus',
    extension: '.webm'
  };
}

// Legacy compatibility function
export function performCrossBrowserCheck() {
  return initializeBrowserCheck();
}

// Initialize compatibility check on app load
export function initializeBrowserCheck() {
  const compat = checkBrowserCompatibility();
  
  const result = {
    browser: compat.browserName,
    device: compat.deviceType,
    audioSupport: compat.audioRecording && compat.mediaRecorder,
    formats: compat.supportedFormats,
    warnings: compat.warnings
  };
  
  console.log('🔍 Browser Compatibility Check:', result);
  
  // Store results for debugging
  (window as any).__noriCompat = compat;
  
  // Show critical warnings to user
  if (compat.warnings.length > 0) {
    console.warn('⚠️ Browser Warnings:', compat.warnings);
  }
  
  return result;
}