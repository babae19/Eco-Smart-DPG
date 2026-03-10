
import { useState, useEffect, useCallback, useRef } from 'react';
import { Campaign } from '@/models/Campaign';
import { getAllCampaigns, supportCampaign, clearCampaignsCache } from '@/services/campaigns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useCampaigns = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Performance optimization refs
  const isFetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isInitializedRef = useRef(false);
  const connectionAttempts = useRef(0);
  const maxRetries = 3;
  
  // Debounce frequent fetches
  const FETCH_DEBOUNCE_MS = 2000; // Increased to 2 seconds
  
  const fetchCampaigns = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Debounce frequent fetches
    if (!forceRefresh && (now - lastFetchTimeRef.current) < FETCH_DEBOUNCE_MS) {
      logger.debug('Skipping fetch due to debounce', 'useCampaigns');
      return;
    }
    
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      logger.debug('Skipping fetch - already in progress', 'useCampaigns');
      return;
    }
    
    if (!isMountedRef.current) return;
    
    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;
    
    // Only show loading for initial fetch
    if (campaigns.length === 0) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const startTime = performance.now();
      const data = await getAllCampaigns();
      const fetchDuration = Math.round(performance.now() - startTime);
      logger.info(`Fetched ${data.length} campaigns in ${fetchDuration}ms`, 'useCampaigns');
      
      if (!isMountedRef.current) return;
      
      setCampaigns(data);
      
    } catch (error) {
      if (!isMountedRef.current) return;
      
      logger.error("Error fetching campaigns", 'useCampaigns', { error });
      setError(typeof error === 'string' ? error : "Failed to load campaigns");
      
      // Only show toast for initial load errors
      if (campaigns.length === 0) {
        toast({
          title: "Error",
          description: "Failed to load campaigns. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [toast, campaigns.length]);
  
  // Initialize only once
  useEffect(() => {
    isMountedRef.current = true;
    
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    // Initial fetch
    fetchCampaigns();
    
    // Set up subscription with better error handling
    const setupSubscription = () => {
      if (subscriptionRef.current || !isMountedRef.current) return;
      
      console.log('[useCampaigns] Setting up realtime subscription');
      
      try {
        subscriptionRef.current = supabase
          .channel('campaigns-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'campaigns' }, 
            (payload) => {
              console.log('[useCampaigns] Real-time update received:', payload.eventType);
              if (isMountedRef.current && !isFetchingRef.current) {
                // Debounced refetch for real-time updates
                setTimeout(() => {
                  if (isMountedRef.current) {
                    clearCampaignsCache();
                    fetchCampaigns(true);
                  }
                }, 1000);
              }
            }
          )
          .subscribe((status) => {
            console.log('[useCampaigns] Subscription status:', status);
            
            if (status === 'SUBSCRIBED') {
              connectionAttempts.current = 0;
              console.log('[useCampaigns] Subscription established successfully');
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              // Only retry on specific transient errors, not CLOSED
              connectionAttempts.current++;
              
              if (connectionAttempts.current <= maxRetries && isMountedRef.current) {
                console.warn(`[useCampaigns] Subscription error (attempt ${connectionAttempts.current}/${maxRetries}), status: ${status}`);
                
                // Clean up current subscription
                if (subscriptionRef.current) {
                  try {
                    supabase.removeChannel(subscriptionRef.current);
                  } catch (cleanupError) {
                    console.warn('[useCampaigns] Error cleaning up subscription:', cleanupError);
                  }
                  subscriptionRef.current = null;
                }
                
                // Retry with exponential backoff
                const retryDelay = Math.min(Math.pow(2, connectionAttempts.current) * 1000, 30000);
                console.log(`[useCampaigns] Retrying subscription in ${retryDelay}ms...`);
                
                setTimeout(() => {
                  if (isMountedRef.current && connectionAttempts.current <= maxRetries) {
                    setupSubscription();
                  }
                }, retryDelay);
              } else {
                console.error('[useCampaigns] Max subscription retries reached or component unmounted');
              }
            } else if (status === 'CLOSED') {
              // Don't retry on CLOSED status - this is intentional
              console.log('[useCampaigns] Subscription closed - not retrying');
            }
          });
      } catch (subscriptionError) {
        console.error('[useCampaigns] Error setting up subscription:', subscriptionError);
        subscriptionRef.current = null;
      }
    };
    
    // Delay subscription setup to improve initial load performance
    const timeoutId = setTimeout(setupSubscription, 5000);
    
    return () => {
      console.log('[useCampaigns] Cleaning up');
      isMountedRef.current = false;
      clearTimeout(timeoutId);
      
      if (subscriptionRef.current) {
        try {
          supabase.removeChannel(subscriptionRef.current);
        } catch (cleanupError) {
          console.warn('[useCampaigns] Error during cleanup:', cleanupError);
        } finally {
          subscriptionRef.current = null;
        }
      }
    };
  }, []); // Empty dependency array
  
  const handleSupport = useCallback(async (id: string, isAuthenticated: boolean) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to support campaigns",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const updated = await supportCampaign(id);
      if (updated && isMountedRef.current) {
        // Optimistic update
        setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
        
        toast({
          title: "Thank you!",
          description: "You're now supporting this campaign",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error supporting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to support campaign. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);
  
  const addCampaign = useCallback((newCampaign: Campaign) => {
    if (isMountedRef.current) {
      setCampaigns(prev => [newCampaign, ...prev]);
    }
  }, []);
  
  const refresh = useCallback(() => {
    console.log('[useCampaigns] Manual refresh triggered');
    clearCampaignsCache();
    fetchCampaigns(true);
  }, [fetchCampaigns]);
  
  return {
    campaigns,
    loading,
    error,
    handleSupport,
    addCampaign,
    refresh
  };
};
