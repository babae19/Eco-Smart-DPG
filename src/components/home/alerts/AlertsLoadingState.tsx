
import React from 'react';

const AlertsLoadingState: React.FC = () => {
  return (
    <div className="space-y-3">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 border border-gray-100 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

export default AlertsLoadingState;
