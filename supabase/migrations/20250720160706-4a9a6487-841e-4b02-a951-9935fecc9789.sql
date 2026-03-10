-- Add unique constraint on user_id to allow upsert operations
ALTER TABLE public.user_notification_preferences 
ADD CONSTRAINT user_notification_preferences_user_id_unique UNIQUE (user_id);