
import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CampaignCard from '../CampaignCard';
import { Campaign } from '@/models/Campaign';
import { Skeleton } from '@/components/ui/skeleton';

interface CampaignsListProps {
  campaigns: Campaign[];
  onSupport: (id: string) => void;
  loading?: boolean;
}

const CampaignsList: React.FC<CampaignsListProps> = ({ campaigns, onSupport, loading = false }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Memoize calculations to avoid unnecessary recalculations
  const { visibleCampaigns, canScrollLeft, canScrollRight, totalPages } = useMemo(() => {
    const itemsPerPage = 5;
    const visible = campaigns.slice(activeIndex, activeIndex + itemsPerPage);
    const canLeft = activeIndex > 0;
    const canRight = activeIndex + itemsPerPage < campaigns.length;
    const pages = Math.ceil(campaigns.length / itemsPerPage);
    
    return {
      visibleCampaigns: visible,
      canScrollLeft: canLeft,
      canScrollRight: canRight,
      totalPages: pages
    };
  }, [campaigns, activeIndex]);
  
  const scrollLeft = useCallback(() => {
    if (canScrollLeft) {
      setActiveIndex(prev => Math.max(0, prev - 1));
    }
  }, [canScrollLeft]);
  
  const scrollRight = useCallback(() => {
    if (canScrollRight) {
      setActiveIndex(prev => prev + 1);
    }
  }, [canScrollRight]);
  
  // Loading skeleton
  if (loading) {
    return (
      <div className="relative">
        <div className="flex overflow-x-auto gap-2 pb-4 hide-scrollbar">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="min-w-[250px] max-w-[250px]">
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="relative">
        <div className="flex overflow-x-auto gap-2 pb-4 hide-scrollbar">
          {visibleCampaigns.map(campaign => (
            <div key={campaign.id} className="min-w-[250px] max-w-[250px]">
              <CampaignCard 
                campaign={campaign} 
                onSupport={onSupport} 
              />
            </div>
          ))}
        </div>
        
        {canScrollLeft && (
          <button 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow z-10"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        
        {canScrollRight && (
          <button 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow z-10"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-2">
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i * 5 <= activeIndex && activeIndex < (i + 1) * 5 
                    ? 'bg-green-600' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(CampaignsList);
