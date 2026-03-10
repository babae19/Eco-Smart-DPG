import React from 'react';
import { useWeatherForecast } from '@/hooks/useWeatherForecast';
import { Sunrise, Sunset, CloudRain, Clock } from 'lucide-react';
import { formatTemperature } from '@/services/weather/temperatureUtils';
import { useWeatherStore } from '@/services/weather/globalWeatherState';
import { format, differenceInMinutes } from 'date-fns';

export const RealtimeWeatherInfo: React.FC = () => {
  const { weeklyForecast, lastUpdated } = useWeatherForecast();
  const { temperatureUnit } = useWeatherStore();

  if (!weeklyForecast || weeklyForecast.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Loading weather information...</p>
      </div>
    );
  }

  const today = weeklyForecast[0];
  const now = new Date();
  
  // Format sunrise and sunset times - using both property names for compatibility
  const sunriseTime = today.sunriseTime || today.sunrise || null;
  const sunsetTime = today.sunsetTime || today.sunset || null;
  
  const formatTimeOnly = (date: Date | null) => {
    if (!date) return 'Unknown';
    return format(date, 'h:mm a');
  };
  
  // Calculate time until next sunrise/sunset
  const getTimeUntil = (targetTime: Date | null) => {
    if (!targetTime) return null;
    
    // If target time is in the past, return null
    if (targetTime < now) return null;
    
    const minutesUntil = differenceInMinutes(targetTime, now);
    const hours = Math.floor(minutesUntil / 60);
    const minutes = minutesUntil % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  // Determine if we should show time until sunrise or sunset
  let nextSunEvent = null;
  let nextSunEventTime = null;
  let nextSunEventIcon = null;
  
  if (sunriseTime && sunriseTime > now) {
    nextSunEvent = "Sunrise";
    nextSunEventTime = getTimeUntil(sunriseTime);
    nextSunEventIcon = <Sunrise size={14} className="text-orange-500 mr-1" />;
  } else if (sunsetTime && sunsetTime > now) {
    nextSunEvent = "Sunset";
    nextSunEventTime = getTimeUntil(sunsetTime);
    nextSunEventIcon = <Sunset size={14} className="text-pink-500 mr-1" />;
  }
  
  // Format precipitation chance
  const formatPrecipChance = (chance: number) => {
    if (chance <= 0) return "No rain expected";
    if (chance < 20) return "Slight chance of rain";
    if (chance < 40) return "Low chance of rain";
    if (chance < 60) return "Moderate chance of rain";
    if (chance < 80) return "High chance of rain";
    return "Very likely to rain";
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm dark:bg-gray-800 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Weather</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {lastUpdated ? `Updated ${format(new Date(lastUpdated), 'h:mm a')}` : 'Live data'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 dark:text-gray-400">Sunrise</span>
          <div className="flex items-center mt-1">
            <Sunrise size={14} className="text-orange-500 mr-1" />
            <span className="text-sm font-medium">{formatTimeOnly(sunriseTime)}</span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 dark:text-gray-400">Sunset</span>
          <div className="flex items-center mt-1">
            <Sunset size={14} className="text-pink-500 mr-1" />
            <span className="text-sm font-medium">{formatTimeOnly(sunsetTime)}</span>
          </div>
        </div>
      </div>
      
      {nextSunEvent && nextSunEventTime && (
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded flex items-center">
          <Clock size={14} className="text-gray-500 mr-1" />
          <span className="text-xs">
            {nextSunEventIcon}
            {nextSunEvent} in {nextSunEventTime}
          </span>
        </div>
      )}
      
      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          <CloudRain size={16} className="text-blue-500 mr-2" />
          <div>
            <div className="flex items-center">
              <span className="text-sm font-medium">{today.precipChance}% chance of rain</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{formatPrecipChance(today.precipChance)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
