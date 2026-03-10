import React from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserLocation } from '@/contexts/LocationContext';
import { useGoogleLocation } from '@/hooks/useGoogleLocation';

const LocationDisplay: React.FC = () => {
  const { latitude, longitude, accuracy, isLoading: locationLoading } = useUserLocation();
  const { locationName, isLoading: geocodeLoading, displayName, fullAddress } = useGoogleLocation(latitude, longitude);

  if (locationLoading) {
    return (
      <Card className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center space-x-3">
          <div className="bg-primary p-2 rounded-full animate-pulse">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Getting your location...</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!latitude || !longitude) {
    return null;
  }

  const isLoading = geocodeLoading;
  const accuracyText = accuracy ? `±${Math.round(accuracy)}m` : '';

  return (
    <Card className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-center space-x-3">
        <div className="bg-primary p-2 rounded-full">
          <MapPin className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Your Location</h3>
            <Badge variant="secondary" className="text-xs bg-success/20 text-success border-success/30">
              <Navigation className="h-2 w-2 mr-1" />
              Live
            </Badge>
            {accuracyText && (
              <Badge variant="outline" className="text-xs">
                {accuracyText}
              </Badge>
            )}
          </div>
          {isLoading ? (
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              <span>Detecting precise location...</span>
            </div>
          ) : displayName ? (
            <div className="mt-1">
              <p className="text-sm text-foreground font-medium">{displayName}</p>
              {locationName?.city && locationName.city !== displayName && (
                <p className="text-xs text-muted-foreground">
                  {locationName.city}, {locationName.region || locationName.country}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default LocationDisplay;
