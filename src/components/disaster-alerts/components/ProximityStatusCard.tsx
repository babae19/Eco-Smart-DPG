
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GeoFenceStatus } from '@/services/disaster/geoProximityService';

interface ProximityStatusCardProps {
  geoFenceStatus: GeoFenceStatus;
}

const ProximityStatusCard: React.FC<ProximityStatusCardProps> = ({ geoFenceStatus }) => {
  return (
    <Card className={`${geoFenceStatus.insideProneArea ? 'border-red-300 bg-red-50' : 'border-green-200 bg-green-50'} transition-colors duration-300`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            {geoFenceStatus.insideProneArea ? (
              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            )}
            Proximity Status
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs font-medium",
              geoFenceStatus.currentRiskLevel === 'critical' && "bg-red-100 text-red-800 border-red-300",
              geoFenceStatus.currentRiskLevel === 'high' && "bg-orange-100 text-orange-800 border-orange-300",
              geoFenceStatus.currentRiskLevel === 'medium' && "bg-amber-100 text-amber-800 border-amber-300",
              geoFenceStatus.currentRiskLevel === 'low' && "bg-blue-100 text-blue-800 border-blue-300",
              geoFenceStatus.currentRiskLevel === 'safe' && "bg-green-100 text-green-800 border-green-300"
            )}
          >
            {geoFenceStatus.currentRiskLevel.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {geoFenceStatus.insideProneArea ? (
          <div className="p-4 bg-red-100 border border-red-200 rounded-lg">
            <div className="text-sm font-medium text-red-800 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              You are in a disaster-prone area
            </div>
            <div className="text-sm text-red-700 mb-3">
              <strong>{geoFenceStatus.nearestProneArea?.name}</strong> - Stay alert and follow safety guidelines
            </div>
            <Button
              variant="default"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white touch-manipulation min-h-[40px] w-full"
              onClick={() => console.log('Emergency actions for:', geoFenceStatus.nearestProneArea?.id)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              View Safety Actions
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <div className="text-sm font-medium text-green-700 mb-1">Safe Location</div>
            <div className="text-xs text-green-600">
              No immediate proximity alerts detected
            </div>
          </div>
        )}

        {geoFenceStatus.proximityAlerts && geoFenceStatus.proximityAlerts.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-gray-700 font-medium">Nearby Alert Areas</div>
            {geoFenceStatus.proximityAlerts.slice(0, 2).map((alert, index) => (
              <div key={index} className="border rounded-lg p-3 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-sm">{alert.areaName}</div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      alert.urgency === 'high' && "bg-red-100 text-red-800",
                      alert.urgency === 'medium' && "bg-amber-100 text-amber-800",
                      alert.urgency === 'low' && "bg-blue-100 text-blue-800"
                    )}
                  >
                    {alert.urgency.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  📍 {(alert.distance * 1000).toFixed(0)}m away
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs touch-manipulation min-h-[36px] w-full"
                  onClick={() => console.log('View area details:', alert.areaId)}
                >
                  View Area Details
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProximityStatusCard;
