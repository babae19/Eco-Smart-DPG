import { useState, useEffect, useRef } from 'react';
import { reverseGeocodeGoogle, GoogleGeocodingResult } from '@/services/geolocation/googleMapsGeocodingService';

export const useGoogleLocation = (latitude?: number, longitude?: number) => {
  const [locationName, setLocationName] = useState<GoogleGeocodingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastCoordsRef = useRef<string>('');

  useEffect(() => {
    if (!latitude || !longitude) {
      setLocationName(null);
      return;
    }

    // Check if coordinates have changed significantly
    const coordsKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    if (lastCoordsRef.current === coordsKey && locationName) {
      return;
    }

    const fetchLocationName = async () => {
      setIsLoading(true);
      try {
        const result = await reverseGeocodeGoogle(latitude, longitude);
        if (result) {
          setLocationName(result);
          lastCoordsRef.current = coordsKey;
          console.log('[useGoogleLocation] Location resolved:', result.formattedAddress);
        }
      } catch (error) {
        console.error('[useGoogleLocation] Error fetching location:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationName();
  }, [latitude, longitude]);

  return { 
    locationName, 
    isLoading,
    displayName: locationName?.placeName || locationName?.city || null,
    fullAddress: locationName?.formattedAddress || null
  };
};
