-- Fix the created_by column to allow NULL or set a default value
ALTER TABLE public.broadcast_notifications 
ALTER COLUMN created_by DROP NOT NULL;

-- Add a comment explaining the change
COMMENT ON COLUMN public.broadcast_notifications.created_by IS 'User ID of the admin who created the broadcast notification. Can be NULL for system-generated notifications.';