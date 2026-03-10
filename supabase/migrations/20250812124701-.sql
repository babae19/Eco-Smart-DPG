-- Secure disaster_alerts RLS: remove unrestricted ALL policy
-- Keep public read of active alerts, restrict writes to admins only

-- 1) Drop the unsafe policy that allowed ALL with condition true
DROP POLICY IF EXISTS "disaster_alerts_service_policy" ON public.disaster_alerts;

-- 2) Ensure an explicit admin-only write policy exists (idempotent approach)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'disaster_alerts' 
      AND policyname = 'Admins can manage disaster alerts'
  ) THEN
    CREATE POLICY "Admins can manage disaster alerts"
    ON public.disaster_alerts
    FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;