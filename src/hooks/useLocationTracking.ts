
import { useState, useEffect } from 'react';
import { GeoFenceStatus } from '@/services/disaster/geoProximityService';

interface LocationTrackingState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  hasPermission: boolean;
  geoFenceStatus: GeoFenceStatus | null;
  lastCheckTime: Date | null;
  refreshLocation: () => void;
}

export const useLocationTracking = (): LocationTrackingState => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [geoFenceStatus, setGeoFenceStatus] = useState<GeoFenceStatus | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  const refreshLocation = () => {
    setIsLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAccuracy(position.coords.accuracy);
        setLastUpdated(new Date());
        setHasPermission(true);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
        setHasPermission(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Initialize with safe status
  useEffect(() => {
    setGeoFenceStatus({
      insideProneArea: false,
      nearestProneArea: null,
      proximityAlerts: [],
      currentRiskLevel: 'safe'
    });
    setLastCheckTime(new Date());
    refreshLocation();
  }, []);

  return {
    latitude,
    longitude,
    accuracy,
    isLoading,
    error,
    lastUpdated,
    hasPermission,
    geoFenceStatus,
    lastCheckTime,
    refreshLocation
  };
};
