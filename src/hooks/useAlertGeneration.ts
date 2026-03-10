
import { useState, useCallback, useRef } from 'react';
import { Alert } from '@/types/AlertTypes';
import { WeatherData } from '@/types/WeatherTypes';
import { generatePersonalizedAlerts } from '@/services/predictiveAlertService';
import { checkProximityToDisasterProneAreas } from '@/services/disaster/geoProximityService';

interface UseAlertGenerationProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  weatherData: WeatherData | null;
}

export const useAlertGeneration = ({
  latitude,
  longitude,
  accuracy,
  weatherData
}: UseAlertGenerationProps) => {
  const [hyperLocalAlerts, setHyperLocalAlerts] = useState<Alert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const lastGenerationRef = useRef<string>('');
  const generationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastGenerationTimeRef = useRef<number>(0);

  const generateHyperLocalAlerts = useCallback(async (forceRefresh: boolean = false): Promise<boolean> => {
    if (!latitude || !longitude) {
      console.log('[Alert Generation] No location available for alert generation');
      return false;
    }

    // Rate limiting: prevent generation more than once every 30 seconds unless forced
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationTimeRef.current;
    if (!forceRefresh && timeSinceLastGeneration < 30000) {
      console.log(`[Alert Generation] Rate limited - last generation ${Math.round(timeSinceLastGeneration/1000)}s ago`);
      return false;
    }

    // Create a location-based key with reduced precision to prevent micro-movements
    const locationKey = `${Math.round(latitude * 100)}-${Math.round(longitude * 100)}`;
    
    // Only prevent duplicates if the location hasn't changed significantly AND it's not a forced refresh
    if (!forceRefresh && lastGenerationRef.current === locationKey) {
      console.log('[Alert Generation] Skipping duplicate generation for same general area');
      return false;
    }

    // Clear any pending generation
    if (generationTimeoutRef.current) {
      clearTimeout(generationTimeoutRef.current);
    }

    try {
      setIsAnalyzing(true);
      lastGenerationTimeRef.current = now;
      
      console.log('[Alert Generation] Generating alerts for location:', {
        lat: latitude.toFixed(4), // Reduced precision in logs
        lng: longitude.toFixed(4),
        accuracy: accuracy ? `${accuracy.toFixed(0)}m` : 'unknown',
        locationKey,
        forceRefresh,
        timeSinceLastGeneration: `${Math.round(timeSinceLastGeneration/1000)}s`
      });

      // Generate personalized alerts based on location and weather
      const personalizedAlerts = generatePersonalizedAlerts(latitude, longitude);
      
      // Check proximity to disaster-prone areas
      const proximityStatus = checkProximityToDisasterProneAreas(latitude, longitude, accuracy || 10);
      
      let proximityRisk = false;
      
      // Generate proximity-based alerts if in or near danger zones
      if (proximityStatus.insideProneArea || proximityStatus.currentRiskLevel === 'high' || proximityStatus.currentRiskLevel === 'critical') {
        proximityRisk = true;
        
        if (proximityStatus.proximityAlerts && proximityStatus.proximityAlerts.length > 0) {
          const proximityAlert: Alert = {
            id: `proximity-${Date.now()}`,
            title: `🚨 PROXIMITY ALERT: ${proximityStatus.nearestProneArea?.name || 'Disaster-Prone Area'}`,
            description: `You are currently ${proximityStatus.insideProneArea ? 'in' : 'near'} a disaster-prone area. ${proximityStatus.proximityAlerts[0]?.recommendedActions.slice(0, 2).join('. ') || 'Take immediate precautions.'}`,
            location: proximityStatus.nearestProneArea?.name || 'Your Location',
            severity: proximityStatus.currentRiskLevel === 'critical' ? 'high' : 
                     proximityStatus.currentRiskLevel === 'high' ? 'high' : 'medium' as 'high' | 'medium' | 'low',
            date: new Date().toISOString(),
            isNew: true,
            type: 'proximity',
            aiPredictionScore: proximityStatus.currentRiskLevel === 'critical' ? 0.95 : 
                              proximityStatus.currentRiskLevel === 'high' ? 0.85 : 0.7,
            isPersonalized: true,
            coordinates: { latitude, longitude }
          };
          
          personalizedAlerts.unshift(proximityAlert);
        }
      }

      // Limit to top 5 most relevant alerts
      const limitedAlerts = personalizedAlerts.slice(0, 5);
      
      setHyperLocalAlerts(limitedAlerts);
      lastGenerationRef.current = locationKey;
      
      console.log(`[Alert Generation] Generated ${limitedAlerts.length} hyper-local alerts (proximity risk: ${proximityRisk}, risk level: ${proximityStatus.currentRiskLevel})`);
      
      return proximityRisk;
    } catch (error) {
      console.error('[Alert Generation] Error generating hyper-local alerts:', error);
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  }, [latitude, longitude, accuracy, weatherData]);

  return {
    hyperLocalAlerts,
    isAnalyzing,
    generateHyperLocalAlerts
  };
};
