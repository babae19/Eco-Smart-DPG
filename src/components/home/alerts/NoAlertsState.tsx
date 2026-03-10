
import React from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';

const NoAlertsState: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
      <div className="flex justify-center mb-2">
        <AlertTriangle size={16} className="text-yellow-500" />
      </div>
      <p className="text-gray-600 text-sm">No alerts at this time</p>
      <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
        <MapPin size={12} className="mr-1" />
        <span>Enable location for personalized alerts</span>
      </div>
    </div>
  );
};

export default NoAlertsState;
