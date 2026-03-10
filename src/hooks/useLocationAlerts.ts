
import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from '@/types/AlertTypes';
import { generatePersonalizedAlerts } from '@/services/predictiveAlertService';

export const useLocationAlerts = (latitude?: number, longitude?: number) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [highestAlert, setHighestAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const lastLocationRef = useRef<string>('');
  const isMountedRef = useRef(true);

  const generateAlerts = useCallback(async () => {
    if (latitude == null || longitude == null || !isMountedRef.current) {
      setLoading(false);
      return;
    }

    const locationKey = `${Math.round((latitude ?? 0) * 100)}-${Math.round((longitude ?? 0) * 100)}`;
    
    // Skip if location hasn't changed significantly
    if (lastLocationRef.current === locationKey) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Generate location-based alerts
      const locationAlerts = generatePersonalizedAlerts(latitude, longitude);
      
      if (isMountedRef.current) {
        setAlerts(locationAlerts);
        
        if (locationAlerts.length === 0) {
          setHighestAlert(null);
        } else {
          const severityOrder = { high: 3, medium: 2, low: 1 } as const;
          const highest = locationAlerts.reduce((prev, current) => {
            const prevScore = severityOrder[prev.severity as keyof typeof severityOrder] || 0;
            const currentScore = severityOrder[current.severity as keyof typeof severityOrder] || 0;
            return currentScore > prevScore ? current : prev;
          }, locationAlerts[0]);
          setHighestAlert(highest);
        }
        lastLocationRef.current = locationKey;
      }
    } catch (error) {
      console.error('[Location Alerts] Error generating alerts:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [latitude, longitude]);

  useEffect(() => {
    isMountedRef.current = true;
    generateAlerts();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [generateAlerts]);

  return {
    alerts,
    highestAlert,
    loading,
    setAlerts,
    setHighestAlert
  };
};
