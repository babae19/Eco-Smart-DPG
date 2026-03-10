import { useEffect, useRef, useCallback, useState } from 'react';
import { useUserLocation } from '@/contexts/LocationContext';
import { calculateHaversineDistance } from '@/utils/geoUtils';
import { safeZones, historicalDisasters } from '@/components/maps/data/evacuationRoutes';
import { allDisasterProneAreas } from '@/components/home/disaster-prone-areas/data';
import { toast } from 'sonner';

interface ProximityNotification {
  id: string;
  type: 'disaster_zone' | 'safe_zone' | 'historical_event';
  title: string;
  message: string;
  distance: number;
  severity: 'info' | 'warning' | 'danger';
  timestamp: Date;
}

interface UseProximityNotificationsOptions {
  enabled?: boolean;
  alertRadiusKm?: number;
  notificationCooldownMs?: number;
}

export const useProximityNotifications = (options: UseProximityNotificationsOptions = {}) => {
  const {
    enabled = true,
    alertRadiusKm = 2,
    notificationCooldownMs = 300000 // 5 minutes cooldown
  } = options;

  const { latitude, longitude } = useUserLocation();
  const lastNotificationRef = useRef<Map<string, number>>(new Map());
  const lastLocationRef = useRef<string>('');
  const [recentNotifications, setRecentNotifications] = useState<ProximityNotification[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Send browser notification
  const sendBrowserNotification = useCallback((title: string, body: string, icon?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          tag: `proximity-${Date.now()}`,
          requireInteraction: false,
          silent: false
        });
      } catch (error) {
        console.error('[ProximityNotifications] Failed to send notification:', error);
      }
    }
  }, []);

  // Check proximity and send notifications
  const checkProximity = useCallback(() => {
    if (!enabled || !latitude || !longitude) return;

    const locationKey = `${latitude.toFixed(4)}-${longitude.toFixed(4)}`;
    
    // Skip if location hasn't changed significantly
    if (lastLocationRef.current === locationKey) {
      return;
    }
    lastLocationRef.current = locationKey;

    const now = Date.now();
    const newNotifications: ProximityNotification[] = [];

    // Check disaster-prone areas
    allDisasterProneAreas.forEach(area => {
      const distance = calculateHaversineDistance(
        latitude,
        longitude,
        area.coordinates.latitude,
        area.coordinates.longitude
      );

      if (distance <= alertRadiusKm) {
        const lastNotified = lastNotificationRef.current.get(`area-${area.id}`);
        
        if (!lastNotified || now - lastNotified > notificationCooldownMs) {
          const severity = area.vulnerabilityLevel === 'critical' || area.vulnerabilityLevel === 'high' 
            ? 'danger' 
            : area.vulnerabilityLevel === 'medium' ? 'warning' : 'info';

          const notification: ProximityNotification = {
            id: `area-${area.id}-${now}`,
            type: 'disaster_zone',
            title: `⚠️ Entering ${area.vulnerabilityLevel.toUpperCase()} Risk Zone`,
            message: `You are ${distance < 0.5 ? 'very close to' : 'near'} ${area.name}. ${area.risks[0]}`,
            distance,
            severity,
            timestamp: new Date()
          };

          newNotifications.push(notification);
          lastNotificationRef.current.set(`area-${area.id}`, now);

          // Show toast notification
          if (severity === 'danger') {
            toast.error(notification.title, {
              description: notification.message,
              duration: 8000
            });
            sendBrowserNotification(notification.title, notification.message, '🚨');
          } else if (severity === 'warning') {
            toast.warning(notification.title, {
              description: notification.message,
              duration: 6000
            });
          } else {
            toast.info(notification.title, {
              description: notification.message,
              duration: 4000
            });
          }
        }
      }
    });

    // Check nearby safe zones (helpful notification)
    const nearbySafeZones = safeZones
      .map(zone => ({
        ...zone,
        distance: calculateHaversineDistance(latitude, longitude, zone.coordinates.lat, zone.coordinates.lng)
      }))
      .filter(zone => zone.distance <= 1)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 1);

    nearbySafeZones.forEach(zone => {
      const lastNotified = lastNotificationRef.current.get(`safe-${zone.id}`);
      
      if (!lastNotified || now - lastNotified > notificationCooldownMs * 2) {
        const notification: ProximityNotification = {
          id: `safe-${zone.id}-${now}`,
          type: 'safe_zone',
          title: `✅ Safe Zone Nearby`,
          message: `${zone.name} is ${(zone.distance * 1000).toFixed(0)}m away. Capacity: ${zone.capacity.toLocaleString()}`,
          distance: zone.distance,
          severity: 'info',
          timestamp: new Date()
        };

        newNotifications.push(notification);
        lastNotificationRef.current.set(`safe-${zone.id}`, now);

        toast.success(notification.title, {
          description: notification.message,
          duration: 4000
        });
      }
    });

    // Update recent notifications
    if (newNotifications.length > 0) {
      setRecentNotifications(prev => [...newNotifications, ...prev].slice(0, 10));
    }

  }, [enabled, latitude, longitude, alertRadiusKm, notificationCooldownMs, sendBrowserNotification]);

  // Effect to check proximity when location changes
  useEffect(() => {
    const timeout = setTimeout(checkProximity, 1000);
    return () => clearTimeout(timeout);
  }, [checkProximity]);

  return {
    recentNotifications,
    notificationPermission,
    requestNotificationPermission,
    checkProximity,
    clearNotifications: () => setRecentNotifications([])
  };
};
