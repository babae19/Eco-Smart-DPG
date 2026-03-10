
import React from 'react';
import { Sun, Cloud, CloudRain, CloudLightning } from 'lucide-react';

// Weather icon mapping function
export const getWeatherIcon = (condition: string, size = 50) => {
  switch (condition) {
    case 'sunny':
      return <Sun className="text-amber-500" size={size} />;
    case 'cloudy':
      return <Cloud className="text-gray-500" size={size} />;
    case 'rainy':
      return <CloudRain className="text-blue-500" size={size} />;
    case 'stormy':
      return <CloudLightning className="text-purple-500" size={size} />;
    case 'drizzle':
      return <CloudRain className="text-blue-400" size={size} />;
    default:
      return <Sun className="text-amber-500" size={size} />;
  }
};

// Generate mock weekly forecast data
export const getWeeklyForecast = (currentTemperature: number, currentCondition: string) => {
  return [
    { day: 'Today', temp: currentTemperature, condition: currentCondition },
    { day: 'Wed', temp: 32, condition: 'rainy' },
    { day: 'Thu', temp: 30, condition: 'drizzle' },
    { day: 'Fri', temp: 29, condition: 'rainy' },
    { day: 'Sat', temp: 30, condition: 'stormy' },
    { day: 'Sun', temp: 32, condition: 'sunny' },
    { day: 'Mon', temp: 31, condition: 'cloudy' }
  ];
};
