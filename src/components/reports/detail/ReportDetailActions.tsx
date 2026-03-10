
import React from 'react';
import { ChevronUp, ThumbsUp, Share2, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportDetailActionsProps {
  reportId: string;
  upvotes: number;
  likes: number;
  onUpvote: () => void;
  onLike: () => void;
}

export const ReportDetailActions: React.FC<ReportDetailActionsProps> = ({ 
  reportId,
  upvotes,
  likes,
  onUpvote,
  onLike
}) => {
  const { toast } = useToast();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Community Report',
        text: 'Check out this community report',
        url: window.location.href,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Report URL copied to clipboard"
      });
    }
  };
  
  const handleReport = () => {
    toast({
      title: "Report Flagged",
      description: "Thank you for flagging this report. Our team will review it."
    });
  };

  return (
    <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-4 p-5 pt-4">
      <div className="flex space-x-6">
        <button 
          onClick={onUpvote}
          className="flex items-center text-gray-600 hover:text-green-600 transition-colors"
        >
          <ChevronUp size={20} className="mr-1" />
          <span>{upvotes}</span>
        </button>
        
        <button 
          onClick={onLike}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ThumbsUp size={18} className="mr-1" />
          <span>{likes}</span>
        </button>
      </div>
      
      <div className="flex space-x-4">
        <button 
          onClick={handleShare}
          className="text-gray-500 hover:text-gray-700"
        >
          <Share2 size={18} />
        </button>
        <button 
          onClick={handleReport}
          className="text-gray-500 hover:text-red-500"
        >
          <Flag size={18} />
        </button>
      </div>
    </div>
  );
};
