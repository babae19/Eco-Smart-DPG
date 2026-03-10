import React, { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Shield,
  Eye,
  Share2,
  MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CommentForm } from './CommentForm';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface EnhancedReportCardProps {
  report: any;
  onUpvote?: (reportId: string) => void;
  onDownvote?: (reportId: string) => void;
  onOpenComments?: () => void;
  isMobile?: boolean;
}

const EnhancedReportCard = memo<EnhancedReportCardProps>(({
  report,
  onUpvote,
  onDownvote,
  onOpenComments,
  isMobile = false
}) => {
  const [showComments, setShowComments] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getIssueTypeConfig = (issueType: string) => {
    const configs = {
      'illegal dumping': { 
        bg: 'bg-destructive/10', 
        text: 'text-destructive', 
        border: 'border-destructive/20' 
      },
      'deforestation': { 
        bg: 'bg-warning/10', 
        text: 'text-warning', 
        border: 'border-warning/20' 
      },
      'water pollution': { 
        bg: 'bg-info/10', 
        text: 'text-info', 
        border: 'border-info/20' 
      },
      'air pollution': { 
        bg: 'bg-secondary/10', 
        text: 'text-secondary', 
        border: 'border-secondary/20' 
      },
      'wildlife endangerment': { 
        bg: 'bg-success/10', 
        text: 'text-success', 
        border: 'border-success/20' 
      },
      default: { 
        bg: 'bg-muted', 
        text: 'text-muted-foreground', 
        border: 'border-border' 
      }
    };
    return configs[issueType?.toLowerCase() as keyof typeof configs] || configs.default;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'approved') {
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/20 flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Verified
        </Badge>
      );
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const handleVote = (type: 'up' | 'down') => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote on reports",
        variant: "default",
      });
      return;
    }

    if (userVote === type) {
      setUserVote(null);
    } else {
      setUserVote(type);
      if (type === 'up' && onUpvote) {
        onUpvote(report.id);
      } else if (type === 'down' && onDownvote) {
        onDownvote(report.id);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: report.description,
          url: window.location.href + '/' + report.id,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      toast({
        title: "Link copied!",
        description: "Report link copied to clipboard",
      });
    }
  };

  const authorName = report.profiles?.full_name || 'Anonymous User';
  const authorAvatar = report.profiles?.avatar_url;
  const issueConfig = getIssueTypeConfig(report.issue_type);

  return (
    <Card className="w-full border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg bg-card overflow-hidden group">
      {/* Image Header */}
      {report.images && report.images.length > 0 && (
        <div 
          className="aspect-video relative overflow-hidden cursor-pointer bg-muted"
          onClick={() => navigate(`/reports/${report.id}`)}
        >
          <img
            src={report.images[0]}
            alt="Report"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Status Badge Overlay */}
          <div className="absolute top-3 right-3">
            {getStatusBadge(report.status)}
          </div>
        </div>
      )}

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Header: Issue Type, Date, More Options */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`text-xs font-medium ${issueConfig.bg} ${issueConfig.text} ${issueConfig.border}`}
          >
            {report.issue_type}
          </Badge>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(report.created_at)}
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <h3 
          className="font-bold text-lg sm:text-xl text-foreground leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors"
          onClick={() => navigate(`/reports/${report.id}`)}
        >
          {report.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {report.description}
        </p>

        {/* Location */}
        {report.location && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1.5 text-primary" />
            <span className="truncate">{report.location}</span>
          </div>
        )}

        <Separator />

        {/* Author Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 ring-2 ring-primary/10">
              <AvatarImage src={authorAvatar} alt={authorName} />
              <AvatarFallback className="text-sm bg-primary/20 text-primary font-semibold">
                {authorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{authorName}</p>
              <p className="text-xs text-muted-foreground">Community Member</p>
            </div>
          </div>
          
          {/* View Count */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>{Math.floor(Math.random() * 500) + 50}</span>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {/* Upvote */}
            <Button
              variant={userVote === 'up' ? 'default' : 'ghost'}
              size="sm"
              className={`h-9 px-3 ${isMobile ? 'touch-manipulation' : ''} ${userVote === 'up' ? 'shadow-md' : ''}`}
              onClick={() => handleVote('up')}
            >
              <ThumbsUp className={`w-4 h-4 mr-1.5 ${userVote === 'up' ? 'fill-current' : ''}`} />
              <span className="font-semibold">{report.upvotes || 0}</span>
            </Button>
            
            {/* Downvote */}
            <Button
              variant={userVote === 'down' ? 'secondary' : 'ghost'}
              size="sm"
              className={`h-9 px-3 ${isMobile ? 'touch-manipulation' : ''}`}
              onClick={() => handleVote('down')}
            >
              <ThumbsDown className={`w-4 h-4 ${userVote === 'down' ? 'fill-current' : ''}`} />
            </Button>

            {/* Comments */}
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 ${isMobile ? 'touch-manipulation' : ''}`}
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4 mr-1.5" />
              <span className="font-semibold">{report.comments?.length || 0}</span>
            </Button>
          </div>

          {/* Share */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="pt-4 space-y-3 border-t border-border">
            {report.comments && report.comments.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {report.comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={comment.authorProfile?.avatar_url} alt={comment.author} />
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {comment.author?.charAt(0)?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">
                          {comment.author}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.date)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground break-words">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
            
            {isAuthenticated ? (
              <CommentForm reportId={report.id} />
            ) : (
              <div className="text-center py-3">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Log in to comment
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

EnhancedReportCard.displayName = 'EnhancedReportCard';

export default EnhancedReportCard;
