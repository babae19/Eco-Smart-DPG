
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface RiskLevelChartProps {
  riskScore: number;
  updatedAt: Date;
}

const RiskLevelChart: React.FC<RiskLevelChartProps> = ({ riskScore, updatedAt }) => {
  // Ensure risk score is between 0-100
  const safeRiskScore = Math.min(100, Math.max(0, riskScore));
  
  // Determine background color based on risk level
  const getBgColor = () => {
    if (safeRiskScore < 33) return 'bg-green-500';
    if (safeRiskScore < 66) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  // Determine text for risk level
  const getRiskLevelText = () => {
    if (safeRiskScore < 33) return 'Low';
    if (safeRiskScore < 66) return 'Medium';
    return 'High';
  };
  
  // Format the last update time
  const formattedTime = format(updatedAt, 'HH:mm');
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Risk Level: <span className="font-medium">{getRiskLevelText()}</span></span>
        <span>Last updated: {formattedTime}</span>
      </div>
      
      <Progress 
        value={safeRiskScore} 
        className="h-2"
        indicatorClassName={getBgColor()}
      />
    </div>
  );
};

export default RiskLevelChart;
