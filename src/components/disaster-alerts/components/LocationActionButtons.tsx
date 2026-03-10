
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Navigation } from 'lucide-react';

interface LocationActionButtonsProps {
  refreshLocation: () => void;
  refreshAlerts: () => void;
  hasLocation: boolean;
  locationLoading: boolean;
  isAnalyzing: boolean;
  isLoading: boolean;
}

const LocationActionButtons: React.FC<LocationActionButtonsProps> = ({
  refreshLocation,
  refreshAlerts,
  hasLocation,
  locationLoading,
  isAnalyzing,
  isLoading
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <Button 
        variant="outline" 
        onClick={refreshLocation}
        disabled={isLoading}
        className="hover:bg-blue-50 touch-manipulation min-h-[48px] flex-1 text-sm"
      >
        {locationLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        {locationLoading ? 'Getting Location...' : 'Refresh Location'}
      </Button>
      
      {hasLocation && (
        <Button 
          variant="outline" 
          onClick={refreshAlerts}
          disabled={isAnalyzing}
          className="hover:bg-green-50 touch-manipulation min-h-[48px] flex-1 text-sm"
        >
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4 mr-2" />
          )}
          {isAnalyzing ? 'Analyzing Area...' : 'Check Proximity'}
        </Button>
      )}
    </div>
  );
};

export default LocationActionButtons;
