-- Enable realtime for broadcast_notifications table
ALTER TABLE public.broadcast_notifications REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_notifications;

-- Update RLS policy to allow users to update notifications as read
ALTER TABLE public.notifications DROP POLICY IF EXISTS "Users can update their own notifications";
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Ensure notifications table is also enabled for realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;