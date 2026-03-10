
import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '@/types/WeatherTypes';
import { useUserLocation } from '@/contexts/LocationContext';
import { WeatherApiService } from '@/services/weather/weatherApiService';

const mapWeatherCondition = (openWeatherCondition: string): WeatherData['condition'] => {
  if (openWeatherCondition.includes('thunderstorm')) return 'stormy';
  if (openWeatherCondition.includes('drizzle')) return 'drizzle';
  if (openWeatherCondition.includes('rain')) return 'rainy';
  if (openWeatherCondition.includes('clouds')) return 'cloudy';
  return 'sunny';
};

export const useWeatherForecast = () => {
  const [weeklyForecast, setWeeklyForecast] = useState<WeatherData[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { latitude, longitude } = useUserLocation();

  const updateWeather = useCallback(async () => {
    if (!latitude || !longitude) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      // Use the unified WeatherApiService for consistency
      const weatherData = await WeatherApiService.fetchWeatherData(latitude, longitude);
      
      // Check if we have forecast data
      if (weatherData && weatherData.forecast && Array.isArray(weatherData.forecast) && weatherData.forecast.length > 0) {
        console.log('[useWeatherForecast] Processing forecast data:', weatherData.forecast);
        
        const mappedForecast: WeatherData[] = weatherData.forecast.map((day: Record<string, unknown>, index: number) => {
          // Get sunrise and sunset from API if available
          // These would be in Unix timestamp format most likely
          const sunrise = typeof day.sunrise === 'number' ? new Date(day.sunrise * 1000) : undefined;
          const sunset = typeof day.sunset === 'number' ? new Date(day.sunset * 1000) : undefined;
          
          // If not available, generate reasonable defaults
          const defaultSunrise = new Date(new Date().setHours(6, 0, 0, 0));
          const defaultSunset = new Date(new Date().setHours(18, 0, 0, 0));
          
          // Calculate precipitation chance correctly
          const precipChance = typeof day.pop === 'number' ? Math.round(day.pop * 100) : 0; // Convert from 0-1 to 0-100%
          
          return {
            day: index === 0 ? 'Today' : new Date((day.dt as number) * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            temp: (day.temp as any)?.day || day.temperature || 28,
            minTemp: (day.temp as any)?.min || (Number(day.temperature) - 3) || 25,
            maxTemp: (day.temp as any)?.max || (Number(day.temperature) + 3) || 31,
            humidity: Number(day.humidity) || 75,
            windSpeed: Number(day.speed || day.windSpeed) || 10,
            condition: mapWeatherCondition(String((day.weather as any)?.[0]?.main || day.conditions || 'Clear').toLowerCase()),
            precipChance,
            updated: true,
            temperature: Number((day.temp as any)?.day || day.temperature || 28),
            feelsLike: Number((day.feels_like as any)?.day || day.feelsLike || ((day.temp as any)?.day || day.temperature || 28)) + (Math.random() > 0.5 ? 2 : -1),
            uvIndex: Number(day.uvi || day.uvIndex) || Math.floor(Math.random() * 10),
            sunrise: sunrise || defaultSunrise,
            sunset: sunset || defaultSunset,
            sunriseTime: sunrise || defaultSunrise,
            sunsetTime: sunset || defaultSunset,
            barometricPressure: Number(day.pressure) || 1013 + Math.floor(Math.random() * 10 - 5)
          };
        });

        setWeeklyForecast(mappedForecast);
        setLastUpdated(new Date());
        console.log(`[useWeatherForecast] Weather updated from OpenWeatherMap API via WeatherApiService with ${mappedForecast.length} forecast days`);
      } else {
        console.log('[useWeatherForecast] No forecast data available, using fallback');
        throw new Error('No forecast data available');
      }
    } catch (apiError) {
      console.error('Failed to update weather from OpenWeatherMap API:', apiError);
      // Use mock data as fallback
      const mockData: WeatherData[] = [
          {
            day: 'Today',
            temp: 32,
            minTemp: 26,
            maxTemp: 34,
            humidity: 75,
            windSpeed: 12,
            condition: 'sunny',
            precipChance: 10,
            temperature: 32, 
            feelsLike: 35, // Added feels like temperature (hotter than actual)
            uvIndex: 8, // Added UV index - high
            sunrise: new Date(new Date().setHours(6, 30, 0, 0)),
            sunset: new Date(new Date().setHours(18, 45, 0, 0)),
            sunriseTime: new Date(new Date().setHours(6, 30, 0, 0)),
            sunsetTime: new Date(new Date().setHours(18, 45, 0, 0)),
            barometricPressure: 1010 // Lower pressure
          },
          {
            day: 'Tue',
            temp: 30,
            minTemp: 25,
            maxTemp: 32,
            humidity: 80,
            windSpeed: 10,
            condition: 'cloudy',
            precipChance: 30,
            temperature: 30,
            feelsLike: 32, // Added feels like temperature
            uvIndex: 6, // Added UV index - moderate
            sunrise: new Date(new Date().setHours(6, 31, 0, 0)),
            sunset: new Date(new Date().setHours(18, 44, 0, 0)),
            sunriseTime: new Date(new Date().setHours(6, 31, 0, 0)),
            sunsetTime: new Date(new Date().setHours(18, 44, 0, 0)),
            barometricPressure: 1012
          },
          {
            day: 'Wed',
            temp: 29,
            minTemp: 24,
            maxTemp: 31,
            humidity: 85,
            windSpeed: 15,
            condition: 'rainy',
            precipChance: 70,
            temperature: 29,
            feelsLike: 31, // Added feels like temperature
            uvIndex: 3, // Added UV index - moderate low (cloudy)
            sunrise: new Date(new Date().setHours(6, 32, 0, 0)),
            sunset: new Date(new Date().setHours(18, 43, 0, 0)),
            sunriseTime: new Date(new Date().setHours(6, 32, 0, 0)),
            sunsetTime: new Date(new Date().setHours(18, 43, 0, 0)),
            barometricPressure: 1008 // Lower pressure (rain)
          },
          {
            day: 'Thu',
            temp: 28,
            minTemp: 23,
            maxTemp: 30,
            humidity: 90,
            windSpeed: 18,
            condition: 'rainy',
            precipChance: 80,
            temperature: 28,
            feelsLike: 29, // Added feels like temperature
            uvIndex: 2, // Added UV index - low (heavy clouds)
            sunrise: new Date(new Date().setHours(6, 33, 0, 0)),
            sunset: new Date(new Date().setHours(18, 42, 0, 0)),
            sunriseTime: new Date(new Date().setHours(6, 33, 0, 0)),
            sunsetTime: new Date(new Date().setHours(18, 42, 0, 0)),
            barometricPressure: 1005 // Even lower (storms)
          },
          {
            day: 'Fri',
            temp: 30,
            minTemp: 25,
            maxTemp: 32,
            humidity: 70,
            windSpeed: 14,
            condition: 'cloudy',
            precipChance: 20,
            temperature: 30,
            feelsLike: 32, // Added feels like temperature
            uvIndex: 5, // Added UV index - moderate
            sunrise: new Date(new Date().setHours(6, 34, 0, 0)),
            sunset: new Date(new Date().setHours(18, 41, 0, 0)),
            sunriseTime: new Date(new Date().setHours(6, 34, 0, 0)),
            sunsetTime: new Date(new Date().setHours(18, 41, 0, 0)),
            barometricPressure: 1011 // Rising pressure (improving weather)
          }
      ];
      
      console.log('Using mock weather data');
      setWeeklyForecast(mockData);
      setLastUpdated(new Date());
      setError('Failed to fetch weather data');
    } finally {
      setIsUpdating(false);
    }
  }, []); // Remove dependencies to prevent loops

  // Update weather when location changes - simpler approach
  useEffect(() => {
    if (latitude && longitude && weeklyForecast.length === 0) {
      updateWeather();
    }
  }, [latitude, longitude]); // Only depend on coordinates

  return {
    weeklyForecast,
    selectedDay,
    setSelectedDay,
    lastUpdated,
    isUpdating,
    updateWeather,
    error
  };
};
