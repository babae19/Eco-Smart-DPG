
import { Alert } from '@/types/AlertTypes';
import { predictDisasterRisk } from '@/services/disaster/disasterPredictionAlgorithms';
import { UnifiedWeatherService } from '@/services/weather/unifiedWeatherService';

export function generatePersonalizedAlerts(latitude: number, longitude: number): Alert[] {
  if (!latitude || !longitude) return [];
  
  try {
    const weatherData = UnifiedWeatherService.getCurrentWeatherDataSync();
    // Convert WeatherTypes.WeatherData to AlertTypes.WeatherData
    const alertWeatherData = {
      temperature: weatherData.temperature, 
      humidity: weatherData.humidity,
      precipitation: weatherData.precipitation || 0, // Provide default value if undefined
      windSpeed: weatherData.windSpeed,
      windDirection: weatherData.windDirection || 'Unknown',
      barometricPressure: weatherData.barometricPressure || 1013.25,
      lastUpdated: weatherData.lastUpdated || new Date()
    };
    
    const predictions = predictDisasterRisk(latitude, longitude, alertWeatherData);
    
    // Convert predictions to alerts
    const personalizedAlerts = predictions.map((prediction, index) => ({
      id: `personalized-${Date.now()}-${index}`,
      title: `${prediction.alertLevel.toUpperCase()} RISK: ${prediction.predictedDisasterType.toUpperCase()}`,
      description: prediction.triggeringFactors.join('. '),
      location: "Your Location",
      severity: prediction.alertLevel as 'high' | 'medium' | 'low',
      date: new Date().toLocaleDateString(),
      isNew: true,
      type: prediction.predictedDisasterType.toLowerCase(),
      aiPredictionScore: prediction.riskScore / 100,
      predictedImpact: prediction.recommendedActions.join('. '),
      weatherFactor: prediction.triggeringFactors.find(f => 
        f.includes('rainfall') || f.includes('temperature') || f.includes('humidity')
      ),
      isPersonalized: true
    }));
    
    return personalizedAlerts;
  } catch (error) {
    console.error('Error generating personalized alerts:', error);
    return [];
  }
}
