/**
 * Google Location Enhancer Component
 * Displays enhanced location information using Google Maps Geocoding API
 * Shows validation status and accuracy improvements with real-time updates
 */

import { useEnhancedGoogleGeolocation } from '@/hooks/useEnhancedGoogleGeolocation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, CheckCircle2, AlertCircle, Loader2, RefreshCw, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';

export const GoogleLocationEnhancer = () => {
  const {
    latitude,
    longitude,
    accuracy,
    enhancedLocation,
    isEnhancing,
    enhancementError,
    accuracyQuality,
    refreshLocation,
    enhanceLocation
  } = useEnhancedGoogleGeolocation();

  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update timestamp when location changes
  useEffect(() => {
    if (latitude && longitude) {
      setLastUpdateTime(new Date());
    }
  }, [latitude, longitude]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshLocation();
    await enhanceLocation();
    setIsRefreshing(false);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (isEnhancing) {
    return (
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Enhancing location accuracy with Google Maps...
          </span>
        </div>
      </Card>
    );
  }

  if (enhancementError) {
    return (
      <Card className="p-4 bg-destructive/10 border-destructive/20">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <span className="text-sm text-destructive">
            Location enhancement unavailable
          </span>
        </div>
      </Card>
    );
  }

  if (!enhancedLocation) {
    return null;
  }

  const getAccuracyColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="p-4 bg-card border-border shadow-lg">
      <div className="space-y-4">
        {/* Header with title and refresh button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Real-Time Location
            </h3>
            {enhancedLocation?.isValidated && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isEnhancing}
            className="h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Live Coordinates Display */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">LIVE COORDINATES</span>
            <span className="text-xs text-muted-foreground">
              Updated: {formatTimestamp(lastUpdateTime)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Latitude</p>
              <p className="text-sm font-mono font-semibold text-foreground">
                {latitude?.toFixed(6) || 'N/A'}°
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Longitude</p>
              <p className="text-sm font-mono font-semibold text-foreground">
                {longitude?.toFixed(6) || 'N/A'}°
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Accuracy Radius</span>
              <span className="text-xs font-semibold text-foreground">
                ±{accuracy?.toFixed(1) || 'N/A'} meters
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Address Information */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Enhanced Address
              </p>
              <p className="text-sm text-foreground break-words">
                {enhancedLocation?.formattedAddress || 'Waiting for location enhancement...'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {enhancedLocation && (
            <>
              <Badge 
                variant="outline" 
                className={getAccuracyColor(enhancedLocation.accuracyLevel)}
              >
                {enhancedLocation.accuracyLevel.toUpperCase()} Precision
              </Badge>
              
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {(enhancedLocation.confidenceScore * 100).toFixed(0)}% Confidence
              </Badge>

              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Google Verified
              </Badge>
            </>
          )}

          {accuracyQuality && (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
              {accuracyQuality}
            </Badge>
          )}
        </div>

        {/* Location Details */}
        {enhancedLocation?.geocodingResult && (
          <div className="pt-3 border-t border-border space-y-2">
            <p className="text-xs font-medium text-muted-foreground">LOCATION DETAILS</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {enhancedLocation.geocodingResult.city && (
                <div>
                  <span className="text-muted-foreground">City:</span>{' '}
                  <span className="text-foreground font-medium">
                    {enhancedLocation.geocodingResult.city}
                  </span>
                </div>
              )}
              {enhancedLocation.geocodingResult.region && (
                <div>
                  <span className="text-muted-foreground">Region:</span>{' '}
                  <span className="text-foreground font-medium">
                    {enhancedLocation.geocodingResult.region}
                  </span>
                </div>
              )}
              {enhancedLocation.geocodingResult.country && (
                <div>
                  <span className="text-muted-foreground">Country:</span>{' '}
                  <span className="text-foreground font-medium">
                    {enhancedLocation.geocodingResult.country}
                  </span>
                </div>
              )}
              {enhancedLocation.geocodingResult.postalCode && (
                <div>
                  <span className="text-muted-foreground">Postal:</span>{' '}
                  <span className="text-foreground font-medium">
                    {enhancedLocation.geocodingResult.postalCode}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Real-time indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">
            Location tracking active
          </span>
        </div>
      </div>
    </Card>
  );
};