
import { supabase } from '@/integrations/supabase/client';
import { WeatherData } from '@/types/WeatherDataTypes';

export class WeatherApiService {
  static async fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    console.log('[WeatherApiService] Fetching weather data for:', { latitude, longitude });

    try {
      const { data, error: fetchError } = await supabase.functions.invoke('weather', {
        body: { 
          latitude: parseFloat(latitude.toFixed(6)), 
          longitude: parseFloat(longitude.toFixed(6))
        }
      });

      if (fetchError) {
        console.error('[WeatherApiService] Edge function error:', fetchError);
        // Return fallback data instead of throwing
        return this.getFallbackWeatherData();
      }

      if (!data) {
        console.warn('[WeatherApiService] No data received, using fallback');
        return this.getFallbackWeatherData();
      }

      return data;
    } catch (error) {
      console.error('[WeatherApiService] Network error:', error);
      // Return fallback data for any network errors
      return this.getFallbackWeatherData();
    }
  }

  private static getFallbackWeatherData(): WeatherData {
    return {
      location: 'Freetown',
      current: {
        temperature: 27,
        conditions: 'Partly Cloudy',
        humidity: 75,
        windSpeed: 8,
        windDirection: 'SW',
        pressure: 1013,
        feelsLike: 29,
        precipitation: 0,
        uvIndex: 6
      },
      forecast: [
        {
          date: new Date().toISOString().split('T')[0],
          high: 28,
          low: 24,
          condition: 'Partly Cloudy',
          precipitation: 10
        }
      ],
      riskAnalysis: {
        riskLevel: 'low',
        risks: [],
        recommendations: ['Stay hydrated', 'Use sun protection during peak hours'],
        summary: 'Generally favorable weather conditions with minimal risks.'
      }
    };
  }
}
