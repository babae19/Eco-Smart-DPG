
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCampaignById, supportCampaign } from '@/services/campaigns';
import { Campaign } from '@/models/Campaign';
import { useToast } from '@/hooks/use-toast';
import { CampaignHeader } from '@/components/campaigns/detail/CampaignHeader';
import { CampaignInfo } from '@/components/campaigns/detail/CampaignInfo';
import { CampaignActions } from '@/components/campaigns/detail/CampaignActions';
import { CampaignDetailsSkeleton } from '@/components/campaigns/detail/CampaignDetailsSkeleton';
import { CampaignDetailsError } from '@/components/campaigns/detail/CampaignDetailsError';
import { CampaignCommunityTab } from '@/components/campaigns/community/CampaignCommunityTab';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Share, Flag, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatorName, setCreatorName] = useState('Community Member');
  const [isSupporting, setIsSupporting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Memoize campaign fetching function to prevent unnecessary re-renders
  const fetchCampaign = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // Start a timer to measure fetch performance
      const startTime = performance.now();
      
      const fetchedCampaign = await getCampaignById(id);
      
      // Log fetch time for performance monitoring
      const fetchTime = Math.round(performance.now() - startTime);
      console.log(`Campaign fetch completed in ${fetchTime}ms`);
      
      if (fetchedCampaign) {
        setCampaign(fetchedCampaign);
        
        // Fetch creator name only if we have a campaign with createdBy
        if (fetchedCampaign.createdBy) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', fetchedCampaign.createdBy)
            .maybeSingle();
            
          if (profileData?.full_name) {
            setCreatorName(profileData.full_name);
          }
        }
      } else {
        setError('Campaign not found');
      }
    } catch (err) {
      console.error('Failed to fetch campaign:', err);
      setError('Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Add cleanup mechanism to avoid state updates after unmount
    let isMounted = true;
    
    const loadCampaign = async () => {
      await fetchCampaign();
      if (!isMounted) return;
    };
    
    loadCampaign();
    
    return () => {
      isMounted = false;
    };
  }, [fetchCampaign]);

  const handleSupport = async () => {
    if (!campaign) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to support this campaign",
        variant: "destructive",
      });
      return;
    }
    
    if (isSupporting) return; // Prevent double clicks
    
    setIsSupporting(true);
    
    try {
      const updatedCampaign = await supportCampaign(campaign.id);
      
      if (updatedCampaign) {
        setCampaign(updatedCampaign);
        toast({
          title: "Thank you!",
          description: "You've successfully supported this campaign",
        });
      } else {
        throw new Error("Failed to update campaign");
      }
    } catch (err: any) {
      console.error('Failed to support campaign:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to support this campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSupporting(false);
    }
  };

  const handleViewMore = () => {
    navigate('/campaigns');
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign?.title || 'Campaign',
        text: campaign?.description || 'Check out this campaign!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Campaign link copied to clipboard",
      });
    }
  };
  
  const handleReport = () => {
    toast({
      title: "Campaign reported",
      description: "Thank you for helping keep our community safe. We'll review this campaign.",
    });
  };

  if (loading) {
    return <CampaignDetailsSkeleton />;
  }

  if (error || !campaign) {
    return <CampaignDetailsError error={error} onGoBack={() => navigate(-1)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-32">
      <Header title={campaign.title} showBackButton />
      
      <CampaignHeader
        imageUrl={campaign.images?.[0] || campaign.imageUrl}
        images={campaign.images || (campaign.imageUrl ? [campaign.imageUrl] : [])}
        title={campaign.title}
      />
      
      <div className="flex justify-end p-2 bg-white border-b">
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share size={16} className="mr-1" />
          Share
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReport}>
          <Flag size={16} className="mr-1" />
          Report
        </Button>
      </div>
      
      {/* Tabs for Details and Community */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="sticky top-0 z-10 bg-white border-b">
          <TabsList className="w-full grid grid-cols-2 h-12 rounded-none">
            <TabsTrigger value="details" className="flex items-center gap-2 data-[state=active]:bg-green-50">
              <Heart size={16} />
              Details
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2 data-[state=active]:bg-green-50">
              <Users size={16} />
              Community
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="details" className="mt-0">
          <CampaignInfo
            campaign={campaign}
            creatorName={creatorName}
          />
        </TabsContent>

        <TabsContent value="community" className="mt-0">
          <CampaignCommunityTab
            campaignId={campaign.id}
            creatorId={campaign.createdBy}
          />
        </TabsContent>
      </Tabs>
      
      <CampaignActions
        onSupport={handleSupport}
        onViewMore={handleViewMore}
        isSupporting={isSupporting}
      />
      
      <BottomNavigation />
    </div>
  );
};

export default CampaignDetails;
