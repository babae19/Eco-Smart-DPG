
import { WeatherData } from '@/types/WeatherTypes';
import { UnifiedWeatherService } from '@/services/weather/unifiedWeatherService';

// Default coordinates for Freetown if no user location available
const DEFAULT_LATITUDE = 8.4657;
const DEFAULT_LONGITUDE = -13.2317;

// Function to get current weather data (synchronous) - uses cached data from unified service
export const getCurrentWeatherDataSync = (): WeatherData => {
  return UnifiedWeatherService.getCurrentWeatherDataSync();
};

// Function to update weather data (asynchronous) - now uses OpenWeatherMap API
export const updateWeatherData = async (latitude?: number, longitude?: number): Promise<WeatherData> => {
  const lat = latitude || DEFAULT_LATITUDE;
  const lng = longitude || DEFAULT_LONGITUDE;
  
  try {
    console.log('Updating weather data from OpenWeatherMap API...');
    return await UnifiedWeatherService.updateWeatherData(lat, lng);
  } catch (error) {
    console.error('Error updating weather data:', error);
    // Return sync data as fallback
    return getCurrentWeatherDataSync();
  }
};
