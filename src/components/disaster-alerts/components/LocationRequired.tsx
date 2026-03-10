
import React from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LocationRequired: React.FC = () => {
  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <div className="flex items-start">
          <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Location Required for AI Analysis</p>
            <p className="text-sm mt-1">
              Enable GPS location to receive personalized disaster risk analysis based on your precise coordinates and local conditions.
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default LocationRequired;
