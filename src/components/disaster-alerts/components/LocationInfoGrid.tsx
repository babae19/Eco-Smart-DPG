
import React from 'react';

interface LocationInfoGridProps {
  accuracy: number | null;
  lastUpdateTime: Date | null;
  isMobile: boolean;
  hyperLocalAlerts: any[];
  isAnalyzing: boolean;
}

const LocationInfoGrid: React.FC<LocationInfoGridProps> = ({
  accuracy,
  lastUpdateTime,
  isMobile,
  hyperLocalAlerts,
  isAnalyzing
}) => {
  const getAccuracyText = () => {
    if (!accuracy) return 'Getting location...';
    if (accuracy <= 10) return 'Excellent';
    if (accuracy <= 30) return 'Good';
    if (accuracy <= 100) return 'Fair';
    return 'Poor';
  };

  const getAccuracyColor = () => {
    if (!accuracy) return 'text-gray-500';
    if (accuracy <= 10) return 'text-green-600';
    if (accuracy <= 30) return 'text-blue-600';
    if (accuracy <= 100) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
      <div className="p-3 bg-white rounded-lg border">
        <span className="text-gray-600 text-xs block mb-1">Accuracy</span>
        <div className={`font-medium ${getAccuracyColor()}`}>
          {accuracy ? `±${Math.round(accuracy)}m` : 'Unknown'}
        </div>
        <div className="text-xs text-gray-500">{getAccuracyText()}</div>
      </div>
      <div className="p-3 bg-white rounded-lg border">
        <span className="text-gray-600 text-xs block mb-1">Last Updated</span>
        <div className="font-medium text-gray-900">
          {lastUpdateTime ? lastUpdateTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : 'Never'}
        </div>
        <div className="text-xs text-gray-500">
          {lastUpdateTime ? 'Active tracking' : 'Waiting...'}
        </div>
      </div>
      <div className="p-3 bg-white rounded-lg border">
        <span className="text-gray-600 text-xs block mb-1">Device Type</span>
        <div className="font-medium text-gray-900">
          {isMobile ? 'Mobile Device' : 'Desktop Browser'}
        </div>
        <div className="text-xs text-gray-500">
          {isMobile ? 'GPS enabled' : 'Network location'}
        </div>
      </div>
      <div className="p-3 bg-white rounded-lg border">
        <span className="text-gray-600 text-xs block mb-1">Alerts Status</span>
        <div className="font-medium text-gray-900">
          {hyperLocalAlerts.length} Active
        </div>
        <div className="text-xs text-gray-500">
          {isAnalyzing ? 'Analyzing...' : 'Monitoring'}
        </div>
      </div>
    </div>
  );
};

export default LocationInfoGrid;
