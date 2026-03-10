import { useState, useEffect } from 'react';
import { reverseGeocodeMapbox, MapboxGeocodingResult } from '@/services/geolocation/mapboxGeocodingService';

export const useMapboxLocation = (latitude?: number, longitude?: number) => {
  const [locationName, setLocationName] = useState<MapboxGeocodingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!latitude || !longitude) {
      setLocationName(null);
      return;
    }

    const fetchLocationName = async () => {
      setIsLoading(true);
      try {
        const result = await reverseGeocodeMapbox(longitude, latitude);
        setLocationName(result);
      } catch (error) {
        console.error('[useMapboxLocation] Error fetching location:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationName();
  }, [latitude, longitude]);

  return { locationName, isLoading };
};
