import { supabase } from '@/integrations/supabase/client';
import { detectMobileCapabilities } from './mobile/mobileCapabilities';
import { 
  detectMobilePushCapabilities, 
  requestMobilePushPermission, 
  sendMobileTestNotification,
  sendMobileAlert,
  getMobileSetupInstructions 
} from './mobile/mobilePushNotificationService';

export interface NotificationPreferences {
  id?: string;
  user_id: string;
  push_notifications: boolean;
  sms_alerts: boolean;
  email_notifications: boolean;
  weather_alerts: boolean;
  disaster_alerts: boolean;
}

// Get user's notification preferences
export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences | null> => {
  try {
    if (!userId) {
      console.warn('[PushNotificationService] No user ID provided');
      return null;
    }

    console.info(`[PushNotificationService] Fetching preferences for user: ${userId}`);

    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[PushNotificationService] Error fetching preferences:', error);
      return null;
    }

    console.info(`[PushNotificationService] Successfully fetched preferences for user: ${userId}`);
    return data ? {
      ...data,
      weather_alerts: data.weather_alerts ?? true,
      disaster_alerts: data.disaster_alerts ?? true
    } : null;
  } catch (error) {
    console.error('[PushNotificationService] Error in getNotificationPreferences:', error);
    return null;
  }
};

// Update or create user's notification preferences
export const updateNotificationPreferences = async (preferences: NotificationPreferences): Promise<boolean> => {
  try {
    console.info(`[PushNotificationService] Updating preferences for user: ${preferences.user_id}`);

    const { error } = await supabase
      .from('user_notification_preferences')
      .upsert(preferences, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('[PushNotificationService] Error updating preferences:', error);
      return false;
    }

    console.info(`[PushNotificationService] Successfully updated preferences for user: ${preferences.user_id}`);
    return true;
  } catch (error) {
    console.error('[PushNotificationService] Error in updateNotificationPreferences:', error);
    return false;
  }
};

// Check if push notifications are supported
export const isPushNotificationSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Get current permission status
export const getCurrentPermissionStatus = (): NotificationPermission => {
  if (!isPushNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
};

// Check if permissions are blocked and provide instructions
export const isPermissionBlocked = (): boolean => {
  return getCurrentPermissionStatus() === 'denied';
};

// Get mobile-specific setup instructions
export const getMobileInstructions = getMobileSetupInstructions;

// Check if device is mobile
export const isMobileDevice = (): boolean => {
  const capabilities = detectMobileCapabilities();
  return capabilities.isMobile;
};

// Get permission status with user-friendly message including mobile context
export const getPermissionStatusMessage = (): string => {
  if (!isPushNotificationSupported()) {
    return "Not supported in this browser";
  }
  
  const permission = getCurrentPermissionStatus();
  const mobileCapabilities = detectMobileCapabilities();
  
  switch (permission) {
    case 'granted':
      return "Allowed";
    case 'denied':
      if (mobileCapabilities.isMobile) {
        return mobileCapabilities.isIOS 
          ? "Blocked - Check iOS Settings or add to home screen"
          : "Blocked - Check browser notification settings";
      }
      return "Blocked - Please allow in browser settings";
    case 'default':
      return mobileCapabilities.isMobile ? "Tap to enable notifications" : "Not requested yet";
    default:
      return "Unknown";
  }
};

// Request push notification permission with mobile optimization
export const requestPushPermission = async (): Promise<NotificationPermission> => {
  if (!isPushNotificationSupported()) {
    console.warn('[PushNotificationService] Push notifications not supported');
    return 'denied';
  }

  const mobileCapabilities = detectMobileCapabilities();
  
  try {
    // Use mobile-optimized permission request for mobile devices
    if (mobileCapabilities.isMobile) {
      const result = await requestMobilePushPermission();
      return result.permission;
    }
    
    // Standard permission request for desktop
    const permission = await Notification.requestPermission();
    console.info(`[PushNotificationService] Permission result: ${permission}`);
    return permission;
  } catch (error) {
    console.error('[PushNotificationService] Error requesting permission:', error);
    return 'denied';
  }
};

// Send a test push notification with mobile optimization
export const sendTestNotification = (title: string, body: string, options?: NotificationOptions): void => {
  try {
    if (!isPushNotificationSupported()) {
      console.warn('[PushNotificationService] Push notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn(`[PushNotificationService] Push notification permission not granted: ${Notification.permission}`);
      return;
    }

    const mobileCapabilities = detectMobileCapabilities();
    
    // Use mobile-optimized notification for mobile devices
    if (mobileCapabilities.isMobile) {
      const result = sendMobileTestNotification(title, body);
      console.info(`[PushNotificationService] Mobile notification result: ${result.message}`);
      return;
    }

    console.info(`[PushNotificationService] Sending desktop notification: ${title}`);
    
    // Try service worker first for persistent notifications
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.info('[PushNotificationService] Using service worker for notification');
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: {
          title,
          body,
          options: {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'test-notification',
            requireInteraction: false,
            silent: false,
            vibrate: [200, 100, 200],
            data: {
              timestamp: Date.now(),
              type: 'test'
            },
            ...options
          }
        }
      });
    } else {
      // Fallback to direct notification
      console.info('[PushNotificationService] Using direct notification (fallback)');
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        ...options
      });

      // Add event listeners for debugging
      notification.onclick = () => {
        console.info('[PushNotificationService] Notification clicked');
        notification.close();
      };

      notification.onerror = (error) => {
        console.error('[PushNotificationService] Notification error:', error);
      };

      notification.onshow = () => {
        console.info('[PushNotificationService] Notification shown');
      };

      notification.onclose = () => {
        console.info('[PushNotificationService] Notification closed');
      };
    }

  } catch (error) {
    console.error('[PushNotificationService] Error creating notification:', error);
  }
};

// Enhanced weather advisory push notification with mobile optimization
export const sendWeatherAdvisoryNotification = async (
  userId: string,
  title: string,
  description: string,
  severity: 'high' | 'medium' | 'low'
): Promise<void> => {
  try {
    console.info(`[PushNotificationService] Attempting to send notification for user: ${userId}, title: ${title}, severity: ${severity}`);
    
    // Check if user has push notifications enabled
    const preferences = await getNotificationPreferences(userId);
    
    if (!preferences) {
      console.warn(`[PushNotificationService] No preferences found for user: ${userId}`);
      return;
    }
    
    if (!preferences.push_notifications) {
      console.info(`[PushNotificationService] Push notifications disabled for user: ${userId}`);
      return;
    }
    
    if (!preferences.weather_alerts) {
      console.info(`[PushNotificationService] Weather alerts disabled for user: ${userId}`);
      return;
    }

    if (!isPushNotificationSupported()) {
      console.warn('[PushNotificationService] Push notifications not supported on this device');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn(`[PushNotificationService] Notification permission not granted: ${Notification.permission}`);
      return;
    }

    const mobileCapabilities = detectMobileCapabilities();
    
    // Use mobile-optimized notifications for mobile devices
    if (mobileCapabilities.isMobile) {
      const result = sendMobileAlert(title, description, severity, 'weather');
      console.info(`[PushNotificationService] Mobile weather alert result: ${result.message}`);
    } else {
      // Desktop notification fallback
      const icon = severity === 'high' ? '🚨' : severity === 'medium' ? '⚠️' : '📢';
      sendTestNotification(
        `${icon} ${title}`,
        description,
        {
          tag: 'weather-advisory',
          requireInteraction: severity === 'high',
          silent: false,
          data: {
            userId,
            severity,
            timestamp: Date.now(),
            type: 'weather'
          }
        }
      );
    }

    console.info(`[PushNotificationService] Weather advisory notification sent successfully to user: ${userId}`);
  } catch (error) {
    console.error('[PushNotificationService] Error sending weather advisory notification:', error);
  }
};

// Enhanced disaster alert push notification
export const sendDisasterAlertNotification = async (
  userId: string,
  title: string,
  description: string,
  severity: 'high' | 'medium' | 'low'
): Promise<void> => {
  try {
    console.info(`[PushNotificationService] Attempting to send disaster alert for user: ${userId}, title: ${title}, severity: ${severity}`);
    
    // Check if user has push notifications enabled
    const preferences = await getNotificationPreferences(userId);
    
    if (!preferences) {
      console.warn(`[PushNotificationService] No preferences found for user: ${userId}`);
      return;
    }
    
    if (!preferences.push_notifications) {
      console.info(`[PushNotificationService] Push notifications disabled for user: ${userId}`);
      return;
    }
    
    if (!preferences.disaster_alerts) {
      console.info(`[PushNotificationService] Disaster alerts disabled for user: ${userId}`);
      return;
    }

    if (!isPushNotificationSupported()) {
      console.warn('[PushNotificationService] Push notifications not supported on this device');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn(`[PushNotificationService] Notification permission not granted: ${Notification.permission}`);
      return;
    }

    const mobileCapabilities = detectMobileCapabilities();
    
    // Use mobile-optimized notifications for mobile devices
    if (mobileCapabilities.isMobile) {
      const result = sendMobileAlert(title, description, severity, 'disaster');
      console.info(`[PushNotificationService] Mobile disaster alert result: ${result.message}`);
    } else {
      // Desktop notification fallback
      const icon = '🚨'; // Always use high urgency icon for disasters
      sendTestNotification(
        `${icon} DISASTER ALERT: ${title}`,
        description,
        {
          tag: 'disaster-alert',
          requireInteraction: true, // Always require interaction for disaster alerts
          silent: false,
          data: {
            userId,
            severity,
            timestamp: Date.now(),
            type: 'disaster'
          }
        }
      );
    }

    console.info(`[PushNotificationService] Disaster alert notification sent successfully to user: ${userId}`);
  } catch (error) {
    console.error('[PushNotificationService] Error sending disaster alert notification:', error);
  }
};

// Initialize push notifications for a user
export const initializePushNotifications = async (userId: string): Promise<boolean> => {
  try {
    if (!isPushNotificationSupported()) {
      console.warn('[PushNotificationService] Push notifications not supported');
      return false;
    }

    // Request permission if not already granted
    if (Notification.permission === 'default') {
      const permission = await requestPushPermission();
      if (permission !== 'granted') {
        console.warn('[PushNotificationService] Push notification permission denied');
        return false;
      }
    }

    // Check if permission is granted
    if (Notification.permission !== 'granted') {
      console.warn('[PushNotificationService] Push notification permission not granted');
      return false;
    }

    // Register service worker for persistent notifications
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });
        
        console.info('[PushNotificationService] Service Worker registered successfully');
        await navigator.serviceWorker.ready;
      } catch (swError) {
        console.error('[PushNotificationService] Service Worker registration failed:', swError);
        // Continue without service worker - basic notifications will still work
      }
    }

    // Get or create user preferences
    let preferences = await getNotificationPreferences(userId);
    if (!preferences) {
      preferences = {
        user_id: userId,
        push_notifications: true,
        sms_alerts: false,
        email_notifications: true,
        weather_alerts: true,
        disaster_alerts: true
      };
      await updateNotificationPreferences(preferences);
    }

    console.info(`[PushNotificationService] Push notifications initialized for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('[PushNotificationService] Error initializing push notifications:', error);
    return false;
  }
};