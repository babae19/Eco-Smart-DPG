import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { WeatherApiService } from '@/services/weather/weatherApiService';
import { WeatherDataProcessor } from '@/services/weather/weatherDataProcessor';
import { useUserLocation } from '@/contexts/LocationContext';
import { WeatherData } from '@/types/WeatherTypes';
import { WeatherData as WeatherDataTypes } from '@/types/WeatherDataTypes';

interface WeatherContextType {
  // Current weather
  currentWeather: any;
  // Weekly forecast
  weeklyForecast: WeatherData[];
  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  // Error states
  error: string | null;
  // Actions
  refreshWeather: () => Promise<void>;
  // Metadata
  lastUpdated: Date | null;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const CACHE_KEY = 'weather_cache';

interface CachedWeather {
  data: WeatherDataTypes;
  timestamp: number;
  coordinates: { lat: number; lng: number };
}

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [weeklyForecast, setWeeklyForecast] = useState<WeatherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { latitude, longitude } = useUserLocation();

  // Check if we have valid cached data
  const getCachedWeather = useCallback((lat: number, lng: number): CachedWeather | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsed: CachedWeather = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - parsed.timestamp > CACHE_DURATION) return null;
      
      // Check if coordinates match (within small margin)
      const coordMatch = 
        Math.abs(parsed.coordinates.lat - lat) < 0.01 &&
        Math.abs(parsed.coordinates.lng - lng) < 0.01;
      
      if (!coordMatch) return null;
      
      return parsed;
    } catch {
      return null;
    }
  }, []);

  // Save weather data to cache
  const cacheWeather = useCallback((data: WeatherDataTypes, lat: number, lng: number) => {
    try {
      const cacheData: CachedWeather = {
        data,
        timestamp: Date.now(),
        coordinates: { lat, lng }
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('[WeatherContext] Failed to cache weather data:', error);
    }
  }, []);

  // Map weather condition helper
  const mapWeatherCondition = useCallback((openWeatherCondition: string): WeatherData['condition'] => {
    if (openWeatherCondition.includes('thunderstorm')) return 'stormy';
    if (openWeatherCondition.includes('drizzle')) return 'drizzle';
    if (openWeatherCondition.includes('rain')) return 'rainy';
    if (openWeatherCondition.includes('clouds')) return 'cloudy';
    return 'sunny';
  }, []);

  // Main fetch function
  const fetchWeather = useCallback(async (forceRefresh = false) => {
    if (!latitude || !longitude) {
      setIsLoading(false);
      return;
    }

    // Check cache first unless forced refresh
    if (!forceRefresh) {
      const cached = getCachedWeather(latitude, longitude);
      if (cached) {
        console.log('[WeatherContext] Using cached weather data');
        const processedData = WeatherDataProcessor.processWeatherData(cached.data);
        
        setCurrentWeather({
          current: processedData.current,
          riskAnalysis: processedData.riskAnalysis
        });

        if (cached.data.forecast && cached.data.forecast.length > 0) {
          const mappedForecast: WeatherData[] = cached.data.forecast.map((day: any, index: number) => {
            const sunrise = typeof day.sunrise === 'number' ? new Date(day.sunrise * 1000) : new Date(new Date().setHours(6, 0, 0, 0));
            const sunset = typeof day.sunset === 'number' ? new Date(day.sunset * 1000) : new Date(new Date().setHours(18, 0, 0, 0));
            const precipChance = typeof day.pop === 'number' ? Math.round(day.pop * 100) : (day.precipitation || 0);
            
            return {
              day: index === 0 ? 'Today' : new Date((day.dt as number) * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
              temp: (day.temp as any)?.day || day.high || 28,
              minTemp: (day.temp as any)?.min || day.low || 25,
              maxTemp: (day.temp as any)?.max || day.high || 31,
              humidity: Number(day.humidity) || 75,
              windSpeed: Number(day.speed || day.windSpeed) || 10,
              condition: mapWeatherCondition(String((day.weather as any)?.[0]?.main || day.condition || 'Clear').toLowerCase()),
              precipChance,
              updated: true,
              temperature: Number((day.temp as any)?.day || day.high || 28),
              feelsLike: Number((day.feels_like as any)?.day || day.feelsLike || ((day.temp as any)?.day || 28)),
              uvIndex: Number(day.uvi || day.uvIndex) || 5,
              sunrise,
              sunset,
              sunriseTime: sunrise,
              sunsetTime: sunset,
              barometricPressure: Number(day.pressure) || 1013
            };
          });
          setWeeklyForecast(mappedForecast);
        }

        setLastUpdated(new Date(cached.timestamp));
        setIsLoading(false);
        return;
      }
    }

    const loading = forceRefresh ? setIsUpdating : setIsLoading;
    loading(true);
    setError(null);

    try {
      console.log('[WeatherContext] Fetching fresh weather data');
      const apiResponse: WeatherDataTypes = await WeatherApiService.fetchWeatherData(latitude, longitude);
      const processedData = WeatherDataProcessor.processWeatherData(apiResponse);
      
      // Cache the response
      cacheWeather(apiResponse, latitude, longitude);

      // Set current weather
      setCurrentWeather({
        current: processedData.current,
        riskAnalysis: processedData.riskAnalysis
      });

      // Process and set forecast
      if (apiResponse.forecast && apiResponse.forecast.length > 0) {
        const mappedForecast: WeatherData[] = apiResponse.forecast.map((day: any, index: number) => {
          const sunrise = typeof day.sunrise === 'number' ? new Date(day.sunrise * 1000) : new Date(new Date().setHours(6, 0, 0, 0));
          const sunset = typeof day.sunset === 'number' ? new Date(day.sunset * 1000) : new Date(new Date().setHours(18, 0, 0, 0));
          const precipChance = typeof day.pop === 'number' ? Math.round(day.pop * 100) : (day.precipitation || 0);
          
          return {
            day: index === 0 ? 'Today' : new Date((day.dt as number) * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            temp: (day.temp as any)?.day || day.high || 28,
            minTemp: (day.temp as any)?.min || day.low || 25,
            maxTemp: (day.temp as any)?.max || day.high || 31,
            humidity: Number(day.humidity) || 75,
            windSpeed: Number(day.speed || day.windSpeed) || 10,
            condition: mapWeatherCondition(String((day.weather as any)?.[0]?.main || day.condition || 'Clear').toLowerCase()),
            precipChance,
            updated: true,
            temperature: Number((day.temp as any)?.day || day.high || 28),
            feelsLike: Number((day.feels_like as any)?.day || day.feelsLike || ((day.temp as any)?.day || 28)),
            uvIndex: Number(day.uvi || day.uvIndex) || 5,
            sunrise,
            sunset,
            sunriseTime: sunrise,
            sunsetTime: sunset,
            barometricPressure: Number(day.pressure) || 1013
          };
        });
        setWeeklyForecast(mappedForecast);
      }

      setLastUpdated(new Date());
      setError(null);
      console.log('[WeatherContext] Successfully fetched and cached weather data');
    } catch (err) {
      console.error('[WeatherContext] Error fetching weather:', err);
      setError('Unable to fetch weather data');
    } finally {
      loading(false);
    }
  }, [latitude, longitude, getCachedWeather, cacheWeather, mapWeatherCondition]);

  // Initial fetch
  useEffect(() => {
    if (latitude && longitude) {
      fetchWeather();
    }
  }, [latitude, longitude]); // Only trigger on coordinate changes

  // Auto-refresh every 10 minutes
  useEffect(() => {
    if (!latitude || !longitude) return;

    const interval = setInterval(() => {
      fetchWeather(true);
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [latitude, longitude, fetchWeather]);

  const refreshWeather = useCallback(async () => {
    await fetchWeather(true);
  }, [fetchWeather]);

  const value = useMemo(() => ({
    currentWeather,
    weeklyForecast,
    isLoading,
    isUpdating,
    error,
    refreshWeather,
    lastUpdated
  }), [currentWeather, weeklyForecast, isLoading, isUpdating, error, refreshWeather, lastUpdated]);

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
