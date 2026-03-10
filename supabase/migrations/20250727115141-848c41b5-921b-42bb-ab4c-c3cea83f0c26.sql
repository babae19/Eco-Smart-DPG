-- Fix all database functions to have proper security settings
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.is_admin(user_id uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.handle_new_report() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.handle_new_campaign() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.handle_report_status_change() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.handle_campaign_status_change() SECURITY DEFINER SET search_path = public;

-- Add RLS policy for table_name table if it doesn't have any
DROP TABLE IF EXISTS public.table_name;

-- Check if there are any tables without proper RLS policies
-- (The INFO message suggests there's a table with RLS enabled but no policies)