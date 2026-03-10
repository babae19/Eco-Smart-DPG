
import { useState, useEffect, useCallback } from 'react';
import { getAllReports } from '@/services/reports/reportFetchService';
import { Report } from '@/services/reports/reportTypes';

export const useRecentReports = (limit = 3) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const fetchReports = useCallback(async () => {
    try {
      console.log('[useRecentReports] Fetching reports with limit:', limit);
      const startTime = performance.now();
      
      const recentReports = await getAllReports(limit);
      
      console.log(`[useRecentReports] Fetched ${recentReports?.length || 0} reports in ${Math.round(performance.now() - startTime)}ms`);
      
      if (Array.isArray(recentReports) && recentReports.length > 0) {
        setReports(recentReports);
        setError(null);
      } else if (Array.isArray(recentReports) && recentReports.length === 0) {
        console.log('[useRecentReports] No reports found');
        setReports([]);
        setError(null); // Don't treat empty results as an error
      } else {
        console.error('[useRecentReports] Invalid data format received:', recentReports);
        setReports([]);
        setError('Received invalid data from server');
      }
    } catch (error) {
      console.error("[useRecentReports] Error fetching reports:", error);
      setError(error instanceof Error ? error.message : 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);
  
  useEffect(() => {
    fetchReports();
  }, [fetchReports, retryCount]);
  
  // Function to manually retry fetching reports
  const retryFetch = () => {
    console.log('[useRecentReports] Retrying fetch...');
    setLoading(true);
    setRetryCount(prevCount => prevCount + 1);
  };
  
  return { reports, loading, error, retryFetch };
};
