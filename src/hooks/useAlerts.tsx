
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface DatabaseAlert {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  severity: string;
  status: string;
  created_at: string;
  created_by?: string;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  severity: 'high' | 'medium' | 'low';
  status: string;
  created_at: string;
  created_by?: string;
}

// Helper function to normalize severity values
const normalizeSeverity = (severity: string): 'high' | 'medium' | 'low' => {
  const normalized = severity.toLowerCase();
  if (normalized === 'high' || normalized === 'critical') return 'high';
  if (normalized === 'medium' || normalized === 'moderate') return 'medium';
  return 'low';
};

// Helper function to convert database alert to frontend alert
const convertDatabaseAlert = (dbAlert: DatabaseAlert): Alert => ({
  ...dbAlert,
  severity: normalizeSeverity(dbAlert.severity)
});

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const subscriptionRef = useRef<RealtimeChannel | null>(null);
  const lastFetchTime = useRef<number>(0);
  const isComponentMounted = useRef(true);
  
  // Rate limiting: minimum 2 seconds between fetches
  const RATE_LIMIT_MS = 2000;

  const fetchAlerts = async (force = false) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;
    
    if (!force && timeSinceLastFetch < RATE_LIMIT_MS) {
      console.info('[useAlerts] Rate limited - skipping fetch');
      return;
    }

    try {
      console.info('[useAlerts] Fetching alerts from Supabase');
      lastFetchTime.current = now;
      
      const { data, error: fetchError } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      if (isComponentMounted.current) {
        const convertedAlerts = (data || []).map(convertDatabaseAlert);
        setAlerts(convertedAlerts);
        setError(null);
        setLastUpdated(new Date());
        console.info(`[useAlerts] Successfully fetched ${convertedAlerts.length} alerts`);
      }
    } catch (err) {
      console.error('[useAlerts] Error fetching alerts:', err);
      if (isComponentMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      }
    } finally {
      if (isComponentMounted.current) {
        setLoading(false);
      }
    }
  };

  const setupSubscription = () => {
    // Clean up existing subscription
    if (subscriptionRef.current) {
      console.info('[useAlerts] Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    console.info('[useAlerts] Setting up realtime subscription');
    
    const channel = supabase
      .channel('alerts-changes')
      .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'alerts' 
          }, 
          (payload) => {
            console.info('[useAlerts] Realtime update received:', payload);
            if (isComponentMounted.current) {
              // Force refresh after realtime update
              fetchAlerts(true);
            }
          }
      )
      .subscribe((status) => {
        console.info(`[useAlerts] Subscription status: ${status}`);
      });

    subscriptionRef.current = channel;
  };

  useEffect(() => {
    isComponentMounted.current = true;
    
    // Initial fetch
    fetchAlerts(true);
    
    // Set up realtime subscription
    setupSubscription();

    // Cleanup function
    return () => {
      console.info('[useAlerts] Cleaning up useAlerts hook');
      isComponentMounted.current = false;
      
      if (subscriptionRef.current) {
        console.info('[useAlerts] Cleaning up subscription');
        const status = subscriptionRef.current.state;
        console.info(`[useAlerts] Subscription status: ${status}`);
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);

  return {
    alerts,
    loading,
    error,
    lastUpdated,
    setAlerts,
    refetch: () => fetchAlerts(true)
  };
};
