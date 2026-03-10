
import { supabase } from '@/integrations/supabase/client';
import { Report } from './reportTypes';
import { mapDbReport } from './reportUtils';

// Get all reports with cache management
const cachedReports: { data: Report[] | null, timestamp: number | null } = {
  data: null,
  timestamp: null
};

// Cache expiry time in milliseconds (5 minutes for better performance)
const CACHE_EXPIRY = 5 * 60 * 1000;

// Get all reports (optimized with limit)
export const getAllReports = async (limit: number = 50): Promise<Report[]> => {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (cachedReports.data && cachedReports.timestamp && 
        (now - cachedReports.timestamp < CACHE_EXPIRY)) {
      console.log('Using cached reports data');
      return limit < 50 ? cachedReports.data.slice(0, limit) : cachedReports.data;
    }
    
    console.log('Fetching fresh reports data from Supabase');
    const { data, error } = await supabase
      .from('reports')
      .select('id, title, description, location, issue_type, upvotes, likes, created_at, created_by, status, images')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching reports:', error);
      // Return cached data if available, even if expired
      if (cachedReports.data) {
        return limit < 50 ? cachedReports.data.slice(0, limit) : cachedReports.data;
      }
      return [];
    }
    
    const reports = await Promise.all(data.map(dbReport => mapDbReport(dbReport, false)));
    
    // Update cache only if fetching full dataset
    if (limit >= 50) {
      cachedReports.data = reports;
      cachedReports.timestamp = now;
    }
    
    return reports;
  } catch (error) {
    console.error('Error in getAllReports:', error);
    // Return cached data if available, even if expired
    if (cachedReports.data) {
      return limit < 50 ? cachedReports.data.slice(0, limit) : cachedReports.data;
    }
    return [];
  }
};

// Get a single report by ID with individual caching
const reportCache: Record<string, { data: Report, timestamp: number }> = {};

// Get a single report by ID
export const getReportById = async (id: string): Promise<Report | undefined> => {
  try {
    // Check if report is in cache and fresh
    const now = Date.now();
    if (reportCache[id] && (now - reportCache[id].timestamp < CACHE_EXPIRY)) {
      console.log(`Using cached data for report ${id}`);
      return reportCache[id].data;
    }
    
    console.log(`Fetching report ${id} from Supabase`);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching report:', error);
      // Return cached version if available even if expired
      return reportCache[id]?.data;
    }
    
    const report = await mapDbReport(data, true);
    
    // Update cache
    reportCache[id] = {
      data: report,
      timestamp: now
    };
    
    return report;
  } catch (error) {
    console.error('Error in getReportById:', error);
    // Return cached version if available
    return reportCache[id]?.data;
  }
};

// Get images for a specific report (lazy loading)
export const getReportImages = async (reportId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('images')
      .eq('id', reportId)
      .single();
    
    if (error || !data?.images) {
      return [];
    }
    
    return Array.isArray(data.images) ? data.images : [];
  } catch (error) {
    console.error('Error fetching report images:', error);
    return [];
  }
};

// Clear cache function (can be called after create/update operations)
export const clearReportsCache = () => {
  cachedReports.data = null;
  cachedReports.timestamp = null;
};
