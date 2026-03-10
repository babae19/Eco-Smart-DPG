-- Add weather threshold columns to user_notification_preferences
ALTER TABLE public.user_notification_preferences 
ADD COLUMN IF NOT EXISTS temp_high_threshold integer DEFAULT 35,
ADD COLUMN IF NOT EXISTS temp_low_threshold integer DEFAULT 15,
ADD COLUMN IF NOT EXISTS rain_threshold integer DEFAULT 70,
ADD COLUMN IF NOT EXISTS wind_threshold integer DEFAULT 40,
ADD COLUMN IF NOT EXISTS humidity_threshold integer DEFAULT 90;