
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  checkProximityToDisasterProneAreas, 
  ProximityAlert,
  GeoFenceStatus 
} from '@/services/disaster/geoProximityService';

interface UseProximityMonitoringProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  hasLocation: boolean;
  onProximityChange?: (status: GeoFenceStatus) => void;
}

export const useProximityMonitoring = ({
  latitude,
  longitude,
  accuracy,
  hasLocation,
  onProximityChange
}: UseProximityMonitoringProps) => {
  const [geoFenceStatus, setGeoFenceStatus] = useState<GeoFenceStatus | null>(null);
  const [lastProximityCheck, setLastProximityCheck] = useState<Date | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<string>('');
  const lastCheckTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  const checkProximity = useCallback(() => {
    if (!hasLocation || !latitude || !longitude || !isMountedRef.current) return;

    // Rate limiting: don't check more than once every 30 seconds
    const now = Date.now();
    if (now - lastCheckTimeRef.current < 30000) {
      return;
    }

    try {
      // Create location key with reduced precision to avoid micro-movement triggers
      const locationKey = `${latitude.toFixed(2)}-${longitude.toFixed(2)}`;
      
      // Skip if location hasn't changed significantly (within ~1km)
      if (lastLocationRef.current === locationKey) {
        return;
      }

      console.log('[Proximity Monitoring] Checking proximity for location:', { 
        latitude: latitude.toFixed(4), 
        longitude: longitude.toFixed(4), 
        accuracy: accuracy?.toFixed(0),
        locationKey 
      });
      
      lastCheckTimeRef.current = now;
      const status = checkProximityToDisasterProneAreas(latitude, longitude, accuracy || 50);
      
      if (!isMountedRef.current) return;
      
      // Create a safe status object without circular references
      const safeStatus: GeoFenceStatus = {
        insideProneArea: status.insideProneArea,
        nearestProneArea: status.nearestProneArea ? {
          id: status.nearestProneArea.id,
          name: status.nearestProneArea.name,
          coordinates: status.nearestProneArea.coordinates,
          risks: Array.isArray(status.nearestProneArea.risks) ? [...status.nearestProneArea.risks] : [],
          vulnerabilityLevel: status.nearestProneArea.vulnerabilityLevel,
          distance: status.nearestProneArea.distance,
          description: status.nearestProneArea.description || '',
          safetyTips: Array.isArray(status.nearestProneArea.safetyTips) ? [...status.nearestProneArea.safetyTips] : []
        } : null,
        proximityAlerts: status.proximityAlerts?.map((alert: ProximityAlert) => ({
          areaId: alert.areaId,
          areaName: alert.areaName,
          distance: alert.distance,
          riskLevel: alert.riskLevel,
          risks: Array.isArray(alert.risks) ? [...alert.risks] : [],
          urgency: alert.urgency,
          recommendedActions: Array.isArray(alert.recommendedActions) ? [...alert.recommendedActions] : [],
          estimatedArrivalTime: alert.estimatedArrivalTime
        })) || [],
        currentRiskLevel: status.currentRiskLevel
      };
      
      // Check if status has meaningfully changed
      const hasChanged = !geoFenceStatus || 
        geoFenceStatus.insideProneArea !== safeStatus.insideProneArea ||
        geoFenceStatus.currentRiskLevel !== safeStatus.currentRiskLevel ||
        geoFenceStatus.nearestProneArea?.id !== safeStatus.nearestProneArea?.id;

      if (hasChanged) {
        console.log('[Proximity Monitoring] Status change detected:', {
          insideProneArea: safeStatus.insideProneArea,
          currentRiskLevel: safeStatus.currentRiskLevel,
          nearestArea: safeStatus.nearestProneArea?.name,
          alertsCount: safeStatus.proximityAlerts.length
        });

        setGeoFenceStatus(safeStatus);
        setLastProximityCheck(new Date());
        lastLocationRef.current = locationKey;
        
        if (onProximityChange) {
          onProximityChange(safeStatus);
        }
      }
    } catch (error) {
      console.error('[Proximity Monitoring] Error checking proximity:', error);
    }
  }, [latitude, longitude, accuracy, hasLocation, geoFenceStatus, onProximityChange]);

  // Debounced proximity checking with longer delay
  useEffect(() => {
    isMountedRef.current = true;
    
    if (hasLocation && latitude && longitude) {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Set new timeout for debounced check with longer delay
      debounceTimeoutRef.current = setTimeout(() => {
        checkProximity();
      }, 5000); // Increased to 5 seconds debounce
    }
    
    return () => {
      isMountedRef.current = false;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [latitude, longitude, hasLocation, checkProximity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    geoFenceStatus,
    lastProximityCheck,
    refreshProximity: checkProximity
  };
};
