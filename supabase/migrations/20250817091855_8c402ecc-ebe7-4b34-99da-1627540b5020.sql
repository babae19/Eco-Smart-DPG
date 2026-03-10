-- Security Enhancement Phase 1: Fix High Priority Data Exposure Issues (Corrected)

-- 1. Fix profiles table - remove overly permissive policies and keep secure ones
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- The existing restrictive policies are good, but let's add admin oversight
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Admin policy for profiles (using the existing is_admin function)
CREATE POLICY "Admins can view all profiles for management" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- 2. Fix user_profiles table - remove overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view user profiles" ON public.user_profiles;

-- Create restrictive policies for user_profiles
CREATE POLICY "Users can view their own user profile only" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admin policy for user_profiles
CREATE POLICY "Admins can view all user profiles for management" 
ON public.user_profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- 3. Clean up debug/excessive logging by updating specific files
-- This will be done via code changes after the migration

-- 4. Security audit complete - RLS policies are now properly restricted