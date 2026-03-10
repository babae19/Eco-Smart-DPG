
import React from 'react';
import { useWeatherForecast } from '@/hooks/useWeatherForecast';
import { Progress } from '@/components/ui/progress';
import { Thermometer, AlertCircle } from 'lucide-react';

const TemperatureGauge: React.FC = () => {
  const { weeklyForecast, isUpdating, error } = useWeatherForecast();
  const currentTemp = weeklyForecast[0]?.temp || 0;
  
  // Calculate temperature percentage (assuming range -10°C to 45°C)
  const tempPercentage = Math.min(100, Math.max(0, ((currentTemp + 10) / 55) * 100));
  
  // Determine color based on temperature
  const getColor = (temp: number) => {
    if (temp >= 35) return 'bg-red-500';
    if (temp >= 30) return 'bg-orange-500';
    if (temp >= 25) return 'bg-yellow-500';
    if (temp >= 20) return 'bg-green-500';
    return 'bg-blue-500';
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2 text-amber-500">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold">Weather Data Error</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Unable to fetch current temperature. Using default data.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <Thermometer className="h-5 w-5 text-gray-500" />
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">
          Current Temperature
        </h3>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          {currentTemp.toFixed(1)}°C
        </span>
        {isUpdating && (
          <span className="text-xs text-gray-500">Updating...</span>
        )}
      </div>

      <Progress 
        value={tempPercentage} 
        className="h-3"
        indicatorClassName={getColor(currentTemp)}
      />
      
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>-10°C</span>
        <span>45°C</span>
      </div>
    </div>
  );
};

export default TemperatureGauge;
