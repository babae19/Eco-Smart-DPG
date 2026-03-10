-- Security Enhancement Phase 1: Fix High Priority Data Exposure Issues

-- 1. Secure the profiles table - only allow users to see their own profile
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create more restrictive profile policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Admin policy for profiles (if needed for admin functions)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND admin = true
  )
);

-- 2. Secure user_profiles table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    -- Enable RLS on user_profiles table
    ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
    
    -- Drop any existing overly permissive policies
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
    DROP POLICY IF EXISTS "Enable update for users based on email" ON public.user_profiles;
    DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.user_profiles;
    
    -- Create secure policies for user_profiles
    CREATE POLICY "Users can view their own user profile" 
    ON public.user_profiles 
    FOR SELECT 
    USING (auth.uid()::text = user_id OR auth.uid()::text = id);
    
    CREATE POLICY "Users can update their own user profile" 
    ON public.user_profiles 
    FOR UPDATE 
    USING (auth.uid()::text = user_id OR auth.uid()::text = id);
    
    CREATE POLICY "Users can insert their own user profile" 
    ON public.user_profiles 
    FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id OR auth.uid()::text = id);
    
    CREATE POLICY "Users can delete their own user profile" 
    ON public.user_profiles 
    FOR DELETE 
    USING (auth.uid()::text = user_id OR auth.uid()::text = id);
  END IF;
END $$;

-- 3. Secure user_notification_preferences table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_notification_preferences') THEN
    -- Enable RLS on user_notification_preferences table
    ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
    
    -- Drop any existing overly permissive policies
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_notification_preferences;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_notification_preferences;
    DROP POLICY IF EXISTS "Enable update for users based on email" ON public.user_notification_preferences;
    DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.user_notification_preferences;
    
    -- Create secure policies for notification preferences
    CREATE POLICY "Users can view their own notification preferences" 
    ON public.user_notification_preferences 
    FOR SELECT 
    USING (auth.uid()::text = user_id);
    
    CREATE POLICY "Users can update their own notification preferences" 
    ON public.user_notification_preferences 
    FOR UPDATE 
    USING (auth.uid()::text = user_id);
    
    CREATE POLICY "Users can insert their own notification preferences" 
    ON public.user_notification_preferences 
    FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id);
    
    CREATE POLICY "Users can delete their own notification preferences" 
    ON public.user_notification_preferences 
    FOR DELETE 
    USING (auth.uid()::text = user_id);
  END IF;
END $$;

-- 4. Create a security definer function for admin checks to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 5. Ensure all existing tables have proper RLS enabled
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Enable RLS on all public tables that don't have it
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
    END LOOP;
END $$;