import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface LocationState {
  latitude: number | undefined;
  longitude: number | undefined;
  error: string | null;
  isLoading: boolean;
  accuracy: number | undefined;
  lastUpdated: Date | null;
}

interface LocationContextType extends LocationState {
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useUserLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useUserLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: React.ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [location, setLocation] = useState<LocationState>({
    latitude: undefined,
    longitude: undefined,
    error: null,
    isLoading: true,
    accuracy: undefined,
    lastUpdated: null
  });

  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const trackingStartedRef = useRef(false);

  const isValidPosition = (lat: number, lng: number): boolean => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && 
           !isNaN(lat) && !isNaN(lng);
  };

  const hasSignificantMovement = (newLat: number, newLng: number): boolean => {
    if (!lastPositionRef.current) return true;
    
    const latDiff = Math.abs(newLat - lastPositionRef.current.lat);
    const lngDiff = Math.abs(newLng - lastPositionRef.current.lng);
    
    return latDiff > 0.00005 || lngDiff > 0.00005;
  };

  const handleSuccess = (position: GeolocationPosition) => {
    const newLat = position.coords.latitude;
    const newLng = position.coords.longitude;
    const newAccuracy = position.coords.accuracy;
    
    if (!isValidPosition(newLat, newLng)) {
      console.warn('[LocationProvider] Invalid position received:', { newLat, newLng });
      return;
    }

    if (!hasSignificantMovement(newLat, newLng) && location.latitude && location.longitude) {
      return;
    }

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      console.log('[LocationProvider] Location updated:', {
        lat: newLat.toFixed(6),
        lng: newLng.toFixed(6),
        accuracy: newAccuracy?.toFixed(1),
        timestamp: new Date().toISOString()
      });

      setLocation({
        latitude: newLat,
        longitude: newLng,
        error: null,
        isLoading: false,
        accuracy: newAccuracy,
        lastUpdated: new Date()
      });

      lastPositionRef.current = { lat: newLat, lng: newLng };
      retryCountRef.current = 0;
    }, 500); // Reduced debounce time
  };
  
  const handleError = (error: GeolocationPositionError) => {
    let errorMessage = "Failed to get your location";
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Location permission denied. Please enable location access in your device settings.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information is unavailable. Please check your GPS is enabled.";
        break;
      case error.TIMEOUT:
        errorMessage = "Location request timed out";
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          console.log(`[LocationProvider] Retrying location request (${retryCountRef.current}/${maxRetries})`);
          setTimeout(startLocationTracking, 2000);
          return;
        }
        break;
    }
    
    console.error('[LocationProvider] Location error:', errorMessage);
    setLocation({
      latitude: undefined,
      longitude: undefined,
      error: errorMessage,
      isLoading: false,
      accuracy: undefined,
      lastUpdated: null
    });
  };

  const startLocationTracking = () => {
    if (trackingStartedRef.current) return;
    trackingStartedRef.current = true;

    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        isLoading: false
      }));
      return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: isMobile ? 25000 : 15000,
      maximumAge: isMobile ? 30000 : 60000
    };

    console.log('[LocationProvider] Starting location tracking with options:', options);

    if (isMobile) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        options
      );
    }
  };

  const refreshLocation = () => {
    trackingStartedRef.current = false;
    retryCountRef.current = 0;
    setLocation(prev => ({ ...prev, isLoading: true, error: null }));
    startLocationTracking();
  };

  useEffect(() => {
    startLocationTracking();
    
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      trackingStartedRef.current = false;
    };
  }, []);
  
  return (
    <LocationContext.Provider value={{ ...location, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
};