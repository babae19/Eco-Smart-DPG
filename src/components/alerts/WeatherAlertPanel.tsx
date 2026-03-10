
import React from 'react';
import { AlertTriangle, CloudRain, Thermometer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useWeatherForecast } from '@/hooks/useWeatherForecast';
import UVIndexAlert from './UVIndexAlert';

const WeatherAlertPanel: React.FC = () => {
  const { weeklyForecast, error } = useWeatherForecast();
  const currentWeather = weeklyForecast?.[0];

  const alerts = [];

  if (currentWeather) {
    // Temperature alerts
    if (currentWeather.temp > 35) {
      alerts.push({
        type: 'temperature',
        severity: 'high',
        title: 'Extreme Heat Warning',
        description: 'Temperature exceeds 35°C. Stay hydrated and avoid prolonged sun exposure.',
        icon: <Thermometer className="h-5 w-5 text-red-600" />
      });
    } else if (currentWeather.temp > 32) {
      alerts.push({
        type: 'temperature',
        severity: 'medium',
        title: 'High Temperature Alert',
        description: 'Temperatures are higher than usual. Take precautions and stay hydrated.',
        icon: <Thermometer className="h-5 w-5 text-amber-600" />
      });
    }

    // Precipitation alerts
    if (currentWeather.precipChance > 70) {
      alerts.push({
        type: 'precipitation',
        severity: 'high',
        title: 'Heavy Rain Alert',
        description: 'High probability of heavy rainfall. Be prepared for potential flooding.',
        icon: <CloudRain className="h-5 w-5 text-red-600" />
      });
    } else if (currentWeather.precipChance > 50) {
      alerts.push({
        type: 'precipitation',
        severity: 'medium',
        title: 'Rain Warning',
        description: 'Moderate to heavy rain expected. Keep updated with weather conditions.',
        icon: <CloudRain className="h-5 w-5 text-amber-600" />
      });
    }
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Weather Data Error</AlertTitle>
          <AlertDescription>
            Unable to fetch current weather data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (alerts.length === 0 && !currentWeather) {
    return (
      <Card className="p-4 bg-green-50 border-green-100">
        <div className="flex items-center text-green-700">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>No active weather alerts for today</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* UV Index Alert - This will only display if UV data is available */}
      <UVIndexAlert />
      
      {/* Standard weather alerts */}
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          variant={alert.severity === 'high' ? 'destructive' : 'default'}
          className={alert.severity === 'high' ? 'border-red-500' : 'border-amber-500'}
        >
          <div className="flex items-start">
            {alert.icon}
            <div className="ml-3">
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
      
      {alerts.length === 0 && currentWeather && (
        <Card className="p-4 bg-green-50 border-green-100">
          <div className="flex items-center text-green-700">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>No weather alerts for current conditions</span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default WeatherAlertPanel;
