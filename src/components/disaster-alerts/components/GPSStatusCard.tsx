
import React from 'react';
import { Navigation, AlertTriangle, RefreshCw, Loader2, Smartphone, Wifi, Signal, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface GPSStatusCardProps {
  locationAccuracy: number | null;
  hasHighAccuracyLocation: boolean;
  currentRiskLevel: string;
  lastAlertTime: Date | null;
  locationError: string | null;
  latitude: number | null;
  longitude: number | null;
  isAnalyzing: boolean;
  onRefresh: () => void;
  deviceCapabilities?: {
    supportsHighAccuracy: boolean;
    supportsWatch: boolean;
    typicalAccuracy: string;
    isMobile?: boolean;
    hasGPS?: boolean;
  };
  accuracyQuality?: string;
  retryCount?: number;
}

const GPSStatusCard: React.FC<GPSStatusCardProps> = ({
  locationAccuracy,
  hasHighAccuracyLocation,
  currentRiskLevel,
  lastAlertTime,
  locationError,
  latitude,
  longitude,
  isAnalyzing,
  onRefresh,
  deviceCapabilities,
  accuracyQuality,
  retryCount = 0
}) => {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getAccuracyColor = (accuracy: number | null, quality: string = 'unknown') => {
    if (!accuracy) return 'text-gray-500';
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'very-good': return 'text-green-500';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-amber-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getGPSStatusIcon = () => {
    if (!deviceCapabilities) return <MapPin className="h-3 w-3" />;
    
    if (deviceCapabilities.isMobile && deviceCapabilities.hasGPS) {
      return hasHighAccuracyLocation ? 
        <Signal className="h-3 w-3 text-green-600" /> : 
        <Signal className="h-3 w-3 text-amber-600" />;
    } else if (deviceCapabilities.supportsHighAccuracy) {
      return <Wifi className="h-3 w-3 text-blue-600" />;
    } else {
      return <Smartphone className="h-3 w-3 text-gray-600" />;
    }
  };

  const getGPSStatusText = () => {
    if (!deviceCapabilities) return 'Unknown';
    
    if (deviceCapabilities.isMobile && deviceCapabilities.hasGPS) {
      return hasHighAccuracyLocation ? 'Mobile GPS (Active)' : 'Mobile GPS (Acquiring)';
    } else if (deviceCapabilities.supportsHighAccuracy) {
      return 'Network Location';
    } else {
      return 'Basic Location';
    }
  };

  const handleRefreshClick = () => {
    console.log('[GPSStatusCard] Refresh button clicked - requesting fresh GPS reading');
    onRefresh();
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center text-blue-900">
          <Navigation className="h-4 w-4 mr-2" />
          Hyper-Local GPS Positioning
          {retryCount > 0 && (
            <Badge variant="outline" className="ml-2 text-xs">
              Retry {retryCount}
            </Badge>
          )}
          {deviceCapabilities?.isMobile && (
            <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700">
              Mobile
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-gray-600 flex items-center mb-1">
              GPS Accuracy
              {getGPSStatusIcon()}
            </div>
            <div className={cn("font-semibold", getAccuracyColor(locationAccuracy, accuracyQuality))}>
              {locationAccuracy ? `±${locationAccuracy.toFixed(0)}m` : 'Acquiring...'}
            </div>
            {accuracyQuality && accuracyQuality !== 'unknown' && (
              <div className="text-xs text-gray-500 mt-0.5">
                Quality: {accuracyQuality}
              </div>
            )}
          </div>
          <div>
            <div className="text-gray-600 mb-1">GPS Status</div>
            <div className={cn("font-semibold text-xs",
              hasHighAccuracyLocation ? "text-green-600" : "text-amber-600"
            )}>
              {getGPSStatusText()}
            </div>
            {deviceCapabilities?.typicalAccuracy && (
              <div className="text-xs text-gray-500 mt-0.5">
                Expected: {deviceCapabilities.typicalAccuracy}
              </div>
            )}
          </div>
          <div>
            <div className="text-gray-600 mb-1">Risk Level</div>
            <Badge variant="outline" className={getRiskLevelColor(currentRiskLevel || 'safe')}>
              {currentRiskLevel?.toUpperCase() || 'SAFE'}
            </Badge>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Last Update</div>
            <div className="font-semibold text-gray-700">
              {lastAlertTime ? lastAlertTime.toLocaleTimeString() : 'Never'}
            </div>
          </div>
        </div>

        {/* Mobile GPS optimization info */}
        {deviceCapabilities?.isMobile && (
          <div className="mt-3 p-2 bg-green-50 rounded text-xs">
            <div className="font-medium text-green-800 mb-1">📱 Mobile GPS Optimization Active</div>
            <div className="text-green-700">
              • High-accuracy GPS enabled • Continuous tracking active • 
              Extended timeout for GPS lock • Real-time position updates
            </div>
          </div>
        )}

        {/* Accuracy improvement tips for mobile */}
        {deviceCapabilities?.isMobile && locationAccuracy && locationAccuracy > 15 && (
          <div className="mt-3 p-2 bg-amber-50 rounded text-xs">
            <div className="font-medium text-amber-800 mb-1">💡 Tips for Better GPS Accuracy</div>
            <div className="text-amber-700">
              • Move to an open area • Ensure GPS is enabled in device settings • 
              Wait for GPS satellite lock • Avoid buildings and tunnels
            </div>
          </div>
        )}
        
        {locationError && (
          <Alert variant="destructive" className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {locationError}
              {deviceCapabilities?.isMobile && (
                <div className="mt-1">
                  Try: Settings → Privacy → Location Services → Enable for this browser
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-500">
            {latitude && longitude ? (
              <>
                📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
                {deviceCapabilities?.isMobile && (
                  <span className="text-green-600 ml-1">• Mobile GPS</span>
                )}
              </>
            ) : (
              'Acquiring precise location...'
            )}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshClick}
            disabled={isAnalyzing}
            className="hover:bg-blue-50"
          >
            {isAnalyzing ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            {isAnalyzing ? 'Getting GPS...' : 'Refresh GPS'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GPSStatusCard;
