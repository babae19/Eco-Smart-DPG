
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WeatherApiService } from '@/services/weather/weatherApiService';
import { WeatherDataProcessor } from '@/services/weather/weatherDataProcessor';
import { WeatherRiskAnalysisService } from '@/services/weather/weatherRiskAnalysisService';
import { useUserLocation } from '@/contexts/LocationContext';
import { WeatherData as WeatherDataTypes } from '@/types/WeatherDataTypes';

interface WeatherCurrent {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  conditions: string;
  feelsLike: number;
  pressure: number;
  precipitation: number;
  uvIndex: number;
}

interface WeatherData {
  current: WeatherCurrent;
  riskAnalysis?: {
    risks: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { latitude, longitude } = useUserLocation();

  const refreshWeatherData = useCallback(async (forceRefetch = false) => {
    if (!latitude || !longitude) {
      setIsLoading(false);
      return;
    }

    // Prevent multiple simultaneous requests unless forced
    if (!forceRefetch && isLoading) return;

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[useWeatherData] Fetching weather data for:', { latitude, longitude });
      
      // Use OpenWeatherMap API via WeatherApiService
      const apiResponse: WeatherDataTypes = await WeatherApiService.fetchWeatherData(latitude, longitude);
      const processedData = WeatherDataProcessor.processWeatherData(apiResponse);
      
      // Convert to useWeatherData format
      const formattedData: WeatherData = {
        current: {
          temperature: processedData.current.temperature,
          humidity: processedData.current.humidity,
          windSpeed: processedData.current.windSpeed,
          windDirection: processedData.current.windDirection || 'N',
          conditions: processedData.current.conditions,
          feelsLike: processedData.current.feelsLike,
          pressure: processedData.current.pressure || 1013,
          precipitation: processedData.current.precipitation || 0,
          uvIndex: processedData.current.uvIndex || 0
        },
        riskAnalysis: {
          risks: processedData.riskAnalysis?.risks.map(r => r.description) || [],
          riskLevel: (processedData.riskAnalysis?.riskLevel === 'critical' ? 'high' : processedData.riskAnalysis?.riskLevel) || 'low'
        }
      };
      
      setWeatherData(formattedData);
      setError(null); // Clear any previous errors
      console.log('[useWeatherData] Successfully updated weather data');
    } catch (err) {
      console.error('[useWeatherData] Error fetching weather data:', err);
      setError('Unable to fetch current weather conditions');
      
      // Only set fallback data if we don't have any existing data
      if (!weatherData) {
        const fallbackData = WeatherRiskAnalysisService.createFallbackData();
        const formattedFallback: WeatherData = {
          current: {
            temperature: fallbackData.current.temperature,
            humidity: fallbackData.current.humidity,
            windSpeed: fallbackData.current.windSpeed,
            windDirection: 'SW',
            conditions: fallbackData.current.conditions,
            feelsLike: fallbackData.current.feelsLike,
            pressure: 1013,
            precipitation: fallbackData.current.precipitation || 0,
            uvIndex: fallbackData.current.uvIndex || 0
          },
          riskAnalysis: {
            risks: [],
            riskLevel: 'low'
          }
        };
        setWeatherData(formattedFallback);
      }
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    // Always fetch when coordinates change or when we don't have data
    if (latitude && longitude) {
      refreshWeatherData();
    }
  }, [latitude, longitude, refreshWeatherData]);

  useEffect(() => {
    // Set up auto-refresh interval (10 minutes) - simpler approach
    if (!latitude || !longitude) return;
    
    const interval = setInterval(() => {
      refreshWeatherData(true); // Force refresh for intervals
    }, 600000);
    
    return () => clearInterval(interval);
  }, [latitude, longitude]); // Only depend on coordinates

  const manualRefresh = useCallback(() => {
    refreshWeatherData(true);
  }, [refreshWeatherData]);

  return {
    weatherData,
    isLoading,
    error,
    refreshWeatherData: manualRefresh
  };
};
