
import React from 'react';
import { Thermometer, RefreshCw } from 'lucide-react';
import { formatTemperature } from '@/services/weather/temperatureUtils';
import TemperatureUnitToggle from '@/components/weather/TemperatureUnitToggle';
import { TemperatureUnit } from '@/types/WeatherTypes';

interface DailyWeatherHeaderProps {
  currentTemperature: number;
  temperatureUnit: TemperatureUnit;
  isUpdating: boolean;
  onUpdateWeather: () => void;
  hasLocation: boolean;
}

const DailyWeatherHeader: React.FC<DailyWeatherHeaderProps> = ({
  currentTemperature,
  temperatureUnit,
  isUpdating,
  onUpdateWeather,
  hasLocation,
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-semibold text-gray-700 flex items-center">
          <Thermometer size={18} className="text-blue-500 mr-2" />
          Current Weather
        </h3>
        <div className="flex items-center">
          <span className="text-sm font-medium text-blue-700 mr-3">
            {formatTemperature(currentTemperature, temperatureUnit)} Now
          </span>
          <TemperatureUnitToggle />
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">
          {hasLocation ? 'Based on your location' : 'Default location'}
        </span>
        <button 
          onClick={onUpdateWeather} 
          disabled={isUpdating}
          className="text-xs text-blue-600 flex items-center hover:underline disabled:text-gray-400"
        >
          <RefreshCw size={12} className={`mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
          {isUpdating ? 'Updating...' : 'Refresh'}
        </button>
      </div>
    </>
  );
};

export default DailyWeatherHeader;
