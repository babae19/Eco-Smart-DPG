
import React, { useEffect, useMemo } from 'react';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useWeatherForecast } from '@/hooks/useWeatherForecast';
import { getTemperatureAdvice } from '@/utils/temperatureAdvice';
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
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const WeatherAdvice: React.FC = () => {
  const { weatherData, isLoading, error, refreshWeatherData } = useWeatherData();
  const { weeklyForecast } = useWeatherForecast();
  const currentTemp = weatherData?.current?.temperature;
  const currentConditions = weatherData?.current?.conditions;
  const { toast } = useToast();

  // Get weather icon based on conditions
  const getWeatherIcon = (conditions: string, size = 24) => {
    const conditionsLower = conditions.toLowerCase();
    
    if (conditionsLower.includes('rain') || conditionsLower.includes('drizzle')) {
      return <CloudRain className={`h-${size/4} w-${size/4} text-weather-rainy`} />;
    } else if (conditionsLower.includes('thunder') || conditionsLower.includes('storm')) {
      return <CloudLightning className={`h-${size/4} w-${size/4} text-weather-stormy`} />;
    } else if (conditionsLower.includes('cloud')) {
      return <Cloud className={`h-${size/4} w-${size/4} text-weather-cloudy`} />;
    } else if (conditionsLower.includes('clear') || conditionsLower.includes('sun')) {
      return <Sun className={`h-${size/4} w-${size/4} text-weather-sunny`} />;
    }
    
    return <Sun className={`h-${size/4} w-${size/4} text-weather-sunny`} />;
  };

  // Get advisory icon based on rain chances and conditions
  const getAdvisoryIcon = useMemo(() => {
    const today = weeklyForecast[0];
    const rainChance = today?.precipChance || 0;
    
    if (rainChance > 50) {
      return <CloudRain className="h-6 w-6 text-white animate-pulse" />;
    } else if (rainChance > 30) {
      return <CloudRain className="h-6 w-6 text-white/90" />;
    } else if (currentConditions?.toLowerCase().includes('rain')) {
      return <CloudRain className="h-6 w-6 text-white" />;
    } else if (currentConditions?.toLowerCase().includes('sun') || currentConditions?.toLowerCase().includes('clear')) {
      return <Sun className="h-6 w-6 text-white" />;
    } else if (currentConditions?.toLowerCase().includes('cloud')) {
      return <Cloud className="h-6 w-6 text-white/90" />;
    }
    
    return <Sun className="h-6 w-6 text-white" />;
  }, [weeklyForecast, currentConditions]);

  // Get next 24 hours forecast prediction
  const getWeatherPrediction = useMemo(() => {
    if (!weeklyForecast.length) return null;
    
    const today = weeklyForecast[0];
    const tomorrow = weeklyForecast[1];
    
    const predictions = [];
    
    if (today?.precipChance && today.precipChance > 20) {
      predictions.push({
        type: 'rain',
        probability: today.precipChance,
        message: `${today.precipChance}% chance of rain today`,
        isHighPriority: today.precipChance > 60
      });
    }
    
    if (tomorrow?.precipChance && tomorrow.precipChance > 20) {
      predictions.push({
        type: 'rain',
        probability: tomorrow.precipChance,
        message: `${tomorrow.precipChance}% chance of rain tomorrow`,
        isHighPriority: tomorrow.precipChance > 60
      });
    }
    
    if (today && tomorrow) {
      const tempDiff = tomorrow.temp - today.temp;
      if (Math.abs(tempDiff) > 3) {
        predictions.push({
          type: 'temperature',
          change: tempDiff,
          message: tempDiff > 0 ? 
            `Getting warmer: +${tempDiff.toFixed(1)}°C tomorrow` : 
            `Getting cooler: ${tempDiff.toFixed(1)}°C tomorrow`,
          isHighPriority: false
        });
      }
    }
    
    return predictions;
  }, [weeklyForecast]);

  // Simple loading state
  if (isLoading && !weatherData) {
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
  if (error && !weatherData) {
    return (
      <Card className="mb-6 overflow-hidden shadow-lg border-destructive/50">
        <CardHeader className="bg-gradient-to-br from-destructive/10 to-destructive/20">
          <div className="text-center py-4">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Weather Advisory Unavailable</h3>
            <p className="text-muted-foreground mb-4 text-sm">{error}</p>
            <Button 
              onClick={() => {
                refreshWeatherData();
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
  if (!weatherData || currentTemp === undefined) {
    return (
      <Card className="mb-6 overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-br from-muted to-muted/50">
          <div className="text-center py-4">
            <Cloud className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-3">Weather advisory not available</p>
            <Button 
              onClick={() => {
                refreshWeatherData();
                toast({
                  title: 'Refreshing Weather Data',
                  description: 'Fetching the latest weather information...'
                });
              }}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Get Weather
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Get temperature advice
  const advice = getTemperatureAdvice(currentTemp);
  
  // Enhance advice with detailed weather conditions
  if (currentConditions && weatherData.current) {
    advice.weatherConditions = currentConditions;
    const conditions = currentConditions.toLowerCase();
    const windSpeed = weatherData.current.windSpeed || 0;
    const humidity = weatherData.current.humidity || 0;
    const today = weeklyForecast[0];
    const rainChance = today?.precipChance || 0;
    
    // Rain-specific advice
    if (conditions.includes('rain') || conditions.includes('drizzle') || rainChance > 30) {
      if (rainChance > 70) {
        advice.recommendations.push('⚠️ High rain chance - carry waterproof gear');
        advice.recommendations.push('🚗 Drive slowly, expect heavy traffic delays');
      } else if (rainChance > 50) {
        advice.recommendations.push('☔ Moderate rain expected - bring umbrella');
        advice.recommendations.push('👟 Wear non-slip shoes for safety');
      } else {
        advice.recommendations.push('🌦️ Light rain possible - keep umbrella handy');
      }
      advice.recommendations.push('🚶‍♂️ Watch for slippery surfaces and puddles');
    }
    
    // Sun/Clear weather advice
    else if (conditions.includes('sun') || conditions.includes('clear')) {
      if (currentTemp > 25) {
        advice.recommendations.push('☀️ Hot sunny day - use SPF 30+ sunscreen');
        advice.recommendations.push('🕶️ Wear sunglasses and light-colored clothing');
        advice.recommendations.push('💧 Stay hydrated, drink plenty of water');
      } else {
        advice.recommendations.push('🌤️ Pleasant sunny weather - enjoy outdoor activities');
        advice.recommendations.push('🧴 Apply sunscreen for extended outdoor time');
      }
    }
    
    // Cloudy weather advice
    else if (conditions.includes('cloud')) {
      advice.recommendations.push('☁️ Cloudy conditions - weather may change quickly');
      advice.recommendations.push('🧥 Dress in layers for temperature variations');
    }
    
    // Wind-specific advice
    if (windSpeed > 25) {
      advice.recommendations.push('💨 Strong winds - secure loose items outdoors');
      advice.recommendations.push('🚗 Exercise caution when driving, especially high-profile vehicles');
    } else if (windSpeed > 15) {
      advice.recommendations.push('🌬️ Moderate winds - be careful with umbrellas');
    }
    
    // Humidity advice
    if (humidity > 80) {
      advice.recommendations.push('💨 High humidity - expect muggy conditions');
    } else if (humidity < 30) {
      advice.recommendations.push('🏜️ Low humidity - stay hydrated and moisturize');
    }
  }

  const gradientClass = 'bg-gradient-to-br from-climate-green to-climate-green-dark';

  return (
    <Card className="mb-6 overflow-hidden shadow-xl border-0 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
      {/* Header with weather info */}
      <CardHeader className={`${gradientClass} text-white relative pb-6`}>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        
        <div className="relative z-10">
          {/* Main weather display */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              {getAdvisoryIcon}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  Weather Advisory
                </h2>
                <p className="text-white/80 text-sm">Real-time conditions & guidance</p>
              </div>
            </div>
            
            <Button
              onClick={() => {
                refreshWeatherData();
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
              {weatherData.current.feelsLike && (
                <p className="text-white/80 text-sm">
                  Feels like {weatherData.current.feelsLike.toFixed(1)}°C
                </p>
              )}
            </div>
            
            <div className="text-right">
              <p className="text-base sm:text-lg font-medium capitalize">{currentConditions}</p>
              <div className="flex justify-end space-x-3 text-white/80 text-sm mt-1">
                {weatherData.current.humidity && (
                  <span className="flex items-center">
                    <Droplets className="h-4 w-4 mr-1" />
                    <span className="font-medium">{weatherData.current.humidity}%</span>
                  </span>
                )}
                {weatherData.current.windSpeed && (
                  <span className="flex items-center">
                    <Wind className="h-4 w-4 mr-1" />
                    <span className="font-medium">{weatherData.current.windSpeed} km/h</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Weather predictions */}
          {getWeatherPrediction && getWeatherPrediction.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {getWeatherPrediction.map((prediction, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className={`${
                    prediction.type === 'rain' && prediction.isHighPriority
                      ? 'bg-orange-500/90 text-white border-orange-300 shadow-lg animate-pulse font-bold text-base px-4 py-2' 
                      : prediction.type === 'rain'
                      ? 'bg-blue-500/80 text-white border-blue-300 shadow-md font-semibold text-sm px-3 py-2'
                      : 'bg-white/20 text-white border-white/30 text-sm px-3 py-1'
                  } transition-all duration-300 animate-fade-in`}
                >
                  {prediction.type === 'rain' && (
                    <CloudRain className={`${
                      prediction.isHighPriority ? 'h-5 w-5 mr-2 animate-bounce' : 'h-4 w-4 mr-1'
                    }`} />
                  )}
                  {prediction.type === 'temperature' && <TrendingUp className="h-4 w-4 mr-1" />}
                  <span className={prediction.type === 'rain' && prediction.isHighPriority ? 'text-base font-bold' : ''}>
                    {prediction.message}
                  </span>
                  {prediction.type === 'rain' && prediction.isHighPriority && (
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
              <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors duration-200 animate-fade-in">
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
};

export default WeatherAdvice;
