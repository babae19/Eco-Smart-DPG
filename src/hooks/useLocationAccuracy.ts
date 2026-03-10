
import { useState, useEffect, useCallback, useRef } from 'react';
import { useEnhancedGeolocation } from './useEnhancedGeolocation';

export const useLocationAccuracy = () => {
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);
  const [accuracyTrend, setAccuracyTrend] = useState<'improving' | 'stable' | 'degrading'>('stable');
  const lastLoggedKeyRef = useRef<string>('');
  
  const { 
    latitude, 
    longitude, 
    accuracy, 
    isLoading: locationLoading,
    error: locationError,
    hasLocation,
    isHighAccuracyAvailable,
    refreshLocation,
    deviceCapabilities,
    accuracyQuality,
    retryCount
  } = useEnhancedGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 3000, // More frequent updates for better tracking
    watchPosition: true
  });

  const previousAccuracyRef = useRef<number | null>(null);

  // Track accuracy trends over time
  useEffect(() => {
    const prev = previousAccuracyRef.current;
    if (accuracy !== null && prev !== null && Math.abs(accuracy - prev) > 3) {
      if (accuracy < prev - 3) {
        setAccuracyTrend('improving');
      } else if (accuracy > prev + 3) {
        setAccuracyTrend('degrading');
      } else {
        setAccuracyTrend('stable');
      }
    }
    if (accuracy !== null) {
      previousAccuracyRef.current = accuracy;
    }
  }, [accuracy]);

  // Track when location updates with enhanced logging - only when location coordinates change
  useEffect(() => {
    if (hasLocation && latitude !== null && longitude !== null) {
      setLastLocationUpdate(new Date());
      // Only log significant location changes to prevent spam
      const locationKey = `${latitude?.toFixed(4)}-${longitude?.toFixed(4)}-${accuracy?.toFixed(0)}`;
      
      if (lastLoggedKeyRef.current !== locationKey) {
        console.log('[Location Accuracy] Location updated:', {
          lat: latitude?.toFixed(6),
          lng: longitude?.toFixed(6),
          accuracy: accuracy?.toFixed(1),
          quality: accuracyQuality
        });
        lastLoggedKeyRef.current = locationKey;
      }
    }
  }, [latitude, longitude, hasLocation, accuracy, accuracyQuality]);

  const getAccuracyStatus = useCallback(() => {
    if (!accuracy) return 'unknown';
    if (accuracy <= 5) return 'excellent';
    if (accuracy <= 10) return 'very-good';
    if (accuracy <= 25) return 'good';
    if (accuracy <= 50) return 'fair';
    return 'poor';
  }, [accuracy]);

  const locationDetails = {
    latitude,
    longitude,
    accuracy,
    hasLocation,
    isHighAccuracyAvailable,
    accuracyStatus: getAccuracyStatus(),
    accuracyTrend,
    deviceCapabilities,
    accuracyQuality,
    retryCount
  };

  return {
    locationDetails,
    locationAccuracy: accuracy,
    hasHighAccuracyLocation: isHighAccuracyAvailable,
    locationError,
    locationLoading,
    lastLocationUpdate,
    refreshLocation
  };
};
