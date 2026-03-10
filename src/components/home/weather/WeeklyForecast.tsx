
import React from 'react';

interface ForecastDay {
  day: string;
  temp: number;
  condition: string;
}

interface WeeklyForecastProps {
  forecast: ForecastDay[];
  getWeatherIcon: (condition: string, size?: number) => React.ReactNode;
}

const WeeklyForecast: React.FC<WeeklyForecastProps> = ({ forecast, getWeatherIcon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-md font-semibold text-gray-700 mb-3">7-Day Forecast</h3>
      <div className="flex overflow-x-auto pb-2 -mx-1 hide-scrollbar">
        {forecast.map((day, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center mx-1 p-3 min-w-[4rem] rounded-lg ${
              index === 0 ? 'bg-blue-50 border border-blue-100' : ''
            }`}
          >
            <span className="text-xs font-medium mb-2">{day.day}</span>
            {getWeatherIcon(day.condition as string, 28)}
            <span className="text-sm font-medium mt-2">{typeof day.temp === 'number' ? day.temp.toFixed(1) : day.temp}°</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyForecast;
