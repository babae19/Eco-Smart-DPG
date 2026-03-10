import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Thermometer, Snowflake, Sun, Flame, Wind, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { sendWeatherAdvisoryNotification } from '@/services/pushNotificationService';

interface TemperatureRange {
  level: 'freezing' | 'cold' | 'cool' | 'pleasant' | 'warm' | 'hot' | 'extreme';
  label: string;
  description: string;
  icon: React.ReactNode;
  feeling: string;
  isExtreme: boolean;
}

const EXTREME_TEMP_STORAGE_KEY = 'ecoalert_last_extreme_temp_alert';

const TemperatureLevel: React.FC = () => {
  const { currentWeather } = useWeather();
  const temperature = currentWeather?.current?.temperature;
  const lastAlertRef = useRef<number>(0);

  const sendExtremeTemperatureAlert = useCallback(async (
    title: string,
    description: string,
    severity: 'high' | 'medium' | 'low'
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await sendWeatherAdvisoryNotification(user.id, title, description, severity);
        console.info('[TemperatureLevel] Extreme temperature alert sent:', title);
      }
    } catch (error) {
      console.error('[TemperatureLevel] Error sending alert:', error);
    }
  }, []);

  // Check and send extreme temperature alerts
  useEffect(() => {
    if (temperature === undefined) return;

    const now = Date.now();
    const lastAlert = localStorage.getItem(EXTREME_TEMP_STORAGE_KEY);
    const lastAlertTime = lastAlert ? parseInt(lastAlert, 10) : 0;
    
    // Only send alert once every 30 minutes for extreme temps
    if (now - lastAlertTime < 30 * 60 * 1000) return;
    if (now - lastAlertRef.current < 30 * 60 * 1000) return;

    const checkExtremeTemperature = async () => {
      if (temperature < 0) {
        await sendExtremeTemperatureAlert(
          '❄️ Freezing Temperature Alert',
          `Current temperature is ${temperature.toFixed(1)}°C. Risk of frostbite and hypothermia. Stay indoors and keep warm.`,
          'high'
        );
        localStorage.setItem(EXTREME_TEMP_STORAGE_KEY, now.toString());
        lastAlertRef.current = now;
      } else if (temperature >= 35) {
        await sendExtremeTemperatureAlert(
          '🔥 Extreme Heat Alert',
          `Current temperature is ${temperature.toFixed(1)}°C. Risk of heat stroke. Stay indoors, hydrate constantly, and avoid outdoor activities.`,
          'high'
        );
        localStorage.setItem(EXTREME_TEMP_STORAGE_KEY, now.toString());
        lastAlertRef.current = now;
      } else if (temperature >= 30) {
        await sendExtremeTemperatureAlert(
          '☀️ High Temperature Warning',
          `Current temperature is ${temperature.toFixed(1)}°C. Limit outdoor exposure and stay hydrated.`,
          'medium'
        );
        localStorage.setItem(EXTREME_TEMP_STORAGE_KEY, now.toString());
        lastAlertRef.current = now;
      } else if (temperature < 5 && temperature >= 0) {
        await sendExtremeTemperatureAlert(
          '🌡️ Cold Temperature Warning',
          `Current temperature is ${temperature.toFixed(1)}°C. Wear warm clothing and limit outdoor exposure.`,
          'medium'
        );
        localStorage.setItem(EXTREME_TEMP_STORAGE_KEY, now.toString());
        lastAlertRef.current = now;
      }
    };

    checkExtremeTemperature();
  }, [temperature, sendExtremeTemperatureAlert]);

  const temperatureInfo = useMemo((): TemperatureRange | null => {
    if (temperature === undefined) return null;

    if (temperature < 0) {
      return {
        level: 'freezing',
        label: 'Freezing',
        description: 'Below 0°C (32°F)',
        icon: <Snowflake className="h-7 w-7 text-info animate-pulse" />,
        feeling: 'Extremely cold - Risk of frostbite. Bundle up completely with insulated layers.',
        isExtreme: true
      };
    } else if (temperature < 10) {
      return {
        level: 'cold',
        label: 'Cold',
        description: '0-10°C (32-50°F)',
        icon: <Snowflake className="h-7 w-7 text-info" />,
        feeling: 'Cold conditions - Wear warm clothing, jacket, and layers outdoors.',
        isExtreme: false
      };
    } else if (temperature < 15) {
      return {
        level: 'cool',
        label: 'Cool',
        description: '10-15°C (50-59°F)',
        icon: <Wind className="h-7 w-7 text-info" />,
        feeling: 'Cool weather - Light layers recommended. Comfortable for outdoor activities.',
        isExtreme: false
      };
    } else if (temperature < 25) {
      return {
        level: 'pleasant',
        label: 'Pleasant',
        description: '15-25°C (59-77°F)',
        icon: <Sun className="h-7 w-7 text-warning" />,
        feeling: 'Comfortable temperature - Ideal for most activities. Light clothing suitable.',
        isExtreme: false
      };
    } else if (temperature < 30) {
      return {
        level: 'warm',
        label: 'Warm',
        description: '25-30°C (77-86°F)',
        icon: <Sun className="h-7 w-7 text-warning" />,
        feeling: 'Warm to hot - Wear light, breathable clothing. Stay hydrated.',
        isExtreme: false
      };
    } else if (temperature < 35) {
      return {
        level: 'hot',
        label: 'Hot',
        description: '30-35°C (86-95°F)',
        icon: <Flame className="h-7 w-7 text-destructive animate-pulse" />,
        feeling: 'Hot conditions - Limit outdoor activities. Drink water frequently.',
        isExtreme: true
      };
    } else {
      return {
        level: 'extreme',
        label: 'Extreme Heat',
        description: 'Above 35°C (95°F)',
        icon: <Flame className="h-7 w-7 text-destructive animate-bounce" />,
        feeling: 'Dangerous heat - Stay indoors. Risk of heat stroke. Hydrate constantly.',
        isExtreme: true
      };
    }
  }, [temperature]);

  if (!temperatureInfo || temperature === undefined) {
    return null;
  }

  // Calculate position on the temperature scale (-10 to 45°C range for better visualization)
  const minTemp = -10;
  const maxTemp = 45;
  const scalePosition = Math.min(100, Math.max(0, ((temperature - minTemp) / (maxTemp - minTemp)) * 100));

  const getHeaderBgClass = () => {
    switch (temperatureInfo.level) {
      case 'freezing':
      case 'cold':
        return 'bg-info/10 border-b border-info/20';
      case 'cool':
        return 'bg-info/5 border-b border-info/10';
      case 'pleasant':
        return 'bg-success/10 border-b border-success/20';
      case 'warm':
        return 'bg-warning/10 border-b border-warning/20';
      case 'hot':
      case 'extreme':
        return 'bg-destructive/10 border-b border-destructive/20';
      default:
        return 'bg-muted border-b border-border';
    }
  };

  const getLabelColorClass = () => {
    switch (temperatureInfo.level) {
      case 'freezing':
      case 'cold':
      case 'cool':
        return 'text-info';
      case 'pleasant':
        return 'text-success';
      case 'warm':
        return 'text-warning';
      case 'hot':
      case 'extreme':
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  const getRangeHighlightClass = (rangeLevel: string) => {
    const isActive = temperatureInfo.level === rangeLevel || 
      (rangeLevel === 'cold' && (temperatureInfo.level === 'cold' || temperatureInfo.level === 'freezing')) ||
      (rangeLevel === 'hot' && (temperatureInfo.level === 'warm' || temperatureInfo.level === 'hot' || temperatureInfo.level === 'extreme'));
    
    if (!isActive) return 'bg-muted/50';
    
    switch (rangeLevel) {
      case 'pleasant':
        return 'bg-success/20 ring-2 ring-success';
      case 'cool':
        return 'bg-info/20 ring-2 ring-info';
      case 'cold':
        return 'bg-info/20 ring-2 ring-info';
      case 'hot':
        return 'bg-destructive/20 ring-2 ring-destructive';
      default:
        return 'bg-muted/50';
    }
  };

  return (
    <Card className="overflow-hidden shadow-lg border-border mb-6">
      <CardHeader className={`${getHeaderBgClass()} py-4 px-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {temperatureInfo.icon}
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getLabelColorClass()}`}>
                {temperatureInfo.label}
              </span>
              {temperatureInfo.isExtreme && (
                <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
              )}
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={`text-lg px-4 py-2 font-bold ${
              temperatureInfo.level === 'freezing' || temperatureInfo.level === 'cold' 
                ? 'bg-info/20 text-info border-info/30' 
                : temperatureInfo.level === 'hot' || temperatureInfo.level === 'extreme'
                ? 'bg-destructive/20 text-destructive border-destructive/30'
                : temperatureInfo.level === 'pleasant'
                ? 'bg-success/20 text-success border-success/30'
                : 'bg-warning/20 text-warning border-warning/30'
            }`}
          >
            {temperature.toFixed(1)}°C
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 bg-card">
        {/* Current Level Display */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{temperatureInfo.description}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{temperatureInfo.feeling}</p>
        </div>

        {/* Temperature Scale Visualization with Marker */}
        <div className="mb-5">
          <div className="relative h-5 rounded-full overflow-visible bg-gradient-to-r from-info via-success via-warning to-destructive">
            {/* Current temperature marker */}
            <div 
              className="absolute -top-1 w-3 h-7 bg-foreground shadow-lg rounded-sm transform -translate-x-1/2 transition-all duration-500 flex items-center justify-center"
              style={{ left: `${scalePosition}%` }}
            >
              <div className="w-1 h-5 bg-background rounded-full" />
            </div>
            {/* Marker label */}
            <div 
              className="absolute -bottom-6 transform -translate-x-1/2 text-xs font-bold text-foreground whitespace-nowrap transition-all duration-500"
              style={{ left: `${scalePosition}%` }}
            >
              {temperature.toFixed(0)}°C
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-8">
            <span>-10°C</span>
            <span>10°C</span>
            <span>25°C</span>
            <span>35°C</span>
            <span>45°C</span>
          </div>
        </div>

        {/* Temperature Ranges Guide */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-foreground flex items-center mb-3">
            <Thermometer className="h-4 w-4 mr-2 text-primary" />
            Temperature Ranges & Feelings
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 rounded-lg transition-all ${getRangeHighlightClass('pleasant')}`}>
              <span className="font-semibold text-success">Pleasant (15-25°C)</span>
              <p className="text-muted-foreground mt-0.5">Comfortable indoors</p>
            </div>
            <div className={`p-2.5 rounded-lg transition-all ${getRangeHighlightClass('cool')}`}>
              <span className="font-semibold text-info">Cool (10-15°C)</span>
              <p className="text-muted-foreground mt-0.5">Light layers needed</p>
            </div>
            <div className={`p-2.5 rounded-lg transition-all ${getRangeHighlightClass('cold')}`}>
              <span className="font-semibold text-info">Cold (&lt;10°C)</span>
              <p className="text-muted-foreground mt-0.5">Warm clothing required</p>
            </div>
            <div className={`p-2.5 rounded-lg transition-all ${getRangeHighlightClass('hot')}`}>
              <span className="font-semibold text-destructive">Hot (&gt;25°C)</span>
              <p className="text-muted-foreground mt-0.5">Stay hydrated</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemperatureLevel;
