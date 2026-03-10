
import React from 'react';
import { Shield } from 'lucide-react';

const NoLocationAlert: React.FC = () => {
  return (
    <div className="bg-green-50 border border-green-100 rounded-lg p-4">
      <div className="flex items-start">
        <Shield className="text-green-500 mt-0.5 mr-2" size={16} />
        <div>
          <h3 className="font-medium text-green-700">No Alerts For Your Location</h3>
          <p className="text-sm text-green-600 mt-1">
            Based on your current location, we don't detect any immediate threats. 
            Stay safe and monitor for any changes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoLocationAlert;
