
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Settings, AlertTriangle, Smartphone, HelpCircle } from 'lucide-react';
import { detectMobileCapabilities } from '@/services/mobile/mobileCapabilities';

interface LocationPermissionCardProps {
  error?: string | null;
}

const LocationPermissionCard: React.FC<LocationPermissionCardProps> = ({ error }) => {
  const mobileCapabilities = detectMobileCapabilities();

  const handleRequestPermission = async () => {
    try {
      console.log('[Location Permission] Requesting permission...');
      const result = await navigator.permissions.query({ name: 'geolocation' });
      console.log('[Location Permission] Current state:', result.state);
      
      if (result.state === 'denied') {
        alert('Location access is blocked. Please enable it in your browser settings and refresh the page.');
        return;
      }
      
      // Trigger geolocation request
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[Location Permission] Permission granted, reloading...');
          window.location.reload();
        },
        (error) => {
          console.error('[Location Permission] Error:', error);
          alert('Failed to get location. Please check your settings and try again.');
        },
        {
          enableHighAccuracy: mobileCapabilities.isMobile,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (err) {
      console.error('[Location Permission] Permission check failed:', err);
      // Fallback: directly request geolocation
      navigator.geolocation.getCurrentPosition(
        () => window.location.reload(),
        () => alert('Location access required for hyper-local alerts'),
        { enableHighAccuracy: mobileCapabilities.isMobile }
      );
    }
  };

  const handleOpenSettings = () => {
    console.log('[Location Permission] Opening settings guidance');
    const userAgent = navigator.userAgent;
    
    if (mobileCapabilities.isIOS) {
      alert('iOS: Go to Settings → Privacy & Security → Location Services → Safari → "While Using App"');
    } else if (mobileCapabilities.isAndroid) {
      alert('Android: Go to Settings → Apps → Browser → Permissions → Location → "Allow only while using the app"');
    } else {
      alert('Desktop: Click the location icon in your browser\'s address bar and select "Allow"');
    }
  };

  const handleHelp = () => {
    console.log('[Location Permission] Showing help');
    alert('Hyper-local alerts require your location to provide personalized disaster warnings for areas within 500 meters of your position. Your location data is processed locally and not stored on our servers.');
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-amber-600" />
            Location Access Required
          </div>
          <div className="flex items-center gap-2">
            {mobileCapabilities.isMobile && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                📱 {mobileCapabilities.isIOS ? 'iOS' : mobileCapabilities.isAndroid ? 'Android' : 'Mobile'}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHelp}
              className="h-auto p-1 touch-manipulation"
            >
              <HelpCircle className="h-4 w-4 text-amber-600" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Mobile Device Info */}
        {mobileCapabilities.isMobile && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-200 rounded-lg text-sm">
            <div className="flex items-center text-blue-800 mb-2">
              <Smartphone className="h-4 w-4 mr-2" />
              <span className="font-medium">Mobile Device Detected</span>
            </div>
            <div className="text-blue-700 text-xs">
              Your {mobileCapabilities.isIOS ? 'iOS' : 'Android'} device supports high-accuracy location tracking for precise hyper-local alerts.
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-amber-700 mb-2">
            Enable GPS access to receive hyper-local disaster alerts based on your precise location within 500 meters.
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-3">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-red-700 text-sm">
                  <div className="font-medium mb-1">Location Error</div>
                  <div className="text-xs">{error}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Mobile Optimized */}
        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleRequestPermission}
            className="bg-amber-600 hover:bg-amber-700 text-white touch-manipulation min-h-[44px] w-full"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Enable Location Access
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleOpenSettings}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 touch-manipulation min-h-[44px] w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Open Settings Guide
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-white rounded-lg border text-xs">
          <div className="font-medium text-gray-800 mb-2">
            {mobileCapabilities.isMobile ? 'Mobile Instructions:' : 'Desktop Instructions:'}
          </div>
          {mobileCapabilities.isIOS ? (
            <ol className="text-gray-600 space-y-1 list-decimal list-inside">
              <li>Tap "Enable Location Access" above</li>
              <li>When prompted, select "Allow"</li>
              <li>If blocked, go to Settings → Privacy → Location Services</li>
              <li>Find Safari/Browser and select "While Using App"</li>
            </ol>
          ) : mobileCapabilities.isAndroid ? (
            <ol className="text-gray-600 space-y-1 list-decimal list-inside">
              <li>Tap "Enable Location Access" above</li>
              <li>When prompted, select "Allow"</li>
              <li>If blocked, go to Settings → Apps → Browser</li>
              <li>Tap Permissions → Location → "Allow only while using app"</li>
            </ol>
          ) : (
            <ol className="text-gray-600 space-y-1 list-decimal list-inside">
              <li>Click "Enable Location Access" above</li>
              <li>Click "Allow" in the browser prompt</li>
              <li>If blocked, click the location icon in the address bar</li>
              <li>Select "Allow" and refresh the page</li>
            </ol>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPermissionCard;
