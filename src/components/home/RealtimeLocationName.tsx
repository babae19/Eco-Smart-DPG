/**
 * Real-Time Location Name Display
 * Shows user's exact geo location with coordinates
 */

import { MapPin, Navigation, Loader2, RefreshCw, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEnhancedGoogleGeolocation } from '@/hooks/useEnhancedGoogleGeolocation';

export const RealtimeLocationName = () => {
  const {
    latitude,
    longitude,
    accuracy,
    enhancedLocation,
    isEnhancing,
    hasLocation,
    refreshLocation,
    isLoading
  } = useEnhancedGoogleGeolocation();

  if (!hasLocation && !isLoading) {
    return (
      <Card className="p-3 bg-card border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Location unavailable</p>
            <p className="text-xs text-muted-foreground">Enable location services</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={refreshLocation}
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  if (isLoading && !hasLocation) {
    return (
      <Card className="p-3 bg-card border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Detecting location...</p>
            <p className="text-xs text-muted-foreground">Getting precise coordinates</p>
          </div>
        </div>
      </Card>
    );
  }

  const accuracyText = accuracy ? `±${Math.round(accuracy)}m` : '';

  return (
    <Card className="p-3 bg-gradient-to-r from-primary/5 via-card to-accent/5 border-primary/20">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Target className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your Location</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-medium text-success">Live</span>
            </div>
            {accuracyText && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {accuracyText}
              </span>
            )}
          </div>
          
          {isEnhancing ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-sm">Detecting address...</span>
            </div>
          ) : enhancedLocation ? (
            <div>
              <p className="text-sm font-semibold text-foreground truncate">
                {enhancedLocation.formattedAddress}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {latitude?.toFixed(6)}°, {longitude?.toFixed(6)}°
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-foreground font-mono">
                {latitude?.toFixed(6)}°, {longitude?.toFixed(6)}°
              </p>
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={refreshLocation}
          className="h-8 w-8 text-primary hover:bg-primary/10 flex-shrink-0"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default RealtimeLocationName;
