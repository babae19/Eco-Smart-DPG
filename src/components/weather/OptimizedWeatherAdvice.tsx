import React, { useMemo, memo, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { getTemperatureAdvice } from '@/utils/temperatureAdvice';
import { useWeatherChangeMonitor } from '@/hooks/useWeatherChangeMonitor';
import { 
  Loader2, 
  RefreshCw, 
  AlertTriangle, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Droplets,
  Wind,
  Eye,
  Thermometer,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const OptimizedWeatherAdvice: React.FC = memo(() => {
  const { currentWeather, weeklyForecast, isLoading, error, refreshWeather } = useWeather();
  const currentTemp = currentWeather?.current?.temperature;
  const currentConditions = currentWeather?.current?.conditions;
  const { toast } = useToast();
  
  // Initialize weather change monitor for push notifications
  useWeatherChangeMonitor();

  // Get weather icon based on conditions
  const getWeatherIcon = useMemo(() => {
    if (!currentConditions) return <Sun className="h-6 w-6 text-white" />;
    
    const conditionsLower = currentConditions.toLowerCase();
    
    if (conditionsLower.includes('rain') || conditionsLower.includes('drizzle')) {
      return <CloudRain className="h-6 w-6 text-white animate-pulse" />;
    } else if (conditionsLower.includes('thunder') || conditionsLower.includes('storm')) {
      return <CloudLightning className="h-6 w-6 text-white" />;
    } else if (conditionsLower.includes('cloud')) {
      return <Cloud className="h-6 w-6 text-white/90" />;
    } else if (conditionsLower.includes('clear') || conditionsLower.includes('sun')) {
      return <Sun className="h-6 w-6 text-white" />;
    }
    
    return <Sun className="h-6 w-6 text-white" />;
  }, [currentConditions]);

  // Get weather predictions with rain chances only (temperatures moved to TemperatureLevel)
  const weatherPrediction = useMemo(() => {
    if (!weeklyForecast.length) return null;
    
    const today = weeklyForecast[0];
    const tomorrow = weeklyForecast[1];
    
    const predictions = [];
    
    // Today's rain chance
    const todayRain = today?.precipChance || 0;
    predictions.push({
      type: 'rain',
      probability: todayRain,
      message: `Today: ${todayRain}% rain`,
      isHighPriority: todayRain > 60,
      isToday: true
    });
    
    // Tomorrow's rain chance
    const tomorrowRain = tomorrow?.precipChance || 0;
    predictions.push({
      type: 'rain',
      probability: tomorrowRain,
      message: `Tomorrow: ${tomorrowRain}% rain`,
      isHighPriority: tomorrowRain > 60,
      isTomorrow: true
    });
    
    return predictions;
  }, [weeklyForecast]);

  // Get temperature advice with dynamic real-time recommendations
  const advice = useMemo(() => {
    if (currentTemp === undefined) return null;
    
    // Pass conditions to get dynamic title
    const baseAdvice = getTemperatureAdvice(currentTemp, currentConditions);
    
    // Build dynamic recommendations based on ALL real-time weather data
    baseAdvice.recommendations = [];
    
    if (currentWeather?.current) {
      const conditions = (currentConditions || '').toLowerCase();
      const windSpeed = currentWeather.current.windSpeed || 0;
      const humidity = currentWeather.current.humidity || 0;
      const uvIndex = currentWeather.current.uvIndex || 0;
      const today = weeklyForecast[0];
      const rainChance = today?.precipChance || 0;
      
      // === Primary condition-based recommendations ===
      
      // Rain/Storm conditions (highest priority)
      if (conditions.includes('thunder') || conditions.includes('storm')) {
        baseAdvice.recommendations.push('⚡ Thunderstorm active - Stay indoors and away from windows');
        baseAdvice.recommendations.push('🔌 Unplug electronic devices to prevent damage');
        baseAdvice.recommendations.push('🚗 Avoid travel if possible; if driving, pull over safely');
      } else if (conditions.includes('rain') || conditions.includes('drizzle') || rainChance > 50) {
        if (rainChance > 70 || conditions.includes('heavy')) {
          baseAdvice.recommendations.push('🌧️ Heavy rain expected - Carry waterproof gear');
          baseAdvice.recommendations.push('🚗 Reduce driving speed, watch for flooding');
        } else {
          baseAdvice.recommendations.push('☔ Rain expected - Bring umbrella when going out');
        }
        baseAdvice.recommendations.push('👟 Wear non-slip footwear for wet surfaces');
      }
      // Clear/Sunny conditions
      else if (conditions.includes('sun') || conditions.includes('clear')) {
        if (uvIndex >= 8) {
          baseAdvice.recommendations.push('☀️ Very high UV index - Limit outdoor exposure 10am-4pm');
          baseAdvice.recommendations.push('🧴 Apply SPF 50+ sunscreen, reapply every 2 hours');
        } else if (uvIndex >= 5) {
          baseAdvice.recommendations.push('🌤️ Moderate UV - Use sunscreen and wear sunglasses');
        } else {
          baseAdvice.recommendations.push('☀️ Good conditions for outdoor activities');
        }
      }
      // Cloudy conditions
      else if (conditions.includes('cloud') || conditions.includes('overcast')) {
        baseAdvice.recommendations.push('☁️ Overcast conditions - Weather may change quickly');
        if (rainChance > 30) {
          baseAdvice.recommendations.push('🌦️ Rain possible later - Keep umbrella nearby');
        }
      }
      
      // === Temperature-based recommendations ===
      if (currentTemp >= 35) {
        baseAdvice.recommendations.push('🌡️ Extreme heat - Stay hydrated, avoid sun exposure');
        baseAdvice.recommendations.push('💧 Drink water every 15-20 minutes');
        baseAdvice.recommendations.push('🏠 Stay in cool/air-conditioned areas when possible');
      } else if (currentTemp >= 30) {
        baseAdvice.recommendations.push('🔥 Hot weather - Wear light, breathable clothing');
        baseAdvice.recommendations.push('💧 Increase water intake throughout the day');
      } else if (currentTemp >= 25) {
        baseAdvice.recommendations.push('🌡️ Warm conditions - Stay hydrated');
      } else if (currentTemp < 15) {
        baseAdvice.recommendations.push('🧥 Cool weather - Dress in warm layers');
      } else if (currentTemp < 10) {
        baseAdvice.recommendations.push('❄️ Cold conditions - Wear warm clothing outdoors');
      }
      
      // === Wind recommendations ===
      if (windSpeed >= 30) {
        baseAdvice.recommendations.push('💨 Strong winds - Secure loose outdoor items');
        baseAdvice.recommendations.push('⚠️ Be cautious when driving, especially high-profile vehicles');
      } else if (windSpeed >= 20) {
        baseAdvice.recommendations.push('🌬️ Breezy conditions - Hold onto umbrellas and hats');
      }
      
      // === Humidity recommendations ===
      if (humidity >= 85) {
        baseAdvice.recommendations.push('💦 Very high humidity - Expect muggy, uncomfortable conditions');
      } else if (humidity >= 70 && currentTemp >= 28) {
        baseAdvice.recommendations.push('🥵 Hot and humid - Limit strenuous outdoor activities');
      } else if (humidity < 30) {
        baseAdvice.recommendations.push('🏜️ Low humidity - Moisturize skin and stay hydrated');
      }
      
      // Ensure at least one general recommendation
      if (baseAdvice.recommendations.length === 0) {
        baseAdvice.recommendations.push('✅ Conditions are favorable for normal activities');
      }
    }
    
    return baseAdvice;
  }, [currentTemp, currentConditions, currentWeather, weeklyForecast]);

  // Loading state
  if (isLoading && !currentWeather) {
    return (
      <Card className="mb-6 overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-br from-climate-green to-climate-green-dark text-white pb-4">
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-5 w-5 text-white mr-2 animate-spin" />
            <span className="text-white">Loading weather data...</span>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Error state
  if (error && !currentWeather) {
    return (
      <Card className="mb-6 overflow-hidden shadow-lg border-destructive/50">
        <CardHeader className="bg-gradient-to-br from-destructive/10 to-destructive/20">
          <div className="text-center py-4">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Weather Advisory Unavailable</h3>
            <p className="text-muted-foreground mb-4 text-sm">{error}</p>
            <Button 
              onClick={() => {
                refreshWeather();
                toast({
                  title: 'Refreshing Weather Data',
                  description: 'Attempting to fetch latest weather information...'
                });
              }}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // No data state
  if (!currentWeather || currentTemp === undefined || !advice) {
    return null;
  }

  return (
    <Card className="mb-6 overflow-hidden shadow-xl border-0 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
      {/* Header with weather info */}
      <CardHeader className="bg-gradient-to-br from-climate-green to-climate-green-dark text-white relative pb-6">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        
        <div className="relative z-10">
          {/* Main weather display */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              {getWeatherIcon}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">General Weather Advisory</h2>
                <p className="text-white/80 text-sm">Real-time conditions • Updates every 10 min</p>
              </div>
            </div>
            
            <Button
              onClick={() => {
                refreshWeather();
                toast({
                  title: 'Refreshing Weather',
                  description: 'Getting latest conditions...'
                });
              }}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Temperature and conditions */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-bold">{currentTemp.toFixed(1)}°</span>
                <span className="text-white/80 text-lg">C</span>
              </div>
              {currentWeather.current.feelsLike && (
                <p className="text-white/80 text-sm">
                  Feels like {currentWeather.current.feelsLike.toFixed(1)}°C
                </p>
              )}
            </div>
            
            <div className="text-right">
              <p className="text-base sm:text-lg font-medium capitalize">{currentConditions}</p>
              <div className="flex justify-end space-x-3 text-white/80 text-sm mt-1">
                {currentWeather.current.humidity && (
                  <span className="flex items-center">
                    <Droplets className="h-4 w-4 mr-1" />
                    <span className="font-medium">{currentWeather.current.humidity}%</span>
                  </span>
                )}
                {currentWeather.current.windSpeed && (
                  <span className="flex items-center">
                    <Wind className="h-4 w-4 mr-1" />
                    <span className="font-medium">{currentWeather.current.windSpeed} km/h</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rain predictions only */}
          {weatherPrediction && weatherPrediction.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {weatherPrediction.map((prediction, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className={`${
                    prediction.isHighPriority
                      ? 'bg-orange-500/90 text-white border-orange-300 shadow-lg animate-pulse font-bold text-base px-4 py-2' 
                      : 'bg-blue-500/80 text-white border-blue-300 shadow-md font-semibold text-sm px-3 py-2'
                  } transition-all duration-300`}
                >
                  <CloudRain className={`${
                    prediction.isHighPriority ? 'h-5 w-5 mr-2 animate-bounce' : 'h-4 w-4 mr-1'
                  }`} />
                  <span>{prediction.message}</span>
                  {prediction.isHighPriority && (
                    <AlertTriangle className="h-4 w-4 ml-2 animate-pulse" />
                  )}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      {/* Advisory content */}
      <CardContent className="p-6 bg-card">
        {/* Severity indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge 
              variant={advice.severity === 'high' ? 'destructive' : advice.severity === 'medium' ? 'secondary' : 'outline'}
              className="font-medium"
            >
              {advice.severity === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {advice.severity === 'medium' && <Eye className="h-3 w-3 mr-1" />}
              {advice.severity === 'low' && <Thermometer className="h-3 w-3 mr-1" />}
              {advice.severity.toUpperCase()} PRIORITY
            </Badge>
            <span className="text-sm text-muted-foreground">Advisory Level</span>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            Updated {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Advisory title and description */}
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">{advice.title}</h3>
          <p className="text-muted-foreground leading-relaxed text-base">{advice.description}</p>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold text-foreground mb-4 flex items-center text-base">
            <Sun className="h-5 w-5 mr-2 text-primary" />
            Recommended Actions
          </h4>
          <div className="grid gap-3">
            {advice.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors duration-200">
                <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-sm sm:text-base text-foreground leading-relaxed font-medium">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
          <span className="font-medium">Auto-updates every 10 minutes</span>
          {error && (
            <Badge variant="outline" className="text-warning border-warning/50 text-xs">
              Using cached data
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedWeatherAdvice.displayName = 'OptimizedWeatherAdvice';

export default OptimizedWeatherAdvice;
