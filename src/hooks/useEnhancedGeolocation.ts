import { useState, useEffect, useCallback, useRef } from 'react';

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

interface DeviceCapabilities {
  hasGPS: boolean;
  isHighAccuracySupported: boolean;
  isMobile: boolean;
  browserSupport: string;
}

export const useEnhancedGeolocation = (options: GeolocationOptions = {}) => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [isHighAccuracyAvailable, setIsHighAccuracyAvailable] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [accuracyQuality, setAccuracyQuality] = useState<string>('unknown');
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    hasGPS: false,
    isHighAccuracySupported: false,
    isMobile: false,
    browserSupport: 'unknown'
  });

  const watchIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const getAccuracyQuality = useCallback((acc: number | null) => {
    if (!acc) return 'unknown';
    if (acc <= 5) return 'excellent';
    if (acc <= 10) return 'very-good';
    if (acc <= 25) return 'good';
    if (acc <= 50) return 'fair';
    return 'poor';
  }, []);

  const detectDeviceCapabilities = useCallback(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasGPS = 'geolocation' in navigator;
    
    const capabilities: DeviceCapabilities = {
      hasGPS,
      isHighAccuracySupported: hasGPS && 'permissions' in navigator,
      isMobile,
      browserSupport: hasGPS ? 'supported' : 'not-supported'
    };
    
    setDeviceCapabilities(capabilities);
    setIsHighAccuracyAvailable(capabilities.isHighAccuracySupported);
    
    return capabilities;
  }, []);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    if (!isMountedRef.current) return;

    const newLatitude = position.coords.latitude;
    const newLongitude = position.coords.longitude;
    const newAccuracy = position.coords.accuracy;

    console.log('[Enhanced Geolocation] Position update:', {
      latitude: newLatitude,
      longitude: newLongitude,
      accuracy: newAccuracy
    });

    setLatitude(newLatitude);
    setLongitude(newLongitude);
    setAccuracy(newAccuracy);
    setIsLoading(false);
    setError(null);
    setHasLocation(true);
    setAccuracyQuality(getAccuracyQuality(newAccuracy));
  }, [getAccuracyQuality]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    if (!isMountedRef.current) return;

    let errorMessage = 'Failed to get location';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
    }

    setError(errorMessage);
    setIsLoading(false);
    setRetryCount(prev => prev + 1);
    
    console.error('[Enhanced Geolocation] Error:', errorMessage);
  }, []);

  const startGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setIsLoading(false);
      return;
    }

    const geoOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 15000,
      maximumAge: options.maximumAge ?? 30000
    };

    if (options.watchPosition) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geoOptions
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        geoOptions
      );
    }
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge, options.watchPosition, handleSuccess, handleError]);

  const refreshLocation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    setIsLoading(true);
    setError(null);
    startGeolocation();
  }, [startGeolocation]);

  // Initialize device capabilities
  useEffect(() => {
    detectDeviceCapabilities();
  }, [detectDeviceCapabilities]);

  // Initialize geolocation
  useEffect(() => {
    isMountedRef.current = true;
    startGeolocation();
    
    return () => {
      isMountedRef.current = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []); // Empty dependency array to prevent infinite loops

  return {
    latitude,
    longitude,
    accuracy,
    isLoading,
    error,
    hasLocation,
    isHighAccuracyAvailable,
    retryCount,
    accuracyQuality,
    deviceCapabilities,
    refreshLocation
  };
};