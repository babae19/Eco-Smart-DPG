
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Comment } from '@/services/reportService';
import { formatDistanceToNow } from 'date-fns';

interface CommentItemProps {
  comment: Comment;
  username: string;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, username }) => {
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const [initials, setInitials] = useState<string>('U');
  
  useEffect(() => {
    if (username && username.trim() !== '') {
      const nameArray = username.split(' ');
      if (nameArray.length > 1) {
        setInitials(`${nameArray[0][0]}${nameArray[1][0]}`.toUpperCase());
      } else {
        setInitials(username[0]?.toUpperCase() || 'U');
      }
    }
  }, [username]);

  return (
    <div className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center mb-1">
        <Avatar className="w-6 h-6 mr-2">
          <AvatarFallback className="bg-green-100 text-green-800 text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{username}</span>
        <span className="text-xs text-gray-500 ml-auto">
          {formatDate(comment.date)}
        </span>
      </div>
      <p className="text-sm">{comment.text}</p>
    </div>
  );
};
