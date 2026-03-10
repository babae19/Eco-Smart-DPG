
import React from 'react';
import TemperatureGauge from './TemperatureGauge';
import { RealtimeWeatherInfo } from '@/components/weather/RealtimeWeatherInfo';
import WeatherAlertPanel from './WeatherAlertPanel';

const TemperatureAlerts: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center">
        <span className="text-blue-600 dark:text-blue-400">Temperature Status</span>
      </h2>
      <div className="space-y-4">
        <TemperatureGauge />
        <WeatherAlertPanel />
        <RealtimeWeatherInfo />
      </div>
    </div>
  );
};

export default TemperatureAlerts;
