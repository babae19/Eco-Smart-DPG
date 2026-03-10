
import React, { useState, useMemo, useCallback } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CampaignForm from './CampaignForm';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from '@/models/Campaign';
import CampaignsList from './campaigns/CampaignsList';
import EmptyCampaignsState from './campaigns/EmptyCampaignsState';
import { useCampaigns } from './campaigns/useCampaigns';

const CampaignsSection: React.FC = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const { campaigns, loading, error, handleSupport, addCampaign, refresh } = useCampaigns();
  
  // Memoize the limited campaigns for performance
  const limitedCampaigns = useMemo(() => {
    return campaigns.slice(0, 10);
  }, [campaigns]);
  
  const handleCampaignCreated = useCallback((newCampaign: Campaign) => {
    addCampaign(newCampaign);
    setShowForm(false);
    toast({
      title: "Campaign Created",
      description: "Your campaign has been created successfully and is now live!",
    });
  }, [addCampaign, toast]);

  const navigateToAllCampaigns = useCallback(() => {
    navigate('/campaigns');
  }, [navigate]);
  
  const handleStartCampaign = useCallback(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to start a campaign",
        variant: "destructive",
      });
      return;
    }
    navigate('/create-campaign');
  }, [isAuthenticated, toast, navigate]);

  // Error state
  if (error && !loading && campaigns.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Campaigns</h2>
          <Button 
            onClick={handleStartCampaign}
            variant="default"
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            size="sm"
          >
            <Plus size={16} className="mr-1" /> Start a Campaign
          </Button>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center border border-red-200">
          <p className="text-red-600 mb-2">Failed to load campaigns</p>
          <Button onClick={refresh} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Campaigns</h2>
          <Button 
            onClick={navigateToAllCampaigns}
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700 hover:bg-green-50 -ml-2"
          >
            View all <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
        <Button 
          onClick={handleStartCampaign}
          variant="default"
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          size="sm"
        >
          <Plus size={16} className="mr-1" /> Start a Campaign
        </Button>
      </div>
      
      {showForm ? (
        <CampaignForm 
          onCampaignCreated={handleCampaignCreated} 
          onCancel={() => setShowForm(false)} 
        />
      ) : (
        <>
          {!loading && limitedCampaigns.length === 0 ? (
            <EmptyCampaignsState 
              isAuthenticated={isAuthenticated}
              onStartCampaign={handleStartCampaign}
            />
          ) : (
            <CampaignsList 
              campaigns={limitedCampaigns}
              onSupport={(id) => handleSupport(id, isAuthenticated)}
              loading={loading}
            />
          )}
        </>
      )}
    </div>
  );
};

export default React.memo(CampaignsSection);
