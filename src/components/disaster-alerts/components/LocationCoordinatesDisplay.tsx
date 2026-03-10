
import React from 'react';

interface LocationCoordinatesDisplayProps {
  latitude: number | null;
  longitude: number | null;
  isMobile: boolean;
}

const LocationCoordinatesDisplay: React.FC<LocationCoordinatesDisplayProps> = ({
  latitude,
  longitude,
  isMobile
}) => {
  if (!latitude || !longitude) return null;

  return (
    <div className="text-xs text-gray-500 border-t pt-3 bg-gray-50 -mx-4 px-4 -mb-4 pb-4">
      <div className="flex items-center justify-between">
        <span>📍 Coordinates:</span>
        <span className="font-mono">
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </span>
      </div>
      {isMobile && (
        <div className="text-green-600 mt-1 text-center">
          • Mobile GPS Active • High Precision Mode •
        </div>
      )}
    </div>
  );
};

export default LocationCoordinatesDisplay;
