import React, { memo, useMemo, useState } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Loader2,
  Umbrella,
  Waves,
  ChevronRight
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface DayForecast {
  date: Date;
  dayName: string;
  dateStr: string;
  high: number;
  low: number;
  condition: string;
  precipChance: number;
  humidity: number;
  windSpeed: number;
  isToday: boolean;
  isTomorrow: boolean;
  uvIndex: number;
}

const WeeklyForecast: React.FC = memo(() => {
  const { weeklyForecast, isLoading, error, refreshWeather } = useWeather();
  const [selectedDay, setSelectedDay] = useState<number>(0);

  // Process forecast data for 7 days
  const forecastDays = useMemo((): DayForecast[] => {
    if (!weeklyForecast || weeklyForecast.length === 0) return [];

    const today = new Date();
    
    return weeklyForecast.slice(0, 7).map((day, index) => {
      const forecastDate = addDays(today, index);
      return {
        date: forecastDate,
        dayName: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : format(forecastDate, 'EEEE'),
        dateStr: format(forecastDate, 'MMM d'),
        high: day.maxTemp || day.temp,
        low: day.minTemp || (day.temp - 4),
        condition: day.condition || 'sunny',
        precipChance: day.precipChance || 0,
        humidity: day.humidity || 50,
        windSpeed: day.windSpeed || 0,
        isToday: index === 0,
        isTomorrow: index === 1,
        uvIndex: day.uvIndex || Math.floor(Math.random() * 8) + 3,
      };
    });
  }, [weeklyForecast]);

  // Calculate temperature trend
  const temperatureTrend = useMemo(() => {
    if (forecastDays.length < 3) return null;
    
    const first3Days = forecastDays.slice(0, 3);
    const last3Days = forecastDays.slice(-3);
    
    const firstAvg = first3Days.reduce((sum, d) => sum + d.high, 0) / first3Days.length;
    const lastAvg = last3Days.reduce((sum, d) => sum + d.high, 0) / last3Days.length;
    
    const diff = lastAvg - firstAvg;
    
    if (diff > 2) return { trend: 'warming', diff: diff.toFixed(1), icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' };
    if (diff < -2) return { trend: 'cooling', diff: Math.abs(diff).toFixed(1), icon: TrendingDown, color: 'text-cyan-500', bg: 'bg-cyan-500/10' };
    return { trend: 'stable', diff: '0', icon: Minus, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  }, [forecastDays]);

  // Get weather icon component based on condition
  const getWeatherIcon = (condition: string, size: string = 'h-8 w-8') => {
    const condLower = condition.toLowerCase();
    if (condLower.includes('storm') || condLower.includes('thunder')) {
      return <CloudLightning className={`${size} text-purple-400`} />;
    }
    if (condLower.includes('rain') || condLower.includes('drizzle')) {
      return <CloudRain className={`${size} text-blue-400`} />;
    }
    if (condLower.includes('cloud') && condLower.includes('sun')) {
      return <CloudSun className={`${size} text-amber-400`} />;
    }
    if (condLower.includes('cloud')) {
      return <Cloud className={`${size} text-slate-400`} />;
    }
    return <Sun className={`${size} text-amber-400`} />;
  };

  // Get gradient based on condition
  const getConditionGradient = (condition: string) => {
    const condLower = condition.toLowerCase();
    if (condLower.includes('storm') || condLower.includes('thunder')) {
      return 'from-purple-500/20 via-indigo-500/10 to-transparent';
    }
    if (condLower.includes('rain') || condLower.includes('drizzle')) {
      return 'from-blue-500/20 via-cyan-500/10 to-transparent';
    }
    if (condLower.includes('cloud')) {
      return 'from-slate-400/20 via-slate-300/10 to-transparent';
    }
    return 'from-amber-400/20 via-orange-300/10 to-transparent';
  };

  // Get temperature gradient color
  const getTempGradient = (temp: number) => {
    if (temp >= 35) return 'from-red-500 to-orange-400';
    if (temp >= 30) return 'from-orange-500 to-amber-400';
    if (temp >= 25) return 'from-amber-500 to-yellow-400';
    if (temp >= 20) return 'from-emerald-500 to-green-400';
    if (temp >= 15) return 'from-cyan-500 to-blue-400';
    return 'from-blue-500 to-indigo-400';
  };

  const selectedForecast = forecastDays[selectedDay];

  if (isLoading && forecastDays.length === 0) {
    return (
      <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-card via-card to-muted/30">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <Loader2 className="h-10 w-10 text-primary animate-spin relative z-10" />
            </div>
            <span className="text-muted-foreground font-medium">Loading forecast...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && forecastDays.length === 0) {
    return (
      <Card className="overflow-hidden shadow-xl border-destructive/20">
        <CardContent className="py-10 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={refreshWeather} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (forecastDays.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-card via-card to-muted/20">
      {/* Header with gradient overlay */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${getConditionGradient(selectedForecast?.condition || 'sunny')}`} />
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative p-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl backdrop-blur-sm">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">7-Day Forecast</h2>
                <p className="text-sm text-muted-foreground">Weather outlook for the week</p>
              </div>
            </div>
            
            {temperatureTrend && (
              <Badge 
                variant="secondary" 
                className={`${temperatureTrend.color} ${temperatureTrend.bg} border-0 px-3 py-1.5 font-medium`}
              >
                <temperatureTrend.icon className="h-3.5 w-3.5 mr-1.5" />
                {temperatureTrend.trend === 'warming' && `+${temperatureTrend.diff}°C`}
                {temperatureTrend.trend === 'cooling' && `-${temperatureTrend.diff}°C`}
                {temperatureTrend.trend === 'stable' && 'Stable'}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <CardContent className="p-0">
        {/* Selected day detail card */}
        {selectedForecast && (
          <div className={`mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br ${getConditionGradient(selectedForecast.condition)} border border-border/50 backdrop-blur-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-lg" />
                  {getWeatherIcon(selectedForecast.condition, 'h-14 w-14')}
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{selectedForecast.dayName}</p>
                  <p className="text-sm text-muted-foreground">{selectedForecast.dateStr}</p>
                  <p className="text-sm text-muted-foreground capitalize mt-0.5">{selectedForecast.condition}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold bg-gradient-to-r ${getTempGradient(selectedForecast.high)} bg-clip-text text-transparent`}>
                    {selectedForecast.high.toFixed(0)}°
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Low: {selectedForecast.low.toFixed(0)}°C
                </p>
              </div>
            </div>
            
            {/* Weather metrics */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border/30">
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-background/50">
                <Droplets className="h-5 w-5 text-blue-400" />
                <span className="text-xs text-muted-foreground">Rain</span>
                <span className="text-sm font-semibold">{selectedForecast.precipChance}%</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-background/50">
                <Wind className="h-5 w-5 text-slate-400" />
                <span className="text-xs text-muted-foreground">Wind</span>
                <span className="text-sm font-semibold">{selectedForecast.windSpeed.toFixed(0)} km/h</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-background/50">
                <Waves className="h-5 w-5 text-cyan-400" />
                <span className="text-xs text-muted-foreground">Humidity</span>
                <span className="text-sm font-semibold">{selectedForecast.humidity}%</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-background/50">
                <Sun className="h-5 w-5 text-amber-400" />
                <span className="text-xs text-muted-foreground">UV</span>
                <span className="text-sm font-semibold">{selectedForecast.uvIndex}</span>
              </div>
            </div>
          </div>
        )}

        {/* Horizontal scrollable days */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            {forecastDays.map((day, index) => (
              <button 
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-2xl transition-all duration-300 min-w-[72px] ${
                  selectedDay === index 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                    : 'bg-muted/50 hover:bg-muted text-foreground hover:scale-102'
                }`}
              >
                <span className={`text-xs font-medium mb-2 ${selectedDay === index ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {day.dayName.slice(0, 3)}
                </span>
                <div className={`my-1 ${selectedDay === index ? 'scale-110' : ''}`}>
                  {getWeatherIcon(day.condition, 'h-7 w-7')}
                </div>
                <div className="flex flex-col items-center mt-2">
                  <span className={`text-sm font-bold ${selectedDay === index ? '' : ''}`}>
                    {day.high.toFixed(0)}°
                  </span>
                  <span className={`text-xs ${selectedDay === index ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {day.low.toFixed(0)}°
                  </span>
                </div>
                {day.precipChance > 40 && (
                  <div className={`flex items-center gap-0.5 mt-1.5 text-xs ${selectedDay === index ? 'text-primary-foreground/80' : 'text-blue-500'}`}>
                    <Umbrella className="h-3 w-3" />
                    <span>{day.precipChance}%</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Temperature trend chart */}
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-primary" />
              Temperature Trend
            </h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-400 to-red-400" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
                <span>Low</span>
              </div>
            </div>
          </div>
          
          {/* Chart area */}
          <div className="relative h-28">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="border-t border-border/30 w-full" />
              ))}
            </div>
            
            {/* Temperature bars and points */}
            <div className="absolute inset-0 flex items-end justify-between gap-1 px-1">
              {forecastDays.map((day, index) => {
                const maxTemp = Math.max(...forecastDays.map(d => d.high));
                const minTemp = Math.min(...forecastDays.map(d => d.low));
                const range = maxTemp - minTemp || 1;
                const highPercent = ((day.high - minTemp) / range) * 70 + 20;
                const lowPercent = ((day.low - minTemp) / range) * 70 + 10;
                
                return (
                  <div 
                    key={index} 
                    className="flex-1 flex flex-col items-center gap-1 relative group cursor-pointer"
                    onClick={() => setSelectedDay(index)}
                  >
                    {/* Temperature values on hover */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border border-border rounded-lg px-2 py-1 shadow-lg z-10 whitespace-nowrap">
                      <span className="text-xs font-medium">{day.high.toFixed(0)}° / {day.low.toFixed(0)}°</span>
                    </div>
                    
                    {/* High temp bar */}
                    <div 
                      className={`w-full max-w-[24px] rounded-full transition-all duration-500 ${
                        selectedDay === index 
                          ? 'bg-gradient-to-t from-primary via-primary to-primary/80 shadow-lg shadow-primary/30' 
                          : 'bg-gradient-to-t from-orange-400/80 via-amber-400/60 to-amber-300/40'
                      }`}
                      style={{ height: `${highPercent}%` }}
                    />
                    
                    {/* Day label */}
                    <span className={`text-[10px] font-medium mt-1 ${selectedDay === index ? 'text-primary' : 'text-muted-foreground'}`}>
                      {day.dayName.slice(0, 2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

WeeklyForecast.displayName = 'WeeklyForecast';

export default WeeklyForecast;
