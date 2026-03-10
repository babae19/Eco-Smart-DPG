import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Settings, Smartphone, Wifi, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { detectMobileCapabilities, getMobileLocationSettings } from '@/services/mobile/mobileCapabilities';
import { useGPSPermissions } from '@/hooks/useGPSPermissions';

interface MobileGPSPermissionsProps {
  onPermissionGranted?: () => void;
}

const MobileGPSPermissions: React.FC<MobileGPSPermissionsProps> = ({ onPermissionGranted }) => {
  const {
    hasPermission,
    permissionState,
    canRequestPermission,
    requestPermission,
    openLocationSettings
  } = useGPSPermissions();

  const [showDetailedHelp, setShowDetailedHelp] = useState(false);
  const mobileCapabilities = detectMobileCapabilities();
  const locationSettings = getMobileLocationSettings();

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted && onPermissionGranted) {
      onPermissionGranted();
    }
  };

  const openNativeSettings = () => {
    if (mobileCapabilities.isIOS && locationSettings.settingsUrl) {
      // Try to open iOS settings directly
      window.location.href = locationSettings.settingsUrl;
    } else {
      // Fallback to showing instructions
      setShowDetailedHelp(true);
    }
  };

  const getPermissionStatusBadge = () => {
    switch (permissionState) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800 border-green-200">GPS Active</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Access Denied</Badge>;
      case 'prompt':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Permission Needed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Checking...</Badge>;
    }
  };

  if (hasPermission) {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between text-green-900">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mobile GPS Enabled
            </div>
            {getPermissionStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-green-700">
            <Smartphone className="h-4 w-4 mr-2" />
            <span>
              {mobileCapabilities.isMobile ? 'Mobile' : 'Desktop'} GPS tracking is active and ready for hyper-local alerts.
            </span>
          </div>
          {mobileCapabilities.isMobile && (
            <div className="mt-2 text-xs text-green-600 bg-green-100 p-2 rounded">
              <strong>Mobile Features Active:</strong> High-accuracy GPS • Background tracking • 
              Proximity alerts • Battery optimization
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between text-amber-900">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Enable Mobile GPS Access
          </div>
          <div className="flex items-center gap-2">
            {getPermissionStatusBadge()}
            {mobileCapabilities.isMobile && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                {mobileCapabilities.isIOS ? '📱 iOS' : mobileCapabilities.isAndroid ? '🤖 Android' : '📱 Mobile'}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mobile-specific information */}
          {mobileCapabilities.isMobile && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <Smartphone className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Mobile GPS Setup Required</p>
                  <p>
                    This app needs access to your device's GPS to provide hyper-local disaster alerts. 
                    The app will appear in your device's location settings once you grant permission.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Permission request section */}
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800 flex-1">
              <p className="font-medium mb-1">Location Permission Required</p>
              <p>
                {mobileCapabilities.isMobile 
                  ? `Grant location access to enable GPS tracking on your ${mobileCapabilities.isIOS ? 'iOS' : 'Android'} device. This will add the app to your device's location settings.`
                  : 'Allow location access to receive proximity alerts for disaster-prone areas.'
                }
              </p>
            </div>
          </div>

          {/* Device-specific capabilities */}
          {mobileCapabilities.isMobile && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                <span>GPS Hardware</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                <span>High Accuracy</span>
              </div>
              <div className="flex items-center">
                {mobileCapabilities.supportsWakeLock ? (
                  <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <Wifi className="h-3 w-3 text-gray-500 mr-1" />
                )}
                <span>Background Tracking</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                <span>Real-time Updates</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {canRequestPermission && permissionState !== 'denied' ? (
              <Button 
                onClick={handleRequestPermission}
                size="sm" 
                className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={permissionState === 'checking'}
              >
                <MapPin className="h-3 w-3 mr-1" />
                {permissionState === 'checking' ? 'Checking...' : 
                 mobileCapabilities.isMobile ? 'Enable Mobile GPS' : 'Enable GPS'}
              </Button>
            ) : (
              <Button 
                onClick={openNativeSettings}
                variant="outline" 
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <Settings className="h-3 w-3 mr-1" />
                Open Settings
              </Button>
            )}
            
            <Button 
              onClick={() => setShowDetailedHelp(!showDetailedHelp)}
              variant="ghost" 
              size="sm"
              className="text-amber-700 hover:bg-amber-100"
            >
              <Info className="h-3 w-3 mr-1" />
              Help
            </Button>
          </div>

          {/* Detailed help section */}
          {showDetailedHelp && (
            <div className="mt-3 p-3 bg-white border border-amber-200 rounded-lg">
              <div className="text-xs">
                <div className="font-medium text-amber-800 mb-2">
                  {mobileCapabilities.isMobile ? 'Mobile Device Instructions:' : 'Browser Instructions:'}
                </div>
                <ol className="text-amber-700 space-y-1">
                  {locationSettings.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start">
                      <span className="font-medium mr-2">{index + 1}.</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
                {mobileCapabilities.isMobile && (
                  <div className="mt-2 p-2 bg-amber-50 rounded text-xs">
                    <strong>Note:</strong> Once enabled, this app will appear in your device's 
                    location settings and can be managed from there.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error state */}
          {permissionState === 'denied' && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
              <div className="font-medium mb-1">Location Access Denied</div>
              <div>
                {mobileCapabilities.isMobile 
                  ? `Please enable location access for ${mobileCapabilities.browserName} in your device settings and refresh this page.`
                  : 'Please enable location access in your browser settings and refresh this page.'
                }
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileGPSPermissions;
