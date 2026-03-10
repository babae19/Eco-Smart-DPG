
import { Alert } from '@/types/AlertTypes';
import { SimulatedAlertsService } from '@/services/SimulatedAlertsService';
import { UnifiedWeatherService } from '@/services/weather/unifiedWeatherService';

export function generateSimulatedAlerts(): Alert[] {
  try {
    const allAlerts: Alert[] = [];
    
    // Get real-time weather data
    const currentWeather = UnifiedWeatherService.getCurrentWeatherDataSync();
    
    // Check if we need to generate a heat wave alert - based on real-time temperature
    const heatAlert = SimulatedAlertsService.generateHeatWaveAlert(currentWeather.temperature);
    if (heatAlert) {
      allAlerts.push(heatAlert);
    }
    
    // Generate rainfall alert if conditions are met - using real-time precipitation data
    if (currentWeather.precipitation > 35) {
      const rainAlert = SimulatedAlertsService.generateRainfallAlert(currentWeather.precipitation);
      allAlerts.push(rainAlert);
    }
    
    // Generate air quality alert if hot and dry - using real-time temperature and humidity
    if (currentWeather.temperature > 32 && currentWeather.humidity < 60) {
      allAlerts.push({
        id: `air-${Date.now()}`,
        title: "POOR AIR QUALITY ALERT",
        description: `Poor air quality detected in Freetown with temperature at ${currentWeather.temperature.toFixed(1)}°C and ${currentWeather.humidity.toFixed(0)}% humidity. Those with respiratory conditions should limit outdoor activities.`,
        location: "Freetown, Sierra Leone",
        severity: "medium",
        date: new Date().toLocaleDateString(),
        isNew: true,
        type: "air"
      });
    }
    
    // Generate wildfire alert if hot and dry for extended periods - using real-time data
    if (currentWeather.temperature > 34 && currentWeather.humidity < 50) {
      allAlerts.push({
        id: `fire-${Date.now()}`,
        title: "WILDFIRE RISK ALERT",
        description: `High temperatures (${currentWeather.temperature.toFixed(1)}°C) and dry conditions (${currentWeather.humidity.toFixed(0)}% humidity) have increased wildfire risk. Avoid open flames and report fire sightings immediately.`,
        location: "Freetown Outskirts",
        severity: "high",
        date: new Date().toLocaleDateString(),
        isNew: true,
        type: "fire"
      });
    }
    
    // Generate drought conditions alert if persistently hot and dry - using real-time data
    if (currentWeather.temperature > 35 && currentWeather.precipitation < 10) {
      allAlerts.push({
        id: `drought-${Date.now()}`,
        title: "DROUGHT CONDITIONS ADVISORY",
        description: `Continued dry conditions observed in Freetown with temperature at ${currentWeather.temperature.toFixed(1)}°C and precipitation at ${currentWeather.precipitation.toFixed(1)}mm. Conserve water and be mindful of wildfire risks.`,
        location: "Freetown, Sierra Leone",
        severity: "medium",
        date: new Date().toLocaleDateString(),
        isNew: true,
        type: "drought"
      });
    }
    
    return allAlerts;
  } catch (error) {
    console.error('Error generating simulated alerts:', error);
    return [];
  }
}
