/**
 * Location Alerts Map Component
 * Interactive Google Maps showing user location and nearby alerts
 */

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { useEnhancedGoogleGeolocation } from '@/hooks/useEnhancedGoogleGeolocation';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface AlertMarker {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export const LocationAlertsMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    latitude,
    longitude,
    accuracy,
    enhancedLocation,
    hasLocation,
    refreshLocation,
    isLoading: locationLoading
  } = useEnhancedGoogleGeolocation();

  // Sample alert markers (in production, fetch from API)
  const alertMarkers: AlertMarker[] = [
    {
      id: '1',
      position: { lat: (latitude || 8.484) + 0.01, lng: (longitude || -13.234) + 0.015 },
      title: 'Flood Warning',
      severity: 'high',
      description: 'Potential flooding in low-lying areas'
    },
    {
      id: '2',
      position: { lat: (latitude || 8.484) - 0.008, lng: (longitude || -13.234) - 0.01 },
      title: 'Heavy Rain Alert',
      severity: 'medium',
      description: 'Expected rainfall > 50mm in next 6 hours'
    }
  ];

  // Load Google Maps script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('[LocationAlertsMap] Google Maps API key not configured');
      setIsLoading(false);
      return;
    }

    // Check if script already loaded
    if (window.google?.maps) {
      setIsMapLoaded(true);
      setIsLoading(false);
      return;
    }

    // Create callback
    window.initMap = () => {
      setIsMapLoaded(true);
      setIsLoading(false);
    };

    // Load script
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error('[LocationAlertsMap] Failed to load Google Maps');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize map when script loaded and location available
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !hasLocation || !latitude || !longitude) {
      return;
    }

    const userPosition = { lat: latitude, lng: longitude };

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: userPosition,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add user marker
      userMarkerRef.current = new window.google.maps.Marker({
        position: userPosition,
        map: mapInstanceRef.current,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3
        }
      });

      // Add accuracy circle
      new window.google.maps.Circle({
        map: mapInstanceRef.current,
        center: userPosition,
        radius: accuracy || 100,
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        strokeColor: '#3B82F6',
        strokeOpacity: 0.3,
        strokeWeight: 1
      });

      // Add alert markers
      alertMarkers.forEach(alert => {
        const markerColor = {
          low: '#22C55E',
          medium: '#F59E0B',
          high: '#EF4444',
          critical: '#DC2626'
        }[alert.severity];

        const marker = new window.google.maps.Marker({
          position: alert.position,
          map: mapInstanceRef.current,
          title: alert.title,
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 8,
            fillColor: markerColor,
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="font-weight: 600; margin-bottom: 4px;">${alert.title}</h3>
              <p style="font-size: 12px; color: #666;">${alert.description}</p>
              <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: ${markerColor}20; color: ${markerColor}; margin-top: 4px;">
                ${alert.severity.toUpperCase()}
              </span>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });
      });
    } else {
      // Update user marker position
      userMarkerRef.current?.setPosition(userPosition);
      mapInstanceRef.current.panTo(userPosition);
    }
  }, [isMapLoaded, hasLocation, latitude, longitude, accuracy]);

  const handleCenterOnUser = () => {
    if (mapInstanceRef.current && latitude && longitude) {
      mapInstanceRef.current.panTo({ lat: latitude, lng: longitude });
      mapInstanceRef.current.setZoom(15);
    }
  };

  const handleRefresh = async () => {
    await refreshLocation();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  if (isLoading || locationLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground text-sm">Loading map...</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasLocation) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          <MapPin className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">Enable location to view map</p>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-3">
            <RefreshCw className="h-4 w-4 mr-2" />
            Enable Location
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Location & Alerts Map
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={handleCenterOnUser} 
              variant="outline" 
              size="sm"
              className="h-8"
            >
              <Navigation className="h-3 w-3 mr-1" />
              Center
            </Button>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              className="h-8"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Map Container */}
        <div 
          ref={mapRef} 
          className="w-full h-[280px] bg-muted"
          style={{ minHeight: '280px' }}
        />
        
        {/* Location Info Bar */}
        <div className="p-3 bg-muted/30 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-muted-foreground">
                {enhancedLocation?.formattedAddress || `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}`}
              </span>
            </div>
            <Badge variant="outline" className="text-[10px]">
              ±{Math.round(accuracy || 100)}m
            </Badge>
          </div>
        </div>

        {/* Nearby Alerts Summary */}
        {alertMarkers.length > 0 && (
          <div className="p-3 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium">Nearby Alerts ({alertMarkers.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {alertMarkers.map(alert => (
                <Badge 
                  key={alert.id} 
                  variant="outline" 
                  className={`text-[10px] ${getSeverityColor(alert.severity)}`}
                >
                  {alert.title}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
