
import { useState, useEffect, useRef, useCallback } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  hasPermission: boolean;
}

export const useDeviceLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
    hasPermission: false
  });

  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const permissionCheckedRef = useRef(false);
  const isMountedRef = useRef(true);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleLocationUpdate = useCallback((position: GeolocationPosition) => {
    if (!isMountedRef.current) return;

    const now = Date.now();
    
    // Rate limit updates to every 5 seconds to avoid excessive updates
    if (now - lastUpdateRef.current < 5000) {
      return;
    }
    
    lastUpdateRef.current = now;
    
    const newLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
      hasPermission: true
    };

    console.log('[Device Location] Location updated:', {
      lat: newLocation.latitude.toFixed(6),
      lng: newLocation.longitude.toFixed(6),
      accuracy: newLocation.accuracy?.toFixed(0) + 'm',
      isMobile: isMobile ? 'Yes' : 'No'
    });

    setLocation(newLocation);
  }, [isMobile]);

  const handleLocationError = useCallback((error: GeolocationPositionError) => {
    if (!isMountedRef.current) return;

    let errorMessage = 'Failed to get your location';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied. Please enable location permissions.';
        setLocation(prev => ({ ...prev, hasPermission: false }));
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable. Check your GPS settings.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Please try again.';
        break;
    }
    
    console.error('[Device Location] Error:', errorMessage);
    setLocation(prev => ({
      ...prev,
      error: errorMessage,
      isLoading: false
    }));
  }, []);

  const startLocationTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation not supported on this device',
        isLoading: false,
        hasPermission: false
      }));
      return;
    }

    // Clear existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: isMobile ? 30000 : 15000, // Longer timeout for mobile
      maximumAge: isMobile ? 10000 : 30000 // Shorter cache for mobile real-time tracking
    };

    console.log('[Device Location] Starting location tracking with options:', {
      ...options,
      isMobile: isMobile ? 'Yes' : 'No'
    });

    // For mobile devices, use watchPosition for continuous tracking
    // For desktop, use getCurrentPosition initially then watchPosition
    if (isMobile) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleLocationUpdate,
        handleLocationError,
        options
      );
    } else {
      // Get initial position first
      navigator.geolocation.getCurrentPosition(
        handleLocationUpdate,
        handleLocationError,
        options
      );
      
      // Then start watching
      setTimeout(() => {
        if (isMountedRef.current) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            handleLocationUpdate,
            handleLocationError,
            { ...options, maximumAge: 60000 } // Less frequent updates for desktop
          );
        }
      }, 2000);
    }
  }, [handleLocationUpdate, handleLocationError, isMobile]);

  const refreshLocation = useCallback(() => {
    console.log('[Device Location] Manual refresh requested');
    setLocation(prev => ({ ...prev, isLoading: true, error: null }));
    
    navigator.geolocation.getCurrentPosition(
      handleLocationUpdate,
      handleLocationError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Force fresh reading
      }
    );
  }, [handleLocationUpdate, handleLocationError]);

  const checkPermission = useCallback(async () => {
    if (permissionCheckedRef.current || !isMountedRef.current) return;
    permissionCheckedRef.current = true;

    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        console.log('[Device Location] Permission status:', permission.state);
        
        if (permission.state === 'granted') {
          setLocation(prev => ({ ...prev, hasPermission: true }));
          startLocationTracking();
        } else if (permission.state === 'denied') {
          setLocation(prev => ({
            ...prev,
            error: 'Location access denied. Please enable location in your device settings.',
            isLoading: false,
            hasPermission: false
          }));
        } else {
          // Permission is 'prompt' - will be requested when we call getCurrentPosition
          startLocationTracking();
        }
      } else {
        // Fallback for browsers without permissions API
        startLocationTracking();
      }
    } catch (error) {
      console.error('[Device Location] Permission check error:', error);
      startLocationTracking();
    }
  }, [startLocationTracking]);

  useEffect(() => {
    isMountedRef.current = true;
    checkPermission();

    return () => {
      isMountedRef.current = false;
      if (watchIdRef.current !== null) {
        console.log('[Device Location] Cleaning up location tracking');
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [checkPermission]);

  return {
    ...location,
    refreshLocation
  };
};
