
import { Campaign } from '../../models/Campaign';
import { supabase } from '@/integrations/supabase/client';
import { mapDbCampaign } from './campaignMapper';

// Helper to check admin status from user_roles table
const checkAdminRole = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  return !error && !!data;
};

/**
 * Admin function to approve a campaign
 */
export const approveCampaign = async (campaignId: string): Promise<Campaign | undefined> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error('User not authenticated');
      return undefined;
    }

    const isAdmin = await checkAdminRole(user.user.id);
    if (!isAdmin) {
      console.error('User is not authorized to approve campaigns');
      return undefined;
    }

    const { data, error } = await supabase
      .from('campaigns')
      .update({ status: 'approved' })
      .eq('id', campaignId)
      .select()
      .single();
    
    if (error) {
      console.error('Error approving campaign:', error);
      return undefined;
    }
    
    return mapDbCampaign(data);
  } catch (error) {
    console.error('Error in approveCampaign:', error);
    return undefined;
  }
};

/**
 * Admin function to reject a campaign
 */
export const rejectCampaign = async (campaignId: string): Promise<Campaign | undefined> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error('User not authenticated');
      return undefined;
    }

    const isAdmin = await checkAdminRole(user.user.id);
    if (!isAdmin) {
      console.error('User is not authorized to reject campaigns');
      return undefined;
    }

    const { data, error } = await supabase
      .from('campaigns')
      .update({ status: 'rejected' })
      .eq('id', campaignId)
      .select()
      .single();
    
    if (error) {
      console.error('Error rejecting campaign:', error);
      return undefined;
    }
    
    return mapDbCampaign(data);
  } catch (error) {
    console.error('Error in rejectCampaign:', error);
    return undefined;
  }
};
