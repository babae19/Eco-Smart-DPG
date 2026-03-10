/**
 * Realtime Notification Initializer
 * Initializes realtime push notification subscriptions
 */

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { initializePushNotifications } from '@/services/pushNotificationService';

export const RealtimeNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Initialize realtime notification subscriptions
  useRealtimeNotifications({
    enableWeatherAlerts: true,
    enableDisasterAlerts: true,
    enableBroadcasts: true
  });

  // Initialize push notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      initializePushNotifications(user.id).then((success) => {
        if (success) {
          console.log('[RealtimeNotificationProvider] Push notifications initialized');
        }
      }).catch((error) => {
        console.error('[RealtimeNotificationProvider] Failed to initialize push notifications:', error);
      });
    }
  }, [isAuthenticated, user?.id]);

  return <>{children}</>;
};

export default RealtimeNotificationProvider;
