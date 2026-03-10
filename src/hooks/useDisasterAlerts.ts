
import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from '@/types/AlertTypes';
import { useUserLocation } from '@/contexts/LocationContext';
import { useAlertFilters } from '@/hooks/alerts/useAlertFilters';
import { fetchDatabaseAlerts } from '@/hooks/alerts/useDatabaseAlerts';
import { generateSimulatedAlerts } from '@/hooks/alerts/useSimulatedAlerts';
import { generatePersonalizedAlerts } from '@/hooks/alerts/usePersonalizedAlerts';
import { sortAlertsByPriority } from '@/hooks/alerts/useAlertSorting';

export const useDisasterAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [animateAlerts, setAnimateAlerts] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { latitude, longitude, lastUpdated } = useUserLocation();
  const { filter, setFilter, filterAlerts } = useAlertFilters();
  
  // Refs to prevent excessive calls
  const lastFetchRef = useRef<number>(0);
  const locationKeyRef = useRef<string>('');
  const isMountedRef = useRef(true);
  
  // Function to fetch alerts from various sources
  const fetchAlerts = useCallback(async () => {
    // Rate limiting: prevent fetching more than once every 10 seconds
    const now = Date.now();
    if (now - lastFetchRef.current < 10000) {
      console.log('[useDisasterAlerts] Rate limited - skipping fetch');
      return;
    }
    
    if (!isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      lastFetchRef.current = now;
      console.log('[useDisasterAlerts] Fetching alerts...');
      let allAlerts: Alert[] = [];
      
      try {
        // 1. Fetch existing alerts from database
        const databaseAlerts = await fetchDatabaseAlerts();
        console.log(`[useDisasterAlerts] Fetched ${databaseAlerts.length} database alerts`);
        allAlerts = [...allAlerts, ...databaseAlerts];
      } catch (dbError) {
        console.error('[useDisasterAlerts] Error fetching database alerts:', dbError);
      }
      
      try {
        // 2. Generate simulated alerts only if no database alerts
        if (allAlerts.length === 0) {
          const simulatedAlerts = generateSimulatedAlerts();
          console.log(`[useDisasterAlerts] Generated ${simulatedAlerts.length} simulated alerts`);
          allAlerts = [...allAlerts, ...simulatedAlerts];
        }
      } catch (simError) {
        console.error('[useDisasterAlerts] Error generating simulated alerts:', simError);
      }
      
      try {
        // 3. Generate personalized alerts based on location if available
        if (latitude && longitude) {
          const locationKey = `${Math.round(latitude * 100)}-${Math.round(longitude * 100)}`;
          
          // Only generate if location changed significantly
          if (locationKey !== locationKeyRef.current) {
            console.log(`[useDisasterAlerts] Generating personalized alerts for new location`);
            const personalizedAlerts = generatePersonalizedAlerts(latitude, longitude);
            console.log(`[useDisasterAlerts] Generated ${personalizedAlerts.length} personalized alerts`);
            allAlerts = [...personalizedAlerts, ...allAlerts];
            locationKeyRef.current = locationKey;
          }
        }
      } catch (persError) {
        console.error('[useDisasterAlerts] Error generating personalized alerts:', persError);
      }
      
      // Sort alerts by severity and timestamp
      const sortedAlerts = sortAlertsByPriority(allAlerts);
      console.log(`[useDisasterAlerts] Total alerts after sorting: ${sortedAlerts.length}`);
      
      if (isMountedRef.current) {
        setAlerts(sortedAlerts);
        setFetchError(null);
        
        // Animate the alerts section if there are new alerts
        if (sortedAlerts.some(alert => alert.isNew)) {
          setAnimateAlerts(true);
          setTimeout(() => setAnimateAlerts(false), 2000);
        }
      }
    } catch (error) {
      console.error('[useDisasterAlerts] Error in fetchAlerts:', error);
      if (isMountedRef.current) {
        setFetchError(error instanceof Error ? error.message : 'Unknown error fetching alerts');
        
        // If all fetches fail, set some default emergency alerts so UI isn't empty
        if (alerts.length === 0) {
          setAlerts([{
            id: `fallback-${Date.now()}`,
            title: "Emergency Alert System",
            description: "Unable to fetch live alerts. Please check your connection and try again later.",
            severity: "medium",
            location: "Freetown",
            date: new Date().toISOString(),
            isNew: false,
            type: "system"
          }]);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [latitude, longitude, alerts.length]);
  
  // Fetch alerts on mount and whenever location is significantly updated
  useEffect(() => {
    isMountedRef.current = true;
    
    const locationKey = latitude && longitude ? `${Math.round(latitude * 100)}-${Math.round(longitude * 100)}` : '';
    
    // Only fetch if location changed significantly or it's the first load
    if (locationKey !== locationKeyRef.current || alerts.length === 0) {
      console.log('[useDisasterAlerts] Setting up alerts with location update:', { latitude, longitude });
      fetchAlerts();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [latitude, longitude, lastUpdated]); // Remove fetchAlerts from deps to prevent infinite loops
  
  // Filter alerts based on the selected filter
  const filteredAlerts = filterAlerts(alerts);
  
  return {
    alerts,
    filteredAlerts,
    filter,
    setFilter,
    animateAlerts,
    isLoading,
    fetchError,
    refreshAlerts: fetchAlerts
  };
};
