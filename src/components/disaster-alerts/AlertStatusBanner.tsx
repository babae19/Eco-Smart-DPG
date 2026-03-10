
import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAlerts } from '@/hooks/useAlerts';
import { Alert } from '@/types/AlertTypes';

const AlertStatusBanner: React.FC = () => {
  const { alerts, error, lastUpdated } = useAlerts();
  const [alertStatus, setAlertStatus] = useState<'active' | 'inactive' | 'warning'>('active');
  const [highestSeverityAlert, setHighestSeverityAlert] = useState<Alert | null>(null);
  
  // Determine the highest severity alert and set alert status
  useEffect(() => {
    if (alerts.length === 0) {
      setAlertStatus('inactive');
      setHighestSeverityAlert(null);
      return;
    }
    
    const highSeverityAlert = alerts.find(alert => alert.severity === 'high');
    const mediumSeverityAlert = alerts.find(alert => alert.severity === 'medium');
    
    if (highSeverityAlert) {
      setAlertStatus('warning');
      setHighestSeverityAlert({
        ...highSeverityAlert,
        severity: highSeverityAlert.severity as 'high' | 'medium' | 'low'
      });
    } else if (mediumSeverityAlert) {
      setAlertStatus('active');
      setHighestSeverityAlert({
        ...mediumSeverityAlert,
        severity: mediumSeverityAlert.severity as 'high' | 'medium' | 'low'
      });
    } else {
      setAlertStatus('active');
      setHighestSeverityAlert({
        ...alerts[0],
        severity: (alerts[0].severity || 'low') as 'high' | 'medium' | 'low'
      });
    }
  }, [alerts]);
  
  const getStatusStyles = () => {
    switch (alertStatus) {
      case 'warning':
        return 'from-destructive to-destructive/80';
      case 'active':
        return 'from-success to-success/80';
      case 'inactive':
        return 'from-muted to-muted/80';
    }
  };
  
  return (
    <div className={cn(
      "bg-gradient-to-r text-white p-3 rounded-lg mb-4 shadow-md",
      getStatusStyles()
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {alertStatus === 'warning' ? (
            <AlertTriangle className="mr-2" size={20} />
          ) : (
            <Bell className="mr-2" size={20} />
          )}
          <div>
            <h2 className="text-sm font-semibold">
              Alert Status: {alertStatus === 'warning' ? 'Critical' : alertStatus === 'active' ? 'Active' : 'No Active Alerts'}
            </h2>
            <p className="text-xs opacity-90">
              {highestSeverityAlert 
                ? `${highestSeverityAlert.location}: ${highestSeverityAlert.title}`
                : 'Monitoring for real-time threats'}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-primary-foreground/20 text-primary-foreground border-0 text-xs">
          {lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString()}` : 'Live Updates'}
        </Badge>
      </div>
    </div>
  );
};

export default AlertStatusBanner;
