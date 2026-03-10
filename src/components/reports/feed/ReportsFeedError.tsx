
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Clock } from 'lucide-react';

interface ReportsFeedErrorProps {
  error: string;
  onRetry: () => void;
  timestamp: number | null;
}

export const ReportsFeedError: React.FC<ReportsFeedErrorProps> = ({ 
  error, 
  onRetry,
  timestamp 
}) => {
  const getTimeSinceError = () => {
    if (!timestamp) return '';
    const minutesAgo = Math.floor((Date.now() - timestamp) / 60000);
    
    if (minutesAgo < 1) return 'just now';
    if (minutesAgo === 1) return '1 minute ago';
    return `${minutesAgo} minutes ago`;
  };
  
  return (
    <div className="mb-6 bg-destructive/5 border-l-4 border-destructive rounded-md p-4">
      <div className="flex items-start">
        <AlertCircle className="mr-3 h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-destructive">
            Error Loading Reports
          </h3>
          
          <div className="mt-1 text-sm text-destructive/80">
            <p>{error}</p>
            
            {timestamp && (
              <div className="flex items-center mt-2 text-xs text-destructive/70">
                <Clock size={12} className="mr-1" />
                <span>Error occurred {getTimeSinceError()}</span>
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <Button 
              onClick={onRetry}
              size="sm" 
              variant="destructive"
              className="flex items-center text-xs"
            >
              <RefreshCw size={12} className="mr-1.5" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
