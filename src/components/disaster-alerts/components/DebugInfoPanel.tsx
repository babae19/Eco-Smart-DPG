
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { GeoFenceStatus } from '@/services/disaster/geoProximityService';

interface DebugInfoPanelProps {
  geoFenceStatus: GeoFenceStatus | null;
}

const DebugInfoPanel: React.FC<DebugInfoPanelProps> = ({
  geoFenceStatus
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!geoFenceStatus) return null;

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center text-gray-600">
            <Info className="h-3 w-3 mr-1" />
            Debug Information
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-1"
          >
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-gray-600">Inside Prone Area:</span>
                <p className="text-gray-800">{geoFenceStatus.insideProneArea ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Risk Level:</span>
                <p className="text-gray-800">{geoFenceStatus.currentRiskLevel}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Alerts Count:</span>
                <p className="text-gray-800">{geoFenceStatus.proximityAlerts.length}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Nearest Area:</span>
                <p className="text-gray-800">{geoFenceStatus.nearestProneArea?.name || 'None'}</p>
              </div>
            </div>
            
            {geoFenceStatus.nearestProneArea && (
              <div className="mt-3 p-2 bg-gray-50 rounded">
                <p className="font-medium text-gray-700">Nearest Area Details:</p>
                <p className="text-gray-600">ID: {geoFenceStatus.nearestProneArea.id}</p>
                <p className="text-gray-600">Distance: {geoFenceStatus.nearestProneArea.distance?.toFixed(3)} km</p>
                <p className="text-gray-600">Vulnerability: {geoFenceStatus.nearestProneArea.vulnerabilityLevel}</p>
                <p className="text-gray-600">Risks: {geoFenceStatus.nearestProneArea.risks?.join(', ') || 'N/A'}</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DebugInfoPanel;
