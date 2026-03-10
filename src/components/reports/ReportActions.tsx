
import React from 'react';
import { ChevronUp, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { likeReport } from '@/services/reportService';

interface ReportActionsProps {
  reportId: string;
  upvotes: number;
  likes: number;
  commentsCount: number;
  onUpvote?: (reportId: string) => void;
  onLike?: (reportId: string) => void;
  showComments: boolean;
  setShowComments: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ReportActions: React.FC<ReportActionsProps> = ({
  reportId,
  upvotes,
  likes,
  commentsCount,
  onUpvote,
  onLike,
  showComments,
  setShowComments
}) => {
  
  const handleUpvote = () => {
    if (onUpvote) {
      onUpvote(reportId);
    } else {
      const updatedReport = likeReport(reportId);
      if (updatedReport) {
        toast({
          title: "Upvoted",
          description: "Thank you for supporting this issue"
        });
      }
    }
  };
  
  const handleLike = () => {
    if (onLike) {
      onLike(reportId);
    } else {
      const updatedReport = likeReport(reportId);
      if (updatedReport) {
        toast({
          title: "Liked",
          description: "You liked this report"
        });
      }
    }
  };

  return (
    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
      <div className="flex space-x-6">
        <Button 
          onClick={handleUpvote}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 hover:text-green-600 hover:bg-green-50"
        >
          <ChevronUp size={18} />
          <span>{upvotes}</span>
        </Button>
        
        <Button 
          onClick={handleLike}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 hover:text-blue-600 hover:bg-blue-50"
        >
          <ThumbsUp size={16} />
          <span>{likes}</span>
        </Button>
        
        <Button 
          onClick={() => setShowComments(!showComments)}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 hover:text-purple-600 hover:bg-purple-50"
        >
          <MessageSquare size={16} />
          <span>{commentsCount}</span>
        </Button>
      </div>
    </div>
  );
};
