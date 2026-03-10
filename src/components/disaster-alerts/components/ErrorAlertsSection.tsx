
import React from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorAlertsSectionProps {
  fetchError: string | null;
  locationLoading: boolean;
  locationError: string | null;
  onRetry: () => void;
}

const ErrorAlertsSection: React.FC<ErrorAlertsSectionProps> = ({
  fetchError,
  locationLoading,
  locationError,
  onRetry
}) => {
  const handleRetry = () => {
    console.log('[ErrorAlertsSection] User requested retry');
    try {
      onRetry();
    } catch (error) {
      console.error('[ErrorAlertsSection] Error during retry:', error);
    }
  };

  return (
    <>
      {/* Show any system alerts or errors */}
      {fetchError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Error loading alerts: {fetchError}</span>
              <button 
                onClick={handleRetry}
                className="flex items-center text-xs underline ml-2 hover:no-underline"
              >
                <RefreshCw size={12} className="mr-1" />
                Try again
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading state for location */}
      {locationLoading && (
        <Alert className="mb-4 border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Getting your location for personalized alerts...
          </AlertDescription>
        </Alert>
      )}

      {/* Location error */}
      {locationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Location error: {locationError}. Using default location for alerts.</span>
              <button 
                onClick={handleRetry}
                className="flex items-center text-xs underline ml-2 hover:no-underline"
              >
                <RefreshCw size={12} className="mr-1" />
                Retry
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ErrorAlertsSection;
