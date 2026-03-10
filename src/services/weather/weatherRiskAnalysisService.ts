
import { WeatherData, WeatherRisk } from '@/types/WeatherDataTypes';

export class WeatherRiskAnalysisService {
  static analyzeUVRisks(weatherData: WeatherData): void {
    if (weatherData.current.uvIndex !== null && weatherData.current.uvIndex !== undefined) {
      const uvIndex = weatherData.current.uvIndex;
      
      if (uvIndex >= 11) {
        weatherData.riskAnalysis!.riskLevel = 'high';
        weatherData.riskAnalysis!.risks.push({
          type: 'uv',
          severity: 'high',
          description: 'Extreme UV exposure risk',
          recommendations: ['Avoid outdoor activities between 10 AM - 4 PM', 'Use SPF 30+ sunscreen and reapply every 2 hours']
        });
      } else if (uvIndex >= 8) {
        weatherData.riskAnalysis!.riskLevel = 'medium';
        weatherData.riskAnalysis!.risks.push({
          type: 'uv',
          severity: 'medium',
          description: 'High UV exposure risk',
          recommendations: ['Use SPF 30+ sunscreen', 'Wear protective clothing and sunglasses']
        });
      }
    }
  }

  static createFallbackData(): WeatherData {
    return {
      location: 'Freetown',
      current: {
        temperature: 27,
        conditions: 'Unknown',
        humidity: 70,
        windSpeed: 5,
        feelsLike: 27,
        precipitation: 0,
        uvIndex: null
      },
      forecast: [],
      riskAnalysis: {
        riskLevel: 'low',
        risks: [],
        recommendations: [],
        summary: 'No significant weather risks detected for current conditions.'
      }
    };
  }
}
