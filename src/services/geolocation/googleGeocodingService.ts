/**
 * Geocoding Service
 * Provides enhanced geo-location services using Google Maps API
 * Falls back to BigDataCloud when Google API is unavailable
 */

import { reverseGeocodeGoogle, GoogleGeocodingResult } from './googleMapsGeocodingService';
import { BigDataCloudService } from './bigDataCloudService';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export interface GeocodingResult {
  formattedAddress: string;
  city: string;
  region: string;
  country: string;
  locality?: string;
  postalCode?: string;
  placeId?: string;
  accuracy: 'ROOFTOP' | 'RANGE_INTERPOLATED' | 'GEOMETRIC_CENTER' | 'APPROXIMATE';
  latitude: number;
  longitude: number;
}

export interface PlaceDetails {
  name: string;
  formattedAddress: string;
  types: string[];
  vicinity?: string;
  placeId: string;
}

/**
 * Reverse geocode coordinates using Google Maps API with BigDataCloud fallback
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<GeocodingResult | null> => {
  try {
    // Try Google Maps API first
    if (GOOGLE_MAPS_API_KEY) {
      console.log('[Geocoding] Using Google Maps API for reverse geocoding');
      const googleResult = await reverseGeocodeGoogle(latitude, longitude);
      
      if (googleResult && googleResult.city !== 'Unknown') {
        return {
          formattedAddress: googleResult.formattedAddress,
          city: googleResult.city,
          region: googleResult.region || '',
          country: googleResult.country || '',
          locality: googleResult.locality,
          postalCode: undefined,
          placeId: undefined,
          accuracy: 'ROOFTOP',
          latitude,
          longitude,
        };
      }
    }

    // Fallback to BigDataCloud
    console.log('[Geocoding] Falling back to BigDataCloud API');
    const result = await BigDataCloudService.reverseGeocode(latitude, longitude);
    
    if (!result) {
      console.warn('[Geocoding] No results found');
      return null;
    }

    return {
      formattedAddress: result.formattedAddress,
      city: result.city || result.locality || '',
      region: result.principalSubdivision || '',
      country: result.countryName || '',
      locality: result.locality,
      postalCode: undefined,
      placeId: undefined,
      accuracy: 'GEOMETRIC_CENTER',
      latitude: result.latitude,
      longitude: result.longitude,
    };
  } catch (error) {
    console.error('[Geocoding] Error:', error);
    return null;
  }
};

/**
 * Get nearby places for enhanced location context
 */
export const getNearbyPlaces = async (
  latitude: number,
  longitude: number,
  radius: number = 100
): Promise<PlaceDetails[]> => {
  try {
    const geocodeResult = await reverseGeocode(latitude, longitude);
    
    if (!geocodeResult) {
      return [];
    }

    return [{
      name: geocodeResult.locality || geocodeResult.city || geocodeResult.region,
      formattedAddress: geocodeResult.formattedAddress,
      types: ['locality'],
      placeId: '',
    }];
  } catch (error) {
    console.error('[Geocoding] Error getting nearby places:', error);
    return [];
  }
};

/**
 * Validate and enhance coordinates
 * Returns confidence level based on geocoding success
 */
export const validateAndEnhanceCoordinates = async (
  latitude: number,
  longitude: number
): Promise<{
  isValid: boolean;
  enhancedLatitude: number;
  enhancedLongitude: number;
  accuracyLevel: 'high' | 'medium' | 'low';
  confidenceScore: number;
  formattedAddress?: string;
}> => {
  try {
    const result = await reverseGeocode(latitude, longitude);

    if (!result) {
      return {
        isValid: false,
        enhancedLatitude: latitude,
        enhancedLongitude: longitude,
        accuracyLevel: 'low',
        confidenceScore: 0,
      };
    }

    const hasCity = Boolean(result.city);
    const hasRegion = Boolean(result.region);
    const hasCountry = Boolean(result.country);
    const usedGoogleApi = result.accuracy === 'ROOFTOP';

    let confidenceScore = 0.5;
    let accuracyLevel: 'high' | 'medium' | 'low' = 'low';

    if (usedGoogleApi && hasCity) {
      confidenceScore = 0.95;
      accuracyLevel = 'high';
    } else if (hasCity && hasCountry) {
      confidenceScore = 0.9;
      accuracyLevel = 'high';
    } else if (hasRegion && hasCountry) {
      confidenceScore = 0.75;
      accuracyLevel = 'medium';
    } else if (hasCountry) {
      confidenceScore = 0.6;
      accuracyLevel = 'medium';
    }

    return {
      isValid: true,
      enhancedLatitude: result.latitude,
      enhancedLongitude: result.longitude,
      accuracyLevel,
      confidenceScore,
      formattedAddress: result.formattedAddress,
    };
  } catch (error) {
    console.error('[Geocoding] Error validating coordinates:', error);
    return {
      isValid: false,
      enhancedLatitude: latitude,
      enhancedLongitude: longitude,
      accuracyLevel: 'low',
      confidenceScore: 0,
    };
  }
};

export const GoogleGeocodingService = {
  reverseGeocode,
  getNearbyPlaces,
  validateAndEnhanceCoordinates,
};
