-- Fix report_comments table - rename 'comment' to 'text' and ensure all columns exist
ALTER TABLE report_comments 
RENAME COLUMN comment TO text;

-- Add missing columns to report_comments if they don't exist
ALTER TABLE report_comments
ADD COLUMN IF NOT EXISTS author TEXT,
ADD COLUMN IF NOT EXISTS report_id UUID REFERENCES reports(id) ON DELETE CASCADE;

-- Add admin column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS admin BOOLEAN DEFAULT false;

-- Add status column to alerts table
ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Create user_notification_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  push_notifications BOOLEAN DEFAULT true,
  sms_alerts BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  alert_radius_km INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_notification_preferences
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_notification_preferences
CREATE POLICY "Users can view own notification preferences"
ON user_notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
ON user_notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
ON user_notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);