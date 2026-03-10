
import React, { useState, useCallback } from 'react';
import { Users, Calendar, Target, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { Campaign } from '@/models/Campaign';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { DeleteDialog } from './ui/DeleteDialog';
import { deleteCampaign } from '@/services/campaigns';
import { toast } from '@/hooks/use-toast';
import CampaignGallery from './campaigns/CampaignGallery';

interface CampaignCardProps {
  campaign: Campaign;
  onSupport: (id: string) => void;
  onDelete?: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onSupport, onDelete }) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const handleCardClick = useCallback(() => {
    navigate(`/campaign/${campaign.id}`);
  }, [navigate, campaign.id]);
  
  const handleSupportClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    
    // Add timeout to prevent multiple rapid clicks
    setTimeout(() => {
      onSupport(campaign.id);
      setIsLoading(false);
    }, 300);
  }, [onSupport, campaign.id]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  }, []);

  const handleDelete = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await deleteCampaign(campaign.id);
      if (success) {
        toast({
          title: "Campaign Deleted",
          description: "Your campaign has been successfully deleted",
        });
        onDelete?.();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the campaign",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the campaign",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
      setIsLoading(false);
    }
  }, [campaign.id, onDelete]);
  
  const getStatusBadge = () => {
    switch (campaign.status) {
      case 'approved':
        return <Badge className="bg-green-600 hover:bg-green-700 absolute top-2 right-2"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 hover:bg-red-700 absolute top-2 right-2"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-warning hover:bg-warning/90 text-warning-foreground absolute top-2 right-2"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };
  
  return (
    <>
      <div 
        className="flex flex-col bg-card rounded-lg shadow-md overflow-hidden mb-4 cursor-pointer transition-transform hover:scale-[1.01]"
        onClick={handleCardClick}
      >
        <CampaignGallery 
          images={campaign.images || (campaign.imageUrl ? [campaign.imageUrl] : [])} 
          title={campaign.title}
        />
        
        <div className="relative p-4">
          {getStatusBadge()}
          {user && campaign.createdBy === user.id && (
            <button
              onClick={handleDeleteClick}
              className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
              disabled={isLoading}
              aria-label="Delete campaign"
            >
              <Trash2 size={14} />
            </button>
          )}
          
          <h3 className="text-lg font-semibold mb-2 text-foreground">{campaign.title}</h3>
          
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <Target size={14} className="mr-1" />
            <span>{campaign.goal}</span>
            <span className="mx-2">•</span>
            <Calendar size={14} className="mr-1" />
            <span>Ends {format(new Date(campaign.endDate), 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center text-sm">
              <Users size={16} className="text-green-600 mr-1" />
              <span className="font-medium">{campaign.supporters}</span>
              <span className="text-gray-500 ml-1">supporters</span>
            </div>
            
            {campaign.status === 'approved' && (
              <Button 
                size="sm" 
                variant="default" 
                onClick={handleSupportClick}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Supporting...' : 'Support'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign? This action cannot be undone."
      />
    </>
  );
};

export default React.memo(CampaignCard);
