
import { useState, useEffect, useCallback } from 'react';
import { useSimplifiedMobileLocation } from './useSimplifiedMobileLocation';
import { checkProximityToDisasterProneAreas, type GeoFenceStatus } from '@/services/disaster/geoProximityService';
import { Alert } from '@/types/AlertTypes';

export const useSimplifiedHyperLocalAlerts = () => {
  const [hyperLocalAlerts, setHyperLocalAlerts] = useState<Alert[]>([]);
  const [geoFenceStatus, setGeoFenceStatus] = useState<GeoFenceStatus | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAlertCheck, setLastAlertCheck] = useState<Date | null>(null);

  const {
    latitude,
    longitude,
    accuracy,
    hasLocation,
    isLoading: locationLoading,
    error: locationError,
    refreshLocation,
    lastUpdateTime,
    isMobile
  } = useSimplifiedMobileLocation();

  const generateHyperLocalAlerts = useCallback(async () => {
    if (!hasLocation || !latitude || !longitude) {
      console.log('[Hyper Local] No location available for alerts');
      return;
    }

    // Prevent duplicate analysis
    if (isAnalyzing) {
      console.log('[Hyper Local] Analysis already in progress');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('[Hyper Local] Generating alerts for location:', {
        lat: latitude.toFixed(6),
        lng: longitude.toFixed(6),
        accuracy: accuracy ? `${accuracy.toFixed(1)}m` : 'unknown',
        device: isMobile ? 'Mobile' : 'Desktop'
      });

      // Check proximity to disaster-prone areas with error handling
      let proximityStatus: GeoFenceStatus;
      
      try {
        proximityStatus = checkProximityToDisasterProneAreas(
          latitude,
          longitude,
          accuracy || 100
        );
      } catch (error) {
        console.error('[Hyper Local] Error checking proximity:', error);
        // Fallback to safe status
        proximityStatus = {
          insideProneArea: false,
          nearestProneArea: null,
          proximityAlerts: [],
          currentRiskLevel: 'safe'
        };
      }

      setGeoFenceStatus(proximityStatus);

      // Generate alerts based on proximity
      const alerts: Alert[] = [];

      if (proximityStatus.insideProneArea && proximityStatus.nearestProneArea) {
        alerts.push({
          id: `proximity-${proximityStatus.nearestProneArea.id}`,
          title: '⚠️ Disaster-Prone Area Alert',
          description: `You are currently in ${proximityStatus.nearestProneArea.name}, which has known risks for ${proximityStatus.nearestProneArea.risks.join(', ')}.`,
          severity: proximityStatus.nearestProneArea.vulnerabilityLevel === 'critical' ? 'high' : 'medium',
          location: proximityStatus.nearestProneArea.name,
          date: new Date().toISOString(),
          isPersonalized: true,
          source: 'hyper_local',
          aiPredictionScore: 0.9,
          isNew: false,
          type: 'general'
        });
      }

      // Add proximity alerts for nearby areas with better error handling
      proximityStatus.proximityAlerts.forEach((alert, index) => {
        try {
          const distance = alert.distance * 1000; // Convert to meters
          if (!isNaN(distance) && distance > 0) {
            alerts.push({
              id: `nearby-${alert.areaId}-${index}`,
              title: `📍 Nearby Risk Area`,
              description: `${alert.areaName} is ${distance.toFixed(0)}m away. Known risks: ${alert.risks.join(', ')}.`,
              severity: alert.urgency === 'high' ? 'high' : alert.urgency === 'medium' ? 'medium' : 'low',
              location: alert.areaName,
              date: new Date().toISOString(),
              isPersonalized: true,
              source: 'proximity',
              aiPredictionScore: 0.8,
              isNew: false,
              type: 'general'
            });
          }
        } catch (error) {
          console.error('[Hyper Local] Error creating proximity alert:', error);
        }
      });

      setHyperLocalAlerts(alerts);
      setLastAlertCheck(new Date());

      console.log('[Hyper Local] Generated', alerts.length, 'hyper-local alerts successfully');
    } catch (error) {
      console.error('[Hyper Local] Error generating alerts:', error);
      // Set empty alerts on error to prevent stale data
      setHyperLocalAlerts([]);
      setGeoFenceStatus({
        insideProneArea: false,
        nearestProneArea: null,
        proximityAlerts: [],
        currentRiskLevel: 'safe'
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [latitude, longitude, accuracy, hasLocation, isMobile, isAnalyzing]);

  // Auto-generate alerts when location updates with debouncing
  useEffect(() => {
    if (!hasLocation || !latitude || !longitude || isAnalyzing) {
      return;
    }

    const shouldGenerate = !lastAlertCheck || 
                          !lastUpdateTime ||
                          (lastUpdateTime.getTime() - lastAlertCheck.getTime() > 30000); // 30 seconds

    if (shouldGenerate) {
      // Debounce to prevent rapid calls
      const timeoutId = setTimeout(() => {
        if (!isAnalyzing) {
          generateHyperLocalAlerts();
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [hasLocation, latitude, longitude, lastUpdateTime]);

  const refreshAlerts = useCallback(async () => {
    console.log('[Hyper Local] Manual refresh triggered');
    try {
      await generateHyperLocalAlerts();
    } catch (error) {
      console.error('[Hyper Local] Manual refresh failed:', error);
    }
  }, [generateHyperLocalAlerts]);

  return {
    // Location data
    latitude,
    longitude,
    accuracy,
    hasLocation,
    locationLoading,
    locationError,
    refreshLocation,
    lastUpdateTime,
    isMobile,
    
    // Alert data
    hyperLocalAlerts,
    geoFenceStatus,
    isAnalyzing,
    refreshAlerts,
    lastAlertCheck,
    
    // Combined loading state
    isLoading: locationLoading || isAnalyzing
  };
};
