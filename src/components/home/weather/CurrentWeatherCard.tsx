
import React from 'react';
import { MapPin, ArrowUp, ArrowDown, Droplets, CloudRain, Wind } from 'lucide-react';

interface CurrentWeatherCardProps {
  temperature: number;
  highTemp: number;
  lowTemp: number;
  condition: string;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  getWeatherIcon: (condition: string, size?: number) => React.ReactNode;
}

const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  temperature,
  highTemp,
  lowTemp,
  condition,
  humidity,
  precipitation,
  windSpeed,
  getWeatherIcon
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg overflow-hidden mb-4">
      <div className="p-4 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-2xl">{temperature.toFixed(1)}°C</h3>
          <div className="flex items-center text-blue-100 text-sm">
            <MapPin size={12} className="mr-1" />
            <span>Current Location</span>
          </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="flex items-center text-xs">
                <ArrowUp size={10} className="mr-0.5" />
                {highTemp}°
              </span>
              <span className="flex items-center text-xs">
                <ArrowDown size={10} className="mr-0.5" />
                {lowTemp}°
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            {getWeatherIcon(condition)}
            <span className="capitalize text-sm mt-1">
              {condition}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center p-2 bg-white/10 rounded">
            <Droplets size={16} className="mb-1" />
            <span className="text-xs">Humidity</span>
            <span className="font-medium text-sm">{humidity}%</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-white/10 rounded">
            <CloudRain size={16} className="mb-1" />
            <span className="text-xs">Precipitation</span>
            <span className="font-medium text-sm">{precipitation}%</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-white/10 rounded">
            <Wind size={16} className="mb-1" />
            <span className="text-xs">Wind</span>
            <span className="font-medium text-sm">{windSpeed} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeatherCard;
