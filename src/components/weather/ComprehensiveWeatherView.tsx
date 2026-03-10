import React, { memo, useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, Thermometer, Droplets, Wind, Sun, Cloud, CloudRain, 
  Moon, Loader2, Calendar, TrendingUp, TrendingDown, ChevronRight,
  Umbrella, Eye, Gauge, CloudSun, Snowflake, CloudLightning, AlertTriangle,
  Bell, Leaf
} from 'lucide-react';
import { useUserLocation } from '@/contexts/LocationContext';
import { useQuery } from '@tanstack/react-query';
import { WeatherApiService } from '@/services/weather/weatherApiService';
import { toast } from 'sonner';

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

interface DailyForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
}

interface AirQualityData {
  aqi: number;
  level: string;
  color: string;
  components: {
    pm2_5: number;
    pm10: number;
    no2: number;
    o3: number;
    co: number;
    so2: number;
  };
  description: string;
}

interface ForecastAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  time: string;
  icon: string;
}

const getWeatherIcon = (condition: string, size: 'sm' | 'md' | 'lg' = 'md', hour?: number) => {
  const isNight = hour !== undefined ? (hour < 6 || hour >= 18) : false;
  const conditionLower = condition.toLowerCase();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8'
  };
  
  if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return <CloudLightning className={`${sizeClasses[size]} text-amber-500`} />;
  }
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return <CloudRain className={`${sizeClasses[size]} text-blue-500`} />;
  }
  if (conditionLower.includes('snow')) {
    return <Snowflake className={`${sizeClasses[size]} text-cyan-300`} />;
  }
  if (conditionLower.includes('cloud') && conditionLower.includes('sun')) {
    return <CloudSun className={`${sizeClasses[size]} text-amber-400`} />;
  }
  if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
    return <Cloud className={`${sizeClasses[size]} text-muted-foreground`} />;
  }
  if (isNight) {
    return <Moon className={`${sizeClasses[size]} text-indigo-400`} />;
  }
  return <Sun className={`${sizeClasses[size]} text-amber-500`} />;
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
  if (hour === 0) return '12AM';
  if (hour === 12) return '12PM';
  return hour > 12 ? `${hour - 12}PM` : `${hour}AM`;
};

const getDayName = (dateStr: string, index: number): string => {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Historical weather patterns (seasonal averages for Sierra Leone)
const getHistoricalPatterns = () => {
  const month = new Date().getMonth();
  
  // Rainy season: May-October, Dry season: November-April
  const isRainySeason = month >= 4 && month <= 9;
  
  const patterns = {
    avgHighTemp: isRainySeason ? 28 : 32,
    avgLowTemp: isRainySeason ? 22 : 20,
    avgRainfall: isRainySeason ? 350 : 15,
    rainyDays: isRainySeason ? 20 : 2,
    humidity: isRainySeason ? 85 : 65,
    season: isRainySeason ? 'Rainy Season' : 'Dry Season',
    monthlyData: [
      { month: 'Jan', rain: 10, temp: 31 },
      { month: 'Feb', rain: 5, temp: 32 },
      { month: 'Mar', rain: 20, temp: 32 },
      { month: 'Apr', rain: 80, temp: 31 },
      { month: 'May', rain: 200, temp: 30 },
      { month: 'Jun', rain: 400, temp: 28 },
      { month: 'Jul', rain: 550, temp: 27 },
      { month: 'Aug', rain: 600, temp: 27 },
      { month: 'Sep', rain: 450, temp: 28 },
      { month: 'Oct', rain: 300, temp: 29 },
      { month: 'Nov', rain: 80, temp: 30 },
      { month: 'Dec', rain: 20, temp: 30 }
    ]
  };
  
  return patterns;
};

// Current Weather Summary Component
const CurrentWeatherSummary: React.FC<{ data: any }> = memo(({ data }) => {
  const current = data?.current;
  if (!current) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {getWeatherIcon(current.conditions, 'lg')}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
            </div>
            <div>
              <div className={`text-4xl font-bold ${getTemperatureColor(current.temperature)}`}>
                {current.temperature}°C
              </div>
              <div className="text-sm text-muted-foreground capitalize">
                {current.conditions}
              </div>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-2 text-sm">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <span>Feels {current.feelsLike}°C</span>
            </div>
            <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
              <Droplets className="h-4 w-4" />
              <span>{current.humidity}%</span>
            </div>
            <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
              <Wind className="h-4 w-4" />
              <span>{current.windSpeed} km/h</span>
            </div>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <Gauge className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-xs text-muted-foreground">Pressure</div>
            <div className="text-sm font-semibold">{current.pressure} hPa</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <Eye className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-xs text-muted-foreground">Wind Dir</div>
            <div className="text-sm font-semibold">{current.windDirection}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <Umbrella className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-xs text-muted-foreground">Rain</div>
            <div className="text-sm font-semibold">{current.precipitation}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Hourly Forecast Component
const HourlyForecast: React.FC<{ hourlyData: HourlyData[] }> = memo(({ hourlyData }) => {
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

  if (hourlyData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Hourly forecast unavailable</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Temperature bar chart */}
      <div className="flex items-end justify-between gap-1 h-28 px-1">
        {hourlyData.map((hour, index) => {
          const barHeight = getBarHeight(hour.temperature);
          const gradientClass = getTemperatureGradient(hour.temperature);
          const tempColor = getTemperatureColor(hour.temperature);
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <span className={`text-[10px] font-bold ${tempColor}`}>
                {hour.temperature}°
              </span>
              <div className="relative w-full flex-1 flex items-end justify-center">
                <div 
                  className={`w-full max-w-[24px] rounded-t-md bg-gradient-to-b ${gradientClass} border border-border/30 transition-all duration-500`}
                  style={{ height: `${barHeight}%`, minHeight: '15%' }}
                >
                  {index === 0 && (
                    <div className="absolute inset-0 rounded-t-md bg-primary/20 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Time and weather icons */}
      <div className="flex justify-between px-1">
        {hourlyData.map((hour, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            {getWeatherIcon(hour.condition, 'sm', hour.hour)}
            <span className="text-[9px] text-muted-foreground mt-1">
              {index === 0 ? 'Now' : formatHour(hour.hour)}
            </span>
          </div>
        ))}
      </div>

      {/* Detailed hourly cards */}
      <div className="grid grid-cols-4 gap-1.5 mt-3">
        {hourlyData.slice(0, 4).map((hour, index) => (
          <div 
            key={index}
            className={`p-2 rounded-lg bg-gradient-to-br ${getTemperatureGradient(hour.temperature)} border border-border/30`}
          >
            <div className="text-[10px] text-muted-foreground text-center mb-1">
              {index === 0 ? 'Now' : formatHour(hour.hour)}
            </div>
            <div className="flex justify-center mb-1">
              {getWeatherIcon(hour.condition, 'sm', hour.hour)}
            </div>
            <div className={`text-sm font-bold text-center ${getTemperatureColor(hour.temperature)}`}>
              {hour.temperature}°
            </div>
            <div className="flex items-center justify-center gap-1 text-[9px] text-muted-foreground">
              <Droplets className="h-2.5 w-2.5" />
              {hour.humidity}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Weekly Forecast Component
const WeeklyForecast: React.FC<{ forecast: DailyForecast[] }> = memo(({ forecast }) => {
  const [selectedDay, setSelectedDay] = useState(0);

  if (forecast.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Weekly forecast unavailable</p>
      </div>
    );
  }

  const selectedForecast = forecast[selectedDay];
  const tempRange = useMemo(() => {
    const allTemps = forecast.flatMap(f => [f.high, f.low]);
    return { min: Math.min(...allTemps), max: Math.max(...allTemps) };
  }, [forecast]);

  return (
    <div className="space-y-4">
      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 hide-scrollbar">
        {forecast.map((day, index) => (
          <button
            key={index}
            onClick={() => setSelectedDay(index)}
            className={`flex-shrink-0 p-2.5 rounded-xl transition-all duration-200 min-w-[70px] ${
              selectedDay === index
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            <div className="text-[10px] font-medium mb-1">
              {getDayName(day.date, index)}
            </div>
            <div className="flex justify-center mb-1">
              {getWeatherIcon(day.condition, 'sm')}
            </div>
            <div className="text-sm font-bold">{day.high}°</div>
            <div className="text-[10px] opacity-70">{day.low}°</div>
          </button>
        ))}
      </div>

      {/* Selected day details */}
      {selectedForecast && (
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getWeatherIcon(selectedForecast.condition, 'lg')}
                <div>
                  <div className="font-semibold">{getDayName(selectedForecast.date, selectedDay)}</div>
                  <div className="text-sm text-muted-foreground capitalize">{selectedForecast.condition}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-destructive" />
                  <span className={`text-lg font-bold ${getTemperatureColor(selectedForecast.high)}`}>
                    {selectedForecast.high}°
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-blue-500" />
                  <span className={`text-lg font-bold ${getTemperatureColor(selectedForecast.low)}`}>
                    {selectedForecast.low}°
                  </span>
                </div>
              </div>
            </div>
            
            {/* Temperature bar */}
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-destructive rounded-full"
                style={{
                  left: `${((selectedForecast.low - tempRange.min) / (tempRange.max - tempRange.min)) * 100}%`,
                  width: `${((selectedForecast.high - selectedForecast.low) / (tempRange.max - tempRange.min)) * 100}%`
                }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-3 text-sm">
              <div className="flex items-center gap-2">
                <Umbrella className="h-4 w-4 text-blue-500" />
                <span>{selectedForecast.precipitation}% rain</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

// Historical Patterns Component
const HistoricalPatterns: React.FC = memo(() => {
  const patterns = getHistoricalPatterns();
  const currentMonth = new Date().getMonth();

  return (
    <div className="space-y-4">
      {/* Season indicator */}
      <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Current Season</div>
              <div className="text-lg font-bold text-primary">{patterns.season}</div>
            </div>
            {patterns.season === 'Rainy Season' ? (
              <CloudRain className="h-8 w-8 text-blue-500" />
            ) : (
              <Sun className="h-8 w-8 text-amber-500" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seasonal averages */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-4 w-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Avg High</span>
          </div>
          <div className="text-xl font-bold">{patterns.avgHighTemp}°C</div>
        </div>
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Avg Low</span>
          </div>
          <div className="text-xl font-bold">{patterns.avgLowTemp}°C</div>
        </div>
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <CloudRain className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Monthly Rain</span>
          </div>
          <div className="text-xl font-bold">{patterns.avgRainfall}mm</div>
        </div>
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Rainy Days</span>
          </div>
          <div className="text-xl font-bold">{patterns.rainyDays}</div>
        </div>
      </div>

      {/* Monthly rainfall chart */}
      <Card className="bg-muted/20 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Annual Rainfall Pattern
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-end justify-between h-24 gap-1">
            {patterns.monthlyData.map((m, i) => {
              const maxRain = Math.max(...patterns.monthlyData.map(d => d.rain));
              const height = (m.rain / maxRain) * 100;
              const isCurrentMonth = i === currentMonth;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="relative flex-1 w-full flex items-end justify-center">
                    <div 
                      className={`w-full max-w-[20px] rounded-t-sm transition-all ${
                        isCurrentMonth 
                          ? 'bg-primary' 
                          : 'bg-blue-500/40'
                      }`}
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                  </div>
                  <span className={`text-[8px] mt-1 ${isCurrentMonth ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Current month
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500/40" />
              Other months
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

// Air Quality Component
const AirQualityDisplay: React.FC<{ airQuality: AirQualityData | null }> = memo(({ airQuality }) => {
  if (!airQuality) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Leaf className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Air quality data unavailable</p>
      </div>
    );
  }

  const getAqiColor = (aqi: number) => {
    const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-500'];
    return colors[aqi - 1] || 'bg-amber-500';
  };

  const getAqiTextColor = (aqi: number) => {
    const colors = ['text-emerald-500', 'text-amber-500', 'text-orange-500', 'text-red-500', 'text-purple-500'];
    return colors[aqi - 1] || 'text-amber-500';
  };

  return (
    <div className="space-y-4">
      {/* AQI Overview */}
      <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Air Quality Index</div>
              <div className={`text-3xl font-bold ${getAqiTextColor(airQuality.aqi)}`}>
                {airQuality.aqi}
              </div>
              <div className={`text-sm font-medium ${getAqiTextColor(airQuality.aqi)}`}>
                {airQuality.level}
              </div>
            </div>
            <div className="relative">
              <div className={`w-16 h-16 rounded-full ${getAqiColor(airQuality.aqi)} opacity-20`} />
              <Leaf className={`absolute inset-0 m-auto h-8 w-8 ${getAqiTextColor(airQuality.aqi)}`} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{airQuality.description}</p>
        </CardContent>
      </Card>

      {/* AQI Scale */}
      <div className="flex gap-1 h-2 rounded-full overflow-hidden">
        {[1, 2, 3, 4, 5].map((level) => (
          <div 
            key={level}
            className={`flex-1 ${getAqiColor(level)} ${airQuality.aqi === level ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : 'opacity-40'}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground px-1">
        <span>Good</span>
        <span>Fair</span>
        <span>Moderate</span>
        <span>Poor</span>
        <span>Very Poor</span>
      </div>

      {/* Pollutant Details */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-center">
          <div className="text-[10px] text-muted-foreground">PM2.5</div>
          <div className="text-sm font-bold">{airQuality.components.pm2_5}</div>
          <div className="text-[9px] text-muted-foreground">µg/m³</div>
        </div>
        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-center">
          <div className="text-[10px] text-muted-foreground">PM10</div>
          <div className="text-sm font-bold">{airQuality.components.pm10}</div>
          <div className="text-[9px] text-muted-foreground">µg/m³</div>
        </div>
        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-center">
          <div className="text-[10px] text-muted-foreground">O₃</div>
          <div className="text-sm font-bold">{airQuality.components.o3}</div>
          <div className="text-[9px] text-muted-foreground">µg/m³</div>
        </div>
        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-center">
          <div className="text-[10px] text-muted-foreground">NO₂</div>
          <div className="text-sm font-bold">{airQuality.components.no2}</div>
          <div className="text-[9px] text-muted-foreground">µg/m³</div>
        </div>
        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-center">
          <div className="text-[10px] text-muted-foreground">SO₂</div>
          <div className="text-sm font-bold">{airQuality.components.so2}</div>
          <div className="text-[9px] text-muted-foreground">µg/m³</div>
        </div>
        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-center">
          <div className="text-[10px] text-muted-foreground">CO</div>
          <div className="text-sm font-bold">{airQuality.components.co}</div>
          <div className="text-[9px] text-muted-foreground">mg/m³</div>
        </div>
      </div>
    </div>
  );
});

// Forecast Alerts Component
const ForecastAlertsDisplay: React.FC<{ alerts: ForecastAlert[], onNotify?: () => void }> = memo(({ alerts, onNotify }) => {
  const getAlertIcon = (icon: string) => {
    switch (icon) {
      case 'cloud-rain': return <CloudRain className="h-5 w-5" />;
      case 'cloud-lightning': return <CloudLightning className="h-5 w-5" />;
      case 'thermometer-snowflake': return <Thermometer className="h-5 w-5" />;
      case 'sun': return <Sun className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 border-destructive/30 text-destructive';
      case 'medium': return 'bg-amber-500/10 border-amber-500/30 text-amber-600';
      default: return 'bg-blue-500/10 border-blue-500/30 text-blue-600';
    }
  };

  const getSeverityIconColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-amber-500';
      default: return 'text-blue-500';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="bg-emerald-500/10 border-emerald-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-500/20">
              <Sun className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <div className="font-medium text-emerald-600">No Weather Alerts</div>
              <div className="text-xs text-muted-foreground">Weather conditions look stable for the next 48 hours</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <Card key={alert.id} className={`${getSeverityColor(alert.severity)} border`}>
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full bg-background/50 ${getSeverityIconColor(alert.severity)}`}>
                {getAlertIcon(alert.icon)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{alert.title}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full bg-background/50 ${
                    alert.severity === 'high' ? 'text-destructive' : 
                    alert.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

// Main Comprehensive Weather View
const ComprehensiveWeatherView: React.FC = memo(() => {
  const { latitude, longitude, isLoading: locationLoading } = useUserLocation();
  const [notifiedAlerts, setNotifiedAlerts] = useState<Set<string>>(new Set());
  
  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ['weather-comprehensive', latitude, longitude],
    queryFn: () => WeatherApiService.fetchWeatherData(latitude!, longitude!),
    enabled: !!latitude && !!longitude,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  const hourlyData: HourlyData[] = useMemo(() => {
    const data = weatherData as any;
    return data?.hourlyForecast || [];
  }, [weatherData]);

  const forecast: DailyForecast[] = useMemo(() => {
    const data = weatherData as any;
    return data?.forecast || [];
  }, [weatherData]);

  const airQuality: AirQualityData | null = useMemo(() => {
    const data = weatherData as any;
    return data?.airQuality || null;
  }, [weatherData]);

  const forecastAlerts: ForecastAlert[] = useMemo(() => {
    const data = weatherData as any;
    return data?.forecastAlerts || [];
  }, [weatherData]);

  // Send notifications for new alerts
  useEffect(() => {
    if (forecastAlerts.length === 0) return;

    forecastAlerts.forEach(alert => {
      if (!notifiedAlerts.has(alert.id) && alert.severity !== 'low') {
        toast.warning(alert.title, {
          description: alert.message,
          duration: 6000,
        });
        setNotifiedAlerts(prev => new Set([...prev, alert.id]));
      }
    });
  }, [forecastAlerts, notifiedAlerts]);

  if (locationLoading || weatherLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Loading weather data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Forecast Alerts */}
      {forecastAlerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Bell className="h-4 w-4 text-amber-500" />
            <span>Weather Alerts</span>
          </div>
          <ForecastAlertsDisplay alerts={forecastAlerts} />
        </div>
      )}

      {/* Current Weather Summary */}
      <CurrentWeatherSummary data={weatherData} />
      
      {/* Tabbed content */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-3">
          <Tabs defaultValue="hourly" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="hourly" className="text-xs">
                <Clock className="h-3.5 w-3.5 mr-1" />
                Hourly
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                7-Day
              </TabsTrigger>
              <TabsTrigger value="aqi" className="text-xs">
                <Leaf className="h-3.5 w-3.5 mr-1" />
                Air
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                Patterns
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="hourly" className="mt-0">
              <HourlyForecast hourlyData={hourlyData} />
            </TabsContent>
            
            <TabsContent value="weekly" className="mt-0">
              <WeeklyForecast forecast={forecast} />
            </TabsContent>

            <TabsContent value="aqi" className="mt-0">
              <AirQualityDisplay airQuality={airQuality} />
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <HistoricalPatterns />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
});

ComprehensiveWeatherView.displayName = 'ComprehensiveWeatherView';
CurrentWeatherSummary.displayName = 'CurrentWeatherSummary';
HourlyForecast.displayName = 'HourlyForecast';
WeeklyForecast.displayName = 'WeeklyForecast';
HistoricalPatterns.displayName = 'HistoricalPatterns';
AirQualityDisplay.displayName = 'AirQualityDisplay';
ForecastAlertsDisplay.displayName = 'ForecastAlertsDisplay';

export default ComprehensiveWeatherView;
