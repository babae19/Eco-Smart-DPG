import React, { useMemo, memo } from 'react';
import { Thermometer, DropletIcon, Wind, RefreshCw, Sunrise, Sunset, CloudRain } from 'lucide-react';
import { useWeather } from '@/contexts/WeatherContext';
import { formatTemperature } from '@/services/weather/temperatureUtils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useWeatherStore } from '@/services/weather/globalWeatherState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const getSafetyAdvice = (temp: number): { title: string; advice: string; severity: 'info' | 'warning' | 'error' } => {
  if (temp >= 35) {
    return {
      title: "Extreme Heat Warning",
      advice: "Stay hydrated, avoid outdoor activities between 11am-3pm, use cooling measures like wet towels, check on vulnerable people.",
      severity: 'error'
    };
  } else if (temp >= 30) {
    return {
      title: "Heat Advisory",
      advice: "Stay hydrated, limit sun exposure, wear lightweight clothing, use fans or air conditioning if available.",
      severity: 'warning'
    };
  } else {
    return {
      title: "Weather Notice",
      advice: "Conditions are moderate. Stay hydrated and use sun protection when outdoors.",
      severity: 'info'
    };
  }
};

const OptimizedClimateBreakdown: React.FC = memo(() => {
  const { weeklyForecast, isUpdating, refreshWeather } = useWeather();
  const { temperatureUnit } = useWeatherStore();
  
  // Memoize computations
  const { currentWeather, safetyAdvice, alertVariant, precipitationAdvice } = useMemo(() => {
    if (!weeklyForecast || weeklyForecast.length === 0) {
      return { currentWeather: null, safetyAdvice: null, alertVariant: 'default', precipitationAdvice: '' };
    }
    
    const current = weeklyForecast[0];
    const advice = getSafetyAdvice(current.temp);
    const variant = advice.severity === 'error' ? 'destructive' : 'default';
    
    const getPrecipAdvice = (chance: number) => {
      if (chance <= 10) return "No rain expected";
      if (chance <= 30) return "Light chance of rain";
      if (chance <= 60) return "Moderate chance of rain";
      if (chance <= 80) return "High chance of rain";
      return "Very likely to rain";
    };
    
    return {
      currentWeather: current,
      safetyAdvice: advice,
      alertVariant: variant,
      precipitationAdvice: getPrecipAdvice(current.precipChance)
    };
  }, [weeklyForecast]);

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return 'Unknown';
    return format(date, 'h:mm a');
  };

  if (!currentWeather || !safetyAdvice) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center">
          <Thermometer className="mr-2 h-5 w-5 text-orange-500" />
          Climate Breakdown
        </h2>
        <button
          onClick={refreshWeather}
          disabled={isUpdating}
          className="text-xs flex items-center text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          <RefreshCw size={14} className={cn("mr-1", isUpdating ? "animate-spin" : "")} />
          {isUpdating ? "Updating..." : "Refresh"}
        </button>
      </div>

      <Alert variant={alertVariant as any} className="mb-3">
        <AlertTitle className="flex items-center">
          {safetyAdvice.title}
        </AlertTitle>
        <AlertDescription>
          {safetyAdvice.advice}
        </AlertDescription>
      </Alert>

      <Card className="mb-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Current Climate Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center">
              <Thermometer className="h-4 w-4 mr-2 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Temperature</p>
                <p className="font-medium">
                  {formatTemperature(currentWeather.temp, temperatureUnit)}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <DropletIcon className="h-4 w-4 mr-2 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Humidity</p>
                <p className="font-medium">{currentWeather.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center">
              <Wind className="h-4 w-4 mr-2 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Wind</p>
                <p className="font-medium">{currentWeather.windSpeed} km/h</p>
              </div>
            </div>
            <div className="flex items-center">
              <CloudRain className="h-4 w-4 mr-2 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Rain Chance</p>
                <p className="font-medium">{currentWeather.precipChance}%</p>
              </div>
            </div>
          </div>

          {/* Sun & Rain Information Section */}
          <div className="border-t border-gray-100 pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sun & Rain Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center">
                <Sunrise className="h-4 w-4 mr-2 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-500">Sunrise</p>
                  <p className="text-sm font-medium">
                    {formatTime(currentWeather.sunriseTime || currentWeather.sunrise)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Sunset className="h-4 w-4 mr-2 text-pink-500" />
                <div>
                  <p className="text-xs text-gray-500">Sunset</p>
                  <p className="text-sm font-medium">
                    {formatTime(currentWeather.sunsetTime || currentWeather.sunset)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Rain forecast information */}
            <div className="mt-3 p-2 bg-blue-50 rounded-md">
              <div className="flex items-center">
                <CloudRain className="h-4 w-4 mr-2 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    {precipitationAdvice}
                  </p>
                  <p className="text-xs text-blue-600">
                    {currentWeather.precipChance}% chance of precipitation today
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

OptimizedClimateBreakdown.displayName = 'OptimizedClimateBreakdown';

export default OptimizedClimateBreakdown;
