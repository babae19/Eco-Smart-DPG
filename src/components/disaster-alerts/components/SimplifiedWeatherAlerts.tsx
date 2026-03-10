import React, { useMemo } from 'react';
import { AlertTriangle, Droplets, Wind, ThermometerSun } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/types/AlertTypes';

interface SimplifiedWeatherAlertsProps {
  temperature?: number;
  precipitation?: number;
  windSpeed?: number;
  uvIndex?: number;
}

const SimplifiedWeatherAlerts: React.FC<SimplifiedWeatherAlertsProps> = ({
  temperature = 28,
  precipitation = 20,
  windSpeed = 15,
  uvIndex = 5
}) => {
  const alerts = useMemo(() => {
    const generatedAlerts: Alert[] = [];
    const now = new Date().toISOString();

    // High Temperature
    if (temperature > 32) {
      generatedAlerts.push({
        id: 'heat',
        title: 'Extreme Heat Warning',
        description: `Temperature at ${temperature}°C. Stay hydrated and avoid sun exposure.`,
        location: 'Current Location',
        severity: temperature > 35 ? 'high' : 'medium',
        date: now,
        type: 'temperature',
        isPersonalized: true,
        source: 'weather-monitoring'
      });
    }

    // Heavy Rain
    if (precipitation > 50) {
      generatedAlerts.push({
        id: 'rain',
        title: 'Heavy Rainfall Alert',
        description: `${precipitation}% chance of heavy rain. Flooding risk in low areas.`,
        location: 'Current Location',
        severity: precipitation > 70 ? 'high' : 'medium',
        date: now,
        type: 'precipitation',
        isPersonalized: true,
        source: 'weather-monitoring'
      });
    }

    // High UV
    if (uvIndex > 8) {
      generatedAlerts.push({
        id: 'uv',
        title: 'High UV Index',
        description: `UV Index ${uvIndex}. Use SPF 30+ sunscreen.`,
        location: 'Current Location',
        severity: 'medium',
        date: now,
        type: 'uv',
        isPersonalized: true,
        source: 'weather-monitoring'
      });
    }

    // Strong Wind
    if (windSpeed > 40) {
      generatedAlerts.push({
        id: 'wind',
        title: 'Strong Wind Advisory',
        description: `Wind at ${windSpeed} km/h. Secure loose objects.`,
        location: 'Current Location',
        severity: windSpeed > 60 ? 'high' : 'medium',
        date: now,
        type: 'wind',
        isPersonalized: true,
        source: 'weather-monitoring'
      });
    }

    return generatedAlerts;
  }, [temperature, precipitation, windSpeed, uvIndex]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <ThermometerSun className="h-5 w-5" />;
      case 'precipitation': return <Droplets className="h-5 w-5" />;
      case 'wind': return <Wind className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">All Clear</h3>
            <p className="text-sm text-muted-foreground">
              No weather alerts at this time. Conditions are favorable.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
              {getIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base">{alert.title}</h3>
                <Badge variant="outline" className="text-xs">
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{alert.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SimplifiedWeatherAlerts;
