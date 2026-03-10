
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Settings, AlertTriangle, Smartphone } from 'lucide-react';
import { useGPSPermissions } from '@/hooks/useGPSPermissions';

const GPSEnablementCard: React.FC = () => {
  const { 
    permissionState, 
    canRequestPermission, 
    requestPermission, 
    openLocationSettings,
    isMobile
  } = useGPSPermissions();

  const handleEnableGPS = async () => {
    const granted = await requestPermission();
    if (!granted && permissionState === 'denied') {
      openLocationSettings();
    }
  };

  const getMobileSpecificInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) {
      return "iOS: Settings → Privacy & Security → Location Services → Safari → While Using App";
    } else if (isAndroid) {
      return "Android: Settings → Apps → Browser → Permissions → Location → Allow";
    } else {
      return "Mobile: Enable location access in your browser settings";
    }
  };

  return (
    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center text-amber-900">
          <MapPin className="h-4 w-4 mr-2" />
          Enable Hyper-Local GPS Positioning
          {isMobile && (
            <Smartphone className="h-4 w-4 ml-2 text-green-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <p className="font-medium mb-1">
                {isMobile ? '📱 Mobile GPS Required' : 'GPS Location Required'}
              </p>
              <p>
                {isMobile 
                  ? 'Enable precise mobile GPS to receive hyper-local disaster alerts within 10 meters of your location. Mobile GPS provides the most accurate positioning for emergency situations.'
                  : 'Enable precise GPS positioning to receive hyper-local disaster alerts within 100 meters of your location. This ensures you get the most relevant safety information for your exact position.'
                }
              </p>
            </div>
          </div>

          {/* Mobile-specific benefits */}
          {isMobile && (
            <div className="bg-green-50 p-2 rounded text-xs">
              <div className="font-medium text-green-800 mb-1">📱 Mobile GPS Benefits:</div>
              <div className="text-green-700">
                • High-accuracy positioning (3-10m) • Real-time location tracking • 
                Continuous GPS updates • Optimized for emergency alerts
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            {canRequestPermission && permissionState !== 'denied' ? (
              <Button 
                onClick={handleEnableGPS}
                size="sm" 
                className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={permissionState === 'checking'}
              >
                <MapPin className="h-3 w-3 mr-1" />
                {permissionState === 'checking' ? 'Checking GPS...' : 
                 isMobile ? 'Enable Mobile GPS' : 'Enable GPS'}
              </Button>
            ) : (
              <Button 
                onClick={openLocationSettings}
                variant="outline" 
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <Settings className="h-3 w-3 mr-1" />
                Open Settings
              </Button>
            )}
          </div>
          
          {permissionState === 'denied' && (
            <div className="text-xs text-amber-600 bg-amber-100 p-2 rounded">
              <div className="font-medium mb-1">Location access was denied</div>
              <div className="mb-2">
                {isMobile ? getMobileSpecificInstructions() : 
                'Please enable location access in your browser settings and refresh the page.'}
              </div>
              {isMobile && (
                <div className="text-amber-700">
                  💡 Tip: Look for the location icon in your address bar and select "Allow"
                </div>
              )}
            </div>
          )}

          {/* Additional mobile tips */}
          {isMobile && permissionState !== 'granted' && (
            <div className="text-xs text-amber-600 bg-amber-100 p-2 rounded">
              <div className="font-medium mb-1">📱 Mobile GPS Tips:</div>
              <div>
                • Ensure GPS is enabled in device settings • Move to an open area for better signal • 
                Allow location access when prompted • Keep the app open for continuous tracking
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GPSEnablementCard;
