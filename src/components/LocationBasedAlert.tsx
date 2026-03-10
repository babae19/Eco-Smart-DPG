
import React, { useEffect, useRef, useMemo } from 'react';
import { Info, MapPin } from 'lucide-react';
import { Alert } from '@/types/AlertTypes';
import { useToast } from '@/hooks/use-toast';
import { useLocationAlerts } from '@/hooks/useLocationAlerts';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { getSeverityStyles } from './alerts/StylesConfig';
import NoLocationAlert from './alerts/NoLocationAlert';
import LoadingAlert from './alerts/LoadingAlert';
import AlertContent from './alerts/AlertContent';

interface LocationBasedAlertProps {
  latitude: number;
  longitude: number;
}

const LocationBasedAlert: React.FC<LocationBasedAlertProps> = ({ 
  latitude, 
  longitude 
}) => {
  const { toast } = useToast();
  const isInitializedRef = useRef(false);
  const lastLocationRef = useRef<string>('');
  
  // Create stable location key to prevent unnecessary re-renders
  const locationKey = useMemo(() => {
    if (!latitude || !longitude) return null;
    return `${latitude.toFixed(6)}-${longitude.toFixed(6)}`;
  }, [latitude, longitude]);
  
  // Use our custom hooks for location-based alerts
  const { 
    alerts, 
    highestAlert, 
    loading, 
    setAlerts,
    setHighestAlert 
  } = useLocationAlerts(latitude, longitude);
  
  // Add a new alert (ensuring no duplicates)
  const addAlert = React.useCallback((newAlert: Alert) => {
    console.log('[LocationBasedAlert] Adding new alert:', newAlert.id);
    setAlerts(prev => {
      if (!prev.some(a => a.id === newAlert.id)) {
        return [newAlert, ...prev];
      }
      return prev;
    });
  }, [setAlerts]);
  
  // Update the highest alert if needed
  const updateHighestAlert = React.useCallback((newAlert: Alert) => {
    console.log('[LocationBasedAlert] Checking if alert should be highest priority:', newAlert.id);
    if (newAlert.severity === 'high' || (newAlert.severity === 'medium' && (!highestAlert || highestAlert.severity === 'low'))) {
      setHighestAlert(newAlert);
    }
  }, [highestAlert, setHighestAlert]);
  
  // Set up realtime alert listening only once per location
  useRealtimeAlerts({
    latitude,
    longitude,
    addAlert,
    updateHighestAlert
  });

  // Track initialization and location changes
  useEffect(() => {
    if (locationKey && locationKey !== lastLocationRef.current) {
      console.log('[LocationBasedAlert] Location changed:', { 
        previous: lastLocationRef.current,
        current: locationKey,
        hasCoordinates: Boolean(latitude && longitude),
        alertsCount: alerts.length, 
        highestAlert: highestAlert?.id,
        loading 
      });
      
      lastLocationRef.current = locationKey;
      isInitializedRef.current = true;
    }
  }, [locationKey, alerts.length, highestAlert, loading]);
  
  if (loading) {
    return <LoadingAlert />;
  }
  
  if (!highestAlert) {
    return <NoLocationAlert />;
  }
  
  const style = getSeverityStyles(highestAlert.severity);
  
  return (
    <AlertContent 
      highestAlert={highestAlert}
      style={style}
      alerts={alerts}
    />
  );
};

export default LocationBasedAlert;
