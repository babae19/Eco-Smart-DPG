import React from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import CampaignForm from '@/components/CampaignForm';
import { useNavigate } from 'react-router-dom';
import { Campaign } from '@/models/Campaign';

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();

  const handleCampaignCreated = (newCampaign: Campaign) => {
    // Navigate to the campaign details page or campaigns list
    navigate('/campaigns');
  };

  const handleCancel = () => {
    // Navigate back to campaigns page
    navigate('/campaigns');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="Create Campaign" showBackButton />
      
      <div className="p-4">
        <CampaignForm 
          onCampaignCreated={handleCampaignCreated}
          onCancel={handleCancel}
        />
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default CreateCampaign;