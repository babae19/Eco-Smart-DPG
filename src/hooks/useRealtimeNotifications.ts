/**
 * Real-time Notification Hook
 * Handles real-time push notifications with Supabase subscriptions
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  sendWeatherAdvisoryNotification, 
  sendDisasterAlertNotification,
  isPushNotificationSupported,
  getCurrentPermissionStatus 
} from '@/services/pushNotificationService';

interface RealtimeNotificationOptions {
  enableWeatherAlerts?: boolean;
  enableDisasterAlerts?: boolean;
  enableBroadcasts?: boolean;
}

export const useRealtimeNotifications = (options: RealtimeNotificationOptions = {}) => {
  const { user } = useAuth();
  const {
    enableWeatherAlerts = true,
    enableDisasterAlerts = true,
    enableBroadcasts = true
  } = options;

  const subscribedRef = useRef(false);

  // Send notification based on type
  const sendNotification = useCallback(async (
    title: string,
    description: string,
    type: 'weather' | 'disaster' | 'broadcast',
    severity: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    if (!user?.id) return;
    if (!isPushNotificationSupported()) return;
    if (getCurrentPermissionStatus() !== 'granted') return;

    try {
      if (type === 'weather') {
        await sendWeatherAdvisoryNotification(user.id, title, description, severity);
      } else if (type === 'disaster') {
        await sendDisasterAlertNotification(user.id, title, description, severity);
      } else {
        // Broadcast notification
        await sendWeatherAdvisoryNotification(user.id, title, description, severity);
      }
      console.log(`[RealtimeNotifications] Sent ${type} notification: ${title}`);
    } catch (error) {
      console.error(`[RealtimeNotifications] Failed to send ${type} notification:`, error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || subscribedRef.current) return;

    console.log('[RealtimeNotifications] Setting up real-time subscriptions');
    subscribedRef.current = true;

    const channels: any[] = [];

    // Subscribe to user-specific notifications
    const userNotificationsChannel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          const notification = payload.new as any;
          console.log('[RealtimeNotifications] New user notification:', notification);
          
          const severity = notification.type === 'danger' ? 'high' : 
                          notification.type === 'warning' ? 'medium' : 'low';
          
          await sendNotification(
            notification.title,
            notification.description,
            notification.type.includes('disaster') ? 'disaster' : 'weather',
            severity
          );
        }
      )
      .subscribe();
    
    channels.push(userNotificationsChannel);

    // Subscribe to broadcast notifications
    if (enableBroadcasts) {
      const broadcastChannel = supabase
        .channel('broadcast-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'broadcast_notifications'
          },
          async (payload) => {
            const notification = payload.new as any;
            if (!notification.is_active) return;
            
            console.log('[RealtimeNotifications] New broadcast:', notification);
            
            const severity = notification.priority === 'high' ? 'high' : 
                            notification.priority === 'medium' ? 'medium' : 'low';
            
            await sendNotification(
              notification.title,
              notification.description,
              'broadcast',
              severity
            );
          }
        )
        .subscribe();
      
      channels.push(broadcastChannel);
    }

    // Subscribe to disaster alerts
    if (enableDisasterAlerts) {
      const disasterChannel = supabase
        .channel('disaster-alerts-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'disaster_alerts'
          },
          async (payload) => {
            const alert = payload.new as any;
            if (!alert.is_active) return;
            
            console.log('[RealtimeNotifications] New disaster alert:', alert);
            
            const severity = alert.severity === 'critical' || alert.severity === 'high' ? 'high' : 
                            alert.severity === 'medium' ? 'medium' : 'low';
            
            await sendNotification(
              `⚠️ ${alert.title}`,
              alert.description,
              'disaster',
              severity
            );
          }
        )
        .subscribe();
      
      channels.push(disasterChannel);
    }

    // Cleanup subscriptions on unmount
    return () => {
      console.log('[RealtimeNotifications] Cleaning up subscriptions');
      subscribedRef.current = false;
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [user?.id, enableWeatherAlerts, enableDisasterAlerts, enableBroadcasts, sendNotification]);

  return {
    sendNotification
  };
};
