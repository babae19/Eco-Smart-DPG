import React from 'react';
import { UserMinus, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CampaignMember } from '@/services/campaigns/campaignMemberService';
import { format } from 'date-fns';

interface CampaignMembersListProps {
  members: CampaignMember[];
  isCreator: boolean;
  creatorId?: string;
  currentUserId?: string;
  onRemoveMember: (memberId: string) => Promise<void>;
}

export const CampaignMembersList: React.FC<CampaignMembersListProps> = ({
  members,
  isCreator,
  creatorId,
  currentUserId,
  onRemoveMember,
}) => {
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name[0].toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Community Members</h3>
        <p className="text-xs text-gray-500">{members.length} members</p>
      </div>

      <ScrollArea className="h-[300px]">
        {members.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm p-4">
            No members yet
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {members.map((member) => {
              const isMemberCreator = member.userId === creatorId;
              const isCurrentUser = member.userId === currentUserId;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.profile?.avatarUrl || ''} />
                      <AvatarFallback className="bg-green-100 text-green-800">
                        {getInitials(member.profile?.fullName)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {member.profile?.fullName || 'Anonymous'}
                        </span>
                        {isMemberCreator && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield size={10} className="mr-1" />
                            Creator
                          </Badge>
                        )}
                        {isCurrentUser && !isMemberCreator && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock size={10} className="mr-1" />
                        Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>

                  {isCreator && !isMemberCreator && !isCurrentUser && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <UserMinus size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {member.profile?.fullName || 'this member'} from the campaign? 
                            They will no longer have access to the community chat.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onRemoveMember(member.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
