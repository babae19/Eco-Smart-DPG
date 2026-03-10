
import { WeatherData } from '@/types/WeatherDataTypes';
import { WeatherRiskAnalysisService } from './weatherRiskAnalysisService';

export class WeatherDataProcessor {
  static processWeatherData(data: any, locationName?: string): WeatherData {
    console.log('[WeatherDataProcessor] Processing raw weather data:', data);
    
    // Handle OpenWeatherMap API structure - extract location properly
    let location = locationName || 'Current Location';
    
    // Try to get location from data if not provided
    if (!locationName) {
      if (data.location && typeof data.location === 'object') {
        const name = data.location.name || '';
        const country = data.location.country || '';
        if (name) {
          location = country ? `${name}, ${country}` : name;
        }
      } else if (data.current?.name) {
        const country = data.current.sys?.country || '';
        location = country ? `${data.current.name}, ${country}` : data.current.name;
      } else if (typeof data.location === 'string' && data.location !== 'Unknown') {
        location = data.location;
      }
    }
    
    // Extract current weather from OpenWeatherMap structure
    const currentWeather = data.current;
    const temperature = currentWeather?.main?.temp || currentWeather?.temperature || 0;
    const humidity = currentWeather?.main?.humidity || currentWeather?.humidity || 0;
    const windSpeed = currentWeather?.wind?.speed || currentWeather?.windSpeed || 0;
    const windDirection = currentWeather?.wind?.deg ? 
      WeatherDataProcessor.convertWindDegreeToDirection(currentWeather.wind.deg) : 
      (currentWeather?.windDirection || 'N');
    const pressure = currentWeather?.main?.pressure || currentWeather?.pressure || 1013;
    const feelsLike = currentWeather?.main?.feels_like || currentWeather?.feelsLike || temperature;
    const conditions = currentWeather?.weather?.[0]?.description || currentWeather?.conditions || 'Unknown';
    const uvIndex = currentWeather?.uvIndex || data.uvIndex || null;
    
    // Calculate precipitation chance from forecast if available
    let precipitation = 0;
    if (data.forecast && data.forecast.length > 0) {
      precipitation = (data.forecast[0].pop || 0) * 100;
    }
    
    // Validate and structure the weather data
    const structuredData: WeatherData = {
      location,
      current: {
        temperature,
        conditions,
        humidity,
        windSpeed,
        windDirection,
        pressure,
        feelsLike,
        precipitation,
        uvIndex
      },
      forecast: Array.isArray(data.forecast) ? data.forecast : [],
      riskAnalysis: data.riskAnalysis ? {
        riskLevel: data.riskAnalysis.riskLevel || 'low',
        risks: data.riskAnalysis.risks || [],
        recommendations: data.riskAnalysis.recommendations || [],
        summary: data.riskAnalysis.summary || 'No significant weather risks detected for current conditions.'
      } : {
        riskLevel: 'low',
        risks: [],
        recommendations: [],
        summary: 'No significant weather risks detected for current conditions.'
      }
    };

    // Add UV risk analysis if UV index is available
    WeatherRiskAnalysisService.analyzeUVRisks(structuredData);

    console.log('[WeatherDataProcessor] Processed weather data:', structuredData);
    return structuredData;
  }

  /**
   * Convert wind degree to direction string
   */
  private static convertWindDegreeToDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }
}
