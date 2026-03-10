import React, { useMemo } from 'react';
import { AlertTriangle, Droplets, Wind, ThermometerSun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OptimizedWeatherAlertsProps {
  temperature?: number;
  precipitation?: number;
  windSpeed?: number;
  uvIndex?: number;
}

interface WeatherAlert {
  id: string;
  title: string;
  desc: string;
  severity: 'high' | 'medium';
  type: string;
}

const OptimizedWeatherAlerts: React.FC<OptimizedWeatherAlertsProps> = ({
  temperature = 28,
  precipitation = 20,
  windSpeed = 15,
  uvIndex = 5
}) => {
  const alerts = useMemo((): WeatherAlert[] => {
    const result: WeatherAlert[] = [];

    if (temperature > 32) {
      result.push({
        id: 'heat',
        title: 'Extreme Heat',
        desc: `${temperature}°C - Stay hydrated`,
        severity: temperature > 35 ? 'high' : 'medium',
        type: 'temp'
      });
    }

    if (precipitation > 50) {
      result.push({
        id: 'rain',
        title: 'Heavy Rain',
        desc: `${precipitation}% chance - Flooding risk`,
        severity: precipitation > 70 ? 'high' : 'medium',
        type: 'precip'
      });
    }

    if (uvIndex > 8) {
      result.push({
        id: 'uv',
        title: 'High UV Index',
        desc: `UV ${uvIndex} - Use SPF 30+`,
        severity: 'medium',
        type: 'uv'
      });
    }

    if (windSpeed > 40) {
      result.push({
        id: 'wind',
        title: 'Strong Wind',
        desc: `${windSpeed} km/h - Secure objects`,
        severity: windSpeed > 60 ? 'high' : 'medium',
        type: 'wind'
      });
    }

    return result;
  }, [temperature, precipitation, windSpeed, uvIndex]);

  const getIcon = (type: string) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case 'temp': return <ThermometerSun className={iconClass} />;
      case 'precip': return <Droplets className={iconClass} />;
      case 'wind': return <Wind className={iconClass} />;
      default: return <AlertTriangle className={iconClass} />;
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold mb-1">All Clear</h3>
        <p className="text-xs text-muted-foreground">No weather alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div 
          key={alert.id} 
          className="rounded-lg border bg-card p-3 flex items-start gap-3 hover:bg-accent/5 transition-colors"
        >
          <div className={`p-2 rounded-md ${
            alert.severity === 'high' 
              ? 'bg-destructive/10 text-destructive' 
              : 'bg-warning/10 text-warning'
          }`}>
            {getIcon(alert.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-semibold text-sm">{alert.title}</h4>
              <Badge variant="outline" className="text-xs h-5 px-1.5">
                {alert.severity}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{alert.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OptimizedWeatherAlerts;
