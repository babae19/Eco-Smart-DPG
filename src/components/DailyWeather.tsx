
import React from 'react';
import { useUserLocation } from '@/contexts/LocationContext';
import WeatherMetrics from '@/components/weather/WeatherMetrics';
import WeeklyForecastView from '@/components/weather/WeeklyForecastView';
import { useWeatherForecast } from '@/hooks/useWeatherForecast';
import { useWeatherStore } from '@/services/weather/globalWeatherState';
import DailyWeatherHeader from '@/components/weather/DailyWeatherHeader';
import WeatherLoadingState from '@/components/weather/WeatherLoadingState';
import LastUpdatedInfo from '@/components/weather/LastUpdatedInfo';

const DailyWeather: React.FC = () => {
  const { latitude, longitude } = useUserLocation();
  const { 
    weeklyForecast,
    selectedDay,
    setSelectedDay,
    lastUpdated,
    isUpdating,
    updateWeather
  } = useWeatherForecast();
  const { temperatureUnit } = useWeatherStore();

  if (weeklyForecast.length === 0) {
    return <WeatherLoadingState />;
  }

  const selectedDayData = weeklyForecast[selectedDay];
  const hasLocation = Boolean(latitude && longitude);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg shadow-md p-4 mb-4 border border-blue-100">
      <DailyWeatherHeader 
        currentTemperature={weeklyForecast[0].temp}
        temperatureUnit={temperatureUnit}
        isUpdating={isUpdating}
        onUpdateWeather={updateWeather}
        hasLocation={hasLocation}
      />
      
      <WeeklyForecastView 
        forecast={weeklyForecast}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        temperatureUnit={temperatureUnit}
      />
      
      <div className="mt-3 pt-3 border-t border-blue-100">
        <WeatherMetrics data={selectedDayData} temperatureUnit={temperatureUnit} />
      </div>
      
      <LastUpdatedInfo lastUpdated={lastUpdated} />
    </div>
  );
};

export default DailyWeather;
