import { detectMobileCapabilities } from './mobileCapabilities';

export interface MobileNotificationResult {
  success: boolean;
  message: string;
  permission?: NotificationPermission;
}

export interface MobileInstructions {
  platform: string;
  instructions: string[];
}

// Detect mobile push capabilities
export const detectMobilePushCapabilities = (): MobileNotificationResult => {
  const capabilities = detectMobileCapabilities();
  
  if (!capabilities.isMobile) {
    return {
      success: false,
      message: 'Not a mobile device'
    };
  }
  
  if (!capabilities.supportsNotifications) {
    return {
      success: false,
      message: 'Push notifications not supported on this device'
    };
  }
  
  return {
    success: true,
    message: 'Push notifications supported',
    permission: Notification.permission
  };
};

// Request push permission optimized for mobile
export const requestMobilePushPermission = async (): Promise<MobileNotificationResult> => {
  const capabilities = detectMobileCapabilities();
  
  if (!capabilities.supportsNotifications) {
    return {
      success: false,
      message: 'Notifications not supported'
    };
  }
  
  try {
    // For iOS, especially in Safari, notifications need special handling
    if (capabilities.isIOS && !capabilities.isPWA) {
      // iOS Safari requires user gesture
      const permission = await Notification.requestPermission();
      return {
        success: permission === 'granted',
        message: permission === 'granted' 
          ? 'Notifications enabled successfully' 
          : 'Permission denied. Please enable in Settings > Safari > Notifications',
        permission
      };
    }
    
    // Standard request for other mobile browsers
    const permission = await Notification.requestPermission();
    return {
      success: permission === 'granted',
      message: permission === 'granted' 
        ? 'Notifications enabled successfully'
        : 'Permission was not granted',
      permission
    };
  } catch (error) {
    console.error('[Mobile] Error requesting notification permission:', error);
    return {
      success: false,
      message: 'Failed to request permission'
    };
  }
};

// Send mobile-optimized test notification
export const sendMobileTestNotification = (title: string, body: string): MobileNotificationResult => {
  const capabilities = detectMobileCapabilities();
  
  if (!capabilities.supportsNotifications || Notification.permission !== 'granted') {
    return {
      success: false,
      message: 'Notifications not available'
    };
  }
  
  try {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'mobile-test',
      requireInteraction: false,
      silent: false,
      data: {
        timestamp: Date.now(),
        type: 'mobile-test'
      }
    });
    
    // Trigger vibration separately if supported
    if (capabilities.supportsVibration && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    // Auto-close after 5 seconds for better mobile UX
    setTimeout(() => {
      notification.close();
    }, 5000);
    
    return {
      success: true,
      message: 'Mobile test notification sent'
    };
  } catch (error) {
    console.error('[Mobile] Error sending test notification:', error);
    return {
      success: false,
      message: 'Failed to send notification'
    };
  }
};

// Send mobile-optimized alert
export const sendMobileAlert = (
  title: string, 
  body: string, 
  severity: 'high' | 'medium' | 'low',
  type: 'weather' | 'disaster'
): MobileNotificationResult => {
  const capabilities = detectMobileCapabilities();
  
  if (!capabilities.supportsNotifications || Notification.permission !== 'granted') {
    return {
      success: false,
      message: 'Notifications not available'
    };
  }
  
  try {
    const icon = severity === 'high' ? '🚨' : severity === 'medium' ? '⚠️' : '📢';
    const vibrationPattern = severity === 'high' ? [300, 100, 300, 100, 300] : [200, 100, 200];
    
    const notification = new Notification(`${icon} ${title}`, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `mobile-${type}-alert`,
      requireInteraction: severity === 'high',
      silent: false,
      data: {
        timestamp: Date.now(),
        type: `mobile-${type}`,
        severity
      }
    });
    
    // Trigger vibration separately if supported
    if (capabilities.supportsVibration && 'vibrate' in navigator) {
      navigator.vibrate(vibrationPattern);
    }
    
    // Auto-close for non-critical alerts
    if (severity !== 'high') {
      setTimeout(() => {
        notification.close();
      }, 8000);
    }
    
    return {
      success: true,
      message: `Mobile ${type} alert sent`
    };
  } catch (error) {
    console.error(`[Mobile] Error sending ${type} alert:`, error);
    return {
      success: false,
      message: `Failed to send ${type} alert`
    };
  }
};

// Get mobile-specific setup instructions
export const getMobileSetupInstructions = (): MobileInstructions => {
  const capabilities = detectMobileCapabilities();
  
  if (capabilities.isIOS) {
    return {
      platform: 'iOS',
      instructions: [
        'Open Settings > Safari > Advanced > Website Data',
        'Find this website and enable notifications',
        'Or add this site to your home screen for PWA notifications'
      ]
    };
  }
  
  if (capabilities.isAndroid) {
    return {
      platform: 'Android',
      instructions: [
        'Open your browser settings',
        'Go to Site Settings > Notifications',
        'Allow notifications for this website'
      ]
    };
  }
  
  return {
    platform: 'Mobile',
    instructions: [
      'Check your browser notification settings',
      'Enable notifications for this website',
      'Refresh the page and try again'
    ]
  };
};