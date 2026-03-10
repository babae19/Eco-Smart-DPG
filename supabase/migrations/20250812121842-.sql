-- Restrict public access to personal data in profiles and user_profiles tables
-- 1) Update RLS policies on public.profiles

-- Drop overly permissive public SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Allow only authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Keep existing insert/update policies as-is (already scoped to the user)

-- 2) Update RLS policies on public.user_profiles (if present) to avoid public PII exposure
DROP POLICY IF EXISTS "User profiles are viewable by everyone" ON public.user_profiles;

CREATE POLICY "Authenticated users can view user profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);
