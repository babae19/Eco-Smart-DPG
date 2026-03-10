
import React from 'react';
import { AlertTriangle, MapPin, ChevronRight, Bell } from 'lucide-react';
import { Alert } from '@/types/AlertTypes';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AlertContentProps {
  highestAlert: Alert;
  style: {
    bgColor: string;
    borderColor: string;
    iconColor: string;
    textColor: string;
    icon: React.ReactNode;
  };
  alerts: Alert[];
  userRiskLevel?: string;
}

const AlertContent: React.FC<AlertContentProps> = ({ 
  highestAlert,
  style,
  alerts,
  userRiskLevel
}) => {
  // Get the time part from the ISO string
  const getFormattedTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Recent';
    }
  };
  
  return (
    <div className={`rounded-lg border ${style.borderColor} ${style.bgColor} p-4 relative overflow-hidden`}>
      <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
      
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {style.icon || <AlertTriangle className={style.iconColor} size={24} />}
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold text-lg ${style.textColor}`}>
              {highestAlert.title}
            </h3>
            
            <Badge variant={highestAlert.severity === 'high' ? 'destructive' : 'outline'} 
              className={highestAlert.isNew ? 'animate-pulse' : ''}>
              {highestAlert.severity === 'high' ? 'Critical' : 
               highestAlert.severity === 'medium' ? 'Warning' : 'Advisory'}
            </Badge>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
            {highestAlert.description}
          </p>
          
          <div className="flex flex-wrap items-center text-xs text-gray-500 gap-3">
            {highestAlert.location && (
              <div className="flex items-center">
                <MapPin size={12} className="mr-1" />
                <span>{highestAlert.location}</span>
              </div>
            )}
            
            {highestAlert.date && (
              <div className="flex items-center">
                <Bell size={12} className="mr-1" />
                <span>Issued at {getFormattedTime(highestAlert.date)}</span>
              </div>
            )}
            
            {userRiskLevel && (
              <div className={cn(
                "px-2 py-0.5 rounded text-white text-xs ml-auto",
                userRiskLevel === 'high' ? 'bg-red-500' : 
                userRiskLevel === 'medium' ? 'bg-amber-500' : 'bg-green-500'
              )}>
                {userRiskLevel.charAt(0).toUpperCase() + userRiskLevel.slice(1)} Risk
              </div>
            )}
          </div>
          
          {alerts.length > 1 && (
            <div className="mt-3 flex justify-end">
              <button className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                View {alerts.length - 1} more alerts <ChevronRight size={12} className="ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertContent;
