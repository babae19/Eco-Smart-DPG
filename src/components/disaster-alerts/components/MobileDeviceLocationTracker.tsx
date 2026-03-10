import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, RefreshCw, Loader2, AlertTriangle, CheckCircle, Smartphone, Battery } from 'lucide-react';
import { useMobileEnhancedGeolocation } from '@/hooks/useMobileEnhancedGeolocation';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import MobileGPSPermissions from '@/components/mobile/MobileGPSPermissions';
import { detectMobileCapabilities } from '@/services/mobile/mobileCapabilities';
import { cn } from '@/lib/utils';

const MobileDeviceLocationTracker: React.FC = () => {
  // Move mobileCapabilities detection before it's used
  const mobileCapabilities = detectMobileCapabilities();

  const {
    latitude,
    longitude,
    accuracy,
    isLoading,
    error,
    hasLocation,
    refreshLocation,
    accuracyQuality,
    retryCount,
    wakeLockStatus
  } = useMobileEnhancedGeolocation({
    enableHighAccuracy: true,
    watchPosition: true,
    enableBackgroundTracking: mobileCapabilities.isMobile,
    timeout: mobileCapabilities.isMobile ? 30000 : 15000,
    maximumAge: mobileCapabilities.isMobile ? 5000 : 30000
  });

  const {
    geoFenceStatus,
    lastCheckTime
  } = useLocationTracking();

  // If no GPS permission, show the permission component
  if (!hasLocation && !isLoading) {
    return <MobileGPSPermissions onPermissionGranted={refreshLocation} />;
  }

  const getAccuracyColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'very-good': return 'text-green-500';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-amber-600';
      default: return 'text-red-600';
    }
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

  const getWakeLockStatus = () => {
    if (!mobileCapabilities.isMobile) return null;
    
    switch (wakeLockStatus) {
      case 'active':
        return <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Background Active</Badge>;
      case 'released':
        return <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">Background Paused</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Mobile Location Status Card */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between text-blue-900">
            <div className="flex items-center">
              {mobileCapabilities.isMobile ? (
                <Smartphone className="h-4 w-4 mr-2" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              {mobileCapabilities.isMobile ? 'Mobile GPS Tracker' : 'Device Location Tracker'}
            </div>
            <div className="flex items-center gap-1">
              {mobileCapabilities.isMobile && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  {mobileCapabilities.isIOS ? '📱 iOS' : mobileCapabilities.isAndroid ? '🤖 Android' : '📱 Mobile'}
                </Badge>
              )}
              {getWakeLockStatus()}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Device Information */}
          {mobileCapabilities.isMobile && (
            <div className="mb-3 p-2 bg-white rounded border">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-600">Device:</span>
                  <div className="font-medium">
                    {mobileCapabilities.isIOS ? 'iOS Device' : mobileCapabilities.isAndroid ? 'Android Device' : 'Mobile Device'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Browser:</span>
                  <div className="font-medium">{mobileCapabilities.browserName}</div>
                </div>
                <div>
                  <span className="text-gray-600">GPS Mode:</span>
                  <div className="font-medium text-green-600">High Accuracy</div>
                </div>
                <div>
                  <span className="text-gray-600">Tracking:</span>
                  <div className="font-medium text-blue-600">
                    {wakeLockStatus === 'active' ? 'Background' : 'Foreground'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location Data Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div>
              <div className="text-gray-600 mb-1">GPS Accuracy</div>
              <div className={cn("font-semibold", getAccuracyColor(accuracyQuality))}>
                {accuracy ? `±${Math.round(accuracy)}m` : 'Getting location...'}
              </div>
              <div className="text-xs text-gray-500">
                {accuracyQuality.charAt(0).toUpperCase() + accuracyQuality.slice(1)}
                {retryCount > 0 && ` (Retry ${retryCount})`}
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
                {lastCheckTime ? lastCheckTime.toLocaleTimeString() : 'Never'}
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

          {/* Mobile GPS Optimization Status */}
          {mobileCapabilities.isMobile && accuracy && accuracy <= 15 && (
            <div className="mb-3 p-2 bg-green-50 rounded text-xs">
              <div className="font-medium text-green-800 mb-1 flex items-center">
                <Smartphone className="h-3 w-3 mr-1" />
                Mobile GPS Optimized
              </div>
              <div className="text-green-700">
                High-accuracy GPS active • Continuous tracking enabled • 
                Battery optimization active • Real-time position updates
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              <div className="flex items-start">
                <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>GPS Error:</strong> {error}
                  {mobileCapabilities.isMobile && (
                    <div className="mt-1 text-red-600">
                      Ensure location services are enabled in your device settings.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Location Coordinates and Actions */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {latitude && longitude ? (
                <>
                  📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  {mobileCapabilities.isMobile && (
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

          {/* Battery and Performance Tips for Mobile */}
          {mobileCapabilities.isMobile && (
            <div className="mt-3 p-2 bg-amber-50 rounded text-xs">
              <div className="flex items-start">
                <Battery className="h-3 w-3 text-amber-600 mr-1 mt-0.5 flex-shrink-0" />
                <div className="text-amber-700">
                  <strong>Battery Optimization:</strong> GPS updates are optimized for mobile battery life. 
                  The app will reduce GPS frequency when in background and increase accuracy when active.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proximity Alerts Card - Enhanced for Mobile */}
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
                {mobileCapabilities.isMobile && (
                  <Badge variant="outline" className="ml-2 text-xs">Real-time</Badge>
                )}
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
                {mobileCapabilities.isMobile && (
                  <div className="text-xs text-red-600 mt-1">
                    Your mobile device will continue monitoring for safety updates.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-3">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-green-700">Location Safe</div>
                <div className="text-xs text-green-600">
                  No immediate proximity alerts in your area
                </div>
                {mobileCapabilities.isMobile && (
                  <div className="text-xs text-green-600 mt-1">
                    Mobile GPS monitoring active for your safety
                  </div>
                )}
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
                      {mobileCapabilities.isMobile && (
                        <span className="text-blue-600 ml-1">• GPS Tracked</span>
                      )}
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

export default MobileDeviceLocationTracker;
