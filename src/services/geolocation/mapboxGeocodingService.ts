/**
 * Mapbox Geocoding Service
 * Provides reverse geocoding to get location names from coordinates
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const GEOCODING_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export interface MapboxGeocodingResult {
  placeName: string;
  city: string;
  region: string;
  country: string;
  formattedAddress: string;
}

/**
 * Reverse geocode coordinates to get location name using Mapbox
 */
export const reverseGeocodeMapbox = async (
  longitude: number,
  latitude: number
): Promise<MapboxGeocodingResult | null> => {
  if (!MAPBOX_TOKEN) {
    console.warn('[Mapbox Geocoding] Token not configured, using fallback');
    return {
      placeName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      city: 'Unknown',
      region: '',
      country: '',
      formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    };
  }

  try {
    const url = `${GEOCODING_API}/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,neighborhood`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      console.warn('[Mapbox Geocoding] No results found');
      return null;
    }

    const feature = data.features[0];
    
    // Extract city, region, country from context
    let city = '';
    let region = '';
    let country = '';
    
    if (feature.context) {
      for (const ctx of feature.context) {
        if (ctx.id.startsWith('place')) {
          city = ctx.text;
        } else if (ctx.id.startsWith('region')) {
          region = ctx.text;
        } else if (ctx.id.startsWith('country')) {
          country = ctx.text;
        }
      }
    }

    // Use place_name as primary, or text as fallback
    const placeName = feature.place_name || feature.text || 'Unknown Location';

    return {
      placeName,
      city: city || feature.text || '',
      region,
      country,
      formattedAddress: feature.place_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    };
  } catch (error) {
    console.error('[Mapbox Geocoding] Error:', error);
    return {
      placeName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      city: 'Unknown',
      region: '',
      country: '',
      formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    };
  }
};
