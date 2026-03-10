/**
 * Real-Time Location Display Component
 * Compact location tracker for Home page
 * Shows live coordinates with Google-enhanced accuracy
 */

import { useEnhancedGoogleGeolocation } from '@/hooks/useEnhancedGoogleGeolocation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

export const RealTimeLocationDisplay = () => {
  const {
    latitude,
    longitude,
    accuracy,
    enhancedLocation,
    isEnhancing
  } = useEnhancedGoogleGeolocation();

  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  useEffect(() => {
    if (latitude && longitude) {
      setLastUpdateTime(new Date());
    }
  }, [latitude, longitude]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (!latitude || !longitude) {
    return null;
  }

  return (
    <Card className="p-3 bg-card border-border">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Your Location</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(lastUpdateTime)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-muted/30 rounded p-2">
          <div>
            <p className="text-xs text-muted-foreground">Lat</p>
            <p className="text-xs font-mono font-semibold text-foreground">
              {latitude.toFixed(6)}°
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lng</p>
            <p className="text-xs font-mono font-semibold text-foreground">
              {longitude.toFixed(6)}°
            </p>
          </div>
        </div>

        {enhancedLocation && (
          <div className="flex items-start gap-2 pt-1">
            <MapPin className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground line-clamp-2">
              {enhancedLocation.formattedAddress}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {enhancedLocation && (
            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
              {(enhancedLocation.confidenceScore * 100).toFixed(0)}% Accurate
            </Badge>
          )}
          <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border">
            ±{accuracy?.toFixed(0)}m
          </Badge>
          {isEnhancing && (
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              Enhancing...
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};