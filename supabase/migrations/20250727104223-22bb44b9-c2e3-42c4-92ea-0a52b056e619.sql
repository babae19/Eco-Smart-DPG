-- Enable realtime for broadcast_notifications table
ALTER TABLE public.broadcast_notifications REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_notifications;

-- Drop existing policy first
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

-- Create new policy to allow users to update notifications as read
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Ensure notifications table is also enabled for realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add notifications table to realtime publication if not already added
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION
        WHEN duplicate_object THEN
            -- Table already in publication, do nothing
            NULL;
    END;
END $$;