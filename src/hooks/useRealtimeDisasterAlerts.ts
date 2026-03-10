import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationQueue } from '@/hooks/useNotificationQueue';

interface DisasterAlert {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  probability: number;
  timeframe: string;
  precautions: string[];
  created_at: string;
  expires_at: string;
  weather_data: import('@/types/SupabaseTypes').WeatherData | null;
  is_active: boolean;
}

interface UseRealtimeDisasterAlertsProps {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export const useRealtimeDisasterAlerts = ({
  latitude,
  longitude,
  radiusKm = 50
}: UseRealtimeDisasterAlertsProps = {}) => {
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { addToQueue } = useNotificationQueue();

  // Fetch existing alerts from database
  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('disaster_alerts')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('[Realtime Alerts] Fetched alerts:', data?.length || 0);
      
      // Transform the data to match our interface
      const typedAlerts: DisasterAlert[] = (data || []).map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity as 'high' | 'medium' | 'low',
        title: alert.title,
        description: alert.description,
        location: alert.location,
        coordinates: alert.coordinates as { latitude: number; longitude: number },
        probability: alert.probability,
        timeframe: alert.timeframe,
        precautions: alert.precautions,
        created_at: alert.created_at,
        expires_at: alert.expires_at,
        weather_data: (alert.weather_data as unknown) as import('@/types/SupabaseTypes').WeatherData | null,
        is_active: alert.is_active
      }));
      
      setAlerts(typedAlerts);
    } catch (error) {
      console.error('[Realtime Alerts] Error fetching alerts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch alerts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger real-time disaster analysis
  const triggerAnalysis = useCallback(async () => {
    if (!latitude || !longitude || isAnalyzing) {
      console.log('[Realtime Alerts] Skipping analysis - missing coordinates or already analyzing');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      
      console.log('[Realtime Alerts] Starting disaster analysis for:', { latitude, longitude });

      const { data, error } = await supabase.functions.invoke('realtime-disaster-analysis', {
        body: {
          coordinates: { latitude, longitude },
          userId: user?.id
        }
      });

      if (error) throw error;

      console.log('[Realtime Alerts] Analysis complete:', data);
      setLastAnalysis(new Date());

      // Queue notifications for new high-severity alerts
      if (data?.alerts) {
        const highSeverityAlerts = data.alerts.filter((alert: DisasterAlert) => alert.severity === 'high');
        if (highSeverityAlerts.length > 0) {
          addToQueue({
            type: 'both',
            severity: 'high',
            title: `🚨 ${highSeverityAlerts.length} Critical Alert${highSeverityAlerts.length > 1 ? 's' : ''}`,
            description: `New disaster risks detected in your area`,
            pushType: 'disaster'
          });
        }
      }

    } catch (error) {
      console.error('[Realtime Alerts] Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      
      addToQueue({
        type: 'toast',
        severity: 'high',
        title: "Analysis Error",
        description: "Failed to analyze disaster risks. Please try again."
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [latitude, longitude, user?.id, isAnalyzing, addToQueue]);

  // Set up realtime subscription
  useEffect(() => {
    console.log('[Realtime Alerts] Setting up realtime subscription');
    
    const channel = supabase
      .channel('disaster-alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'disaster_alerts'
        },
        (payload) => {
          console.log('[Realtime Alerts] New alert received:', payload.new);
          
          // Transform the realtime data to match our interface
          const rawAlert = payload.new;
          const newAlert: DisasterAlert = {
            id: rawAlert.id,
            type: rawAlert.type,
            severity: rawAlert.severity as 'high' | 'medium' | 'low',
            title: rawAlert.title,
            description: rawAlert.description,
            location: rawAlert.location,
            coordinates: rawAlert.coordinates as { latitude: number; longitude: number },
            probability: rawAlert.probability,
            timeframe: rawAlert.timeframe,
            precautions: rawAlert.precautions,
            created_at: rawAlert.created_at,
            expires_at: rawAlert.expires_at,
            weather_data: (rawAlert.weather_data as unknown) as import('@/types/SupabaseTypes').WeatherData | null,
            is_active: rawAlert.is_active
          };
          
          // Add new alert to the list
          setAlerts(prevAlerts => [newAlert, ...prevAlerts]);

          // Queue notification for high severity alerts (with rate limiting)
          if (newAlert.severity === 'high') {
            addToQueue({
              type: 'both',
              severity: newAlert.severity,
              title: newAlert.title,
              description: `${newAlert.description.substring(0, 100)}${newAlert.description.length > 100 ? '...' : ''}`,
              pushType: 'disaster'
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'disaster_alerts'
        },
        (payload) => {
          console.log('[Realtime Alerts] Alert updated:', payload.new);
          
          // Transform the realtime data to match our interface
          const rawAlert = payload.new;
          const updatedAlert: DisasterAlert = {
            id: rawAlert.id,
            type: rawAlert.type,
            severity: rawAlert.severity as 'high' | 'medium' | 'low',
            title: rawAlert.title,
            description: rawAlert.description,
            location: rawAlert.location,
            coordinates: rawAlert.coordinates as { latitude: number; longitude: number },
            probability: rawAlert.probability,
            timeframe: rawAlert.timeframe,
            precautions: rawAlert.precautions,
            created_at: rawAlert.created_at,
            expires_at: rawAlert.expires_at,
            weather_data: (rawAlert.weather_data as unknown) as import('@/types/SupabaseTypes').WeatherData | null,
            is_active: rawAlert.is_active
          };
          
          setAlerts(prevAlerts =>
            prevAlerts.map(alert =>
              alert.id === updatedAlert.id ? updatedAlert : alert
            )
          );
        }
      )
      .subscribe();

    return () => {
      console.log('[Realtime Alerts] Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [addToQueue]);

  // Initial fetch
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Set up automatic analysis every minute when location is available
  useEffect(() => {
    if (!latitude || !longitude) return;

    // Check if we should skip analysis (if recently analyzed)
    const now = Date.now();
    if (lastAnalysis && (now - lastAnalysis.getTime()) < 55000) {
      console.log('[Realtime Alerts] Skipping setup - analysis performed recently');
      return;
    }

    console.log('[Realtime Alerts] Setting up automatic analysis timer');
    
    // Initial analysis with a small delay to prevent rapid successive calls
    const initialTimeout = setTimeout(() => {
      triggerAnalysis();
    }, 1000);

    // Set up interval for every minute
    const interval = setInterval(() => {
      const currentTime = Date.now();
      // Only trigger if last analysis was more than 55 seconds ago
      if (!lastAnalysis || (currentTime - lastAnalysis.getTime()) >= 55000) {
        console.log('[Realtime Alerts] Auto-triggering analysis');
        triggerAnalysis();
      } else {
        console.log('[Realtime Alerts] Skipping analysis - too recent');
      }
    }, 60000); // 60 seconds

    return () => {
      console.log('[Realtime Alerts] Cleaning up analysis timer');
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [latitude, longitude, triggerAnalysis, lastAnalysis]);

  // Filter alerts by location if coordinates provided
  const localAlerts = alerts.filter(alert => {
    if (!latitude || !longitude || !alert.coordinates) return true;
    
    const distance = calculateDistance(
      latitude,
      longitude,
      alert.coordinates.latitude,
      alert.coordinates.longitude
    );
    
    return distance <= radiusKm;
  });

  const criticalAlerts = localAlerts.filter(alert => alert.severity === 'high');
  const activeAlertsCount = localAlerts.length;

  return {
    alerts: localAlerts,
    criticalAlerts,
    activeAlertsCount,
    isLoading,
    isAnalyzing,
    lastAnalysis,
    error,
    triggerAnalysis,
    refetch: fetchAlerts
  };
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}