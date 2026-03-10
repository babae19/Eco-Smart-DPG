/**
 * Enhanced Geolocation Hook with Google Maps Integration
 * Provides high-accuracy location tracking with Google's geocoding validation
 * Integrates with disaster risk assessment and AI analysis systems
 */

import { useState, useEffect, useCallback } from 'react';
import { useEnhancedGeolocation } from './useEnhancedGeolocation';
import { GoogleGeocodingService, GeocodingResult } from '@/services/geolocation/googleGeocodingService';

interface EnhancedLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  geocodingResult: GeocodingResult | null;
  confidenceScore: number;
  accuracyLevel: 'high' | 'medium' | 'low';
  formattedAddress: string;
  isValidated: boolean;
}

export const useEnhancedGoogleGeolocation = () => {
  const [enhancedLocation, setEnhancedLocation] = useState<EnhancedLocationData | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementError, setEnhancementError] = useState<string | null>(null);

  const {
    latitude,
    longitude,
    accuracy,
    isLoading,
    error,
    hasLocation,
    refreshLocation,
    deviceCapabilities,
    accuracyQuality
  } = useEnhancedGeolocation({
    enableHighAccuracy: true,
    timeout: 10000, // Faster timeout for more responsive updates
    maximumAge: 1000, // Only accept location data less than 1 second old for real-time tracking
    watchPosition: true // Continuous tracking
  });

  /**
   * Enhance location data with Google's geocoding services
   * Provides validation, accuracy improvement, and human-readable addresses
   */
  const enhanceLocationWithGoogle = useCallback(async () => {
    if (!latitude || !longitude) {
      return;
    }

    setIsEnhancing(true);
    setEnhancementError(null);

    try {
      console.log('[Enhanced Google Geolocation] Validating coordinates:', {
        lat: latitude.toFixed(6),
        lng: longitude.toFixed(6)
      });

      // Validate and enhance coordinates using Google
      const validation = await GoogleGeocodingService.validateAndEnhanceCoordinates(
        latitude,
        longitude
      );

      if (!validation.isValid) {
        setEnhancementError('Unable to validate location');
        return;
      }

      // Get detailed geocoding information
      const geocodingResult = await GoogleGeocodingService.reverseGeocode(
        validation.enhancedLatitude,
        validation.enhancedLongitude
      );

      const enhanced: EnhancedLocationData = {
        latitude: validation.enhancedLatitude,
        longitude: validation.enhancedLongitude,
        accuracy: accuracy || 100,
        geocodingResult,
        confidenceScore: validation.confidenceScore,
        accuracyLevel: validation.accuracyLevel,
        formattedAddress: geocodingResult?.formattedAddress || 'Unknown location',
        isValidated: true
      };

      setEnhancedLocation(enhanced);

      console.log('[Enhanced Google Geolocation] Location enhanced:', {
        address: enhanced.formattedAddress,
        accuracy: enhanced.accuracyLevel,
        confidence: (enhanced.confidenceScore * 100).toFixed(0) + '%'
      });

    } catch (error) {
      console.error('[Enhanced Google Geolocation] Enhancement failed:', error);
      setEnhancementError(error instanceof Error ? error.message : 'Enhancement failed');
    } finally {
      setIsEnhancing(false);
    }
  }, [latitude, longitude, accuracy]);

  // Enhance location whenever coordinates change
  useEffect(() => {
    if (hasLocation && latitude && longitude) {
      // Only enhance if location changed significantly (more than 10 meters)
      if (enhancedLocation) {
        const latDiff = Math.abs(latitude - enhancedLocation.latitude);
        const lngDiff = Math.abs(longitude - enhancedLocation.longitude);
        const significantChange = latDiff > 0.0001 || lngDiff > 0.0001; // ~11 meters
        
        if (!significantChange) {
          return; // Skip enhancement if location hasn't changed much
        }
      }
      
      enhanceLocationWithGoogle();
    }
  }, [hasLocation, latitude, longitude]);

  return {
    // Basic geolocation data
    latitude,
    longitude,
    accuracy,
    isLoading: isLoading || isEnhancing,
    error: error || enhancementError,
    hasLocation,
    deviceCapabilities,
    accuracyQuality,
    
    // Enhanced Google data
    enhancedLocation,
    isEnhancing,
    enhancementError,
    
    // Actions
    refreshLocation,
    enhanceLocation: enhanceLocationWithGoogle
  };
};