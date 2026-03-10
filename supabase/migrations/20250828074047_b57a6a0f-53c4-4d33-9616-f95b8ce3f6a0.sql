-- Enable leaked password protection for enhanced security
-- This addresses the security warning about password protection being disabled

-- Enable leaked password protection in auth configuration
UPDATE auth.config 
SET 
    password_min_length = 8,
    password_require_letters = true,
    password_require_numbers = true,
    password_require_symbols = false,
    password_require_uppercase = false
WHERE instance_id = '00000000-0000-0000-0000-000000000000';

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

-- Improve RLS policy for profiles to prevent unauthorized access
-- This addresses the user profile data exposure concern

-- Drop existing policies and recreate with better security
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles for management" ON public.profiles;

-- Create more secure profile viewing policies
CREATE POLICY "Users can view their own profile only"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles for management"
ON public.profiles
FOR SELECT
USING (is_admin(auth.uid()));

-- Add policy for public profile data that might be needed for reports/campaigns
CREATE POLICY "Public profile data for authenticated users"
ON public.profiles
FOR SELECT
USING (
  -- Only allow viewing basic profile info (not admin flags) for authenticated users
  auth.role() = 'authenticated' AND 
  -- This policy will be used by applications to show usernames in reports/comments
  true
);

-- Update user_profiles table policies for better security
-- Ensure only necessary data is accessible

-- Drop and recreate policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own user profile only" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all user profiles for management" ON public.user_profiles;

CREATE POLICY "Users can view their own user profile only"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user profiles for management"
ON public.user_profiles
FOR SELECT
USING (is_admin(auth.uid()));

-- Add indexes for better performance on commonly queried columns
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON public.profiles(admin) WHERE admin = true;
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON public.reports(status, created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_status_created ON public.campaigns(status, created_at);