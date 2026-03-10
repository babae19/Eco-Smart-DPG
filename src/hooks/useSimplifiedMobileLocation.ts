
import { useState, useEffect, useCallback } from 'react';
import { detectMobileCapabilities } from '@/services/mobile/mobileCapabilities';

interface SimpleLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  hasLocation: boolean;
  isLoading: boolean;
  error: string | null;
  refreshLocation: () => void;
  lastUpdateTime: Date | null;
  isMobile: boolean;
}

export const useSimplifiedMobileLocation = (): SimpleLocationState => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const mobileCapabilities = detectMobileCapabilities();

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const newLat = position.coords.latitude;
    const newLng = position.coords.longitude;
    const newAccuracy = position.coords.accuracy;

    // Validate coordinates - allow 0 values but check for NaN and out of bounds
    if (isNaN(newLat) || isNaN(newLng) || Math.abs(newLat) > 90 || Math.abs(newLng) > 180) {
      console.error('[Simplified Location] Invalid coordinates received:', { newLat, newLng });
      setError('Invalid location coordinates received');
      setIsLoading(false);
      return;
    }

    setLatitude(newLat);
    setLongitude(newLng);
    setAccuracy(newAccuracy);
    setHasLocation(true);
    setIsLoading(false);
    setError(null);
    setLastUpdateTime(new Date());

    console.log('[Simplified Location] Location updated:', {
      lat: newLat.toFixed(6),
      lng: newLng.toFixed(6),
      accuracy: newAccuracy?.toFixed(1) + 'm',
      device: mobileCapabilities.isMobile ? 'Mobile' : 'Desktop'
    });
  }, [mobileCapabilities.isMobile]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Failed to get location';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied. Please enable location permissions.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
    }

    setError(errorMessage);
    setIsLoading(false);
    
    console.error('[Simplified Location] Error:', errorMessage, {
      code: error.code,
      device: mobileCapabilities.isMobile ? 'Mobile' : 'Desktop'
    });
  }, [mobileCapabilities.isMobile]);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: mobileCapabilities.isMobile ? 15000 : 10000,
      maximumAge: 5000
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      options
    );
  }, [handleSuccess, handleError, mobileCapabilities.isMobile]);

  const refreshLocation = useCallback(() => {
    console.log('[Simplified Location] Manual refresh requested');
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    getLocation();
  }, []); // Remove getLocation dependency to prevent excessive calls

  return {
    latitude,
    longitude,
    accuracy,
    hasLocation,
    isLoading,
    error,
    refreshLocation,
    lastUpdateTime,
    isMobile: mobileCapabilities.isMobile
  };
};
