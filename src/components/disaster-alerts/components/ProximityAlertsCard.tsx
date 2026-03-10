
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { GeoFenceStatus } from '@/services/disaster/geoProximityService';
import { formatDistance } from '@/services/disaster/locationUtils';

interface ProximityAlertsCardProps {
  geoFenceStatus: GeoFenceStatus | null;
  lastCheckTime?: Date | null;
}

const ProximityAlertsCard: React.FC<ProximityAlertsCardProps> = ({
  geoFenceStatus,
  lastCheckTime
}) => {
  if (!geoFenceStatus) {
    return (
      <Card className="border-gray-200">
        <CardContent className="py-4">
          <div className="text-center text-gray-500">
            <Shield className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">Analyzing your area for proximity alerts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { proximityAlerts, nearestProneArea, insideProneArea } = geoFenceStatus;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <Card className={`${insideProneArea ? 'border-red-300 bg-red-50' : 'border-green-200 bg-green-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            {insideProneArea ? (
              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
            ) : (
              <Shield className="h-4 w-4 mr-2 text-green-600" />
            )}
            Proximity Alerts
          </div>
          {lastCheckTime && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {lastCheckTime.toLocaleTimeString()}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {insideProneArea && (
          <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded">
            <div className="text-xs font-medium text-red-800 mb-1">
              ⚠️ You are currently in a disaster-prone area
            </div>
            <div className="text-xs text-red-700">
              Please stay alert and follow safety recommendations
            </div>
          </div>
        )}

        {nearestProneArea && (
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">Nearest Risk Area</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{nearestProneArea.name}</div>
                <div className="text-xs text-gray-600">
                  {formatDistance(nearestProneArea.distance)} away
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {nearestProneArea.risks?.join(', ') || 'Multiple risks'}
              </Badge>
            </div>
          </div>
        )}

        {proximityAlerts && proximityAlerts.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 mb-2">Active Proximity Alerts</div>
            {proximityAlerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="border rounded p-2 bg-white">
                <div className="flex items-start justify-between mb-1">
                  <div className="font-medium text-xs">{alert.areaName}</div>
                  <Badge variant="outline" className={getUrgencyColor(alert.urgency)}>
                    {alert.urgency.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {formatDistance(alert.distance)} • {alert.estimatedArrivalTime}
                </div>
                <div className="text-xs text-gray-700">
                  Risks: {alert.risks.join(', ')}
                </div>
                {alert.recommendedActions && alert.recommendedActions.length > 0 && (
                  <div className="text-xs text-blue-700 mt-1">
                    💡 {alert.recommendedActions[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3">
            <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-green-700">All Clear</div>
            <div className="text-xs text-green-600">
              No immediate proximity alerts in your area
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProximityAlertsCard;
