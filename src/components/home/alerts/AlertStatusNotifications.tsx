
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AlertStatusNotificationsProps {
  error: string | null;
  isAnalyzing: boolean;
  enhancementError: string | null;
  analysisComplete: boolean;
  enhancedAlertsCount: number;
  userReportPatternsCount: number;
}

const AlertStatusNotifications: React.FC<AlertStatusNotificationsProps> = ({
  error,
  isAnalyzing,
  enhancementError,
  analysisComplete,
  enhancedAlertsCount,
  userReportPatternsCount
}) => {
  return (
    <>
      {/* Show database error */}
      {error && (
        <Alert variant="destructive" className="mb-3">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            <div className="text-sm">Error loading alerts: {error}</div>
            <div className="text-xs mt-1 opacity-80">Showing cached data if available</div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Show enhancement status */}
      {isAnalyzing && (
        <Alert variant="default" className="mb-3 border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 mr-2 text-blue-600 animate-pulse" />
          <AlertDescription>
            <div className="text-sm text-blue-800">
              Analyzing weather patterns, historical data, and community reports...
            </div>
            <div className="text-xs mt-1 text-blue-700">
              Generating personalized risk assessment for your location
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Show enhancement error */}
      {enhancementError && (
        <Alert variant="default" className="mb-3 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
          <AlertDescription>
            <div className="text-sm text-amber-800">
              Could not complete enhanced analysis: {enhancementError}
            </div>
            <div className="text-xs mt-1 text-amber-700">
              Showing available alerts instead
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Show enhanced analysis status when complete */}
      {analysisComplete && enhancedAlertsCount > 0 && userReportPatternsCount > 0 && (
        <Alert variant="default" className="mb-3 border-green-200 bg-green-50">
          <AlertTriangle className="h-4 w-4 mr-2 text-green-600" />
          <AlertDescription>
            <div className="text-sm text-green-800">
              Enhanced analysis complete: {userReportPatternsCount} community patterns analyzed
            </div>
            <div className="text-xs mt-1 text-green-700">
              Alerts prioritized based on weather, historical data, and community reports
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default AlertStatusNotifications;
