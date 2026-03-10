
import React from 'react';
import { Thermometer, Wind, Droplets, Umbrella, Compass, ArrowDown, ArrowUp, Sun } from 'lucide-react';
import { WeatherData, TemperatureUnit } from '@/types/WeatherTypes';
import { formatTemperature } from '@/services/weather/temperatureUtils';

interface WeatherMetricsProps {
  data: WeatherData;
  temperatureUnit: TemperatureUnit;
}

const WeatherMetrics: React.FC<WeatherMetricsProps> = ({ data, temperatureUnit }) => {
  const getUVIndexLevel = (index?: number) => {
    if (!index && index !== 0) return 'N/A';
    
    if (index >= 11) return 'Extreme';
    if (index >= 8) return 'Very High';
    if (index >= 6) return 'High';
    if (index >= 3) return 'Moderate';
    return 'Low';
  };
  
  const getUVIndexColor = (index?: number) => {
    if (!index && index !== 0) return 'text-gray-400';
    
    if (index >= 11) return 'text-purple-600';
    if (index >= 8) return 'text-red-600';
    if (index >= 6) return 'text-orange-500';
    if (index >= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col">
        <div className="flex items-center text-gray-500 mb-1">
          <ArrowDown size={14} className="mr-1 text-blue-500" /> 
          <span className="text-xs">Low</span>
        </div>
        <div className="font-medium">
          {formatTemperature(data.minTemp, temperatureUnit)}
        </div>
      </div>
      
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col">
        <div className="flex items-center text-gray-500 mb-1">
          <ArrowUp size={14} className="mr-1 text-red-500" /> 
          <span className="text-xs">High</span>
        </div>
        <div className="font-medium">
          {formatTemperature(data.maxTemp, temperatureUnit)}
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col">
        <div className="flex items-center text-gray-500 mb-1">
          <Thermometer size={14} className="mr-1 text-orange-400" /> 
          <span className="text-xs">Feels Like</span>
        </div>
        <div className="font-medium">
          {data.feelsLike 
            ? formatTemperature(data.feelsLike, temperatureUnit) 
            : formatTemperature(data.temp, temperatureUnit)}
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col">
        <div className="flex items-center text-gray-500 mb-1">
          <Sun size={14} className="mr-1 text-yellow-500" /> 
          <span className="text-xs">UV Index</span>
        </div>
        <div className="font-medium flex items-center">
          <span>{data.uvIndex ?? 'N/A'}</span>
          <span className={`ml-2 text-xs ${getUVIndexColor(data.uvIndex)}`}>
            {getUVIndexLevel(data.uvIndex)}
          </span>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col">
        <div className="flex items-center text-gray-500 mb-1">
          <Wind size={14} className="mr-1" /> 
          <span className="text-xs">Wind</span>
        </div>
        <div className="font-medium flex items-center">
          <span>{data.windSpeed} km/h</span>
          {data.windDirection && (
            <span className="text-xs ml-1 text-gray-500">{data.windDirection}</span>
          )}
        </div>
      </div>
      
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col">
        <div className="flex items-center text-gray-500 mb-1">
          <Droplets size={14} className="mr-1" /> 
          <span className="text-xs">Humidity</span>
        </div>
        <div className="font-medium">
          {data.humidity}%
        </div>
      </div>
      
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col">
        <div className="flex items-center text-gray-500 mb-1">
          <Umbrella size={14} className="mr-1" /> 
          <span className="text-xs">Rain Chance</span>
        </div>
        <div className="font-medium">
          {data.precipChance}%
        </div>
      </div>

      {data.barometricPressure && (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center text-gray-500 mb-1">
            <Compass size={14} className="mr-1" /> 
            <span className="text-xs">Pressure</span>
          </div>
          <div className="font-medium">
            {data.barometricPressure} hPa
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherMetrics;
