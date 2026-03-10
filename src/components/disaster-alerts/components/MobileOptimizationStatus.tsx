
import React from 'react';
import { Smartphone } from 'lucide-react';

interface MobileOptimizationStatusProps {
  isMobile: boolean;
  hasLocation: boolean;
}

const MobileOptimizationStatus: React.FC<MobileOptimizationStatusProps> = ({
  isMobile,
  hasLocation
}) => {
  if (!isMobile || !hasLocation) return null;

  return (
    <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg text-sm">
      <div className="flex items-center text-green-800 mb-2">
        <Smartphone className="h-4 w-4 mr-2" />
        <span className="font-medium">Mobile Location Active</span>
      </div>
      <div className="text-green-700 text-xs grid grid-cols-2 gap-2">
        <div>✓ Continuous tracking</div>
        <div>✓ Real-time alerts</div>
        <div>✓ Battery optimized</div>
        <div>✓ Touch interface</div>
      </div>
    </div>
  );
};

export default MobileOptimizationStatus;
