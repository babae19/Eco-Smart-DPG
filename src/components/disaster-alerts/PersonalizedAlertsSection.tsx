
import React from 'react';
import { Shield, Info, MapPin, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGPSPermissions } from '@/hooks/useGPSPermissions';
import LocationBasedAlert from '@/components/LocationBasedAlert';

interface PersonalizedAlertsSectionProps {
  latitude: number | null;
  longitude: number | null;
  locationLoading: boolean;
  locationError: string | null;
  accuracy: number | null;
  lastUpdated: Date | null;
  formattedTime: string;
  animateAlerts: boolean;
}

const PersonalizedAlertsSection: React.FC<PersonalizedAlertsSectionProps> = ({
  latitude,
  longitude,
  locationLoading,
  locationError,
  accuracy,
  lastUpdated,
  formattedTime,
  animateAlerts
}) => {
  const {
    hasPermission,
    permissionState,
    canRequestPermission,
    requestPermission,
    openLocationSettings
  } = useGPSPermissions();

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="bg-green-100 p-2 rounded-full mr-2">
            <Shield className={cn("text-green-600")} size={18} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Local Safety Alerts</h2>
        </div>
        <span className="text-xs text-gray-500">{formattedTime}</span>
      </div>
      
      {/* GPS Permission Check */}
      {!hasPermission ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-md">
          <div className="flex items-start">
            <MapPin className={cn("text-amber-500 mt-0.5 mr-2")} size={16} />
            <div className="flex-1">
              <h3 className="font-medium text-amber-700">GPS Location Required</h3>
              <p className="text-sm text-amber-600 mt-1">
                Enable GPS access to receive hyper-local disaster alerts based on your precise location.
                This allows us to provide warnings for disaster-prone areas within 100 meters of your position.
              </p>
              <div className="flex gap-2 mt-3">
                {canRequestPermission && permissionState !== 'denied' ? (
                  <Button 
                    onClick={requestPermission}
                    size="sm" 
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    disabled={permissionState === 'checking'}
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    {permissionState === 'checking' ? 'Checking...' : 'Enable GPS'}
                  </Button>
                ) : (
                  <Button 
                    onClick={openLocationSettings}
                    variant="outline" 
                    size="sm"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Open Settings
                  </Button>
                )}
              </div>
              {permissionState === 'denied' && (
                <p className="text-xs text-amber-600 mt-2 bg-amber-100 p-2 rounded">
                  Location access was denied. Please enable it in your browser settings and refresh the page.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Show location-based alerts if we have permission and location */
        latitude && longitude ? (
          <div>
            <div className="bg-gray-100 rounded-lg p-2 mb-3 flex items-center text-xs text-gray-600">
              <MapPin size={14} className={cn("text-green-600 mr-1")} />
              <span>
                GPS tracking active • Last updated: {lastUpdated?.toLocaleTimeString() || 'Unknown'} 
                {accuracy && ` • Accuracy: ${Math.round(accuracy)}m`}
              </span>
            </div>
            <div className={animateAlerts ? 'animate-pulse transition-all duration-300' : ''}>
              <LocationBasedAlert latitude={latitude} longitude={longitude} />
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Info className={cn("text-blue-500 mr-2")} size={16} />
              <div>
                <h3 className="font-medium text-blue-700">Acquiring GPS Location...</h3>
                <p className="text-sm text-blue-600 mt-1">
                  Please wait while we determine your precise location for hyper-local alerts.
                </p>
              </div>
            </div>
          </div>
        )
      )}
      
      {/* Show location error if applicable */}
      {locationError && hasPermission && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-md mt-4">
          <div className="flex items-start">
            <Info className={cn("text-red-500 mt-0.5 mr-2")} size={16} />
            <div>
              <h3 className="font-medium text-red-700">GPS Location Error</h3>
              <p className="text-sm text-red-600 mt-1">{locationError}</p>
              <Button variant="outline" size="sm" className="mt-2">
                Retry Location
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedAlertsSection;
