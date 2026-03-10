
import React from 'react';
import { AlertTriangle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GeneralAlertsSectionProps {
  children: React.ReactNode;
}

const GeneralAlertsSection: React.FC<GeneralAlertsSectionProps> = ({ children }) => {
  return (
    <div>
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-2">
              <AlertTriangle className="text-blue-600" size={18} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">General Alerts</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-xs flex items-center">
            <Filter size={14} className="mr-1" />
            Filter
          </Button>
        </div>
      </div>
      
      {children}
    </div>
  );
};

export default GeneralAlertsSection;
