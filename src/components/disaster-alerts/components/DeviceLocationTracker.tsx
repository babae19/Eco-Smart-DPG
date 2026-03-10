
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, RefreshCw, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useGPSPermissions } from '@/hooks/useGPSPermissions';
import { cn } from '@/lib/utils';

const DeviceLocationTracker: React.FC = () => {
  const {
    latitude,
    longitude,
    accuracy,
    isLoading,
    error,
    lastUpdated,
    hasPermission: locationPermission,
    geoFenceStatus,
    lastCheckTime,
    refreshLocation
  } = useLocationTracking();

  const {
    hasPermission: gpsPermission,
    permissionState,
    canRequestPermission,
    requestPermission,
    openLocationSettings,
    isMobile
  } = useGPSPermissions();

  const getAccuracyQuality = (acc: number | null) => {
    if (!acc) return { text: 'Unknown', color: 'text-gray-500' };
    if (acc <= 5) return { text: 'Excellent', color: 'text-green-600' };
    if (acc <= 10) return { text: 'Very Good', color: 'text-green-500' };
    if (acc <= 20) return { text: 'Good', color: 'text-blue-600' };
    if (acc <= 50) return { text: 'Fair', color: 'text-amber-600' };
    return { text: 'Poor', color: 'text-red-600' };
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const accuracyQuality = getAccuracyQuality(accuracy);

  // Show permission request if no GPS access
  if (!gpsPermission) {
    return (
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center text-amber-900">
            <Navigation className="h-4 w-4 mr-2" />
            Device Location Access Required
            {isMobile && (
              <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700">
                Mobile Device
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">
                  {isMobile ? '📱 Enable Mobile GPS Tracking' : 'Enable GPS Location Tracking'}
                </p>
                <p>
                  {isMobile 
                    ? 'Allow precise mobile GPS access to track your device location and receive proximity alerts for disaster-prone areas within 10 meters of your position.'
                    : 'Enable precise GPS positioning to track your device location and receive proximity alerts for disaster-prone areas near your position.'
                  }
                </p>
              </div>
            </div>

            {isMobile && (
              <div className="bg-green-50 p-2 rounded text-xs">
                <div className="font-medium text-green-800 mb-1">📱 Mobile GPS Features:</div>
                <div className="text-green-700">
                  • High-accuracy positioning (3-10m) • Real-time location tracking • 
                  Continuous GPS updates • Optimized for emergency alerts
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              {canRequestPermission && permissionState !== 'denied' ? (
                <Button 
                  onClick={requestPermission}
                  size="sm" 
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={permissionState === 'checking'}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {permissionState === 'checking' ? 'Checking...' : 
                   isMobile ? 'Enable Mobile GPS' : 'Enable GPS'}
                </Button>
              ) : (
                <Button 
                  onClick={openLocationSettings}
                  variant="outline" 
                  size="sm"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Open Settings
                </Button>
              )}
            </div>
            
            {permissionState === 'denied' && (
              <div className="text-xs text-amber-600 bg-amber-100 p-2 rounded">
                <div className="font-medium mb-1">Location access was denied</div>
                <div>
                  {isMobile 
                    ? 'Please enable location access in your device settings and refresh the page.'
                    : 'Please enable location access in your browser settings and refresh the page.'
                  }
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Location Status Card */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center text-blue-900">
            <Navigation className="h-4 w-4 mr-2" />
            Device Location Tracker
            {isMobile && (
              <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700">
                Mobile GPS
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-gray-600 mb-1">GPS Accuracy</div>
              <div className={cn("font-semibold", accuracyQuality.color)}>
                {accuracy ? `±${Math.round(accuracy)}m` : 'Getting location...'}
              </div>
              <div className="text-xs text-gray-500">
                {accuracyQuality.text}
              </div>
            </div>
            
            <div>
              <div className="text-gray-600 mb-1">Risk Level</div>
              <Badge 
                variant="outline" 
                className={getRiskLevelColor(geoFenceStatus?.currentRiskLevel || 'safe')}
              >
                {(geoFenceStatus?.currentRiskLevel || 'safe').toUpperCase()}
              </Badge>
            </div>
            
            <div>
              <div className="text-gray-600 mb-1">Last Updated</div>
              <div className="font-semibold text-gray-700">
                {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
              </div>
            </div>
            
            <div>
              <div className="text-gray-600 mb-1">Status</div>
              <div className={cn("font-semibold flex items-center", 
                isLoading ? "text-amber-600" : "text-green-600"
              )}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile GPS optimization info */}
          {isMobile && accuracy && accuracy <= 15 && (
            <div className="mt-3 p-2 bg-green-50 rounded text-xs">
              <div className="font-medium text-green-800 mb-1">📱 Mobile GPS Optimized</div>
              <div className="text-green-700">
                High-accuracy GPS active • Continuous tracking enabled • Real-time position updates
              </div>
            </div>
          )}

          {error && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500">
              {latitude && longitude ? (
                <>
                  📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  {isMobile && (
                    <span className="text-green-600 ml-1">• Mobile GPS</span>
                  )}
                </>
              ) : (
                'Getting your precise location...'
              )}
            </span>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshLocation}
              disabled={isLoading}
              className="hover:bg-blue-50"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              {isLoading ? 'Updating...' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Proximity Alerts Card - only show when we have location */}
      {latitude && longitude && geoFenceStatus && (
        <Card className={`${geoFenceStatus.insideProneArea ? 'border-red-300 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center">
                {geoFenceStatus.insideProneArea ? (
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                )}
                Proximity Alerts
              </div>
              {lastCheckTime && (
                <div className="flex items-center text-xs text-gray-500">
                  <Navigation className="h-3 w-3 mr-1" />
                  {lastCheckTime.toLocaleTimeString()}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {geoFenceStatus.insideProneArea ? (
              <div className="p-2 bg-red-100 border border-red-200 rounded">
                <div className="text-xs font-medium text-red-800 mb-1">
                  ⚠️ You are currently in a disaster-prone area
                </div>
                <div className="text-xs text-red-700">
                  Please stay alert and follow safety recommendations
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-green-700">Location Safe</div>
                <div className="text-xs text-green-600">
                  No immediate proximity alerts in your area
                </div>
              </div>
            )}

            {geoFenceStatus.proximityAlerts && geoFenceStatus.proximityAlerts.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-gray-600">Active Proximity Alerts</div>
                {geoFenceStatus.proximityAlerts.slice(0, 2).map((alert, index) => (
                  <div key={index} className="border rounded p-2 bg-white">
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-medium text-xs">{alert.areaName}</div>
                      <Badge variant="outline" className="text-[10px]">
                        {alert.urgency.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      📍 {(alert.distance * 1000).toFixed(0)}m away
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeviceLocationTracker;
