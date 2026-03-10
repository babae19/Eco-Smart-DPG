
import { useState, useEffect, useCallback, useRef } from 'react';
import { checkProximityToDisasterProneAreas, GeoFenceStatus } from '@/services/disaster/geoProximityService';

interface UseProximityAlertsProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  enabled: boolean;
}

export const useProximityAlerts = ({
  latitude,
  longitude,
  accuracy,
  enabled
}: UseProximityAlertsProps) => {
  const [geoFenceStatus, setGeoFenceStatus] = useState<GeoFenceStatus | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  
  const lastLocationRef = useRef<string>('');
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkProximity = useCallback(() => {
    if (!enabled || !latitude || !longitude) return;

    const locationKey = `${latitude.toFixed(3)}-${longitude.toFixed(3)}`;
    
    // Skip if location hasn't changed significantly
    if (lastLocationRef.current === locationKey) {
      return;
    }

    try {
      console.log('[Proximity Alerts] Checking proximity for:', {
        lat: latitude.toFixed(4),
        lng: longitude.toFixed(4),
        accuracy: accuracy?.toFixed(0) + 'm'
      });

      const status = checkProximityToDisasterProneAreas(
        latitude,
        longitude,
        accuracy || 50
      );

      // Only update if status has changed meaningfully
      const hasChanged = !geoFenceStatus || 
        geoFenceStatus.insideProneArea !== status.insideProneArea ||
        geoFenceStatus.currentRiskLevel !== status.currentRiskLevel ||
        geoFenceStatus.nearestProneArea?.id !== status.nearestProneArea?.id;

      if (hasChanged) {
        console.log('[Proximity Alerts] Status updated:', {
          insideArea: status.insideProneArea,
          riskLevel: status.currentRiskLevel,
          nearestArea: status.nearestProneArea?.name,
          alertsCount: status.proximityAlerts.length
        });

        setGeoFenceStatus(status);
        setLastCheckTime(new Date());
        lastLocationRef.current = locationKey;
      }
    } catch (error) {
      console.error('[Proximity Alerts] Error checking proximity:', error);
    }
  }, [latitude, longitude, accuracy, enabled, geoFenceStatus]);

  // Debounced proximity checking
  useEffect(() => {
    if (!enabled) return;

    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    checkTimeoutRef.current = setTimeout(() => {
      checkProximity();
    }, 2000);

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [latitude, longitude, enabled, checkProximity]);

  return {
    geoFenceStatus,
    lastCheckTime,
    refreshProximity: checkProximity
  };
};
