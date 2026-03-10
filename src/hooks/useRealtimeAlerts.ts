
import { useEffect, useRef, useCallback } from 'react';
import { Alert } from '@/types/AlertTypes';
import { useAuth } from '@/contexts/AuthContext';
import { sendWeatherAdvisoryNotification, sendDisasterAlertNotification } from '@/services/pushNotificationService';
import { createNotification } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseRealtimeAlertsProps {
  latitude?: number;
  longitude?: number;
  addAlert: (alert: Alert) => void;
  updateHighestAlert: (alert: Alert) => void;
}

interface AlertData {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  type: 'weather' | 'disaster' | 'emergency';
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
}

export const useRealtimeAlerts = ({
  latitude,
  longitude,
  addAlert,
  updateHighestAlert
}: UseRealtimeAlertsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(0);

  // Process incoming alert and send appropriate notifications
  const processAlert = useCallback(async (alertData: AlertData) => {
    if (!user?.id) return;

    try {
      console.info('[RealtimeAlerts] Processing alert:', alertData);

      // Check if alert is relevant to user's location (within 20km)
      let isRelevant = true;
      if (latitude && longitude && alertData.coordinates) {
        const distance = calculateDistance(
          latitude, longitude,
          alertData.coordinates.latitude, alertData.coordinates.longitude
        );
        isRelevant = distance <= 20; // 20km radius
        console.info(`[RealtimeAlerts] Alert distance: ${distance.toFixed(2)}km, relevant: ${isRelevant}`);
      }

      if (!isRelevant) {
        console.info('[RealtimeAlerts] Alert not relevant to user location');
        return;
      }

      // Convert to Alert type and add to UI
      const uiAlert: Alert = {
        id: alertData.id,
        title: alertData.title,
        description: alertData.description,
        severity: alertData.severity,
        location: alertData.location || 'Your Location',
        date: new Date().toISOString(),
        isNew: true,
        type: alertData.type,
        isPersonalized: true,
        coordinates: alertData.coordinates
      };

      addAlert(uiAlert);
      updateHighestAlert(uiAlert);

      // Create database notification
      await createNotification(
        user.id,
        alertData.title,
        alertData.description,
        `${alertData.type}_alert`
      );

      // Send mobile-optimized push notification
      if (alertData.type === 'disaster' || alertData.severity === 'high') {
        await sendDisasterAlertNotification(
          user.id,
          alertData.title,
          alertData.description,
          alertData.severity
        );
      } else {
        await sendWeatherAdvisoryNotification(
          user.id,
          alertData.title,
          alertData.description,
          alertData.severity
        );
      }

      // Show immediate toast for high severity alerts
      if (alertData.severity === 'high') {
        toast({
          title: `🚨 ${alertData.title}`,
          description: alertData.description,
          variant: "destructive",
        });
      }

      console.info('[RealtimeAlerts] Alert processed successfully');
    } catch (error) {
      console.error('[RealtimeAlerts] Error processing alert:', error);
    }
  }, [user?.id, latitude, longitude, toast, addAlert, updateHighestAlert]);

  // Utility function to calculate distance between coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (!latitude || !longitude || !user?.id) return;

    console.info('[RealtimeAlerts] Setting up real-time alert channels');

    // Subscribe to disaster alerts broadcast
    const disasterChannel = supabase
      .channel('disaster_alerts_realtime')
      .on('broadcast', { event: 'new_disaster_alert' }, (payload) => {
        console.info('[RealtimeAlerts] Received disaster alert:', payload);
        processAlert({
          ...payload.payload,
          type: 'disaster'
        });
      })
      .subscribe();

    // Subscribe to weather alerts broadcast
    const weatherChannel = supabase
      .channel('weather_alerts_realtime')
      .on('broadcast', { event: 'new_weather_alert' }, (payload) => {
        console.info('[RealtimeAlerts] Received weather alert:', payload);
        processAlert({
          ...payload.payload,
          type: 'weather'
        });
      })
      .subscribe();

    // Subscribe to emergency alerts broadcast
    const emergencyChannel = supabase
      .channel('emergency_alerts_realtime')
      .on('broadcast', { event: 'new_emergency_alert' }, (payload) => {
        console.info('[RealtimeAlerts] Received emergency alert:', payload);
        processAlert({
          ...payload.payload,
          type: 'emergency',
          severity: 'high' // Emergency alerts are always high severity
        });
      })
      .subscribe();

    // Set up periodic weather monitoring with real alerts
    const monitorWeather = async () => {
      try {
        // Check current weather conditions and generate alerts if needed
        const { data: weatherData, error } = await supabase.functions.invoke('weather', {
          body: { latitude, longitude }
        });

        if (error) throw error;

        // Check for critical weather conditions
        if (weatherData?.current?.temperature > 38) {
          await processAlert({
            id: `heat-${Date.now()}`,
            title: 'Extreme Heat Warning',
            description: `Temperature has reached ${weatherData.current.temperature.toFixed(1)}°C. Take immediate precautions.`,
            severity: 'high',
            type: 'weather',
            timestamp: Date.now(),
            coordinates: { latitude, longitude }
          });
        }

        if (weatherData?.current?.precipitation > 30) {
          await processAlert({
            id: `rain-${Date.now()}`,
            title: 'Heavy Rainfall Alert',
            description: `Heavy rainfall detected (${weatherData.current.precipitation.toFixed(1)}mm). Flood risk elevated.`,
            severity: 'high',
            type: 'weather',
            timestamp: Date.now(),
            coordinates: { latitude, longitude }
          });
        }
      } catch (error) {
        console.error('[RealtimeAlerts] Error monitoring weather:', error);
      }
    };

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Monitor weather every 5 minutes
    intervalRef.current = setInterval(monitorWeather, 5 * 60 * 1000);
    
    // Initial weather check
    monitorWeather();

    return () => {
      console.info('[RealtimeAlerts] Cleaning up alert channels');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      supabase.removeChannel(disasterChannel);
      supabase.removeChannel(weatherChannel);
      supabase.removeChannel(emergencyChannel);
    };
  }, [latitude, longitude, user?.id]); // Remove callback functions from deps to prevent frequent recreations

  // Manual alert broadcast for testing
  const broadcastTestAlert = useCallback(async (type: 'weather' | 'disaster' | 'emergency') => {
    if (!user?.id) return;

    const testAlert: AlertData = {
      id: `test-${Date.now()}`,
      title: `Test ${type.charAt(0).toUpperCase() + type.slice(1)} Alert`,
      description: `This is a test ${type} alert to verify real-time mobile notifications are working perfectly.`,
      severity: type === 'emergency' ? 'high' : 'medium',
      type,
      timestamp: Date.now(),
      coordinates: latitude && longitude ? { latitude, longitude } : undefined
    };

    // Process the alert locally
    await processAlert(testAlert);

    console.info(`[RealtimeAlerts] Test ${type} alert processed`);
  }, [user?.id, latitude, longitude, processAlert]);

  return {
    broadcastTestAlert
  };
};
