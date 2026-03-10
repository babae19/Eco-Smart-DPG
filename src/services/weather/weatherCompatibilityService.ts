import { WeatherData as WeatherTypesData } from '@/types/WeatherTypes';
import { WeatherData as WeatherDataTypesData } from '@/types/WeatherDataTypes';

/**
 * Service to handle compatibility between different weather data formats
 */
export class WeatherCompatibilityService {
  /**
   * Convert WeatherDataTypes format to WeatherTypes format
   */
  static convertToWeatherTypes(data: WeatherDataTypesData): WeatherTypesData {
    return {
      day: 'Today',
      temp: data.current.temperature,
      minTemp: data.forecast[0]?.low || data.current.temperature - 5,
      maxTemp: data.forecast[0]?.high || data.current.temperature + 5,
      humidity: data.current.humidity,
      windSpeed: data.current.windSpeed,
      condition: this.mapCondition(data.current.conditions),
      precipChance: data.forecast[0]?.precipitation || 0,
      windDirection: data.current.windDirection,
      precipitation: data.current.precipitation,
      temperature: data.current.temperature,
      barometricPressure: data.current.pressure,
      uvIndex: data.current.uvIndex,
      feelsLike: data.current.feelsLike,
    };
  }

  /**
   * Convert WeatherTypes format to WeatherDataTypes format
   */
  static convertToWeatherDataTypes(data: WeatherTypesData): WeatherDataTypesData {
    return {
      location: 'Current Location',
      current: {
        temperature: data.temperature,
        conditions: this.mapConditionReverse(data.condition),
        humidity: data.humidity,
        windSpeed: data.windSpeed,
        windDirection: data.windDirection,
        pressure: data.barometricPressure,
        feelsLike: data.feelsLike || data.temperature,
        precipitation: data.precipitation,
        uvIndex: data.uvIndex,
      },
      forecast: [{
        date: new Date().toISOString().split('T')[0],
        high: data.maxTemp,
        low: data.minTemp,
        condition: this.mapConditionReverse(data.condition),
        precipitation: data.precipChance,
      }],
      riskAnalysis: {
        riskLevel: 'low',
        risks: [],
        recommendations: [],
        summary: 'Weather conditions appear normal.',
      },
    };
  }

  /**
   * Map conditions from string to specific types
   */
  private static mapCondition(condition: string): 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'drizzle' {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('rain')) {
      return 'rainy';
    } else if (conditionLower.includes('drizzle')) {
      return 'drizzle';
    } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
      return 'stormy';
    } else if (conditionLower.includes('cloud')) {
      return 'cloudy';
    } else if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
      return 'sunny';
    }
    
    return 'sunny';
  }

  /**
   * Map conditions from specific types to string
   */
  private static mapConditionReverse(condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'drizzle'): string {
    switch (condition) {
      case 'sunny':
        return 'Clear';
      case 'cloudy':
        return 'Cloudy';
      case 'rainy':
        return 'Rain';
      case 'stormy':
        return 'Thunderstorm';
      case 'drizzle':
        return 'Light Rain';
      default:
        return 'Clear';
    }
  }
}