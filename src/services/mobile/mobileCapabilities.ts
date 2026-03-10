// Mobile device detection and capabilities
export interface MobileCapabilities {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isPWA: boolean;
  supportsNotifications: boolean;
  supportsVibration: boolean;
  supportsWakeLock: boolean;
  browserName: string;
  screenSize: string;
  isInApp: boolean;
  platform: string;
}

export const detectMobileCapabilities = (): MobileCapabilities => {
  const userAgent = navigator.userAgent || '';
  const platform = navigator.platform || '';
  
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /Mobile|Tablet/.test(userAgent);
  
  // Check if running as PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true ||
                document.referrer.includes('android-app://');
  
  // Check notification support
  const supportsNotifications = 'Notification' in window && 'serviceWorker' in navigator;
  
  // Check vibration support
  const supportsVibration = 'vibrate' in navigator;
  
  // Check wake lock support
  const supportsWakeLock = 'wakeLock' in navigator;
  
  // Detect browser
  let browserName = 'Unknown';
  if (userAgent.includes('Chrome')) browserName = 'Chrome';
  else if (userAgent.includes('Firefox')) browserName = 'Firefox';
  else if (userAgent.includes('Safari')) browserName = 'Safari';
  else if (userAgent.includes('Edge')) browserName = 'Edge';
  
  // Screen size category
  const screenSize = window.innerWidth < 768 ? 'small' : window.innerWidth < 1024 ? 'medium' : 'large';
  
  // Check if in-app browser
  const isInApp = /Instagram|FBAN|FBAV|Twitter|Line|WhatsApp|LinkedIn/.test(userAgent);

  return {
    isMobile,
    isIOS,
    isAndroid,
    isPWA,
    supportsNotifications,
    supportsVibration,
    supportsWakeLock,
    browserName,
    screenSize,
    isInApp,
    platform
  };
};

// Additional utility functions for missing imports
export const getMobileLocationSettings = () => ({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
  settingsUrl: 'app-settings:',
  instructions: [
    'Go to Settings > Privacy & Security > Location Services',
    'Enable Location Services for your browser',
    'Allow location access for this website'
  ]
});

export const getMobileGeoOptions = () => ({
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 300000
});