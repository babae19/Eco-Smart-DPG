
import React, { useEffect, useState } from 'react';
import { Comment, addComment } from '@/services/reportService';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CommentList } from './comments/CommentList';
import { CommentForm } from './comments/CommentForm';

interface ReportCommentsProps {
  comments: Comment[];
  reportId: string;
  onComment?: (reportId: string, comment: string) => void;
}

export const ReportComments: React.FC<ReportCommentsProps> = ({
  comments: initialComments,
  reportId,
  onComment
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [usernames, setUsernames] = useState<{[key: string]: string}>({});
  const [loadingUsernames, setLoadingUsernames] = useState(true);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchUsernames = async () => {
      setLoadingUsernames(true);

      // Skip fetching if user is not authenticated to avoid RLS errors
      if (!isAuthenticated) {
        setLoadingUsernames(false);
        return;
      }

      const userIds = [...new Set(comments.map(comment => comment.author))];
      
      if (userIds.length === 0) {
        setLoadingUsernames(false);
        return;
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      if (data) {
        const usernameMap = data.reduce((acc, profile) => ({
          ...acc,
          [profile.id]: profile.full_name || 'Anonymous User'
        }), {});
        setUsernames(usernameMap);
      }
      setLoadingUsernames(false);
    };
    
    fetchUsernames();
  }, [comments, isAuthenticated]);

  useEffect(() => {
    // Subscribe to new comments for this report
    const channel = supabase
      .channel('report_comments')
      .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'report_comments',
            filter: `report_id=eq.${reportId}`
          }, 
          async (payload) => {
            const newComment = payload.new as any;
            // Add the new comment to the list
            setComments(prevComments => [...prevComments, {
              id: newComment.id,
              text: newComment.text,
              author: newComment.author,
              date: new Date(newComment.created_at).toISOString()
            }]);

            // Show toast notification
            toast({
              title: "New Comment",
              description: "A new comment has been added to this report"
            });

            // Fetch username for the new comment's author only if authenticated
            if (isAuthenticated) {
              const { data } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('id', newComment.author)
                .single();

              if (data) {
                setUsernames(prev => ({
                  ...prev,
                  [data.id]: data.full_name || 'Anonymous User'
                }));
              }
            }
          }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reportId]);

  const handleAddComment = async (newComment: string) => {
    if (onComment) {
      onComment(reportId, newComment);
    } else {
      const updatedReport = await addComment(reportId, newComment);
      if (updatedReport) {
        toast({
          title: "Comment Added",
          description: "Your comment has been added"
        });
      }
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-gray-100">
      <h4 className="font-medium text-sm mb-2">Comments</h4>
      <CommentList 
        comments={comments} 
        usernames={usernames} 
        loading={loadingUsernames} 
      />
      <CommentForm onSubmit={handleAddComment} />
    </div>
  );
};
