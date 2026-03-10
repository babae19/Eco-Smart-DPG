
import { useState, useEffect, useCallback } from 'react';
import { useMobileEnhancedGeolocation } from './useMobileEnhancedGeolocation';
import { useHyperLocalAlerts } from './useHyperLocalAlerts';
import { detectMobileCapabilities } from '@/services/mobile/mobileCapabilities';

export const useMobileHyperLocalAlerts = () => {
  const [isReady, setIsReady] = useState(false);
  const [lastAlertCheck, setLastAlertCheck] = useState<Date | null>(null);
  
  const mobileCapabilities = detectMobileCapabilities();
  
  // Get mobile-optimized location data
  const {
    latitude,
    longitude,
    accuracy,
    isLoading: locationLoading,
    error: locationError,
    hasLocation,
    refreshLocation,
    accuracyQuality,
    lastUpdateTime
  } = useMobileEnhancedGeolocation({
    enableHighAccuracy: true,
    watchPosition: mobileCapabilities.isMobile,
    enableBackgroundTracking: mobileCapabilities.isMobile,
    timeout: mobileCapabilities.isMobile ? 30000 : 15000,
    maximumAge: mobileCapabilities.isMobile ? 5000 : 30000
  });

  // Get hyper-local alerts based on the mobile location
  const {
    hyperLocalAlerts,
    geoFenceStatus,
    isAnalyzing,
    locationAccuracy,
    hasHighAccuracyLocation,
    locationDetails,
    refreshAlerts
  } = useHyperLocalAlerts();

  // Mobile-specific alert refresh logic
  const refreshMobileAlerts = useCallback(async () => {
    if (!hasLocation || !latitude || !longitude) {
      console.log('[Mobile Hyper-Local] No location available for alert refresh');
      return;
    }

    // For mobile devices, only refresh if location accuracy is good enough
    if (mobileCapabilities.isMobile && accuracy && accuracy > 50) {
      console.log('[Mobile Hyper-Local] Location accuracy too low for reliable alerts:', accuracy);
      return;
    }

    try {
      console.log('[Mobile Hyper-Local] Refreshing alerts for mobile location:', {
        lat: latitude.toFixed(6),
        lng: longitude.toFixed(6),
        accuracy: accuracy ? `${accuracy.toFixed(1)}m` : 'unknown',
        quality: accuracyQuality
      });
      
      await refreshAlerts();
      setLastAlertCheck(new Date());
    } catch (error) {
      console.error('[Mobile Hyper-Local] Error refreshing alerts:', error);
    }
  }, [hasLocation, latitude, longitude, accuracy, accuracyQuality, mobileCapabilities.isMobile, refreshAlerts]);

  // Auto-refresh alerts when location changes significantly on mobile
  useEffect(() => {
    if (!mobileCapabilities.isMobile || !hasLocation || !latitude || !longitude) {
      return;
    }

    // Check if we should refresh alerts
    const shouldRefresh = !lastAlertCheck || 
                         (lastUpdateTime && lastUpdateTime.getTime() - lastAlertCheck.getTime() > 60000) || // 1 minute
                         (accuracy && accuracy <= 15); // High accuracy location

    if (shouldRefresh) {
      refreshMobileAlerts();
    }
  }, [hasLocation, latitude, longitude, accuracy, lastUpdateTime, lastAlertCheck, refreshMobileAlerts, mobileCapabilities.isMobile]);

  // Set ready state when we have sufficient location data
  useEffect(() => {
    const ready = hasLocation && 
                  latitude !== null && 
                  longitude !== null &&
                  (!mobileCapabilities.isMobile || (accuracy !== null && accuracy <= 100));
    
    setIsReady(ready);
    
    if (ready) {
      console.log('[Mobile Hyper-Local] System ready:', {
        device: mobileCapabilities.isMobile ? `Mobile (${mobileCapabilities.isIOS ? 'iOS' : 'Android'})` : 'Desktop',
        accuracy: accuracy ? `${accuracy.toFixed(1)}m` : 'unknown',
        quality: accuracyQuality,
        alertsCount: hyperLocalAlerts.length
      });
    }
  }, [hasLocation, latitude, longitude, accuracy, accuracyQuality, hyperLocalAlerts.length, mobileCapabilities]);

  return {
    // Location data
    latitude,
    longitude,
    accuracy,
    hasLocation,
    locationLoading,
    locationError,
    accuracyQuality,
    lastUpdateTime,
    refreshLocation,
    
    // Alert data
    hyperLocalAlerts,
    geoFenceStatus,
    isAnalyzing,
    locationAccuracy,
    hasHighAccuracyLocation,
    locationDetails,
    refreshAlerts: refreshMobileAlerts,
    lastAlertCheck,
    
    // Mobile capabilities
    mobileCapabilities,
    isReady,
    
    // Combined loading state
    isLoading: locationLoading || isAnalyzing
  };
};
