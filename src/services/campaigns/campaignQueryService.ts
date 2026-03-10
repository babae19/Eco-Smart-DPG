
import { Campaign } from '@/models/Campaign';
import { supabase } from '@/integrations/supabase/client';
import { mapDbCampaign } from './campaignMapper';

// Enhanced cache mechanism for campaigns
const campaignsCache: {
  data: Campaign[] | null;
  timestamp: number | null;
  promise: Promise<Campaign[]> | null; // Prevent duplicate requests
} = {
  data: null,
  timestamp: null,
  promise: null
};

// Single campaign cache
const singleCampaignCache: Record<string, {
  data: Campaign;
  timestamp: number;
}> = {};

// Increased cache expiry time for better performance (10 minutes)
const CACHE_EXPIRY = 10 * 60 * 1000;

/**
 * Fetches all campaigns with enhanced caching and deduplication
 */
export const getAllCampaigns = async (): Promise<Campaign[]> => {
  try {
    const now = Date.now();
    
    // Check for valid cache first
    if (campaignsCache.data && campaignsCache.timestamp && 
        (now - campaignsCache.timestamp < CACHE_EXPIRY)) {
      console.log('[campaignQueryService] Using cached campaigns data');
      return campaignsCache.data;
    }
    
    // If there's already a request in progress, wait for it
    if (campaignsCache.promise) {
      console.log('[campaignQueryService] Waiting for existing campaigns request');
      return await campaignsCache.promise;
    }
    
    // Create and cache the promise to prevent duplicate requests
    campaignsCache.promise = fetchCampaignsFromDB();
    
    try {
      const campaigns = await campaignsCache.promise;
      
      // Update cache
      campaignsCache.data = campaigns;
      campaignsCache.timestamp = now;
      
      console.log(`[campaignQueryService] Cached ${campaigns.length} campaigns`);
      return campaigns;
    } finally {
      // Clear the promise after completion
      campaignsCache.promise = null;
    }
    
  } catch (error) {
    console.error('[campaignQueryService] Error in getAllCampaigns:', error);
    
    // Clear the promise on error
    campaignsCache.promise = null;
    
    // Return cached data if available, otherwise throw
    if (campaignsCache.data) {
      console.log('[campaignQueryService] Returning cached data due to error');
      return campaignsCache.data;
    }
    throw error;
  }
};

/**
 * Internal function to fetch campaigns from database
 */
async function fetchCampaignsFromDB(): Promise<Campaign[]> {
  console.log('[campaignQueryService] Fetching campaigns from Supabase');
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('[campaignQueryService] Error fetching campaigns:', error);
    throw new Error(error.message);
  }
  
  // Map data from DB format to frontend format
  return data.map(mapDbCampaign);
}

/**
 * Fetches a single campaign by ID with caching
 */
export const getCampaignById = async (id: string): Promise<Campaign> => {
  try {
    // Check for valid cache for this campaign
    const now = Date.now();
    if (singleCampaignCache[id] && 
        (now - singleCampaignCache[id].timestamp < CACHE_EXPIRY)) {
      console.log(`[campaignQueryService] Using cached data for campaign ${id}`);
      return singleCampaignCache[id].data;
    }
    
    // Check if campaign exists in the main campaigns cache
    if (campaignsCache.data) {
      const campaign = campaignsCache.data.find(c => c.id === id);
      if (campaign) {
        console.log(`[campaignQueryService] Found campaign ${id} in main cache`);
        // Update single campaign cache
        singleCampaignCache[id] = {
          data: campaign,
          timestamp: now
        };
        return campaign;
      }
    }
    
    console.log(`[campaignQueryService] Fetching campaign ${id} from Supabase`);
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('[campaignQueryService] Error fetching campaign:', error);
      throw new Error(error.message);
    }
    
    if (!data) {
      throw new Error('Campaign not found');
    }
    
    // Map the campaign
    const campaign = mapDbCampaign(data);
    
    // Update cache
    singleCampaignCache[id] = {
      data: campaign,
      timestamp: now
    };
    
    return campaign;
  } catch (error) {
    console.error('[campaignQueryService] Error in getCampaignById:', error);
    throw error;
  }
};

/**
 * Clears all campaign caches
 */
export const clearCampaignsCache = () => {
  campaignsCache.data = null;
  campaignsCache.timestamp = null;
  campaignsCache.promise = null;
  Object.keys(singleCampaignCache).forEach(key => {
    delete singleCampaignCache[key];
  });
  console.log('[campaignQueryService] Cleared all campaigns cache');
};

/**
 * Clears a single campaign from cache
 */
export const clearCampaignCache = (id: string) => {
  if (singleCampaignCache[id]) {
    delete singleCampaignCache[id];
  }
  
  // Also clear full cache since it might contain this campaign
  campaignsCache.data = null;
  campaignsCache.timestamp = null;
  campaignsCache.promise = null;
  console.log(`[campaignQueryService] Cleared cache for campaign ${id}`);
};
