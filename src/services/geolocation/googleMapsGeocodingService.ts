/**
 * Google Maps Geocoding Service
 * Provides reverse geocoding using Google Maps API
 */

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export interface GoogleGeocodingResult {
  placeName: string;
  city: string;
  locality: string;
  region: string;
  country: string;
  formattedAddress: string;
  neighborhood?: string;
}

// Cache for geocoding results
const geocodeCache = new Map<string, GoogleGeocodingResult>();

/**
 * Reverse geocode coordinates to get location name using Google Maps
 */
export const reverseGeocodeGoogle = async (
  latitude: number,
  longitude: number
): Promise<GoogleGeocodingResult | null> => {
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  
  // Check cache first
  if (geocodeCache.has(cacheKey)) {
    console.log('[Google Geocoding] Using cached result for:', cacheKey);
    return geocodeCache.get(cacheKey)!;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('[Google Geocoding] API key not configured, using fallback');
    return {
      placeName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      city: 'Unknown',
      locality: '',
      region: '',
      country: '',
      formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&result_type=locality|sublocality|neighborhood|administrative_area_level_1`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn('[Google Geocoding] No results found, status:', data.status);
      return null;
    }

    const result = data.results[0];
    
    // Extract city, region, country from address components
    let city = '';
    let locality = '';
    let region = '';
    let country = '';
    let neighborhood = '';
    
    if (result.address_components) {
      for (const component of result.address_components) {
        if (component.types.includes('locality')) {
          city = component.long_name;
        } else if (component.types.includes('sublocality_level_1') || component.types.includes('sublocality')) {
          locality = component.long_name;
        } else if (component.types.includes('neighborhood')) {
          neighborhood = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          region = component.long_name;
        } else if (component.types.includes('country')) {
          country = component.long_name;
        }
      }
    }

    // Build formatted address
    const displayName = neighborhood || locality || city;
    const addressParts = [displayName, city !== displayName ? city : '', region, country].filter(Boolean);
    const formattedAddress = addressParts.join(', ') || result.formatted_address;

    const geocodingResult: GoogleGeocodingResult = {
      placeName: displayName || city || result.formatted_address,
      city: city || locality || '',
      locality: locality || neighborhood || '',
      region,
      country,
      neighborhood,
      formattedAddress
    };

    // Cache the result
    geocodeCache.set(cacheKey, geocodingResult);
    console.log('[Google Geocoding] Result:', geocodingResult);

    return geocodingResult;
  } catch (error) {
    console.error('[Google Geocoding] Error:', error);
    return {
      placeName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      city: 'Unknown',
      locality: '',
      region: '',
      country: '',
      formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    };
  }
};

/**
 * Get precise location name for display
 */
export const getPreciseLocationName = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  const result = await reverseGeocodeGoogle(latitude, longitude);
  if (!result) return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  
  // Return the most specific name available
  return result.locality || result.neighborhood || result.city || result.placeName;
};
