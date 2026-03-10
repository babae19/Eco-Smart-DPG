import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  CampaignMember,
  ChatMessage,
  isUserCampaignMember,
  joinCampaign,
  leaveCampaign,
  getCampaignMembers,
  getCampaignMemberCount,
  removeCampaignMember,
  sendChatMessage,
  getChatMessages,
  deleteChatMessage,
} from '@/services/campaigns/campaignMemberService';

interface UseCampaignCommunityResult {
  // Membership
  isMember: boolean;
  isCreator: boolean;
  members: CampaignMember[];
  memberCount: number;
  isJoining: boolean;
  isLeaving: boolean;
  join: () => Promise<void>;
  leave: () => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  
  // Chat
  messages: ChatMessage[];
  isSendingMessage: boolean;
  sendMessage: (message: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useCampaignCommunity = (
  campaignId: string,
  creatorId?: string
): UseCampaignCommunityResult => {
  const { user, isAuthenticated } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [members, setMembers] = useState<CampaignMember[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCreator = user?.id === creatorId;

  const fetchData = useCallback(async () => {
    if (!campaignId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch member count (always available)
      const count = await getCampaignMemberCount(campaignId);
      setMemberCount(count);

      if (isAuthenticated) {
        // Check membership
        const memberStatus = await isUserCampaignMember(campaignId);
        setIsMember(memberStatus);

        // If member or creator, fetch full data
        if (memberStatus || isCreator) {
          const [membersData, messagesData] = await Promise.all([
            getCampaignMembers(campaignId),
            getChatMessages(campaignId),
          ]);
          setMembers(membersData);
          setMessages(messagesData);
        }
      }
    } catch (err) {
      console.error('Error fetching community data:', err);
      setError('Failed to load community data');
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, isAuthenticated, isCreator]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!campaignId || (!isMember && !isCreator)) return;

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`campaign-messages-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_chat_messages',
          filter: `campaign_id=eq.${campaignId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as any;
            // Fetch profile for new message
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', newMsg.user_id)
              .maybeSingle();

            setMessages(prev => [...prev, {
              id: newMsg.id,
              campaignId: newMsg.campaign_id,
              userId: newMsg.user_id,
              message: newMsg.message,
              isDeleted: newMsg.is_deleted ?? false,
              deletedBy: newMsg.deleted_by,
              createdAt: newMsg.created_at,
              profile: profile ? {
                fullName: profile.full_name,
                avatarUrl: profile.avatar_url,
              } : undefined,
            }]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as any;
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMsg.id
                ? { ...msg, isDeleted: updatedMsg.is_deleted, deletedBy: updatedMsg.deleted_by }
                : msg
            ));
          }
        }
      )
      .subscribe();

    // Subscribe to member changes
    const membersChannel = supabase
      .channel(`campaign-members-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_members',
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          // Refresh members list on any change
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(membersChannel);
    };
  }, [campaignId, isMember, isCreator, fetchData]);

  const join = useCallback(async () => {
    if (!isAuthenticated) {
      setError('You must be logged in to join');
      return;
    }
    
    setIsJoining(true);
    try {
      await joinCampaign(campaignId);
      setIsMember(true);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsJoining(false);
    }
  }, [campaignId, isAuthenticated, fetchData]);

  const leave = useCallback(async () => {
    setIsLeaving(true);
    try {
      await leaveCampaign(campaignId);
      setIsMember(false);
      setMessages([]);
      setMembers([]);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLeaving(false);
    }
  }, [campaignId, fetchData]);

  const handleRemoveMember = useCallback(async (memberId: string) => {
    try {
      await removeCampaignMember(campaignId, memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      setMemberCount(prev => prev - 1);
    } catch (err: any) {
      setError(err.message);
    }
  }, [campaignId]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    setIsSendingMessage(true);
    try {
      await sendChatMessage(campaignId, message);
      // Message will be added via realtime subscription
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSendingMessage(false);
    }
  }, [campaignId]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await deleteChatMessage(messageId);
      // Update will come via realtime subscription
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  return {
    isMember,
    isCreator,
    members,
    memberCount,
    isJoining,
    isLeaving,
    join,
    leave,
    removeMember: handleRemoveMember,
    messages,
    isSendingMessage,
    sendMessage: handleSendMessage,
    deleteMessage: handleDeleteMessage,
    isLoading,
    error,
    refresh: fetchData,
  };
};
