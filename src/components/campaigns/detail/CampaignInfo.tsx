
import React from 'react';
import { Calendar, Users, User, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Campaign } from '@/models/Campaign';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CampaignInfoProps {
  campaign: Campaign;
  creatorName: string;
}

export const CampaignInfo = React.memo(({ campaign, creatorName }: CampaignInfoProps) => {
  // Calculate days remaining
  const daysRemaining = differenceInDays(campaign.endDate, new Date());
  const isUrgent = daysRemaining <= 7;
  
  // Calculate support progress percentage
  const targetSupport = Math.max(1000, campaign.supporters * 2);
  const progressPercentage = Math.min(100, (campaign.supporters / targetSupport) * 100);
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Badge variant={campaign.goal === 'Environmental Action' ? 'default' : 'outline'} 
                className={campaign.goal === 'Environmental Action' ? "bg-green-600 hover:bg-green-700" : ""}>
            {campaign.goal}
          </Badge>
          
          {isUrgent && (
            <Badge variant="destructive" className="animate-pulse">
              <Clock size={12} className="mr-1" /> Urgent
            </Badge>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <User size={16} className="mr-1" />
            <span>{creatorName}</span>
          </div>
          <div className="flex items-center">
            <Calendar size={16} className="mr-1" />
            <span>Ends {format(campaign.endDate, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center">
            <Users size={16} className="mr-1" />
            <span>{campaign.supporters} supporters</span>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Support progress</span>
            <span className="text-sm font-medium">{campaign.supporters} / {targetSupport}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <h2 className="text-xl font-semibold mb-2">About this Campaign</h2>
        <p className="text-gray-700 mb-4 whitespace-pre-line">
          {campaign.description || `This campaign aims to address ${campaign.goal.toLowerCase()} challenges by engaging the community and creating 
          sustainable solutions. Join us in making a difference for our environment and future generations.`}
        </p>
        
        <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
          <p className="text-sm text-gray-600">
            Started by <span className="font-medium">{creatorName}</span> on {format(campaign.createdAt, 'MMMM d, yyyy')}. 
            We need your support to reach our goals and create meaningful change.
          </p>
        </div>
      </div>
    </div>
  );
});

// Display name for React DevTools
CampaignInfo.displayName = 'CampaignInfo';
