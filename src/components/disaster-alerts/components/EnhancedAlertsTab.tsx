import React, { memo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Cloud, Sun, CloudRain, Thermometer, Droplets, Wind, 
  Bell, AlertTriangle, MapPin, RefreshCw, Clock, Calendar,
  CloudLightning, TrendingUp, TrendingDown, Shield, Gauge,
  Moon, CloudSun, Activity, Loader2, Umbrella, ChevronRight,
  Eye, Waves,
  CloudFog, Info, CheckCircle, Sparkles,
  BarChart3
} from 'lucide-react';
import ClimateTrendCharts from './ClimateTrendCharts';
import WeatherNotificationSettings from './WeatherNotificationSettings';
import { useWeatherAlertMonitor } from '@/hooks/useWeatherAlertMonitor';
import { useEmergencyAlertSystem } from '@/hooks/useEmergencyAlertSystem';
import { useUserLocation } from '@/contexts/LocationContext';
import { useQuery } from '@tanstack/react-query';
import { WeatherApiService } from '@/services/weather/weatherApiService';
import { checkProximityToDisasterProneAreas } from '@/services/disaster/geoProximityService';
import { useWeatherChangeMonitor } from '@/hooks/useWeatherChangeMonitor';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { sendWeatherAdvisoryNotification } from '@/services/pushNotificationService';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

// Weather condition icons with enhanced styling
const getWeatherIcon = (condition: string, size: 'sm' | 'md' | 'lg' | 'xl' = 'md', hour?: number) => {
  const isNight = hour !== undefined ? (hour < 6 || hour >= 18) : false;
  const conditionLower = condition?.toLowerCase() || '';
  
  const sizeClasses = { 
    sm: 'h-5 w-5', 
    md: 'h-7 w-7', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  
  if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return <CloudLightning className={`${sizeClasses[size]} text-warning drop-shadow-lg`} />;
  }
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return <CloudRain className={`${sizeClasses[size]} text-primary drop-shadow-lg`} />;
  }
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return <CloudFog className={`${sizeClasses[size]} text-muted-foreground drop-shadow-lg`} />;
  }
  if (conditionLower.includes('cloud') && conditionLower.includes('sun')) {
    return <CloudSun className={`${sizeClasses[size]} text-warning drop-shadow-lg`} />;
  }
  if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
    return <Cloud className={`${sizeClasses[size]} text-muted-foreground drop-shadow-lg`} />;
  }
  if (isNight) {
    return <Moon className={`${sizeClasses[size]} text-secondary-foreground drop-shadow-lg`} />;
  }
  return <Sun className={`${sizeClasses[size]} text-warning drop-shadow-lg`} />;
};

const getTemperatureGradient = (temp: number): string => {
  if (temp < 20) return 'from-primary to-primary/70';
  if (temp < 25) return 'from-success to-success/70';
  if (temp < 30) return 'from-warning to-warning/70';
  return 'from-destructive to-destructive/70';
};

const getDayName = (dateStr: string, index: number): string => {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const getAirQualityLabel = (humidity: number): { label: string; color: string; description: string } => {
  if (humidity < 40) return { label: 'Dry', color: 'text-warning', description: 'Low moisture' };
  if (humidity < 60) return { label: 'Comfortable', color: 'text-success', description: 'Ideal conditions' };
  if (humidity < 80) return { label: 'Humid', color: 'text-primary', description: 'Moderate moisture' };
  return { label: 'Very Humid', color: 'text-secondary-foreground', description: 'High moisture' };
};

// Hero Weather Section with Enhanced Visual Design
const HeroWeatherSection: React.FC<{ data: any; location: string; onRefresh: () => void; isRefreshing: boolean }> = memo(({ 
  data, location, onRefresh, isRefreshing 
}) => {
  const current = data?.current;
  const currentHour = new Date().getHours();
  
  if (!current) return null;

  
  const airQuality = getAirQualityLabel(current.humidity);
  const isNight = currentHour < 6 || currentHour >= 18;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl"
    >
      {/* Bold Animated Gradient Background - Vibrant colors */}
      <div className={cn(
        "absolute inset-0 transition-all duration-1000",
        isNight 
          ? "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900"
          : current.temperature > 30
          ? "bg-gradient-to-br from-red-600 via-orange-500 to-red-700"
          : current.temperature > 25
          ? "bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500"
          : "bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600"
      )} />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
      
      <div className="relative p-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div 
              className="h-10 w-10 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <MapPin className="h-5 w-5 text-white drop-shadow-sm" />
            </motion.div>
            <div>
              <h2 className="font-bold text-lg text-white drop-shadow-md">{location || 'Current Location'}</h2>
              <p className="text-xs text-white/90 flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 bg-green-300 rounded-full animate-pulse shadow-lg" />
                Live Weather Data
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/20"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-5 w-5 text-white", isRefreshing && "animate-spin")} />
          </Button>
        </div>

        {/* Main Temperature Display */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-5">
            <motion.div 
              className="relative"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.02, 1]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 blur-xl bg-white/30 rounded-full" />
              {getWeatherIcon(current.conditions, 'xl', currentHour)}
            </motion.div>
            <div>
              <div className="text-7xl font-extrabold text-white drop-shadow-xl tracking-tight">
                {Math.round(current.temperature)}°
              </div>
              <div className="text-base text-white font-semibold capitalize flex items-center gap-3 mt-1 drop-shadow-md">
                {current.conditions}
                <Badge className="bg-white/30 text-white border-white/40 text-xs backdrop-blur-sm font-bold shadow-lg">
                  Feels {Math.round(current.feelsLike)}°
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid - Bold Glassmorphism Cards */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Droplets, value: `${current.humidity}%`, label: 'Humidity', color: 'text-white' },
            { icon: Wind, value: current.windSpeed, label: 'km/h', color: 'text-white' },
            { icon: Eye, value: current.uvIndex || 5, label: 'UV Index', color: 'text-white' },
            { icon: Gauge, value: current.pressure || 1013, label: 'hPa', color: 'text-white' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-white/25 backdrop-blur-md rounded-2xl p-3 text-center border border-white/30 hover:bg-white/35 transition-all shadow-lg"
            >
              <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-1 drop-shadow-md`} />
              <div className="text-lg font-bold text-white drop-shadow-md">{stat.value}</div>
              <div className="text-[10px] text-white/90 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Air Quality Strip - Bold styling */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 p-3 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-between border border-white/30 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400/50 to-green-500/50 flex items-center justify-center border border-white/30 shadow-md">
              <Sparkles className="h-5 w-5 text-white drop-shadow-md" />
            </div>
            <div>
              <div className="font-bold text-white drop-shadow-md">{airQuality.label} Air</div>
              <div className="text-xs text-white/90 font-medium">{airQuality.description}</div>
            </div>
          </div>
          <Badge className="bg-emerald-500/40 text-white border-emerald-300/50 backdrop-blur-sm font-bold shadow-md">
            <CheckCircle className="h-3 w-3 mr-1" />
            Good
          </Badge>
        </motion.div>
      </div>
    </motion.div>
  );
});

// Horizontal Hourly Forecast
const HourlyForecastStrip: React.FC<{ forecast: any[] }> = memo(({ forecast }) => {
  // Generate hourly data from daily forecast - use useMemo to prevent random re-renders
  const hourlyData = React.useMemo(() => {
    const data: Array<{ hour: number; temp: number; condition: string; precipitation: number }> = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const hour = (now.getHours() + i) % 24;
      const dayIndex = Math.floor((now.getHours() + i) / 24);
      const dayData = forecast?.[dayIndex] || forecast?.[0];
      
      if (dayData) {
        const isNight = hour < 6 || hour >= 18;
        // Use deterministic interpolation instead of Math.random()
        const factor = (i % 3) * 0.8;
        const temp = isNight 
          ? dayData.low + factor
          : dayData.high - factor;
        
        data.push({
          hour,
          temp: Math.round(temp),
          condition: dayData.condition,
          precipitation: dayData.precipitation
        });
      }
    }
    return data;
  }, [forecast]);

  return (
    <Card className="border-border/50 overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
            <Clock className="h-4 w-4 text-emerald-600" />
            Hourly Forecast
          </h3>
          <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700 font-bold">Next 12 hours</Badge>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3">
            {hourlyData.map((data, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl min-w-[70px] transition-all shadow-md",
                  index === 0 
                    ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white border border-emerald-400" 
                    : "bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-emerald-100 dark:border-emerald-800"
                )}
              >
                <span className={cn(
                  "text-xs font-bold",
                  index === 0 ? "text-white" : "text-emerald-700 dark:text-emerald-300"
                )}>
                  {index === 0 ? 'Now' : `${data.hour}:00`}
                </span>
                {getWeatherIcon(data.condition, 'sm', data.hour)}
                <span className={cn(
                  "font-bold text-lg",
                  index === 0 ? "text-white" : "text-slate-800 dark:text-slate-100"
                )}>{data.temp}°</span>
                {data.precipitation > 20 && (
                  <span className={cn(
                    "text-[10px] flex items-center gap-0.5 font-medium",
                    index === 0 ? "text-emerald-100" : "text-emerald-600 dark:text-emerald-400"
                  )}>
                    <Droplets className="h-2.5 w-2.5" />
                    {data.precipitation}%
                  </span>
                )}
              </motion.div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

// 7-Day Forecast with Visual Enhancement
const WeeklyForecast: React.FC<{ forecast: any[] }> = memo(({ forecast }) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  if (!forecast || forecast.length === 0) return null;

  return (
    <Card className="border-border/50 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
            <Calendar className="h-4 w-4 text-emerald-600" />
            7-Day Outlook
          </h3>
        </div>
        <div className="space-y-2">
          {forecast.slice(0, 7).map((day, index) => {
            const tempGradient = getTemperatureGradient(day.high);
            const isSelected = selectedDay === index;
            
            return (
              <motion.div
                key={index}
                layout
                onClick={() => setSelectedDay(isSelected ? null : index)}
                className={cn(
                  "rounded-2xl cursor-pointer transition-all shadow-sm",
                  index === 0 
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white border border-emerald-400" 
                    : "bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-emerald-100 dark:border-emerald-800",
                  isSelected && "ring-2 ring-emerald-400"
                )}
              >
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-16 text-sm font-medium">
                      {getDayName(day.date, index)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getWeatherIcon(day.condition, 'sm')}
                      <span className="text-xs text-muted-foreground capitalize hidden sm:inline">
                        {day.condition}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {day.precipitation > 20 && (
                      <div className="flex items-center gap-1 text-xs text-blue-400">
                        <Umbrella className="h-3.5 w-3.5" />
                        {day.precipitation}%
                      </div>
                    )}
                    <div className="flex items-center gap-2 min-w-[100px] justify-end">
                      <span className={`font-bold text-lg bg-gradient-to-r ${tempGradient} bg-clip-text text-transparent`}>
                        {Math.round(day.high)}°
                      </span>
                      <span className="text-muted-foreground text-sm">{Math.round(day.low)}°</span>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isSelected && "rotate-90"
                    )} />
                  </div>
                </div>
                
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 pt-1 grid grid-cols-3 gap-2">
                        <div className="text-center p-2 rounded-xl bg-background/60">
                          <TrendingUp className="h-4 w-4 text-destructive mx-auto mb-1" />
                          <div className="text-sm font-semibold">{Math.round(day.high)}°</div>
                          <div className="text-[10px] text-muted-foreground">High</div>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-background/60">
                          <TrendingDown className="h-4 w-4 text-success mx-auto mb-1" />
                          <div className="text-sm font-semibold">{Math.round(day.low)}°</div>
                          <div className="text-[10px] text-muted-foreground">Low</div>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-background/60">
                          <Droplets className="h-4 w-4 text-success mx-auto mb-1" />
                          <div className="text-sm font-semibold">{day.precipitation}%</div>
                          <div className="text-[10px] text-muted-foreground">Rain</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

// Risk Assessment Panel
const RiskAssessmentPanel: React.FC<{ 
  latitude: number; 
  longitude: number;
  weatherData: any;
}> = memo(({ latitude, longitude, weatherData }) => {
  const [riskData, setRiskData] = useState<any>(null);

  useEffect(() => {
    if (!latitude || !longitude) return;
    
    const proximityStatus = checkProximityToDisasterProneAreas(latitude, longitude, 100);
    
    let floodRisk = 0;
    let landslideRisk = 0;
    let heatRisk = 0;
    
    const current = weatherData?.current;
    if (current) {
      if (current.precipitation > 20) floodRisk += 30;
      if (current.humidity > 85) floodRisk += 15;
      if (current.precipitation > 50) landslideRisk += 25;
      if (current.temperature > 32) heatRisk += 40;
      if (current.temperature > 28) heatRisk += 20;
    }
    
    if (proximityStatus.insideProneArea) {
      floodRisk += 40;
      landslideRisk += 30;
    } else if (proximityStatus.proximityAlerts.length > 0) {
      floodRisk += 20;
      landslideRisk += 15;
    }
    
    const month = new Date().getMonth();
    const isRainySeason = month >= 4 && month <= 9;
    if (isRainySeason) {
      floodRisk += 20;
      landslideRisk += 15;
    }

    setRiskData({
      flood: Math.min(floodRisk, 95),
      landslide: Math.min(landslideRisk, 90),
      heat: Math.min(heatRisk, 90),
      isInProneArea: proximityStatus.insideProneArea,
      nearestArea: proximityStatus.nearestProneArea?.name
    });
  }, [latitude, longitude, weatherData]);

  if (!riskData) return null;

  const getRiskLevel = (value: number): { label: string; color: string; bgColor: string } => {
    if (value < 25) return { label: 'Low', color: 'text-success', bgColor: 'bg-success' };
    if (value < 50) return { label: 'Moderate', color: 'text-primary', bgColor: 'bg-primary' };
    if (value < 75) return { label: 'High', color: 'text-warning', bgColor: 'bg-warning' };
    return { label: 'Severe', color: 'text-destructive', bgColor: 'bg-destructive' };
  };

  const risks = [
    { name: 'Flood Risk', value: riskData.flood, icon: Waves, iconColor: 'text-primary' },
    { name: 'Landslide Risk', value: riskData.landslide, icon: Activity, iconColor: 'text-warning' },
    { name: 'Heat Stress', value: riskData.heat, icon: Thermometer, iconColor: 'text-destructive' }
  ];

  return (
    <Card className={cn(
      "border-border/50 overflow-hidden",
      riskData.isInProneArea && "border-destructive/50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Risk Assessment
          </h3>
          {riskData.isInProneArea && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Risk Zone
            </Badge>
          )}
        </div>

        {riskData.isInProneArea && riskData.nearestArea && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3"
          >
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <div className="font-medium text-destructive text-sm">Proximity Alert</div>
              <div className="text-xs text-muted-foreground">You are near {riskData.nearestArea}</div>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          {risks.map((risk, index) => {
            const level = getRiskLevel(risk.value);
            const Icon = risk.icon;
            
            return (
              <motion.div
                key={risk.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${risk.iconColor}`} />
                    <span className="text-sm font-medium">{risk.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${level.color}`}>{risk.value}%</span>
                    <Badge variant="outline" className={`text-[10px] ${level.color} border-current`}>
                      {level.label}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${risk.value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${level.bgColor} rounded-full`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            Based on current weather, location & seasonal patterns
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

// Alert Notifications Panel
const AlertsPanel: React.FC<{ 
  alerts: any[];
  onEnableNotifications: () => void;
}> = memo(({ alerts, onEnableNotifications }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast.success('Notifications enabled!');
        onEnableNotifications();
      }
    }
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Active Alerts
          </h3>
          {!notificationsEnabled ? (
            <Button size="sm" variant="outline" onClick={handleEnableNotifications} className="gap-1">
              <Bell className="h-3 w-3" />
              Enable
            </Button>
          ) : (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </div>

        {alerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 text-center"
          >
            <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <h4 className="font-semibold text-success mb-1">All Clear!</h4>
            <p className="text-sm text-muted-foreground">
              No weather warnings for your area
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-2xl border flex items-start gap-3",
                  alert.severity === 'high' 
                    ? "bg-destructive/10 border-destructive/30" 
                    : alert.severity === 'medium'
                    ? "bg-warning/10 border-warning/30"
                    : "bg-primary/10 border-primary/30"
                )}
              >
                <AlertTriangle className={cn(
                  "h-5 w-5 flex-shrink-0 mt-0.5",
                  alert.severity === 'high' ? "text-destructive" : 
                  alert.severity === 'medium' ? "text-warning" : "text-primary"
                )} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{alert.title}</span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Climate Tips Section
const ClimateTipsSection: React.FC<{ weatherData: any }> = memo(({ weatherData }) => {
  const current = weatherData?.current;
  
  const tips = [];
  
  if (current) {
    if (current.temperature > 30) {
      tips.push({
        icon: Thermometer,
        title: 'Stay Hydrated',
        description: 'Drink plenty of water and avoid outdoor activities during peak heat.',
        color: 'text-destructive',
        bgColor: 'bg-destructive/10'
      });
    }
    if (current.uvIndex > 6) {
      tips.push({
        icon: Sun,
        title: 'High UV Alert',
        description: 'Use SPF 30+ sunscreen and seek shade during midday hours.',
        color: 'text-warning',
        bgColor: 'bg-warning/10'
      });
    }
    if (current.humidity > 80) {
      tips.push({
        icon: Droplets,
        title: 'High Humidity',
        description: 'Stay in well-ventilated areas. Thunderstorms possible.',
        color: 'text-primary',
        bgColor: 'bg-primary/10'
      });
    }
    if (current.windSpeed > 20) {
      tips.push({
        icon: Wind,
        title: 'Strong Winds',
        description: 'Secure loose outdoor items. Exercise caution when driving.',
        color: 'text-secondary-foreground',
        bgColor: 'bg-secondary/50'
      });
    }
  }
  
  if (tips.length === 0) {
    tips.push({
      icon: CheckCircle,
      title: 'Favorable Conditions',
      description: 'Weather conditions are ideal for outdoor activities today.',
      color: 'text-success',
      bgColor: 'bg-success/10'
    });
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Info className="h-4 w-4 text-primary" />
          Climate Advisory
        </h3>
        <div className="space-y-3">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn("p-3 rounded-xl flex items-start gap-3", tip.bgColor)}
              >
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", tip.bgColor)}>
                  <Icon className={cn("h-4 w-4", tip.color)} />
                </div>
                <div>
                  <h4 className={cn("font-medium text-sm", tip.color)}>{tip.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{tip.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

// Main Component
const EnhancedAlertsTab: React.FC = memo(() => {
  const { latitude, longitude, isLoading: locationLoading } = useUserLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationName, setLocationName] = useState<string>('Freetown');
  const [activeTab, setActiveTab] = useState('overview');
  
  useWeatherChangeMonitor();

  // Stabilize coordinates to prevent re-fetching on minor GPS drift (~111m precision)
  const stableLat = latitude ? Math.round(latitude * 1000) / 1000 : undefined;
  const stableLng = longitude ? Math.round(longitude * 1000) / 1000 : undefined;

  const { data: weatherData, isLoading: weatherLoading, refetch } = useQuery({
    queryKey: ['weather-alerts-tab', stableLat, stableLng],
    queryFn: () => WeatherApiService.fetchWeatherData(latitude!, longitude!),
    enabled: !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    placeholderData: (prev) => prev, // Keep previous data while refetching to prevent flickering
  });

  // Monitor weather for threshold-based alerts
  useWeatherAlertMonitor(weatherData as any);

  // Emergency alert system - triggers device alarm for rain ≥80% or risk ≥80%
  const maxRainProb = React.useMemo(() => {
    const forecast = (weatherData as any)?.forecast || [];
    return forecast.reduce((max: number, day: any) => Math.max(max, day?.precipitation || 0), 0);
  }, [weatherData]);

  // Calculate risk score from weather data
  const riskScore = React.useMemo(() => {
    const current = (weatherData as any)?.current;
    if (!current) return 0;
    let score = 0;
    if (current.temperature > 35) score += 30;
    if (current.humidity > 85) score += 20;
    if (current.precipitation > 20) score += 25;
    if (maxRainProb > 60) score += 25;
    return Math.min(score, 100);
  }, [weatherData, maxRainProb]);

  useEmergencyAlertSystem({
    rainProbability: maxRainProb,
    aiRiskScore: riskScore,
    weatherData: weatherData as any,
    enabled: !!latitude && !!longitude,
  });

  useEffect(() => {
    if (latitude && longitude) {
      import('@/services/geolocation/googleMapsGeocodingService').then(({ reverseGeocodeGoogle }) => {
        reverseGeocodeGoogle(latitude, longitude).then(result => {
          if (result) {
            const name = result.locality || result.neighborhood || result.city || 'Current Location';
            setLocationName(name);
          }
        });
      });
    }
  }, [latitude, longitude]);

  const forecast = (weatherData as any)?.forecast || [];
  const forecastAlerts = (weatherData as any)?.forecastAlerts || [];

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Data refreshed');
    } catch {
      toast.error('Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleEnableNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await sendWeatherAdvisoryNotification(
          user.id,
          '🔔 Notifications Enabled',
          'You will now receive weather and disaster alerts.',
          'low'
        );
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, []);

  // Loading States
  if (locationLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div>
            <p className="font-medium">Finding your location...</p>
            <p className="text-sm text-muted-foreground">Please wait</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!latitude || !longitude) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-xs"
        >
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Location Required</p>
            <p className="text-sm text-muted-foreground mt-1">
              Enable location services to view accurate weather data and alerts for your area.
            </p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </motion.div>
      </div>
    );
  }

  if (weatherLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Cloud className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <div>
            <p className="font-medium">Loading weather data...</p>
            <p className="text-sm text-muted-foreground">Getting the latest conditions</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-xs"
        >
          <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-warning" />
          </div>
          <div>
            <p className="font-medium">Unable to Load Data</p>
            <p className="text-sm text-muted-foreground mt-1">
              We couldn't fetch the weather data. Please try again.
            </p>
          </div>
          <Button onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 pb-4"
    >
      {/* Hero Weather */}
      <HeroWeatherSection 
        data={weatherData} 
        location={locationName}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 h-12 bg-muted/50 rounded-2xl p-1">
          <TabsTrigger 
            value="overview" 
            className="rounded-xl text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm flex flex-col gap-0.5 py-1.5"
          >
            <Calendar className="h-4 w-4" />
            <span className="text-[10px]">Forecast</span>
          </TabsTrigger>
          <TabsTrigger 
            value="trends" 
            className="rounded-xl text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm flex flex-col gap-0.5 py-1.5"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-[10px]">Trends</span>
          </TabsTrigger>
          <TabsTrigger 
            value="risks" 
            className="rounded-xl text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm flex flex-col gap-0.5 py-1.5"
          >
            <Shield className="h-4 w-4" />
            <span className="text-[10px]">Risks</span>
          </TabsTrigger>
          <TabsTrigger 
            value="alerts" 
            className="rounded-xl text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm flex flex-col gap-0.5 py-1.5"
          >
            <Bell className="h-4 w-4" />
            <span className="text-[10px]">Alerts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <HourlyForecastStrip forecast={forecast} />
          <WeeklyForecast forecast={forecast} />
          <ClimateTipsSection weatherData={weatherData} />
        </TabsContent>

        <TabsContent value="trends" className="mt-4 space-y-4">
          <ClimateTrendCharts 
            latitude={latitude}
            longitude={longitude}
          />
        </TabsContent>

        <TabsContent value="risks" className="mt-4 space-y-4">
          <RiskAssessmentPanel 
            latitude={latitude}
            longitude={longitude}
            weatherData={weatherData}
          />
          <ClimateTipsSection weatherData={weatherData} />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4 space-y-4">
          <AlertsPanel 
            alerts={forecastAlerts}
            onEnableNotifications={handleEnableNotifications}
          />
          <WeatherNotificationSettings />
        </TabsContent>
      </Tabs>

      {/* Last Updated Footer */}
      <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2 pt-2">
        <Clock className="h-3 w-3" />
        Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </motion.div>
  );
});

HeroWeatherSection.displayName = 'HeroWeatherSection';
HourlyForecastStrip.displayName = 'HourlyForecastStrip';
WeeklyForecast.displayName = 'WeeklyForecast';
RiskAssessmentPanel.displayName = 'RiskAssessmentPanel';
AlertsPanel.displayName = 'AlertsPanel';
ClimateTipsSection.displayName = 'ClimateTipsSection';
EnhancedAlertsTab.displayName = 'EnhancedAlertsTab';

export default EnhancedAlertsTab;
