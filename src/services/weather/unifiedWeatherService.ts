import { WeatherApiService } from './weatherApiService';
import { WeatherDataProcessor } from './weatherDataProcessor';
import { WeatherRiskAnalysisService } from './weatherRiskAnalysisService';
import { WeatherData as WeatherDataTypes } from '@/types/WeatherDataTypes';
import { WeatherData as WeatherTypesData } from '@/types/WeatherTypes';
import { WeatherCompatibilityService } from './weatherCompatibilityService';

/**
 * Unified Weather Service that provides consistent access to OpenWeatherMap API
 * for all weather-related components in the application
 */
export class UnifiedWeatherService {
  private static cachedData: WeatherDataTypes | null = null;
  private static lastFetch: Date | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get current weather data from OpenWeatherMap API with caching
   */
  static async getCurrentWeatherData(latitude: number, longitude: number): Promise<WeatherDataTypes> {
    // Check if we have cached data that's still fresh
    if (this.cachedData && this.lastFetch && 
        (Date.now() - this.lastFetch.getTime()) < this.CACHE_DURATION) {
      return this.cachedData;
    }

    try {
      const rawData = await WeatherApiService.fetchWeatherData(latitude, longitude);
      const processedData = WeatherDataProcessor.processWeatherData(rawData);
      
      // Cache the data
      this.cachedData = processedData;
      this.lastFetch = new Date();
      
      return processedData;
    } catch (error) {
      console.error('[UnifiedWeatherService] Failed to fetch weather data:', error);
      
      // Return fallback data if API fails
      const fallbackData = WeatherRiskAnalysisService.createFallbackData();
      this.cachedData = fallbackData;
      this.lastFetch = new Date();
      
      return fallbackData;
    }
  }

  /**
   * Get current weather data in legacy WeatherTypes format for backwards compatibility
   */
  static async getCurrentWeatherDataLegacy(latitude: number, longitude: number): Promise<WeatherTypesData> {
    const weatherData = await this.getCurrentWeatherData(latitude, longitude);
    
    // Convert to legacy format
    return {
      day: 'Today',
      temp: weatherData.current.temperature,
      minTemp: weatherData.current.temperature - 3,
      maxTemp: weatherData.current.temperature + 3,
      humidity: weatherData.current.humidity,
      windSpeed: weatherData.current.windSpeed,
      condition: this.mapConditionToLegacy(weatherData.current.conditions),
      precipChance: weatherData.current.precipitation ? Math.min(90, weatherData.current.precipitation * 5) : 10,
      windDirection: weatherData.current.windDirection,
      precipitation: weatherData.current.precipitation,
      lastUpdated: new Date(),
      temperature: weatherData.current.temperature,
      feelsLike: weatherData.current.feelsLike,
      barometricPressure: weatherData.current.pressure,
      uvIndex: weatherData.current.uvIndex,
      sunriseTime: new Date(new Date().setHours(6, 30, 0, 0)),
      sunsetTime: new Date(new Date().setHours(18, 45, 0, 0)),
      sunrise: new Date(new Date().setHours(6, 30, 0, 0)),
      sunset: new Date(new Date().setHours(18, 45, 0, 0))
    };
  }

  /**
   * Get weather data synchronously from cache (for backwards compatibility)
   * Note: This will return cached data or fallback data if no cache exists
   */
  static getCurrentWeatherDataSync(): WeatherTypesData {
    if (this.cachedData) {
      return {
        day: 'Today',
        temp: this.cachedData.current.temperature,
        minTemp: this.cachedData.current.temperature - 3,
        maxTemp: this.cachedData.current.temperature + 3,
        humidity: this.cachedData.current.humidity,
        windSpeed: this.cachedData.current.windSpeed,
        condition: this.mapConditionToLegacy(this.cachedData.current.conditions),
        precipChance: this.cachedData.current.precipitation ? Math.min(90, this.cachedData.current.precipitation * 5) : 10,
        windDirection: this.cachedData.current.windDirection,
        precipitation: this.cachedData.current.precipitation,
        lastUpdated: new Date(),
        temperature: this.cachedData.current.temperature,
        feelsLike: this.cachedData.current.feelsLike,
        barometricPressure: this.cachedData.current.pressure,
        uvIndex: this.cachedData.current.uvIndex,
        sunriseTime: new Date(new Date().setHours(6, 30, 0, 0)),
        sunsetTime: new Date(new Date().setHours(18, 45, 0, 0)),
        sunrise: new Date(new Date().setHours(6, 30, 0, 0)),
        sunset: new Date(new Date().setHours(18, 45, 0, 0))
      };
    }

    // Return fallback data
    const fallback = WeatherRiskAnalysisService.createFallbackData();
    return {
      day: 'Today',
      temp: fallback.current.temperature,
      minTemp: fallback.current.temperature - 3,
      maxTemp: fallback.current.temperature + 3,
      humidity: fallback.current.humidity,
      windSpeed: fallback.current.windSpeed,
      condition: this.mapConditionToLegacy(fallback.current.conditions),
      precipChance: 30,
      windDirection: 'SW',
      precipitation: fallback.current.precipitation,
      lastUpdated: new Date(),
      temperature: fallback.current.temperature,
      feelsLike: fallback.current.feelsLike,
      barometricPressure: 1013,
      uvIndex: fallback.current.uvIndex,
      sunriseTime: new Date(new Date().setHours(6, 30, 0, 0)),
      sunsetTime: new Date(new Date().setHours(18, 45, 0, 0)),
      sunrise: new Date(new Date().setHours(6, 30, 0, 0)),
      sunset: new Date(new Date().setHours(18, 45, 0, 0))
    };
  }

  /**
   * Update weather data (async wrapper for backwards compatibility)
   */
  static async updateWeatherData(latitude: number, longitude: number): Promise<WeatherTypesData> {
    // Clear cache to force fresh fetch
    this.cachedData = null;
    this.lastFetch = null;
    
    return await this.getCurrentWeatherDataLegacy(latitude, longitude);
  }

  /**
   * Clear cached data
   */
  static clearCache(): void {
    this.cachedData = null;
    this.lastFetch = null;
  }

  /**
   * Map OpenWeatherMap conditions to legacy condition format
   */
  private static mapConditionToLegacy(condition: string): WeatherTypesData['condition'] {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('thunderstorm') || lowerCondition.includes('storm')) {
      return 'stormy';
    }
    if (lowerCondition.includes('drizzle')) {
      return 'drizzle';
    }
    if (lowerCondition.includes('rain')) {
      return 'rainy';
    }
    if (lowerCondition.includes('cloud')) {
      return 'cloudy';
    }
    
    return 'sunny';
  }

  // Method to convert between weather data formats for compatibility
  static convertWeatherData(data: WeatherDataTypes): WeatherTypesData {
    return WeatherCompatibilityService.convertToWeatherTypes(data);
  }

  static convertToDataTypes(data: WeatherTypesData): WeatherDataTypes {
    return WeatherCompatibilityService.convertToWeatherDataTypes(data);
  }
}