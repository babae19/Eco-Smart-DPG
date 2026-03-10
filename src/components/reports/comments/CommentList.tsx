
import React from 'react';
import { Comment } from '@/services/reportService';
import { CommentItem } from './CommentItem';
import { Skeleton } from "@/components/ui/skeleton";

interface CommentListProps {
  comments: Comment[];
  usernames: { [key: string]: string };
  loading?: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({ comments, usernames, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <Skeleton className="h-6 w-6 rounded-full mr-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-gray-500 mb-4">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <div className="space-y-3 mb-4">
      {comments.map(comment => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          username={usernames[comment.author] || 'Anonymous User'} 
        />
      ))}
    </div>
  );
};
