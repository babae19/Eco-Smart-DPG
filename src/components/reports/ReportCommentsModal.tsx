
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addComment, Report } from '@/services/reportService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface ReportCommentsModalProps {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportCommentsModal: React.FC<ReportCommentsModalProps> = ({
  report,
  open,
  onOpenChange
}) => {
  const { isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Reset comment input when dialog opens/closes or report changes
    setNewComment('');
  }, [open, report]);
  
  useEffect(() => {
    const fetchUsernames = async () => {
      if (!report || !report.comments || report.comments.length === 0) return;

      // Skip fetching if not authenticated to respect RLS and avoid errors
      if (!isAuthenticated) return;
      
      try {
        // Extract unique user IDs from comments ensuring they're strings
        const userIds = [...new Set(report.comments.map(comment => String(comment.author)))]
        
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        
        if (data) {
          const usernameMap = data.reduce<Record<string, string>>((acc, profile) => {
            acc[profile.id] = profile.full_name || 'Anonymous User';
            return acc;
          }, {});
          setUsernames(usernameMap);
        }
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    };
    
    fetchUsernames();
  }, [report, isAuthenticated]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!report || !isAuthenticated) return;
    
    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter something before posting",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedReport = await addComment(report.id, newComment);
      if (updatedReport) {
        toast({
          title: "Comment Added",
          description: "Your comment has been posted",
        });
        
        // Reset comment input
        setNewComment('');
        
        // Close dialog if requested
        // onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
      console.error("Comment submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getInitials = (name: string) => {
    if (!name || name === 'Anonymous User') return 'AU';
    
    const nameArray = name.split(' ');
    if (nameArray.length > 1) {
      return `${nameArray[0][0]}${nameArray[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  // If no report is provided, don't show the modal
  if (!report) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Comments for {report.title}</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {report.comments.length > 0 ? (
            <div className="space-y-4 mb-4">
              {report.comments.map(comment => {
                const authorId = String(comment.author);
                const username = usernames[authorId] || 'Anonymous User';
                
                return (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-green-100 text-green-800 text-xs">
                          {getInitials(username)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{username}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {formatDate(comment.date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
        
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmitting}
                className="flex-1"
              />
              <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-md text-sm">
            Please sign in to comment on reports.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
