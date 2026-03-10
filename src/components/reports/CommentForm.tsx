import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CommentFormProps {
  reportId: string;
  onCommentAdded?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({ reportId, onCommentAdded }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) return;

    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to comment.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('report_comments')
        .insert({
          report_id: reportId,
          author: user.id,
          text: comment.trim()
        });

      if (error) throw error;

      setComment('');
      onCommentAdded?.();
      
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="min-h-[60px] text-sm resize-none"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={!comment.trim() || isSubmitting}
          className="h-7 px-3"
        >
          <Send className="w-3 h-3 mr-1" />
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  );
};