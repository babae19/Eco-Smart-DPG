
import { Campaign } from '../../models/Campaign';
import { supabase } from '@/integrations/supabase/client';
import { mapDbCampaign } from './campaignMapper';
import { toast } from '@/hooks/use-toast';
import { validateCampaignInput, sanitizeText } from '@/utils/validation';

/**
 * Creates a new campaign
 */
export const createCampaign = async (
  campaign: Omit<Campaign, 'id' | 'createdAt' | 'supporters' | 'status' | 'createdBy'>
): Promise<Campaign | undefined> => {
  try {
    const user = supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be logged in to create a campaign');
    }

    // Validate input data
    const validation = validateCampaignInput({
      title: campaign.title,
      description: campaign.description,
      goal: campaign.goal
    });

    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return undefined;
    }
    
    const { data, error } = await supabase
      .from('campaigns')
      .insert([{
        title: sanitizeText(campaign.title),
        goal: sanitizeText(campaign.goal),
        end_date: campaign.endDate.toISOString(),
        image_url: campaign.imageUrl,
        images: campaign.images,
        description: campaign.description ? sanitizeText(campaign.description) : '',
        created_by: (await user).data.user?.id,
        // Auto-approve all campaigns
        status: 'approved'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating campaign:', error);
      return undefined;
    }
    
    // Show toast notification for successful creation
    if (typeof window !== 'undefined') {
      toast({
        title: "Campaign Created",
        description: "Your campaign has been created and is now live!",
        variant: "default",
      });
    }
    
    return mapDbCampaign(data);
  } catch (error) {
    console.error('Error in createCampaign:', error);
    return undefined;
  }
};

/**
 * Deletes a campaign (only owner or admin can delete)
 */
export const deleteCampaign = async (id: string): Promise<boolean> => {
  try {
    // Check if user is authenticated
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error('User not authenticated');
      return false;
    }

    // Get the campaign to verify ownership or admin status
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !campaign) {
      console.error('Campaign not found:', fetchError);
      return false;
    }

    // Check if user is the owner
    const isOwner = campaign.created_by === user.user.id;

    // Check if user is admin (if not owner) using user_roles table
    let isAdmin = false;
    if (!isOwner) {
      const { data: role, error: roleError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      isAdmin = !roleError && !!role;
    }

    // Only allow deletion if user is owner or admin
    if (!isOwner && !isAdmin) {
      console.error('User is not authorized to delete this campaign');
      return false;
    }

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting campaign:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteCampaign:', error);
    return false;
  }
};
