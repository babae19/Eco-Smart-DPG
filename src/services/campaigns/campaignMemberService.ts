import { supabase } from '@/integrations/supabase/client';

export interface CampaignMember {
  id: string;
  campaignId: string;
  userId: string;
  joinedAt: string;
  notificationsEnabled: boolean;
  profile?: {
    fullName: string | null;
    avatarUrl: string | null;
  };
}

export interface ChatMessage {
  id: string;
  campaignId: string;
  userId: string;
  message: string;
  isDeleted: boolean;
  deletedBy: string | null;
  createdAt: string;
  profile?: {
    fullName: string | null;
    avatarUrl: string | null;
  };
}

// Type for raw chat message from database
interface DbChatMessage {
  id: string;
  campaign_id: string;
  user_id: string;
  message: string;
  is_deleted: boolean;
  deleted_by: string | null;
  created_at: string;
}

/**
 * Check if user is a member of a campaign
 */
export const isUserCampaignMember = async (campaignId: string): Promise<boolean> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data, error } = await supabase
    .from('campaign_members')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('user_id', userData.user.id)
    .maybeSingle();

  return !error && !!data;
};

/**
 * Join a campaign
 */
export const joinCampaign = async (campaignId: string): Promise<CampaignMember | null> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('User must be authenticated to join campaigns');
  }

  // Check if already a member
  const isMember = await isUserCampaignMember(campaignId);
  if (isMember) {
    throw new Error('Already a member of this campaign');
  }

  const { data, error } = await supabase
    .from('campaign_members')
    .insert({
      campaign_id: campaignId,
      user_id: userData.user.id,
      notifications_enabled: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error joining campaign:', error);
    throw new Error(`Failed to join campaign: ${error.message}`);
  }

  return {
    id: data.id,
    campaignId: data.campaign_id,
    userId: data.user_id,
    joinedAt: data.joined_at,
    notificationsEnabled: data.notifications_enabled ?? true,
  };
};

/**
 * Leave a campaign
 */
export const leaveCampaign = async (campaignId: string): Promise<void> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('User must be authenticated to leave campaigns');
  }

  const { error } = await supabase
    .from('campaign_members')
    .delete()
    .eq('campaign_id', campaignId)
    .eq('user_id', userData.user.id);

  if (error) {
    console.error('Error leaving campaign:', error);
    throw new Error(`Failed to leave campaign: ${error.message}`);
  }
};

/**
 * Get campaign members with profiles
 */
export const getCampaignMembers = async (campaignId: string): Promise<CampaignMember[]> => {
  const { data, error } = await supabase
    .from('campaign_members')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('joined_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaign members:', error);
    return [];
  }

  // Fetch profiles for all members
  const userIds = data.map(m => m.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  return data.map(member => ({
    id: member.id,
    campaignId: member.campaign_id,
    userId: member.user_id,
    joinedAt: member.joined_at,
    notificationsEnabled: member.notifications_enabled ?? true,
    profile: profileMap.get(member.user_id) ? {
      fullName: profileMap.get(member.user_id)!.full_name,
      avatarUrl: profileMap.get(member.user_id)!.avatar_url,
    } : undefined,
  }));
};

/**
 * Get member count for a campaign
 */
export const getCampaignMemberCount = async (campaignId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('campaign_members')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId);

  if (error) {
    console.error('Error fetching member count:', error);
    return 0;
  }

  return count || 0;
};

/**
 * Remove a member (creator moderation)
 */
export const removeCampaignMember = async (campaignId: string, memberId: string): Promise<void> => {
  const { error } = await supabase
    .from('campaign_members')
    .delete()
    .eq('id', memberId)
    .eq('campaign_id', campaignId);

  if (error) {
    console.error('Error removing member:', error);
    throw new Error(`Failed to remove member: ${error.message}`);
  }
};

/**
 * Send a chat message
 */
export const sendChatMessage = async (campaignId: string, message: string): Promise<ChatMessage | null> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('User must be authenticated to send messages');
  }

  const { data, error } = await supabase
    .from('campaign_chat_messages')
    .insert({
      campaign_id: campaignId,
      user_id: userData.user.id,
      message: message.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw new Error(`Failed to send message: ${error.message}`);
  }

  return {
    id: data.id,
    campaignId: data.campaign_id,
    userId: data.user_id,
    message: data.message,
    isDeleted: data.is_deleted ?? false,
    deletedBy: data.deleted_by,
    createdAt: data.created_at,
  };
};

/**
 * Get chat messages for a campaign
 */
export const getChatMessages = async (campaignId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('campaign_chat_messages')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  const messages = data || [];

  // Fetch profiles for all message authors
  const userIds = [...new Set(messages.map(m => m.user_id))];
  
  if (userIds.length === 0) {
    return [];
  }
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  return messages.map(msg => ({
    id: msg.id,
    campaignId: msg.campaign_id,
    userId: msg.user_id,
    message: msg.message,
    isDeleted: msg.is_deleted ?? false,
    deletedBy: msg.deleted_by,
    createdAt: msg.created_at,
    profile: profileMap.get(msg.user_id) ? {
      fullName: profileMap.get(msg.user_id)!.full_name,
      avatarUrl: profileMap.get(msg.user_id)!.avatar_url,
    } : undefined,
  }));
};

/**
 * Delete a chat message (soft delete)
 */
export const deleteChatMessage = async (messageId: string): Promise<void> => {
  const { data: userData } = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from('campaign_chat_messages')
    .update({
      is_deleted: true,
      deleted_by: userData.user?.id,
    })
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting message:', error);
    throw new Error(`Failed to delete message: ${error.message}`);
  }
};
