
import React from 'react';
import { Alert } from '@/types/AlertTypes';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, Clock, History, Cloud, Thermometer, Droplets, Wind } from 'lucide-react';
import RiskLevelChart from './RiskLevelChart';
import RiskFactorBadge from './RiskFactorBadge';
import { Skeleton } from '@/components/ui/skeleton';

interface AlertDetectedRisksProps {
  alerts: Alert[];
  isLoading?: boolean;
}

const getAlertIcon = (alertType: string | undefined) => {
  switch (alertType?.toLowerCase()) {
    case 'flooding':
    case 'precipitation':
      return <Droplets className="h-4 w-4 text-blue-600" />;
    case 'landslide':
      return <AlertCircle className="h-4 w-4 text-amber-600" />;
    case 'fire outbreak':
    case 'fire':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    case 'disease outbreak':
      return <Thermometer className="h-4 w-4 text-purple-600" />;
    case 'temperature':
      return <Thermometer className="h-4 w-4 text-orange-600" />;
    case 'drought':
      return <Thermometer className="h-4 w-4 text-yellow-600" />;
    case 'wind':
    case 'storm':
      return <Wind className="h-4 w-4 text-slate-600" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  }
};

const getSeverityStyle = (severity: string) => {
  switch (severity) {
    case 'high':
      return { 
        containerClass: "bg-gradient-to-r from-red-50 to-red-100 border-red-200",
        textClass: "text-red-800",
        badgeVariant: "destructive" as const
      };
    case 'medium':
      return { 
        containerClass: "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200",
        textClass: "text-amber-800",
        badgeVariant: "warning" as const
      };
    default:
      return { 
        containerClass: "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200",
        textClass: "text-blue-800",
        badgeVariant: "secondary" as const
      };
  }
};

const AlertDetectedRisks: React.FC<AlertDetectedRisksProps> = ({ alerts, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium mb-1">Detected Risks:</h3>
        {[1, 2].map((i) => (
          <div key={i} className="border rounded-md p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <div className="flex flex-wrap gap-2 mb-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!alerts || alerts.length === 0) {
    return (
      <div className="border rounded-md p-4 bg-gray-50 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No risks detected at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-1">Detected Risks:</h3>
      
      {alerts.map((alert) => {
        const style = getSeverityStyle(alert.severity);
        
        return (
          <div 
            key={alert.id}
            className={cn(
              "border rounded-md p-4 transition-all shadow-sm",
              style.containerClass
            )}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                {getAlertIcon(alert.type)}
                <h4 className={cn("font-medium text-sm ml-2", style.textClass)}>
                  {alert.title}
                </h4>
              </div>
              <Badge variant={style.badgeVariant} className={alert.isNew ? 'animate-pulse' : ''}>
                {alert.severity.toUpperCase()}
              </Badge>
            </div>
            
            {alert.aiPredictionScore !== undefined && (
              <div className="mb-3">
                <RiskLevelChart 
                  riskScore={alert.aiPredictionScore * 100} 
                  updatedAt={new Date()} 
                />
              </div>
            )}
            
            <p className={cn("text-sm mb-3", style.textClass)}>
              {alert.description}
            </p>
            
            {/* Risk factors as badges */}
            {(alert.weatherFactor || alert.historicalPattern) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {alert.weatherFactor && (
                  <RiskFactorBadge factor={alert.weatherFactor} />
                )}
                {alert.historicalPattern && (
                  <RiskFactorBadge 
                    factor="Historical Pattern" 
                    className="bg-purple-50 text-purple-700 border-purple-100" 
                  />
                )}
              </div>
            )}
            
            {(alert.historicalPattern || alert.weatherFactor || alert.predictedImpact) && (
              <div className="mt-3 pt-3 border-t border-opacity-30 text-xs space-y-2">
                {alert.historicalPattern && (
                  <div className="flex items-start">
                    <History className="h-3.5 w-3.5 mr-2 flex-shrink-0 mt-0.5 opacity-70" />
                    <span className={cn("opacity-90", style.textClass)}>{alert.historicalPattern}</span>
                  </div>
                )}
                
                {alert.weatherFactor && (
                  <div className="flex items-start">
                    <Cloud className="h-3.5 w-3.5 mr-2 flex-shrink-0 mt-0.5 opacity-70" />
                    <span className={cn("opacity-90", style.textClass)}>{alert.weatherFactor}</span>
                  </div>
                )}
                
                {alert.predictedImpact && (
                  <div className="flex items-start">
                    <Clock className="h-3.5 w-3.5 mr-2 flex-shrink-0 mt-0.5 opacity-70" />
                    <span className={cn("opacity-90", style.textClass)}>Timeframe: {alert.predictedImpact}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AlertDetectedRisks;
