
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LocationErrorDisplayProps {
  locationError: string | null;
}

const LocationErrorDisplay: React.FC<LocationErrorDisplayProps> = ({ locationError }) => {
  if (!locationError) return null;

  return (
    <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-sm text-red-700">
      <div className="flex items-start">
        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <strong>Location Error:</strong> {locationError}
        </div>
      </div>
    </div>
  );
};

export default LocationErrorDisplay;
