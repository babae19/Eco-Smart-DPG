import React, { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ThumbsUp, MessageCircle, MapPin, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CommentForm } from './CommentForm';

interface LightweightReportCardProps {
  report: any;
  onUpvote?: (reportId: string) => void;
  onLike?: (reportId: string) => void;
  onOpenComments?: () => void;
  isMobile?: boolean;
}

const LightweightReportCard = memo<LightweightReportCardProps>(({
  report,
  onUpvote,
  onLike,
  onOpenComments,
  isMobile = false
}) => {
  const [showComments, setShowComments] = useState(false);
  const getIssueTypeColor = (issueType: string) => {
    const colors = {
      'illegal dumping': 'bg-red-100 text-red-800 border-red-200',
      'deforestation': 'bg-amber-100 text-amber-800 border-amber-200',
      'water pollution': 'bg-blue-100 text-blue-800 border-blue-200',
      'air pollution': 'bg-purple-100 text-purple-800 border-purple-200',
      'wildlife endangerment': 'bg-environmental-light text-environmental-dark border-environmental',
      default: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[issueType?.toLowerCase() as keyof typeof colors] || colors.default;
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const authorName = report.profiles?.full_name || 'Anonymous User';
  const authorAvatar = report.profiles?.avatar_url;

  return (
    <Card className="w-full border border-environmental/20 hover:border-environmental/40 transition-all duration-200 hover:shadow-md bg-gradient-to-r from-white to-environmental-light/5">
      <CardContent className="p-4 space-y-3">
        {/* Header with issue type and timestamp */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`text-xs ${getIssueTypeColor(report.issue_type)}`}
          >
            {report.issue_type}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(report.created_at)}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg text-foreground leading-tight line-clamp-2">
          {report.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {report.description}
        </p>

        {/* Location */}
        {report.location && (
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 mr-1 text-environmental" />
            <span className="truncate">{report.location}</span>
          </div>
        )}

        {/* Image Preview - Optimized for performance */}
        {report.images && report.images.length > 0 && (
          <div className="aspect-video rounded-lg overflow-hidden bg-environmental-light/10">
            <img
              src={report.images[0]}
              alt="Report image"
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Author and Actions */}
        <div className="flex items-center justify-between pt-2">
          {/* Author */}
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={authorAvatar} alt={authorName} />
              <AvatarFallback className="text-xs bg-environmental text-white">
                {authorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-24">
              {authorName}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs h-7 px-2 hover:bg-environmental/10 ${isMobile ? 'touch-manipulation' : ''}`}
              onClick={() => onUpvote?.(report.id)}
            >
              <ThumbsUp className="w-3 h-3 mr-1" />
              {report.upvotes || 0}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs h-7 px-2 hover:bg-environmental/10 ${isMobile ? 'touch-manipulation' : ''}`}
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              {report.comments?.length || 0} Comments
              {showComments ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        <Collapsible open={showComments} onOpenChange={setShowComments}>
          <CollapsibleContent className="pt-3 border-t border-environmental/10">
            {report.comments && report.comments.length > 0 ? (
              <div className="space-y-2">
                {report.comments.map((comment: any) => (
                  <div key={comment.id} className="flex space-x-2 text-sm">
                    <Avatar className="w-5 h-5 flex-shrink-0">
                      <AvatarImage src={comment.authorProfile?.avatar_url} alt={comment.author} />
                      <AvatarFallback className="text-xs bg-environmental/20 text-environmental">
                        {comment.author?.charAt(0)?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-xs text-foreground">
                          {comment.author}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.date)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 break-words">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                No comments yet. Be the first to comment!
              </p>
            )}
            <CommentForm reportId={report.id} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
});

LightweightReportCard.displayName = 'LightweightReportCard';

export default LightweightReportCard;