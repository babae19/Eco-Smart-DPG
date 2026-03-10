
import React from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';

interface CampaignDetailsErrorProps {
  error: string;
  onGoBack: () => void;
}

export const CampaignDetailsError = ({ error, onGoBack }: CampaignDetailsErrorProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Campaign Details" showBackButton />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || "The campaign you're looking for doesn't exist or has been removed."}
          </p>
          <Button onClick={onGoBack}>
            Go Back
          </Button>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};
