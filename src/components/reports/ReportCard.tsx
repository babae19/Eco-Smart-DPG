
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowUp, MessageSquare, ThumbsUp, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Report } from '@/services/reports/reportTypes';
import OptimizedLazyImages from './OptimizedLazyImages';

interface ReportCardProps {
  report: Report;
  onUpvote: (reportId: string) => void;
  onLike: (reportId: string) => void;
  onOpenComments: () => void;
  isMobile?: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onUpvote,
  onLike,
  onOpenComments,
  isMobile = true
}) => {
  
  // Format timestamp
  const formattedTime = formatDistanceToNow(new Date(report.date), { addSuffix: true });
  
  // Get status color using semantic tokens
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800';
      case 'in-progress': 
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };
  
  // Prepare the display status text
  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'in-progress': return 'In Progress';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Card 
      className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${isMobile ? 'mb-4' : 'h-full'}`}
    >
      <OptimizedLazyImages 
        reportId={report.id} 
        className="h-48 w-full overflow-hidden"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{report.title}</h3>
          <Badge className={getStatusColor(report.status)}>
            {getStatusDisplay(report.status)}
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{report.description}</p>
        
        <div className="flex flex-col space-y-2 text-xs text-muted-foreground mb-3">
          <div className="flex items-center">
            <User size={14} className="mr-1" />
            <span>Community Report</span>
          </div>
          
          <div className="flex items-center">
            <MapPin size={14} className="mr-1" />
            <span>{report.location}</span>
            <span className="mx-2">•</span>
            <span>{formattedTime}</span>
          </div>
          
          <div className="flex items-center">
            <Badge variant="outline" className="text-xs">
              {report.issueType}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex space-x-3">
            <button 
              className="flex items-center text-xs text-muted-foreground hover:text-green-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onUpvote(report.id);
              }}
            >
              <ArrowUp size={14} className="mr-1" />
              <span>{report.upvotes}</span>
            </button>
            <button 
              className="flex items-center text-xs text-muted-foreground hover:text-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onLike(report.id);
              }}
            >
              <ThumbsUp size={14} className="mr-1" />
              <span>{report.likes}</span>
            </button>
            <button
              className="flex items-center text-xs text-muted-foreground hover:text-purple-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onOpenComments();
              }}
            >
              <MessageSquare size={14} className="mr-1" />
              <span>{report.comments.length}</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(ReportCard);
