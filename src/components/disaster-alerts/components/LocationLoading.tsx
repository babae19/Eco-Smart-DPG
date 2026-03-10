
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const LocationLoading: React.FC = () => {
  return (
    <CardContent className="py-8">
      <div className="text-center">
        <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-500 animate-pulse" />
        <p className="text-sm text-gray-600">Acquiring GPS location...</p>
        <p className="text-xs text-gray-500 mt-1">Please enable location access for personalized analysis</p>
      </div>
    </CardContent>
  );
};

export default LocationLoading;
