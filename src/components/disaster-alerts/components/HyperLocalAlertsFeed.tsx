
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, MapPin, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SimplifiedMobileLocationTracker from './SimplifiedMobileLocationTracker';
import { useSimplifiedHyperLocalAlerts } from '@/hooks/useSimplifiedHyperLocalAlerts';
import { useMemo } from 'react';
import LocationPermissionCard from './LocationPermissionCard';

const HyperLocalAlertsFeed: React.FC = () => {
  const {
    hasLocation,
    locationLoading,
    locationError,
    refreshLocation,
    isMobile,
    hyperLocalAlerts,
    isAnalyzing,
    refreshAlerts,
    isLoading
  } = useSimplifiedHyperLocalAlerts();

  // Memoize expensive computations
  const statusInfo = useMemo(() => ({
    color: locationError ? 'border-red-200 bg-red-50' :
           !hasLocation ? 'border-amber-200 bg-amber-50' :
           'border-green-200 bg-green-50',
    icon: locationError ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
          !hasLocation ? <MapPin className="h-4 w-4 text-amber-600" /> :
          <CheckCircle className="h-4 w-4 text-green-600" />,
    text: locationError ? 'Location Error' :
          !hasLocation ? 'Getting Location...' :
          isMobile ? 'Mobile Location Active' : 'Location Ready'
  }), [locationError, hasLocation, isMobile]);


  return (
    <div className="space-y-4">
      {/* Simplified Status Header */}
      <Card className={`${statusInfo.color} transition-colors duration-300`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center">
              {statusInfo.icon}
              <span className="ml-2">Hyper-Local Alert System</span>
            </div>
            <div className="flex items-center gap-2">
              {isMobile && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  📱 Mobile Device
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {statusInfo.text}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Mobile Device Info */}
          {isMobile && (
            <div className="mb-3 p-3 bg-blue-100 border border-blue-200 rounded-lg text-sm">
              <div className="flex items-center text-blue-800 mb-2">
                <Smartphone className="h-4 w-4 mr-2" />
                <span className="font-medium">Mobile Device Detected</span>
              </div>
              <div className="text-blue-700 text-xs leading-relaxed">
                ✓ Optimized for mobile location tracking<br />
                ✓ Real-time proximity alerts<br />
                ✓ Battery efficient monitoring<br />
                ✓ Touch-friendly interface
              </div>
            </div>
          )}

          {/* Error State */}
          {locationError && (
            <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-3 text-sm">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-red-700">
                  <div className="font-medium mb-1">Location Error</div>
                  <div className="text-xs">{locationError}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshLocation}
              disabled={isLoading}
              className="hover:bg-blue-50 touch-manipulation min-h-[44px] flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Location
            </Button>
            
            {hasLocation && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshAlerts}
                disabled={isAnalyzing}
                className="hover:bg-green-50 touch-manipulation min-h-[44px] flex-1"
              >
                <MapPin className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                Check Alerts
              </Button>
            )}
          </div>

          {/* Alert Summary */}
          {hasLocation && (
            <div className="p-3 bg-white rounded-lg border text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Hyper-Local Alerts:</span>
                <span className="font-medium text-lg">{hyperLocalAlerts.length}</span>
              </div>
              {hyperLocalAlerts.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Tap "Check Alerts" to refresh proximity data
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Permission Check */}
      {!hasLocation && !locationLoading && (
        <LocationPermissionCard error={locationError} />
      )}

      {/* Main Location Tracker */}
      {hasLocation && <SimplifiedMobileLocationTracker />}

      {/* Mobile-specific tips */}
      {isMobile && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="text-sm text-blue-800">
              <div className="font-medium flex items-center mb-2">
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile Location Tips
              </div>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li>• Allow location access when prompted</li>
                <li>• Keep the app open for best accuracy</li>
                <li>• Ensure GPS/location services are enabled</li>
                <li>• Works best with mobile data or WiFi connection</li>
                <li>• All buttons are optimized for touch interaction</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HyperLocalAlertsFeed;
