
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyCampaignsStateProps {
  isAuthenticated: boolean;
  onStartCampaign: () => void;
}

const EmptyCampaignsState: React.FC<EmptyCampaignsStateProps> = ({ 
  isAuthenticated,
  onStartCampaign 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <h3 className="text-lg font-medium text-gray-800 mb-2">No Campaigns Found</h3>
      <p className="text-gray-600 mb-4">
        Be the first to start a campaign for environmental action.
      </p>
      {isAuthenticated ? (
        <Button
          onClick={onStartCampaign}
          className="bg-green-600 hover:bg-green-700"
        >
          Start a Campaign
        </Button>
      ) : (
        <p className="text-sm text-gray-500">Sign in to start a campaign</p>
      )}
    </div>
  );
};

export default EmptyCampaignsState;
