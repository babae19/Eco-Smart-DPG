
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/models/Campaign';
import { mapDbCampaign } from './campaignMapper';
import { clearCampaignCache, getCampaignById } from './campaignQueryService';

/**
 * Auto-add user as campaign member when they support
 */
const autoJoinCampaignCommunity = async (campaignId: string, userId: string): Promise<void> => {
  try {
    // Check if already a member
    const { data: existingMember } = await supabase
      .from('campaign_members')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('user_id', userId)
      .maybeSingle();

    // If not already a member, add them
    if (!existingMember) {
      const { error } = await supabase
        .from('campaign_members')
        .insert({
          campaign_id: campaignId,
          user_id: userId,
          notifications_enabled: true,
        });

      if (error) {
        console.error('Error auto-joining campaign community:', error);
        // Don't throw - this is a secondary action
      } else {
        console.log('User automatically added to campaign community');
      }
    }
  } catch (error) {
    console.error('Error in autoJoinCampaignCommunity:', error);
    // Don't throw - supporting the campaign should still succeed
  }
};

/**
 * Updates the supporters count for a campaign and auto-adds user to community
 */
export const supportCampaign = async (id: string): Promise<Campaign | null> => {
  try {
    // First get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error('User must be authenticated to support campaigns');
    }

    // Get current campaign to check status
    const { data: campaignData, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !campaignData) {
      console.error('Error fetching campaign to support:', fetchError);
      throw new Error('Campaign not found');
    }

    // Verify campaign is approved
    if (campaignData.status !== 'approved') {
      throw new Error('Cannot support campaigns that are not approved');
    }

    // Update the supporters count
    const { data, error } = await supabase
      .from('campaigns')
      .update({ supporters: (campaignData.supporters || 0) + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error supporting campaign:', error);
      throw new Error(`Failed to support campaign: ${error.message}`);
    }

    // Auto-add supporter to campaign community
    await autoJoinCampaignCommunity(id, userData.user.id);

    // Clear cache for this campaign
    clearCampaignCache(id);

    // Return the updated campaign
    return mapDbCampaign(data);
  } catch (error) {
    console.error('Error in supportCampaign:', error);
    throw error;
  }
};
