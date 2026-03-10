-- Fix security issues identified in the security scan
-- Note: Password protection settings need to be configured through the Supabase Dashboard

-- Update notification system policies to be more restrictive
-- This addresses the security concern about system insertion policy being too broad

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "System can insert notifications for any user" ON public.notifications;

-- Create a more restricted policy for system notifications
CREATE POLICY "Authenticated system can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  -- Only allow if the inserting user is either an admin or the notification is for themselves
  auth.uid() = user_id OR is_admin(auth.uid())
);

-- Add indexes for better performance on commonly queried columns
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON public.profiles(admin) WHERE admin = true;
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON public.reports(status, created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_status_created ON public.campaigns(status, created_at);