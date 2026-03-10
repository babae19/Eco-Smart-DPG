
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Brain } from 'lucide-react';

interface AlertAnalyzingProps {
  progress: number;
}

const AlertAnalyzing: React.FC<AlertAnalyzingProps> = ({ progress }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center">
        <Brain className="h-8 w-8 text-blue-500 animate-pulse mr-2" />
        <span className="text-sm font-medium text-gray-700">AI Analysis in Progress</span>
      </div>
      <Progress value={progress} max={100} className="h-2" />
      <p className="text-center text-xs text-gray-500">
        Analyzing {progress < 25 ? 'user reports' : progress < 50 ? 'weather patterns' : progress < 75 ? 'risk factors' : 'generating recommendations'}...
      </p>
    </div>
  );
};

export default AlertAnalyzing;
