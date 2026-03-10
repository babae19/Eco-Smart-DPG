
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowUp, MessageSquare, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReportCardProps {
  id: string;
  title: string;
  description: string;
  location: string;
  timestamp: Date | string;
  status: 'pending' | 'resolved' | 'in-progress';
  issueType: string;
  upvotes: number;
  likes: number;
  comments: number;
  imageUrl?: string;
  onUpvote: (id: string) => void;
  onLike: (id: string) => void;
  onComment: (id: string, comment: string) => void;
  onClick?: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  id,
  title,
  description,
  location,
  timestamp,
  status,
  issueType,
  upvotes,
  likes,
  comments,
  imageUrl,
  onUpvote,
  onLike,
  onClick
}) => {
  // Format timestamp
  const formattedTime = typeof timestamp === 'string' 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : formatDistanceToNow(timestamp, { addSuffix: true });
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in-progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card 
      className="mb-4 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {imageUrl && (
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <Badge className={getStatusColor(status)}>
            {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">{description}</p>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
          <MapPin size={14} className="mr-1" />
          <span>{location}</span>
          <span className="mx-2">•</span>
          <span>{formattedTime}</span>
          <Badge variant="outline" className="ml-2">
            {issueType}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex space-x-3">
            <button 
              className="flex items-center text-xs text-gray-600 hover:text-green-600"
              onClick={(e) => {
                e.stopPropagation();
                onUpvote(id);
              }}
            >
              <ArrowUp size={14} className="mr-1" />
              <span>{upvotes}</span>
            </button>
            <button 
              className="flex items-center text-xs text-gray-600 hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                onLike(id);
              }}
            >
              <ThumbsUp size={14} className="mr-1" />
              <span>{likes}</span>
            </button>
            <div className="flex items-center text-xs text-gray-600">
              <MessageSquare size={14} className="mr-1" />
              <span>{comments}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReportCard;
