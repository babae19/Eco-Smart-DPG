import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  RefreshCw, 
  Clock, 
  MapPin, 
  AlertTriangle,
  Thermometer,
  Droplets,
  Wind,
  Loader2
} from 'lucide-react';
import { useRealtimeDisasterAlerts } from '@/hooks/useRealtimeDisasterAlerts';
import { useUserLocation } from '@/contexts/LocationContext';

const RealtimeDisasterAnalysis: React.FC = () => {
  const { latitude, longitude, isLoading: locationLoading, error: locationError } = useUserLocation();
  
  const {
    alerts,
    criticalAlerts,
    activeAlertsCount,
    isLoading,
    isAnalyzing,
    lastAnalysis,
    error,
    triggerAnalysis
  } = useRealtimeDisasterAlerts({
    latitude: latitude || undefined,
    longitude: longitude || undefined,
    radiusKm: 50
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'extreme_heat':
      case 'heat_wave':
        return <Thermometer className="h-4 w-4" />;
      case 'flooding':
      case 'heavy_rain':
        return <Droplets className="h-4 w-4" />;
      case 'strong_winds':
      case 'storm_damage':
        return <Wind className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (locationLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Getting your location...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (locationError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Location access is required for realtime disaster analysis. Please enable location services.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Realtime Disaster Analysis
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={triggerAnalysis}
              disabled={isAnalyzing || !latitude || !longitude}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Analysis
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            AI-powered disaster risk analysis updated every minute
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-blue-600" />
              <p className="text-lg font-bold text-blue-900">{activeAlertsCount}</p>
              <p className="text-xs text-blue-700">Active Alerts</p>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <Shield className="h-6 w-6 mx-auto mb-1 text-red-600" />
              <p className="text-lg font-bold text-red-900">{criticalAlerts.length}</p>
              <p className="text-xs text-red-700">Critical Alerts</p>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-1 text-green-600" />
              <p className="text-lg font-bold text-green-900">
                {lastAnalysis ? new Date(lastAnalysis).toLocaleTimeString() : 'Never'}
              </p>
              <p className="text-xs text-green-700">Last Analysis</p>
            </div>
          </div>

          {latitude && longitude && (
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p>Loading disaster alerts...</p>
            </div>
          </CardContent>
        </Card>
      ) : alerts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Active Disaster Alerts
            </CardTitle>
            <CardDescription>
              Current disaster risks in your area (50km radius)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold flex items-center">
                    {getTypeIcon(alert.type)}
                    <span className="ml-2">{alert.title}</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  <span className="text-sm font-medium text-orange-600">
                    {alert.probability ?? 'N/A'}% risk
                  </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-2">{alert.description}</p>
                <p className="text-sm text-gray-600 mb-3 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {alert.timeframe}
                </p>
                
                {alert.precautions && alert.precautions.length > 0 && (
                  <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                    <h5 className="font-medium text-yellow-800 mb-1">Precautions:</h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {alert.precautions.map((precaution, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          {precaution}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                  <span>Location: {alert.location}</span>
                  <span>
                    Created: {new Date(alert.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <h3 className="font-medium text-green-900 mb-1">All Clear</h3>
              <p className="text-sm text-green-700">
                No disaster risks detected in your area at this time.
              </p>
              {lastAnalysis && (
                <p className="text-xs text-green-600 mt-2">
                  Last checked: {new Date(lastAnalysis).toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <Shield className="h-5 w-5 mr-3 text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Realtime Monitoring</h4>
              <p className="text-sm text-blue-700">
                This system automatically analyzes weather conditions and generates disaster predictions every minute. 
                You'll receive instant notifications for critical alerts through push notifications and the notification panel.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeDisasterAnalysis;