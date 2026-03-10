
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import CampaignCard from '@/components/CampaignCard';
import { Button } from '@/components/ui/button';
import { Filter, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaigns } from '@/components/campaigns/useCampaigns';

const AllCampaigns: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { campaigns, loading } = useCampaigns(); // Use shared hook
  const [filter, setFilter] = useState<string>('all');
  
  const goalTypes = ['All', 'Raise Awareness', 'Fundraising', 'Community Engagement', 'Educational Campaign', 'Environmental Action'];
  
  // Memoize filtered campaigns to avoid unnecessary recalculation
  const filteredCampaigns = useMemo(() => {
    if (filter === 'all' || filter === 'All') {
      return campaigns;
    }
    return campaigns.filter(campaign => campaign.goal === filter);
  }, [campaigns, filter]);
  
  const handleSupport = async (id: string) => {
    navigate(`/campaign/${id}`);
  };
  
  // Enhanced loading state with proper skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header title="All Campaigns" showBackButton />
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="h-7 bg-gray-200 rounded animate-pulse w-40"></div>
            {isAuthenticated && (
              <div className="h-9 bg-gray-200 rounded animate-pulse w-36"></div>
            )}
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {goalTypes.map((_, index) => (
              <div key={index} className="h-9 bg-gray-200 rounded animate-pulse min-w-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-72 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="All Campaigns" showBackButton />
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Community Campaigns</h1>
          {isAuthenticated && (
            <Button 
              onClick={() => navigate('/create-campaign')}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Plus size={16} className="mr-1" /> Start a Campaign
            </Button>
          )}
        </div>
        
        <div className="mb-4 overflow-x-auto pb-2">
          <div className="flex gap-2">
            {goalTypes.map((type, index) => (
              <Button
                key={index}
                variant={filter === type || (filter === 'all' && type === 'All') ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(type === 'All' ? 'all' : type)}
                className="whitespace-nowrap"
              >
                {index === 0 && <Filter size={14} className="mr-1" />}
                {type}
              </Button>
            ))}
          </div>
        </div>
        
        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCampaigns.map(campaign => (
              <div key={campaign.id}>
                <CampaignCard 
                  campaign={campaign} 
                  onSupport={handleSupport} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Campaigns Found</h3>
            <p className="text-gray-600 mb-4">
              There are no campaigns matching your current filter criteria.
            </p>
            <Button
              onClick={() => setFilter('all')}
              variant="outline"
            >
              Clear Filter
            </Button>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default AllCampaigns;
