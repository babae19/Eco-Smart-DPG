
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { WeatherData } from '@/types/WeatherDataTypes';
import { Shield, CheckCircle, MapPin, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SafetyTabContentProps {
  safetyRecommendations: string[];
  weatherData: WeatherData | null;
  proximityStatus?: any;
}

const SafetyTabContent: React.FC<SafetyTabContentProps> = ({
  safetyRecommendations,
  weatherData,
  proximityStatus
}) => {
  const hasProximityWarnings = proximityStatus?.insideProneArea || 
    (proximityStatus?.proximityAlerts && proximityStatus?.proximityAlerts.length > 0);

  return (
    <TabsContent value="safety" className="p-4 space-y-3">
      {safetyRecommendations.length === 0 && !hasProximityWarnings ? (
        <div className="text-center py-6 text-gray-500">
          <Shield className="h-8 w-8 mx-auto mb-2 text-green-400" />
          <p className="text-sm">No specific safety recommendations at this time</p>
          <p className="text-xs text-gray-400 mt-1">Current conditions appear safe</p>
        </div>
      ) : (
        <>
          {/* Location-based warnings */}
          {hasProximityWarnings && (
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-gray-900 flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-red-600" />
                Location Safety Status
              </h4>
              
              {proximityStatus?.insideProneArea && (
                <div className="p-2 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center">
                        <span className="text-xs font-medium text-red-800">
                          You are in a high-risk area
                        </span>
                        <Badge variant="destructive" className="ml-2 text-[10px]">
                          {proximityStatus.currentRiskLevel?.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-xs text-red-700">
                        {proximityStatus.nearestProneArea?.name || "Unknown area"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {proximityStatus?.proximityAlerts?.map((alert: any, index: number) => (
                <div key={index} className="p-2 bg-amber-50 border border-amber-200 rounded">
                  <div className="flex items-start">
                    <MapPin className="h-3 w-3 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-amber-800">{alert.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Safety Recommendations */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <Shield className="h-4 w-4 mr-1 text-blue-600" />
              Safety Recommendations
            </h4>
            {safetyRecommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start p-2 bg-green-50 border border-green-200 rounded">
                <CheckCircle className="h-3 w-3 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-green-800">{recommendation}</span>
              </div>
            ))}
          </div>
        </>
      )}
      
      {weatherData?.riskAnalysis?.recommendations && weatherData.riskAnalysis.recommendations.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Weather-Based Recommendations</h4>
          {weatherData.riskAnalysis.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start p-2 bg-blue-50 border border-blue-200 rounded mb-1">
              <CheckCircle className="h-3 w-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-blue-800">{rec}</span>
            </div>
          ))}
        </div>
      )}
    </TabsContent>
  );
};

export default SafetyTabContent;
