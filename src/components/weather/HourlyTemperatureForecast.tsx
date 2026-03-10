import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Thermometer, Droplets, Wind, Sun, Cloud, CloudRain, Moon, Loader2 } from 'lucide-react';
import { useUserLocation } from '@/contexts/LocationContext';
import { useQuery } from '@tanstack/react-query';
import { WeatherApiService } from '@/services/weather/weatherApiService';

interface HourlyData {
  time: string;
  hour: number;
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

const getWeatherIcon = (condition: string, hour: number) => {
  const isNight = hour < 6 || hour >= 18;
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return <CloudRain className="h-5 w-5 text-blue-500" />;
  }
  if (conditionLower.includes('cloud')) {
    return <Cloud className="h-5 w-5 text-muted-foreground" />;
  }
  if (isNight) {
    return <Moon className="h-5 w-5 text-indigo-400" />;
  }
  return <Sun className="h-5 w-5 text-amber-500" />;
};

const getTemperatureColor = (temp: number): string => {
  if (temp < 10) return 'text-blue-500';
  if (temp < 20) return 'text-cyan-500';
  if (temp < 25) return 'text-emerald-500';
  if (temp < 30) return 'text-amber-500';
  return 'text-destructive';
};

const getTemperatureGradient = (temp: number): string => {
  if (temp < 10) return 'from-blue-500/20 to-blue-600/10';
  if (temp < 20) return 'from-cyan-500/20 to-cyan-600/10';
  if (temp < 25) return 'from-emerald-500/20 to-emerald-600/10';
  if (temp < 30) return 'from-amber-500/20 to-amber-600/10';
  return 'from-red-500/20 to-red-600/10';
};

const formatHour = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
};

const HourlyTemperatureForecast: React.FC = memo(() => {
  const { latitude, longitude, isLoading: locationLoading } = useUserLocation();
  
  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ['weather-hourly', latitude, longitude],
    queryFn: () => WeatherApiService.fetchWeatherData(latitude!, longitude!),
    enabled: !!latitude && !!longitude,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000,
  });

  const hourlyData: HourlyData[] = useMemo(() => {
    const data = weatherData as any;
    if (!data?.hourlyForecast) return [];
    return data.hourlyForecast || [];
  }, [weatherData]);

  const temperatureRange = useMemo(() => {
    if (hourlyData.length === 0) return { min: 20, max: 35 };
    const temps = hourlyData.map(h => h.temperature);
    return {
      min: Math.min(...temps) - 2,
      max: Math.max(...temps) + 2
    };
  }, [hourlyData]);

  const getBarHeight = (temp: number): number => {
    const range = temperatureRange.max - temperatureRange.min;
    return ((temp - temperatureRange.min) / range) * 100;
  };

  if (locationLoading || weatherLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading hourly forecast...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hourlyData.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Hourly forecast unavailable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base font-semibold">
          <Clock className="h-5 w-5 mr-2 text-primary" />
          24-Hour Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Temperature Timeline Chart */}
        <div className="relative mb-6">
          <div className="flex items-end justify-between gap-1 h-32 px-1">
            {hourlyData.map((hour, index) => {
              const barHeight = getBarHeight(hour.temperature);
              const gradientClass = getTemperatureGradient(hour.temperature);
              const tempColor = getTemperatureColor(hour.temperature);
              
              return (
                <div 
                  key={index} 
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  {/* Temperature value */}
                  <span className={`text-xs font-bold ${tempColor}`}>
                    {hour.temperature}°
                  </span>
                  
                  {/* Bar */}
                  <div className="relative w-full flex-1 flex items-end justify-center">
                    <div 
                      className={`w-full max-w-[28px] rounded-t-lg bg-gradient-to-b ${gradientClass} border border-border/30 transition-all duration-500`}
                      style={{ height: `${barHeight}%`, minHeight: '20%' }}
                    >
                      {/* Animated pulse for current hour */}
                      {index === 0 && (
                        <div className="absolute inset-0 rounded-t-lg bg-primary/20 animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Time labels */}
          <div className="flex justify-between mt-2 px-1">
            {hourlyData.map((hour, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                {getWeatherIcon(hour.condition, hour.hour)}
                <span className="text-[10px] text-muted-foreground mt-1 font-medium">
                  {index === 0 ? 'Now' : formatHour(hour.hour)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed hourly cards */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">Detailed View</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {hourlyData.slice(0, 4).map((hour, index) => (
              <div 
                key={index}
                className={`p-3 rounded-xl bg-gradient-to-br ${getTemperatureGradient(hour.temperature)} border border-border/30`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {index === 0 ? 'Now' : formatHour(hour.hour)}
                  </span>
                  {getWeatherIcon(hour.condition, hour.hour)}
                </div>
                
                <div className={`text-xl font-bold ${getTemperatureColor(hour.temperature)}`}>
                  {hour.temperature}°C
                </div>
                
                <div className="text-[10px] text-muted-foreground capitalize truncate">
                  {hour.description}
                </div>
                
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Droplets className="h-3 w-3" />
                    {hour.humidity}%
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Wind className="h-3 w-3" />
                    {hour.windSpeed}km/h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Temperature trend indicator */}
        <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Temperature Trend</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Low: {temperatureRange.min + 2}°C
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-destructive" />
                High: {temperatureRange.max - 2}°C
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

HourlyTemperatureForecast.displayName = 'HourlyTemperatureForecast';

export default HourlyTemperatureForecast;
