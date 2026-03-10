
import React from 'react';
import { CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/types/AlertTypes';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface AIDisasterAlertAgentFooterProps {
  alerts: Alert[];
  hasWeatherRisks: boolean;
  hasUserReports: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  riskScore?: number;
  analysisComplete?: boolean;
}

const AIDisasterAlertAgentFooter: React.FC<AIDisasterAlertAgentFooterProps> = ({
  alerts,
  hasWeatherRisks,
  hasUserReports,
  activeTab,
  onTabChange,
  riskScore = 0,
  analysisComplete = false
}) => {
  const riskCount = alerts.length;
  const highRiskCount = alerts.filter(a => a.severity === 'high').length;
  
  const getRiskLevelText = (score: number) => {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MODERATE';
    return 'LOW';
  };
  
  return (
    <CardFooter className="bg-gray-50 px-4 py-2 text-xs text-gray-600">
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-2">
          {riskCount > 0 && (
            <Badge variant={highRiskCount > 0 ? "destructive" : "secondary"} className="text-xs">
              {riskCount} Risk{riskCount !== 1 ? 's' : ''} Detected
            </Badge>
          )}
          {hasWeatherRisks && (
            <Badge variant="outline" className="text-xs">
              Weather Analysis
            </Badge>
          )}
          {hasUserReports && (
            <Badge variant="outline" className="text-xs">
              Community Data
            </Badge>
          )}
          {analysisComplete && riskScore > 0 && (
            <Badge 
              variant={riskScore >= 50 ? "outline" : "secondary"} 
              className={`text-xs ${
                riskScore >= 75 ? 'border-red-300 bg-red-50 text-red-700' :
                riskScore >= 50 ? 'border-orange-300 bg-orange-50 text-orange-700' :
                riskScore >= 25 ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                'border-green-300 bg-green-50 text-green-700'
              }`}
            >
              {getRiskLevelText(riskScore)} RISK
            </Badge>
          )}
        </div>
        <span className="flex items-center">
          {analysisComplete && <CheckCircle className="h-3 w-3 mr-1 text-green-500" />}
          AI-Powered Analysis
        </span>
      </div>
    </CardFooter>
  );
};

export default AIDisasterAlertAgentFooter;
