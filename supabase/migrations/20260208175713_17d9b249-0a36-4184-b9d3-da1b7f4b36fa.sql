
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 5. Create has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Grant execute to authenticated and anon
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;

-- 6. Create is_admin function that all existing policies reference
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(user_id, 'admin')
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon;

-- 7. Migrate existing admin users from profiles.admin to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE admin = true
ON CONFLICT (user_id, role) DO NOTHING;

-- 8. Fix climate_products: require authentication to view products (protects contact info)
DROP POLICY IF EXISTS "Anyone can view active products" ON public.climate_products;
CREATE POLICY "Authenticated users can view active products"
ON public.climate_products FOR SELECT
TO authenticated
USING (is_active = true);

-- 9. Fix campaigns: require authentication to view campaigns (protects created_by)
DROP POLICY IF EXISTS "Campaigns are viewable by everyone" ON public.campaigns;
CREATE POLICY "Authenticated users can view campaigns"
ON public.campaigns FOR SELECT
TO authenticated
USING (true);

-- 10. Add admin policies for disaster_alerts management
CREATE POLICY "Admins can insert disaster alerts"
ON public.disaster_alerts FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update disaster alerts"
ON public.disaster_alerts FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete disaster alerts"
ON public.disaster_alerts FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 11. Add admin policies for broadcast_notifications management
CREATE POLICY "Admins can insert broadcast notifications"
ON public.broadcast_notifications FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update broadcast notifications"
ON public.broadcast_notifications FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete broadcast notifications"
ON public.broadcast_notifications FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 12. Add admin policy for notifications insert (system can insert for any user)
CREATE POLICY "Admins can insert notifications for users"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- 13. Add admin select policy for profiles (admins can see all)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));
