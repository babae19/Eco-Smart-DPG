import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from '@/models/Campaign';
import CampaignsList from '@/components/campaigns/CampaignsList';
import EmptyCampaignsState from '@/components/campaigns/EmptyCampaignsState';
import { getAllCampaigns } from '@/services/campaigns/campaignQueryService';
import { supportCampaign } from '@/services/campaigns/campaignInteractionService';

const FastCampaignsSection: React.FC = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Memoize the limited campaigns for performance
  const limitedCampaigns = useMemo(() => {
    return campaigns.slice(0, 10);
  }, [campaigns]);
  
  // Fetch campaigns once on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await getAllCampaigns();
        setCampaigns(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaigns();
  }, []);

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
  
  const handleSupport = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to support campaigns",
        variant: "destructive",
      });
      return;
    }

    try {
      await supportCampaign(id);
      
      // Optimistic update
      setCampaigns(prev => prev.map(c => 
        c.id === id ? { ...c, supporters: c.supporters + 1 } : c
      ));
      
      toast({
        title: "Campaign supported!",
        description: "Thank you for your support",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to support campaign",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, toast]);

  // Error state
  if (error && !loading && campaigns.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h2 className="text-lg font-semibold text-foreground">Campaigns</h2>
          <Button 
            onClick={handleStartCampaign}
            variant="default"
            size="sm"
          >
            <Plus size={16} className="mr-1" /> Start a Campaign
          </Button>
        </div>
        
        <div className="bg-card rounded-lg p-6 text-center border border-destructive/20">
          <p className="text-destructive mb-2">Failed to load campaigns</p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
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
          <h2 className="text-lg font-semibold text-foreground">Campaigns</h2>
          <Button 
            onClick={navigateToAllCampaigns}
            variant="ghost"
            size="sm"
            className="hover:bg-accent -ml-2"
          >
            View all <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
        <Button 
          onClick={handleStartCampaign}
          variant="default"
          size="sm"
        >
          <Plus size={16} className="mr-1" /> Start a Campaign
        </Button>
      </div>
      
      {!loading && limitedCampaigns.length === 0 ? (
        <EmptyCampaignsState 
          isAuthenticated={isAuthenticated}
          onStartCampaign={handleStartCampaign}
        />
      ) : (
        <CampaignsList 
          campaigns={limitedCampaigns}
          onSupport={handleSupport}
          loading={loading}
        />
      )}
    </div>
  );
};

export default React.memo(FastCampaignsSection);
