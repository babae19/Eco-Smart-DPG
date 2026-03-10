
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Alert } from '@/types/AlertTypes';
import { AlertTriangle, TrendingUp, Target, Brain, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AIRisksTabContentProps {
  alerts: Alert[];
  onRefresh: () => void;
  riskScore?: number;
  confidenceLevel?: number;
  weatherImpact?: number;
}

const AIRisksTabContent: React.FC<AIRisksTabContentProps> = ({
  alerts,
  onRefresh,
  riskScore = 0,
  confidenceLevel = 0,
  weatherImpact = 0
}) => {
  const getRiskLevelColor = (score: number) => {
    if (score >= 75) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 25) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getRiskLevelText = (score: number) => {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MODERATE';
    return 'LOW';
  };

  return (
    <TabsContent value="risks" className="p-4 space-y-4">
      {/* AI Analysis Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Gauge className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium">Risk Score</span>
            </div>
            <Badge variant="outline" className={getRiskLevelColor(riskScore)}>
              {getRiskLevelText(riskScore)}
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress value={riskScore} className="h-2" />
            <div className="text-xs text-gray-600">
              {riskScore.toFixed(1)}/100 - Based on AI analysis
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Brain className="h-4 w-4 text-purple-500 mr-2" />
              <span className="text-sm font-medium">AI Confidence</span>
            </div>
            <span className="text-sm font-bold text-purple-600">
              {Math.round(confidenceLevel * 100)}%
            </span>
          </div>
          <div className="space-y-2">
            <Progress value={confidenceLevel * 100} className="h-2" />
            <div className="text-xs text-gray-600">
              Analysis reliability score
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-orange-500 mr-2" />
              <span className="text-sm font-medium">Weather Impact</span>
            </div>
            <span className="text-sm font-bold text-orange-600">
              {weatherImpact.toFixed(0)}%
            </span>
          </div>
          <div className="space-y-2">
            <Progress value={weatherImpact} className="h-2" />
            <div className="text-xs text-gray-600">
              Current weather contribution
            </div>
          </div>
        </div>
      </div>

      {/* AI-Generated Alerts */}
      {alerts.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600 mb-3">No AI-detected risks at this time</p>
          <div className="text-xs text-gray-500 mb-4">
            Risk Score: {riskScore.toFixed(1)} | Confidence: {Math.round(confidenceLevel * 100)}%
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <Brain className="w-4 h-4 mr-2" />
            Refresh AI Analysis
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">AI-Detected Risks ({alerts.length})</h4>
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <TrendingUp className="w-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
          
          {alerts.slice(0, 5).map((alert, index) => (
            <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'high' ? 'bg-red-50 border-red-400' :
              alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
              'bg-blue-50 border-blue-400'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-sm text-gray-900">{alert.title}</h5>
                    {alert.isPersonalized && (
                      <Badge variant="secondary" className="text-xs">
                        <Brain className="w-3 h-3 mr-1" />
                        AI Enhanced
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                  
                  {alert.aiPredictionScore && (
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
                        <span className="text-blue-600">
                          Confidence: {Math.round(alert.aiPredictionScore * 100)}%
                        </span>
                      </div>
                      {alert.predictedImpact && (
                        <div className="text-gray-500">
                          Impact: {alert.predictedImpact}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <Badge variant={
                  alert.severity === 'high' ? 'destructive' :
                  alert.severity === 'medium' ? 'warning' : 'secondary'
                } className={alert.isNew ? 'animate-pulse' : ''}>
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>
              
              {(alert.weatherFactor || alert.historicalPattern) && (
                <div className="mt-3 pt-2 border-t border-opacity-30 text-xs space-y-1">
                  {alert.weatherFactor && (
                    <div className="text-gray-600">
                      <span className="font-medium">Weather Factor:</span> {alert.weatherFactor}
                    </div>
                  )}
                  {alert.historicalPattern && (
                    <div className="text-gray-600">
                      <span className="font-medium">Historical Pattern:</span> {alert.historicalPattern}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {alerts.length > 5 && (
            <div className="text-center py-2">
              <div className="text-xs text-gray-500">
                Showing top 5 risks. {alerts.length - 5} additional risks detected.
              </div>
            </div>
          )}
        </div>
      )}
    </TabsContent>
  );
};

export default AIRisksTabContent;
