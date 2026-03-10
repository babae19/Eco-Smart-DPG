import React from 'react';
import { Loader2 } from 'lucide-react';
import { useWeatherData } from '@/hooks/useWeatherData';
import OptimizedWeatherAlerts from './OptimizedWeatherAlerts';

const RealtimeWeatherAlerts: React.FC = () => {
  const { weatherData, isLoading } = useWeatherData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <OptimizedWeatherAlerts
      temperature={weatherData?.current.temperature}
      precipitation={weatherData?.current.precipitation}
      windSpeed={weatherData?.current.windSpeed}
      uvIndex={weatherData?.current.uvIndex}
    />
  );
};

export default RealtimeWeatherAlerts;
