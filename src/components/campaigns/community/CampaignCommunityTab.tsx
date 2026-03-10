import React from 'react';
import { Users, MessageCircle, LogIn, LogOut, Lock, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CampaignCommunityChat } from './CampaignCommunityChat';
import { CampaignMembersList } from './CampaignMembersList';
import { useCampaignCommunity } from '@/hooks/useCampaignCommunity';
import { useAuth } from '@/contexts/AuthContext';

interface CampaignCommunityTabProps {
  campaignId: string;
  creatorId?: string;
}

export const CampaignCommunityTab: React.FC<CampaignCommunityTabProps> = ({
  campaignId,
  creatorId,
}) => {
  const { user, isAuthenticated } = useAuth();
  const {
    isMember,
    isCreator,
    members,
    memberCount,
    isJoining,
    isLeaving,
    join,
    leave,
    removeMember,
    messages,
    isSendingMessage,
    sendMessage,
    deleteMessage,
    isLoading,
    error,
  } = useCampaignCommunity(campaignId, creatorId);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Join the Community
        </h3>
        <p className="text-muted-foreground mb-4">
          Sign in to join this campaign's community and chat with other members.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <a href="/login">Sign In</a>
        </Button>
      </div>
    );
  }

  // Not a member (and not creator)
  if (!isMember && !isCreator) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Join the Community
        </h3>
        <p className="text-muted-foreground mb-2">
          {memberCount} members have already joined this campaign.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Join to access the community chat and connect with other supporters.
        </p>
        <Button
          onClick={join}
          disabled={isJoining}
          className="bg-primary hover:bg-primary/90"
        >
          <LogIn size={18} className="mr-2" />
          {isJoining ? 'Joining...' : 'Join Community'}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header with member info and leave button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Users size={18} className="text-primary" />
          </div>
          <div>
            <span className="font-semibold text-foreground">{memberCount} Members</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-success font-medium">Live</span>
            </div>
          </div>
          {isCreator && (
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
              Creator
            </Badge>
          )}
        </div>
        
        {!isCreator && (
          <Button
            variant="outline"
            size="sm"
            onClick={leave}
            disabled={isLeaving}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <LogOut size={14} className="mr-1" />
            {isLeaving ? 'Leaving...' : 'Leave'}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm border border-destructive/20">
          {error}
        </div>
      )}

      {/* Tabs for Chat and Members */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle size={16} />
            Chat
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users size={16} />
            Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-4">
          <CampaignCommunityChat
            messages={messages}
            isSending={isSendingMessage}
            isCreator={isCreator}
            onSendMessage={sendMessage}
            onDeleteMessage={deleteMessage}
          />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <CampaignMembersList
            members={members}
            isCreator={isCreator}
            creatorId={creatorId}
            currentUserId={user?.id}
            onRemoveMember={removeMember}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
