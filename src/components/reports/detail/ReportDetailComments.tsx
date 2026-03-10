
import React, { useState, useEffect } from 'react';
import { Comment } from '@/services/reports/reportTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface ReportDetailCommentsProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
}

export const ReportDetailComments: React.FC<ReportDetailCommentsProps> = ({ 
  comments,
  onAddComment
}) => {
  const [newComment, setNewComment] = useState('');
  const [usernames, setUsernames] = useState<{[key: string]: string}>({});
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchUsernames = async () => {
      if (comments.length === 0) return;

      // Respect RLS: skip fetching if not authenticated
      if (!isAuthenticated) return;
      
      const userIds = [...new Set(comments.map(comment => comment.author))];
      
      try {
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
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    };
    
    fetchUsernames();
  }, [comments, isAuthenticated]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    onAddComment(newComment);
    setNewComment('');
  };
  
  const getInitials = (name: string) => {
    if (!name || name === 'Anonymous User') return 'AU';
    
    const nameArray = name.split(' ');
    if (nameArray.length > 1) {
      return `${nameArray[0][0]}${nameArray[1][0]}`.toUpperCase();
    } else {
      return name[0]?.toUpperCase() || 'U';
    }
  };
  
  return (
    <div className="pt-4 border-t border-gray-100 p-5">
      <h3 className="font-medium text-lg mb-4">Comments ({comments.length})</h3>
      
      {comments.length > 0 ? (
        <div className="space-y-4 mb-6">
          {comments.map(comment => {
            const username = usernames[comment.author] || 'Anonymous User';
            
            return (
              <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="bg-green-100 text-green-800 text-xs">
                      {getInitials(username)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{username}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(comment.date).toLocaleDateString(undefined, {
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 mb-6">No comments yet. Be the first to comment!</p>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full"
        />
        <Button type="submit" className="w-full">Post Comment</Button>
      </form>
    </div>
  );
};
