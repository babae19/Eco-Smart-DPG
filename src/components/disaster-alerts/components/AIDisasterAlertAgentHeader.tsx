
import React from 'react';
import { Brain, RefreshCw } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AIDisasterAlertAgentHeaderProps {
  onRefresh: () => void;
  isDataLoading: boolean;
  riskScore?: number;
  confidenceLevel?: number;
}

const AIDisasterAlertAgentHeader: React.FC<AIDisasterAlertAgentHeaderProps> = ({
  onRefresh,
  isDataLoading,
  riskScore,
  confidenceLevel
}) => {
  return (
    <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-3">
      <CardTitle className="text-lg flex items-center justify-between">
        <span className="flex items-center">
          <Brain className="mr-2 h-5 w-5" />
          AI Disaster Risk Analysis
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh}
          disabled={isDataLoading}
          className="text-white hover:bg-white/20"
        >
          <RefreshCw className={`h-4 w-4 ${isDataLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardTitle>
    </CardHeader>
  );
};

export default AIDisasterAlertAgentHeader;
