
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radar, TrendingUp, MapPin, ExternalLink, AlertTriangle } from 'lucide-react';
import { Alert } from '@/types/AlertTypes';

interface HyperLocalFeedCardProps {
  hyperLocalAlerts: Alert[];
  isAnalyzing: boolean;
  locationAccuracy: number | null;
}

const HyperLocalFeedCard: React.FC<HyperLocalFeedCardProps> = ({
  hyperLocalAlerts,
  isAnalyzing,
  locationAccuracy
}) => {
  const handleViewFullAlert = (alertId: string) => {
    console.log('Viewing full alert:', alertId);
    // This could navigate to a detailed alert view
  };

  const handleTakeAction = (alertId: string) => {
    console.log('Taking action for alert:', alertId);
    // This could show safety recommendations or emergency actions
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center">
            <Radar className="h-4 w-4 mr-2" />
            Hyper-Local Alert Feed
          </span>
          {locationAccuracy && (
            <Badge variant="outline" className="text-xs">
              ±{locationAccuracy.toFixed(0)}m accuracy
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="text-center py-6">
            <Radar className="h-8 w-8 mx-auto mb-3 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600 mb-2">Analyzing your location for hyper-local risks...</p>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        ) : hyperLocalAlerts.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-3 text-green-500" />
            <p className="text-sm font-medium text-green-700">Safe Location Detected</p>
            <p className="text-xs text-gray-500 mt-1">No hyper-local alerts for your current position</p>
            <p className="text-xs text-green-600 mt-2">✓ You're in a safe area</p>
          </div>
        ) : (
          <div className="space-y-3">
            {hyperLocalAlerts.slice(0, 3).map((alert, index) => (
              <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'high' ? 'bg-red-50 border-red-400' :
                alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      {alert.severity === 'high' && <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />}
                      <h4 className="font-medium text-sm text-gray-900">{alert.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{alert.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    {alert.isPersonalized && (
                      <Badge variant="outline" className="text-xs">
                        Personalized
                      </Badge>
                    )}
                    {alert.aiPredictionScore && (
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
                        <span className="text-xs text-blue-600">
                          {Math.round(alert.aiPredictionScore * 100)}% confidence
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons - Mobile Optimized */}
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewFullAlert(alert.id)}
                      className="text-xs px-2 py-1 h-auto touch-manipulation min-h-[32px]"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    {alert.severity === 'high' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleTakeAction(alert.id)}
                        className="text-xs px-2 py-1 h-auto bg-red-600 hover:bg-red-700 touch-manipulation min-h-[32px]"
                      >
                        Action
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {hyperLocalAlerts.length > 3 && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs touch-manipulation min-h-[40px]"
                  onClick={() => console.log('Show all alerts')}
                >
                  View All {hyperLocalAlerts.length} Alerts
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HyperLocalFeedCard;
