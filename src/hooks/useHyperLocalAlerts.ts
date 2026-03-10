
import { useState, useEffect } from 'react';
import { useLocationAccuracy } from './useLocationAccuracy';
import { useProximityMonitoring } from './useProximityMonitoring';
import { useAlertGeneration } from './useAlertGeneration';
import { WeatherData } from '@/types/WeatherTypes';
import { useWeatherData } from './useWeatherData';
import { GeoFenceStatus } from '@/services/disaster/geoProximityService';

export const useHyperLocalAlerts = () => {
  const [lastAlertTime, setLastAlertTime] = useState<Date | null>(null);
  
  const {
    locationDetails,
    locationAccuracy,
    hasHighAccuracyLocation,
    locationError,
    locationLoading
  } = useLocationAccuracy();

  const { weatherData: rawWeatherData } = useWeatherData();

  // Convert the weather data from useWeatherData to the format expected by useAlertGeneration
  const weatherData: WeatherData | null = rawWeatherData ? {
    day: 'Today',
    temp: rawWeatherData.current.temperature,
    minTemp: rawWeatherData.current.temperature - 3,
    maxTemp: rawWeatherData.current.temperature + 3,
    humidity: rawWeatherData.current.humidity,
    windSpeed: rawWeatherData.current.windSpeed,
    condition: rawWeatherData.current.conditions.toLowerCase().includes('rain') ? 'rainy' :
              rawWeatherData.current.conditions.toLowerCase().includes('cloud') ? 'cloudy' :
              rawWeatherData.current.conditions.toLowerCase().includes('storm') ? 'stormy' : 'sunny' as WeatherData['condition'],
    precipChance: rawWeatherData.current.precipitation || 0,
    windDirection: rawWeatherData.current.windDirection?.toString() || 'N',
    precipitation: rawWeatherData.current.precipitation || 0,
    lastUpdated: new Date(),
    temperature: rawWeatherData.current.temperature,
    feelsLike: rawWeatherData.current.feelsLike,
    barometricPressure: rawWeatherData.current.pressure,
    uvIndex: rawWeatherData.current.uvIndex || 0,
    sunriseTime: new Date(),
    sunsetTime: new Date(),
    sunrise: new Date(),
    sunset: new Date()
  } : null;

  const {
    hyperLocalAlerts,
    isAnalyzing,
    generateHyperLocalAlerts
  } = useAlertGeneration({
    latitude: locationDetails.latitude,
    longitude: locationDetails.longitude,
    accuracy: locationDetails.accuracy,
    weatherData
  });

  const handleProximityChange = (status: GeoFenceStatus) => {
    // Regenerate alerts when entering/leaving high-risk areas
    if (status.insideProneArea || status.currentRiskLevel === 'high' || status.currentRiskLevel === 'critical') {
      generateHyperLocalAlerts(false).then((proximityRisk) => {
        if (proximityRisk) {
          setLastAlertTime(new Date());
        }
      });
    }
  };

  const { geoFenceStatus } = useProximityMonitoring({
    latitude: locationDetails.latitude,
    longitude: locationDetails.longitude,
    accuracy: locationDetails.accuracy,
    hasLocation: locationDetails.hasLocation,
    onProximityChange: handleProximityChange
  });

  // Generate alerts when location becomes available or changes significantly
  useEffect(() => {
    if (locationDetails.hasLocation && locationDetails.isHighAccuracyAvailable) {
      generateHyperLocalAlerts(false).then((proximityRisk) => {
        if (proximityRisk) {
          setLastAlertTime(new Date());
        }
      });
    }
  }, [locationDetails.hasLocation, locationDetails.isHighAccuracyAvailable, generateHyperLocalAlerts]);

  const refreshAlerts = async () => {
    console.log('[Hyper Local Alerts] Manual refresh triggered');
    
    // Check if we have location data
    if (!locationDetails.hasLocation) {
      console.log('[Hyper Local Alerts] No location available for refresh');
      return;
    }
    
    try {
      // Force refresh alerts regardless of location cache
      const proximityRisk = await generateHyperLocalAlerts(true);
      if (proximityRisk) {
        setLastAlertTime(new Date());
      }
      console.log('[Hyper Local Alerts] Manual refresh completed successfully');
    } catch (error) {
      console.error('[Hyper Local Alerts] Error during manual refresh:', error);
    }
  };

  return {
    hyperLocalAlerts,
    geoFenceStatus,
    isAnalyzing: isAnalyzing || locationLoading,
    locationAccuracy,
    hasHighAccuracyLocation,
    locationError,
    lastAlertTime,
    refreshAlerts,
    locationDetails
  };
};
