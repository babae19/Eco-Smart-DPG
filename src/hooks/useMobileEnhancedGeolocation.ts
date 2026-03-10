import { useState, useEffect, useCallback, useRef } from 'react';
import { detectMobileCapabilities, getMobileGeoOptions, type MobileCapabilities } from '@/services/mobile/mobileCapabilities';

interface MobileGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  enableBackgroundTracking?: boolean;
}

interface MobileGeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isLoading: boolean;
  error: string | null;
  hasLocation: boolean;
  isHighAccuracyAvailable: boolean;
  refreshLocation: () => void;
  mobileCapabilities: MobileCapabilities;
  accuracyQuality: string;
  retryCount: number;
  wakeLockStatus: 'active' | 'released' | 'unsupported';
  lastUpdateTime: Date | null;
}

export const useMobileEnhancedGeolocation = (options: MobileGeolocationOptions = {}): MobileGeolocationState => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [isHighAccuracyAvailable, setIsHighAccuracyAvailable] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [wakeLockStatus, setWakeLockStatus] = useState<'active' | 'released' | 'unsupported'>('unsupported');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isMountedRef = useRef(true);
  const lastSuccessfulLocationRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  
  const mobileCapabilities = detectMobileCapabilities();

  const getAccuracyQuality = useCallback((acc: number | null) => {
    if (!acc) return 'unknown';
    if (mobileCapabilities.isMobile) {
      if (acc <= 5) return 'excellent'; // GPS-level accuracy
      if (acc <= 10) return 'very-good'; // Good mobile GPS
      if (acc <= 20) return 'good'; // Acceptable mobile GPS
      if (acc <= 50) return 'fair'; // Network-assisted
      return 'poor'; // WiFi/cell tower only
    } else {
      if (acc <= 10) return 'good';
      if (acc <= 50) return 'fair';
      return 'poor';
    }
  }, [mobileCapabilities.isMobile]);

  // Enhanced wake lock for mobile background tracking
  const requestWakeLock = useCallback(async () => {
    if (!mobileCapabilities.supportsWakeLock || !options.enableBackgroundTracking || !mobileCapabilities.isMobile) {
      return;
    }

    try {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
      
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setWakeLockStatus('active');
      
      wakeLockRef.current.addEventListener('release', () => {
        setWakeLockStatus('released');
        console.log('[Mobile GPS] Wake lock released - GPS may be less accurate in background');
      });
      
      console.log('[Mobile GPS] Wake lock acquired for continuous tracking');
    } catch (error) {
      console.warn('[Mobile GPS] Wake lock failed, tracking may be limited in background:', error);
      setWakeLockStatus('unsupported');
    }
  }, [mobileCapabilities.supportsWakeLock, mobileCapabilities.isMobile, options.enableBackgroundTracking]);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    if (!isMountedRef.current) return;

    const now = Date.now();
    const newLat = position.coords.latitude;
    const newLng = position.coords.longitude;
    const newAccuracy = position.coords.accuracy;

    // Validate coordinates
    if (!newLat || !newLng || Math.abs(newLat) > 90 || Math.abs(newLng) > 180) {
      console.error('[Mobile GPS] Invalid coordinates received:', { newLat, newLng });
      return;
    }

    // For mobile devices, implement smart filtering to avoid GPS jitter
    if (mobileCapabilities.isMobile && lastSuccessfulLocationRef.current) {
      const lastLoc = lastSuccessfulLocationRef.current;
      const timeDiff = now - lastLoc.time;
      
      // Calculate distance moved (rough estimation)
      const latDiff = Math.abs(newLat - lastLoc.lat) * 111000; // meters
      const lngDiff = Math.abs(newLng - lastLoc.lng) * 111000 * Math.cos(newLat * Math.PI / 180);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      
      // If location changed too dramatically in short time, it might be GPS error
      if (timeDiff < 3000 && distance > 100 && newAccuracy > 20) {
        console.warn('[Mobile GPS] Suspicious location jump detected, skipping update');
        return;
      }
    }

    lastSuccessfulLocationRef.current = { lat: newLat, lng: newLng, time: now };

    setLatitude(newLat);
    setLongitude(newLng);
    setAccuracy(newAccuracy);
    setHasLocation(true);
    setIsHighAccuracyAvailable(newAccuracy <= (mobileCapabilities.isMobile ? 20 : 50));
    setIsLoading(false);
    setError(null);
    setRetryCount(0);
    setLastUpdateTime(new Date());

    console.log('[Mobile GPS] Location updated:', {
      lat: newLat.toFixed(6),
      lng: newLng.toFixed(6),
      accuracy: newAccuracy?.toFixed(1) + 'm',
      quality: getAccuracyQuality(newAccuracy),
      device: mobileCapabilities.isMobile ? `Mobile (${mobileCapabilities.isIOS ? 'iOS' : 'Android'})` : 'Desktop',
      browser: mobileCapabilities.browserName
    });
  }, [getAccuracyQuality, mobileCapabilities]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    if (!isMountedRef.current) return;

    let errorMessage = 'Failed to get location';
    let shouldRetry = false;
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = mobileCapabilities.isMobile 
          ? `Location access denied. Please enable location permissions for ${mobileCapabilities.browserName} in your device settings.`
          : 'Location access denied. Please enable location permissions in your browser.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = mobileCapabilities.isMobile
          ? 'GPS unavailable. Please ensure location services are enabled and you have a clear view of the sky.'
          : 'Location information unavailable. Please check your network connection.';
        shouldRetry = mobileCapabilities.isMobile && retryCount < 2;
        break;
      case error.TIMEOUT:
        errorMessage = mobileCapabilities.isMobile 
          ? 'GPS timeout. Trying to get location...' 
          : 'Location request timed out.';
        shouldRetry = retryCount < (mobileCapabilities.isMobile ? 3 : 1);
        break;
    }

    setError(errorMessage);
    setIsLoading(false);
    setRetryCount(prev => prev + 1);
    
    console.error('[Mobile GPS] Error:', errorMessage, {
      code: error.code,
      device: mobileCapabilities.isMobile ? `Mobile (${mobileCapabilities.isIOS ? 'iOS' : 'Android'})` : 'Desktop',
      retryCount,
      shouldRetry
    });

    // Auto-retry for mobile devices with exponential backoff
    if (shouldRetry && mobileCapabilities.isMobile) {
      setTimeout(() => {
        if (isMountedRef.current) {
          console.log('[Mobile GPS] Auto-retrying location request...');
          setIsLoading(true);
          setError(null);
          startLocationTracking();
        }
      }, Math.pow(2, retryCount) * 1000); // 1s, 2s, 4s delays
    }
  }, [mobileCapabilities, retryCount]);

  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device');
      setIsLoading(false);
      return;
    }

    // Use mobile-optimized geolocation options
    const geoOptions = getMobileGeoOptions();
    
    // Override with user options if provided
    const finalOptions: PositionOptions = {
      ...geoOptions,
      enableHighAccuracy: options.enableHighAccuracy ?? geoOptions.enableHighAccuracy,
      timeout: options.timeout ?? geoOptions.timeout,
      maximumAge: options.maximumAge ?? geoOptions.maximumAge
    };

    console.log('[Mobile GPS] Starting location tracking:', {
      ...finalOptions,
      device: mobileCapabilities.isMobile ? `Mobile (${mobileCapabilities.isIOS ? 'iOS' : 'Android'})` : 'Desktop',
      browser: mobileCapabilities.browserName,
      screenSize: mobileCapabilities.screenSize,
      inApp: mobileCapabilities.isInApp
    });

    if (options.watchPosition && mobileCapabilities.isMobile) {
      // Clear existing watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        finalOptions
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        finalOptions
      );
    }

    // Request wake lock for mobile background tracking
    if (mobileCapabilities.isMobile && options.enableBackgroundTracking) {
      requestWakeLock();
    }
  }, [options, handleSuccess, handleError, mobileCapabilities, requestWakeLock]);

  const refreshLocation = useCallback(() => {
    console.log('[Mobile GPS] Manual refresh requested');
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    
    const geoOptions = getMobileGeoOptions();
    
    // Force fresh location reading
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        ...geoOptions,
        maximumAge: 0 // Force fresh reading
      }
    );
  }, [handleSuccess, handleError, mobileCapabilities]);

  useEffect(() => {
    isMountedRef.current = true;
    startLocationTracking();

    // Handle page visibility changes for mobile battery optimization
    const handleVisibilityChange = () => {
      if (mobileCapabilities.isMobile) {
        if (document.hidden) {
          console.log('[Mobile GPS] Page hidden, maintaining background tracking');
          // Don't stop tracking but reduce frequency
        } else {
          console.log('[Mobile GPS] Page visible, resuming active tracking');
          if (!hasLocation || (lastUpdateTime && Date.now() - lastUpdateTime.getTime() > 30000)) {
            refreshLocation();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startLocationTracking, refreshLocation, mobileCapabilities, hasLocation, lastUpdateTime]);

  return {
    latitude,
    longitude,
    accuracy,
    isLoading,
    error,
    hasLocation,
    isHighAccuracyAvailable,
    refreshLocation,
    mobileCapabilities,
    accuracyQuality: getAccuracyQuality(accuracy),
    retryCount,
    wakeLockStatus,
    lastUpdateTime
  };
};
