
import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllReports, clearReportsCache } from '@/services/reports/reportFetchService';
import { Report } from '@/services/reports/reportTypes';
import { toast } from '@/hooks/use-toast';

export const useFeedReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  
  // Use ref to track if a fetch is currently in progress
  const isFetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const reportsCacheRef = useRef<Record<string, Report[]>>({});
  const refreshTimerRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  const fetchReports = useCallback(async (showLoadingState = true, useCache = true) => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) return;
    
    // Use cache if available and fresh (less than 3 minutes old)
    if (useCache && reportsCacheRef.current.all && lastFetchTime && 
        (Date.now() - lastFetchTime < 180000)) {
      console.log('[useFeedReports] Using cached data');
      setReports(filter === 'all' ? reportsCacheRef.current.all : 
        reportsCacheRef.current.all.filter(report => report.issueType === filter));
      setLoading(false);
      return;
    }
    
    if (!isMountedRef.current) return;
    
    isFetchingRef.current = true;
    console.log('[useFeedReports] Fetching reports - Start');
    const startTime = performance.now();
    
    if (showLoadingState) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const data = await getAllReports();
      
      if (!isMountedRef.current) return;
      
      const fetchDuration = Math.round(performance.now() - startTime);
      console.log(`[useFeedReports] Fetched ${data.length} reports in ${fetchDuration}ms`);
      setLastFetchTime(Date.now());
      
      if (Array.isArray(data)) {
        // Cache all reports
        reportsCacheRef.current.all = data;
        
        // Pre-cache reports by issue type
        const issueTypes = [...new Set(data.map(report => report.issueType))];
        issueTypes.forEach(type => {
          reportsCacheRef.current[type] = data.filter(report => report.issueType === type);
        });
        
        // Set filtered reports
        setReports(filter === 'all' ? data : data.filter(report => report.issueType === filter));
      } else {
        console.error('[useFeedReports] Invalid data format received:', data);
        setReports([]);
        setError('Received invalid data format from server');
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.error("[useFeedReports] Error fetching reports:", error);
      setError(error instanceof Error ? error.message : 'Failed to load reports');
      
      // Only show toast for fresh errors
      if (!reportsCacheRef.current.all) {
        toast({
          title: "Error Loading Reports",
          description: "Failed to fetch the latest reports.",
          variant: "destructive"
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [filter, lastFetchTime]);

  // Setup background refresh
  const setupBackgroundRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
    }
    
    // Longer refresh interval for better performance
    const refreshInterval = 300000; // 5 minutes
    
    refreshTimerRef.current = window.setTimeout(() => {
      console.log('[useFeedReports] Background auto-refresh triggered');
      fetchReports(false, false);
      setupBackgroundRefresh();
    }, refreshInterval);
  }, [fetchReports]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    // Initial fetch with cache
    fetchReports(true, true);
    
    // Set up background refresh
    setupBackgroundRefresh();
    
    return () => {
      isMountedRef.current = false;
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // Apply filter when it changes
  useEffect(() => {
    if (!loading && reportsCacheRef.current.all) {
      const filteredReports = filter === 'all' 
        ? reportsCacheRef.current.all 
        : reportsCacheRef.current.all.filter(report => report.issueType === filter);
      setReports(filteredReports);
    }
  }, [filter, loading]);

  const handleRetry = useCallback(() => {
    console.log('[useFeedReports] Manual refresh requested');
    clearReportsCache();
    fetchReports(true, false);
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    filter,
    setFilter,
    handleRetry,
    lastFetchTime,
    refresh: handleRetry
  };
};
