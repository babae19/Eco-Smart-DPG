/**
 * BigDataCloud Reverse Geocoding Service
 * Free API for converting coordinates to location names
 * No API key required for client-side requests
 */

const BIGDATACLOUD_API = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

export interface BigDataCloudResult {
  city: string;
  locality: string;
  principalSubdivision: string;
  countryName: string;
  countryCode: string;
  continent: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  localityInfo?: {
    administrative: Array<{
      name: string;
      description: string;
      order: number;
    }>;
  };
}

/**
 * Reverse geocode coordinates using BigDataCloud free API
 * No API key required - uses client IP for rate limiting
 */
export const reverseGeocodeBigDataCloud = async (
  latitude: number,
  longitude: number
): Promise<BigDataCloudResult | null> => {
  try {
    const url = `${BIGDATACLOUD_API}?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`BigDataCloud geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    // Build formatted address from available components
    const addressParts = [
      data.locality,
      data.city,
      data.principalSubdivision,
      data.countryName
    ].filter(Boolean);

    const formattedAddress = addressParts.join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

    return {
      city: data.city || data.locality || '',
      locality: data.locality || '',
      principalSubdivision: data.principalSubdivision || '',
      countryName: data.countryName || '',
      countryCode: data.countryCode || '',
      continent: data.continent || '',
      formattedAddress,
      latitude: data.latitude || latitude,
      longitude: data.longitude || longitude,
      localityInfo: data.localityInfo
    };
  } catch (error) {
    console.error('[BigDataCloud Geocoding] Error:', error);
    return null;
  }
};

/**
 * Get location details with administrative hierarchy
 */
export const getLocationHierarchy = async (
  latitude: number,
  longitude: number
): Promise<string[]> => {
  try {
    const result = await reverseGeocodeBigDataCloud(latitude, longitude);
    
    if (!result) return [];

    const hierarchy: string[] = [];
    
    if (result.localityInfo?.administrative) {
      result.localityInfo.administrative
        .sort((a, b) => a.order - b.order)
        .forEach(admin => {
          if (admin.name) hierarchy.push(admin.name);
        });
    }

    // Fallback to basic hierarchy
    if (hierarchy.length === 0) {
      if (result.locality) hierarchy.push(result.locality);
      if (result.city && result.city !== result.locality) hierarchy.push(result.city);
      if (result.principalSubdivision) hierarchy.push(result.principalSubdivision);
      if (result.countryName) hierarchy.push(result.countryName);
    }

    return hierarchy;
  } catch (error) {
    console.error('[BigDataCloud] Error getting hierarchy:', error);
    return [];
  }
};

export const BigDataCloudService = {
  reverseGeocode: reverseGeocodeBigDataCloud,
  getLocationHierarchy
};
