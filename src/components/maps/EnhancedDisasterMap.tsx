/**
 * Enhanced Disaster Map Component
 * Shows evacuation routes, safe zones, disaster-prone areas, and historical events
 * Using Google Maps API for reliable map rendering
 */

import { useEffect, useRef, useState, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, Navigation, RefreshCw, AlertTriangle, Loader2, Route,
  Shield, Clock, History, Layers
} from 'lucide-react';
import { useEnhancedGoogleGeolocation } from '@/hooks/useEnhancedGoogleGeolocation';
import { allDisasterProneAreas } from '@/components/home/disaster-prone-areas/data/index';
import { 
  safeZones, 
  evacuationRoutes, 
  historicalDisasters,
  SafeZone,
  EvacuationRoute,
  HistoricalDisaster 
} from './data/evacuationRoutes';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google: any;
    initEnhancedMap: () => void;
  }
}

// Map layer toggle state
interface MapLayers {
  safeZones: boolean;
  evacuationRoutes: boolean;
  disasterProne: boolean;
  historicalEvents: boolean;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const EnhancedDisasterMap = memo(() => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'layers' | 'history'>('layers');
  const [selectedHistoricalType, setSelectedHistoricalType] = useState<'all' | 'flood' | 'landslide' | 'fire' | 'storm'>('all');
  const [layers, setLayers] = useState<MapLayers>({
    safeZones: true,
    evacuationRoutes: true,
    disasterProne: true,
    historicalEvents: false
  });

  const {
    latitude,
    longitude,
    accuracy,
    enhancedLocation,
    hasLocation,
    refreshLocation,
    isLoading: locationLoading
  } = useEnhancedGoogleGeolocation();

  // Clear all markers and polylines
  const clearMapOverlays = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach(polyline => polyline.setMap(null));
    polylinesRef.current = [];
  }, []);

  // Create info window
  const getInfoWindow = useCallback(() => {
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }
    return infoWindowRef.current;
  }, []);

  // Add safe zone markers
  const addSafeZoneMarkers = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    const iconColors: Record<string, string> = {
      hospital: '#EF4444',
      school: '#3B82F6',
      government: '#8B5CF6',
      community: '#22C55E',
      shelter: '#F59E0B',
      religious: '#EC4899'
    };

    safeZones.forEach(zone => {
      const color = iconColors[zone.type] || iconColors.community;
      
      const marker = new window.google.maps.Marker({
        position: { lat: zone.coordinates.lat, lng: zone.coordinates.lng },
        map: mapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 3
        },
        title: zone.name
      });

      marker.addListener('click', () => {
        const infoWindow = getInfoWindow();
        infoWindow.setContent(`
          <div style="padding: 8px; max-width: 220px;">
            <h3 style="font-weight: 700; margin-bottom: 6px; color: ${color};">${zone.name}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 6px;">${zone.description}</p>
            <div style="font-size: 11px; margin-bottom: 4px;">
              <strong>Capacity:</strong> ${zone.capacity.toLocaleString()} people
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
              ${zone.facilities.slice(0, 3).map(f => `<span style="background: ${color}20; color: ${color}; padding: 2px 6px; border-radius: 10px; font-size: 10px;">${f}</span>`).join('')}
            </div>
          </div>
        `);
        infoWindow.open(mapRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [getInfoWindow]);

  // Add evacuation routes
  const addEvacuationRoutes = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    const routeColors: Record<string, string> = {
      high: '#22C55E',
      medium: '#F59E0B',
      low: '#EF4444'
    };

    evacuationRoutes.forEach(route => {
      const color = routeColors[route.safetyLevel];
      const path = route.path.map(p => ({ lat: p.lat, lng: p.lng }));

      const polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: mapRef.current
      });

      polylinesRef.current.push(polyline);

      // Add start marker (red)
      const startMarker = new window.google.maps.Marker({
        position: path[0],
        map: mapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2
        }
      });
      markersRef.current.push(startMarker);

      // Add end marker (green) with popup
      const endMarker = new window.google.maps.Marker({
        position: path[path.length - 1],
        map: mapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#22C55E',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2
        },
        title: route.name
      });

      endMarker.addListener('click', () => {
        const infoWindow = getInfoWindow();
        infoWindow.setContent(`
          <div style="padding: 6px;">
            <strong style="color: ${color};">🚶 ${route.name}</strong>
            <p style="font-size: 11px; color: #666; margin: 4px 0;">${route.distance} • ${route.estimatedTime}</p>
            <span style="background: ${color}20; color: ${color}; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600;">
              ${route.safetyLevel.toUpperCase()} SAFETY
            </span>
          </div>
        `);
        infoWindow.open(mapRef.current, endMarker);
      });

      markersRef.current.push(endMarker);
    });
  }, [getInfoWindow]);

  // Add disaster-prone area markers
  const addDisasterProneAreas = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    const severityColors: Record<string, string> = {
      critical: '#DC2626',
      high: '#F59E0B',
      medium: '#3B82F6',
      low: '#22C55E'
    };

    allDisasterProneAreas.slice(0, 12).forEach(area => {
      const color = severityColors[area.vulnerabilityLevel] || severityColors.medium;
      
      const marker = new window.google.maps.Marker({
        position: { lat: area.coordinates.latitude, lng: area.coordinates.longitude },
        map: mapRef.current,
        icon: {
          path: 'M 0,-8 8,8 -8,8 Z',
          scale: 1.2,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
          rotation: 180
        },
        title: area.name
      });

      marker.addListener('click', () => {
        const infoWindow = getInfoWindow();
        infoWindow.setContent(`
          <div style="padding: 8px; max-width: 220px;">
            <h3 style="font-weight: 700; margin-bottom: 4px; color: ${color};">⚠️ ${area.name}</h3>
            <span style="display: inline-block; padding: 2px 8px; background: ${color}20; color: ${color}; border-radius: 10px; font-size: 10px; font-weight: 600; margin-bottom: 6px;">
              ${area.vulnerabilityLevel.toUpperCase()} RISK
            </span>
            <p style="font-size: 11px; color: #666; margin-bottom: 6px;">${area.description.slice(0, 100)}...</p>
            <div style="display: flex; flex-wrap: wrap; gap: 3px;">
              ${area.risks.slice(0, 3).map(r => `<span style="background: #f5f5f5; padding: 2px 5px; border-radius: 4px; font-size: 9px;">${r}</span>`).join('')}
            </div>
          </div>
        `);
        infoWindow.open(mapRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [getInfoWindow]);

  // Add historical disaster markers
  const addHistoricalDisasters = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    const typeConfig: Record<string, { color: string; emoji: string }> = {
      flood: { color: '#3B82F6', emoji: '🌊' },
      landslide: { color: '#A855F7', emoji: '⛰️' },
      fire: { color: '#EF4444', emoji: '🔥' },
      storm: { color: '#0EA5E9', emoji: '🌀' }
    };

    const filteredDisasters = selectedHistoricalType === 'all' 
      ? historicalDisasters 
      : historicalDisasters.filter(d => d.type === selectedHistoricalType);

    filteredDisasters.forEach(disaster => {
      const config = typeConfig[disaster.type];
      const severityScale: Record<string, number> = {
        low: 10,
        medium: 14,
        high: 18,
        catastrophic: 22
      };
      const scale = severityScale[disaster.severity];

      const marker = new window.google.maps.Marker({
        position: { lat: disaster.coordinates.lat, lng: disaster.coordinates.lng },
        map: mapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: scale,
          fillColor: config.color,
          fillOpacity: 0.8,
          strokeColor: 'white',
          strokeWeight: 3
        },
        title: `${disaster.type} - ${disaster.year}`
      });

      marker.addListener('click', () => {
        const infoWindow = getInfoWindow();
        infoWindow.setContent(`
          <div style="padding: 8px; max-width: 250px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="font-size: 20px;">${config.emoji}</span>
              <div>
                <h3 style="font-weight: 700; color: ${config.color}; margin: 0;">${disaster.location}</h3>
                <span style="font-size: 11px; color: #888;">${disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)} • ${disaster.year}</span>
              </div>
            </div>
            <p style="font-size: 11px; color: #666; margin-bottom: 8px;">${disaster.description}</p>
            <div style="display: flex; gap: 8px;">
              ${disaster.casualties !== undefined ? `
                <div style="background: #FEE2E2; padding: 4px 8px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 9px; color: #991B1B;">Casualties</div>
                  <div style="font-weight: 700; font-size: 14px; color: #DC2626;">${disaster.casualties.toLocaleString()}</div>
                </div>
              ` : ''}
              ${disaster.displaced !== undefined ? `
                <div style="background: #FEF3C7; padding: 4px 8px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 9px; color: #92400E;">Displaced</div>
                  <div style="font-weight: 700; font-size: 14px; color: #D97706;">${disaster.displaced.toLocaleString()}</div>
                </div>
              ` : ''}
            </div>
          </div>
        `);
        infoWindow.open(mapRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [selectedHistoricalType, getInfoWindow]);

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setIsLoading(false);
      return;
    }

    if (window.google?.maps) {
      setIsMapLoaded(true);
      setIsLoading(false);
      return;
    }

    window.initEnhancedMap = () => {
      setIsMapLoaded(true);
      setIsLoading(false);
    };

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initEnhancedMap`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error('[EnhancedDisasterMap] Failed to load Google Maps');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    } else {
      // Script exists, check if API is ready
      const checkReady = setInterval(() => {
        if (window.google?.maps) {
          setIsMapLoaded(true);
          setIsLoading(false);
          clearInterval(checkReady);
        }
      }, 100);
      setTimeout(() => clearInterval(checkReady), 5000);
    }
  }, []);

  // Initialize map when script loaded
  useEffect(() => {
    if (!isMapLoaded || !mapContainerRef.current || !window.google) return;

    const centerLat = latitude || 8.4657;
    const centerLng = longitude || -13.2317;

    mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true
    });

    // Add user location marker if available
    if (hasLocation && latitude && longitude) {
      new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 3
        },
        title: 'Your Location'
      });

      // Add accuracy circle
      new window.google.maps.Circle({
        strokeColor: '#3B82F6',
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        map: mapRef.current,
        center: { lat: latitude, lng: longitude },
        radius: accuracy || 100
      });
    }
  }, [isMapLoaded, latitude, longitude, hasLocation, accuracy]);

  // Update map layers when toggles change
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.google) return;

    clearMapOverlays();

    if (layers.safeZones) addSafeZoneMarkers();
    if (layers.evacuationRoutes) addEvacuationRoutes();
    if (layers.disasterProne) addDisasterProneAreas();
    if (layers.historicalEvents) addHistoricalDisasters();
  }, [isMapLoaded, layers, selectedHistoricalType, addSafeZoneMarkers, addEvacuationRoutes, addDisasterProneAreas, addHistoricalDisasters, clearMapOverlays]);

  const toggleLayer = (layer: keyof MapLayers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleCenterOnUser = () => {
    if (mapRef.current && hasLocation && latitude && longitude) {
      mapRef.current.panTo({ lat: latitude, lng: longitude });
      mapRef.current.setZoom(14);
    }
  };

  // Fallback when no API key
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-primary" />
            Disaster Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <MapPin className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">Map requires configuration</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-background rounded-lg p-3">
                <Shield className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <p className="text-lg font-bold">{safeZones.length}</p>
                <p className="text-xs text-muted-foreground">Safe Zones</p>
              </div>
              <div className="bg-background rounded-lg p-3">
                <Route className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-bold">{evacuationRoutes.length}</p>
                <p className="text-xs text-muted-foreground">Routes</p>
              </div>
              <div className="bg-background rounded-lg p-3">
                <History className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                <p className="text-lg font-bold">{historicalDisasters.length}</p>
                <p className="text-xs text-muted-foreground">Events</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-primary" />
            Disaster Preparedness Map
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCenterOnUser}
              disabled={!hasLocation}
            >
              <Navigation className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={refreshLocation}
              disabled={locationLoading}
            >
              <RefreshCw className={cn("h-4 w-4", locationLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Map Container */}
        <div className="relative">
          <div 
            ref={mapContainerRef} 
            className="w-full h-[300px]"
          />
          
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Legend overlay */}
          <div className="absolute bottom-2 left-2 bg-background/95 backdrop-blur-sm rounded-lg p-2 text-xs shadow-lg">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Safe</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Caution</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Danger</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layer Controls */}
        <div className="p-3 border-t border-border/50">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'layers' | 'history')}>
            <TabsList className="w-full h-8">
              <TabsTrigger value="layers" className="flex-1 text-xs gap-1">
                <Layers className="h-3 w-3" />
                Layers
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 text-xs gap-1">
                <History className="h-3 w-3" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="layers" className="mt-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={layers.safeZones ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs justify-start"
                  onClick={() => toggleLayer('safeZones')}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Safe Zones ({safeZones.length})
                </Button>
                <Button
                  variant={layers.evacuationRoutes ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs justify-start"
                  onClick={() => toggleLayer('evacuationRoutes')}
                >
                  <Route className="h-3 w-3 mr-1" />
                  Routes ({evacuationRoutes.length})
                </Button>
                <Button
                  variant={layers.disasterProne ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs justify-start"
                  onClick={() => toggleLayer('disasterProne')}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Risk Areas
                </Button>
                <Button
                  variant={layers.historicalEvents ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs justify-start"
                  onClick={() => toggleLayer('historicalEvents')}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Past Events
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-2">
              <div className="flex flex-wrap gap-1">
                {(['all', 'flood', 'landslide', 'fire', 'storm'] as const).map(type => (
                  <Badge
                    key={type}
                    variant={selectedHistoricalType === type ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => {
                      setSelectedHistoricalType(type);
                      setLayers(prev => ({ ...prev, historicalEvents: true }));
                    }}
                  >
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Showing {selectedHistoricalType === 'all' ? historicalDisasters.length : historicalDisasters.filter(d => d.type === selectedHistoricalType).length} historical events
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
});

EnhancedDisasterMap.displayName = 'EnhancedDisasterMap';

export default EnhancedDisasterMap;
