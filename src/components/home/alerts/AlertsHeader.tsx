
import React from 'react';
import { Bell, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertsHeaderProps {
  lastUpdated: string | null;
}

const AlertsHeader: React.FC<AlertsHeaderProps> = ({ lastUpdated }) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center">
        <div className="bg-red-100 p-2 rounded-full mr-2">
          <Bell size={16} className={cn("text-red-500")} />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Recent Alerts</h2>
      </div>
      {lastUpdated && (
        <div className="text-xs text-gray-500 flex items-center">
          <Clock size={12} className={cn("mr-1")} />
          Last updated: {lastUpdated}
        </div>
      )}
    </div>
  );
};

export default AlertsHeader;
