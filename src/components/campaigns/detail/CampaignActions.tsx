import React from 'react';
import { Heart, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useViewportSize } from '@/hooks/useViewportSize';

interface CampaignActionsProps {
  onSupport: () => void;
  onViewMore: () => void;
  isSupporting?: boolean;
  onJoin?: () => void;
  isJoining?: boolean;
  isMember?: boolean;
}

export const CampaignActions = ({ 
  onSupport, 
  onViewMore, 
  isSupporting = false,
  onJoin,
  isJoining = false,
  isMember = false,
}: CampaignActionsProps) => {
  const { isMobile, isSmallMobile } = useViewportSize();

  const handleSupportClick = () => {
    console.log('Support button clicked');
    onSupport();
  };

  const handleViewMoreClick = () => {
    console.log('View more button clicked');
    onViewMore();
  };

  // Calculate proper bottom spacing to avoid navigation overlap
  const bottomSpacing = isMobile ? 'bottom-20' : 'bottom-4';
  const containerPadding = isSmallMobile ? 'p-3' : 'p-4';
  const buttonSize = isMobile ? 'lg' : 'default';

  return (
    <div className={`fixed ${bottomSpacing} left-0 right-0 ${containerPadding} bg-white border-t border-gray-200 shadow-md z-10 safe-area-inset-bottom`}>
      <div className={`flex gap-2 ${isMobile ? 'max-w-full' : 'max-w-md'} mx-auto`}>
        <Button 
          onClick={handleSupportClick}
          className="flex-1 bg-green-600 hover:bg-green-700 font-medium focus:ring-2 focus:ring-green-500 active:scale-95 transition-transform touch-manipulation"
          size={buttonSize}
          disabled={isSupporting}
        >
          <Heart size={isMobile ? 20 : 18} className="mr-2" fill="white" />
          {isSupporting ? 'Supporting...' : 'Support'}
        </Button>
        
        {onJoin && !isMember && (
          <Button 
            onClick={onJoin}
            variant="outline"
            className="flex-1 border-green-600 text-green-600 hover:bg-green-50 font-medium focus:ring-2 focus:ring-green-500 active:scale-95 transition-transform touch-manipulation"
            size={buttonSize}
            disabled={isJoining}
          >
            <Users size={isMobile ? 20 : 18} className="mr-2" />
            {isJoining ? 'Joining...' : 'Join'}
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={handleViewMoreClick}
          className="flex-none focus:ring-2 focus:ring-green-500 active:scale-95 transition-transform touch-manipulation min-w-[48px]"
          size={buttonSize}
        >
          <ArrowRight size={isMobile ? 20 : 18} />
        </Button>
      </div>
    </div>
  );
};
