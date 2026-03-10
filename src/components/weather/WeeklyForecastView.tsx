
import React, { useMemo } from 'react';
import { WeatherData, TemperatureUnit } from '@/types/WeatherTypes';
import { getWeatherIcon } from '@/services/weather/weatherIconUtils';
import { convertTemperature, getTemperatureSymbol } from '@/services/weather/temperatureUtils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface WeeklyForecastViewProps {
  forecast: WeatherData[];
  selectedDay: number;
  onSelectDay: (index: number) => void;
  temperatureUnit: TemperatureUnit;
}

const DayItem = React.memo(({ 
  day, 
  index, 
  selectedDay, 
  onSelectDay,
  temperatureUnit
}: { 
  day: WeatherData; 
  index: number; 
  selectedDay: number; 
  onSelectDay: (index: number) => void;
  temperatureUnit: TemperatureUnit;
}) => (
  <motion.div 
    key={index} 
    initial={{ opacity: 0.6, y: 10 }}
    animate={{ 
      opacity: 1, 
      y: 0, 
      scale: selectedDay === index ? 1.05 : 1
    }}
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.2 }}
    className={cn(
      "flex flex-col items-center mx-1 p-2 min-w-[3.5rem] rounded-lg transition-all duration-300 cursor-pointer",
      selectedDay === index ? "bg-blue-100 border border-blue-200 shadow-sm dark:bg-blue-900/30 dark:border-blue-800" : 
        "hover:bg-blue-50 border border-transparent dark:hover:bg-blue-900/20",
      day.updated ? "animate-pulse" : ""
    )}
    onClick={() => onSelectDay(index)}
    role="button"
    tabIndex={0}
    aria-label={`Select ${day.day} weather forecast`}
    aria-selected={selectedDay === index}
  >
    <span className="text-xs font-medium mb-1">{day.day}</span>
    <div className={cn("my-1 transition-all", day.updated ? "scale-110" : "")}>
      {getWeatherIcon(day.condition)}
    </div>
    <span className="text-sm font-medium mt-1">
      {convertTemperature(day.temp, temperatureUnit)}°{getTemperatureSymbol(temperatureUnit)}
    </span>
    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
      <span>{convertTemperature(day.minTemp, temperatureUnit)}°</span>
      <span className="mx-1">-</span>
      <span>{convertTemperature(day.maxTemp, temperatureUnit)}°</span>
    </div>
  </motion.div>
));

const WeeklyForecastView: React.FC<WeeklyForecastViewProps> = ({ 
  forecast, 
  selectedDay, 
  onSelectDay,
  temperatureUnit
}) => {
  const forecastItems = useMemo(() => {
    return forecast.map((day, index) => (
      <DayItem 
        key={index}
        day={day} 
        index={index} 
        selectedDay={selectedDay} 
        onSelectDay={onSelectDay}
        temperatureUnit={temperatureUnit}
      />
    ));
  }, [forecast, selectedDay, onSelectDay, temperatureUnit]);

  return (
    <div className="flex overflow-x-auto scrollbar-hide pb-2 -mx-1 no-scrollbar hide-scrollbar">
      {forecastItems}
    </div>
  );
};

export default React.memo(WeeklyForecastView);
